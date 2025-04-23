import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export type Role = "mentor" | "student";

// Generate a unique session ID for this browser tab
const generateSessionId = () => {
  // Check if we already have a session ID in this tab
  let sessionId = sessionStorage.getItem('user-session-id');
  if (!sessionId) {
    // Generate a random session ID if we don't have one
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('user-session-id', sessionId);
  }
  return sessionId;
};

// Increment the signed count for a code block
export const incrementSignedCount = async (blockId: string): Promise<void> => {
  const result = await client.models.CodeBlock.get({ id: blockId });
  const currentSignedCount = result.data?.signed || 0;
  
  await client.models.CodeBlock.update({
    id: blockId,
    signed: currentSignedCount + 1
  });
};

// Decrement the signed count for a code block
export const decrementSignedCount = async (blockId: string): Promise<void> => {
  const result = await client.models.CodeBlock.get({ id: blockId });
  const currentSignedCount = result.data?.signed || 0;
  
  if (currentSignedCount > 0) {
    await client.models.CodeBlock.update({
      id: blockId,
      signed: currentSignedCount - 1
    });
  }
};

// Determine and set user role
export const determineUserRole = async (
  blockId: string
): Promise<Role> => {
  // Check if user was previously a mentor for this block
  const storedRole = localStorage.getItem(`block-${blockId}-role`);
  if (storedRole === 'mentor') {
    // Verify that the mentor flag is still set in the database
    const result = await client.models.CodeBlock.get({ id: blockId });
    if (result.data?.hasMentor) {
      return 'mentor';
    }
    // If hasMentor is false, we need to try to become a mentor again
  }

  // Try to acquire the mentor role with optimistic concurrency control
  try {
    const result = await client.models.CodeBlock.get({ id: blockId });
    
    if (!result.data?.hasMentor) {
      // First get the current state to check if we can become mentor
      const updatedBlock = await client.models.CodeBlock.update({
        id: blockId,
        hasMentor: true
      });
      
      if (updatedBlock.data) {
        // Successfully acquired mentor role
        localStorage.setItem(`block-${blockId}-role`, 'mentor');
        return 'mentor';
      }
    }
    
    // If we get here, someone else is the mentor or version check failed
    localStorage.setItem(`block-${blockId}-role`, 'student');
    return 'student';
  } catch (error) {
    // If update fails due to version conflict, someone else became mentor first
    console.error('Failed to update mentor status:', error);
    localStorage.setItem(`block-${blockId}-role`, 'student');
    return 'student';
  }
};

// Release mentor role if user is mentor
export const releaseMentorRole = async (
  blockId: string,
  currentRole: Role
): Promise<void> => {
  if (currentRole === 'mentor') {
    await client.models.CodeBlock.update({
      id: blockId,
      hasMentor: false
    });
    localStorage.removeItem(`block-${blockId}-role`);
  }
};

// Subscribe to code block changes
export const subscribeToCodeBlock = (
  blockId: string,
  onUpdate: (codeBlock: Schema["CodeBlock"]["type"]) => void
) => {
  const subscription = client.models.CodeBlock.observeQuery({
    filter: { id: { eq: blockId } }
  }).subscribe({
    next: (data) => {
      if (data.items.length > 0) {
        onUpdate(data.items[0]);
      }
    },
    error: (error) => console.error('Subscription error:', error)
  });

  return subscription;
};

// Fetch code block data
export const fetchCodeBlock = async (blockId: string) => {
  const result = await client.models.CodeBlock.get({ id: blockId });
  return result.data;
};

// Create a viewer for a code block
export const createViewer = async (
  codeId: string, 
  userRole: Role, 
  initialCode: string
): Promise<Schema["Viewer"]["type"]> => {
  // Get session ID for this browser tab
  const sessionId = generateSessionId();
  
  // Check if we already have a viewer for this session
  const existingViewerId = sessionStorage.getItem(`block-${codeId}-viewer`);
  
  if (existingViewerId) {
    // Try to get the existing viewer
    const existing = await client.models.Viewer.get({ id: existingViewerId });
    if (existing.data) {
      return existing.data;
    }
    // If viewer no longer exists in the database, remove it from sessionStorage
    sessionStorage.removeItem(`block-${codeId}-viewer`);
  }
  
  // Create a new viewer
  const viewer = await client.models.Viewer.create({
    role: userRole,
    code: initialCode,
    codeId: codeId
  });
  
  // Store the session ID in sessionStorage for this tab only
  if (viewer.data && viewer.data.id) {
    sessionStorage.setItem(`block-${codeId}-viewer`, viewer.data.id);
    // Also store this viewer's session association (but not in the database model)
    sessionStorage.setItem(`viewer-${viewer.data.id}-session`, sessionId);
  }
  
  if (!viewer.data) {
    throw new Error("Failed to create viewer");
  }
  
  return viewer.data;
};

// Get existing viewer or return null if not found
export const getExistingViewer = async (codeId: string): Promise<Schema["Viewer"]["type"] | null> => {
  const viewerId = sessionStorage.getItem(`block-${codeId}-viewer`);
  
  if (viewerId) {
    const result = await client.models.Viewer.get({ id: viewerId });
    if (result.data) {
      return result.data;
    }
    // If viewer no longer exists in database, remove from sessionStorage
    sessionStorage.removeItem(`block-${codeId}-viewer`);
  }
  
  return null;
};

// Update viewer code
export const updateViewerCode = async (viewerId: string, code: string): Promise<void> => {
  await client.models.Viewer.update({
    id: viewerId,
    code: code
  });
};

// Delete a viewer instance
export const deleteViewer = async (blockId: string): Promise<void> => {
  const viewerId = sessionStorage.getItem(`block-${blockId}-viewer`);
  
  if (viewerId) {
    try {
      await client.models.Viewer.delete({
        id: viewerId
      });
      // Remove viewer ID from sessionStorage
      sessionStorage.removeItem(`block-${blockId}-viewer`);
    } catch (error) {
      console.error('Error deleting viewer:', error);
    }
  }
};

// Fetch all student viewers for a code block
export const fetchStudentViewers = async (codeId: string): Promise<Schema["Viewer"]["type"][]> => {
  try {
    const result = await client.models.Viewer.list({
      filter: { 
        codeId: { eq: codeId },
        role: { eq: "student" }
      },
      // If limit is available, include it
      ...(client.models.Viewer.list.length !== undefined ? { limit: 100 } : {})
    });
    
    console.log('Fetched students:', result.data?.length || 0);
    return result.data || [];
  } catch (error) {
    console.error('Error fetching student viewers:', error);
    return [];
  }
};

// Subscribe to viewer changes for a code block
export const subscribeToViewers = (
  codeId: string,
  onUpdate: (viewers: Schema["Viewer"]["type"][]) => void
) => {
  const subscription = client.models.Viewer.observeQuery({
    filter: { 
      codeId: { eq: codeId },
      role: { eq: "student" }
    }
  }).subscribe({
    next: (data) => {
      console.log('Student viewers update:', data.items.length, 'students');
      onUpdate(data.items);
    },
    error: (error) => console.error('Viewer subscription error:', error)
  });

  return subscription;
};

// Update viewer's solved status
export const updateViewerSolvedStatus = async (viewerId: string, solved: boolean): Promise<void> => {
  await client.models.Viewer.update({
    id: viewerId,
    solved: solved
  });
};

// Subscribe to student code changes
export const subscribeToStudentCode = (
  studentViewers: Schema["Viewer"]["type"][], 
  onCodeUpdate: (studentId: string, code: string) => void
) => {
  // Create subscriptions for all student viewers
  const subscriptions = studentViewers.map(student => {
    if (!student.id) return null;
    
    // First get the initial code
    client.models.Viewer.get({ id: student.id }).then(result => {
      if (result.data) {
        onCodeUpdate(student.id || '', result.data?.code || '');
      }
    });
    
    // Then subscribe to changes
    return client.models.Viewer.observeQuery({
      filter: { id: { eq: student.id } }
    }).subscribe({
      next: (data) => {
        if (data.items.length > 0) {
          const updatedStudent = data.items[0];
          onCodeUpdate(student.id || '', updatedStudent.code || '');
        }
      },
      error: (error) => console.error(`Student code subscription error for ${student.id}:`, error)
    });
  }).filter(Boolean);
  
  return subscriptions;
};

// Handle solution checking 
export const checkSolution = (code: string, solution: string): boolean => {
  if (!solution || !code) return false;
  
  // Compare the user's code with the solution
  // Trim both to ignore whitespace differences
  const normalizedCode = code.trim();
  const normalizedSolution = solution.trim();
  return normalizedCode === normalizedSolution;
};

// Initialize code block session
export const initializeSession = async (blockId: string) => {
  if (!blockId) return null;
  
  // Fetch code block data
  const data = await fetchCodeBlock(blockId);
  if (!data) return null;
  
  // Determine user role
  const userRole = await determineUserRole(blockId);
  
  // Get existing viewer or create new one
  let viewerData = await getExistingViewer(blockId);
  let isNewViewer = false;
  
  if (!viewerData) {
    // Create a new viewer
    viewerData = await createViewer(blockId, userRole, data?.skeletonCode || "");
    isNewViewer = true;
  }
  
  // Increment signed count for student only if this is a new viewer
  if (viewerData.role === "student" && isNewViewer) {
    await incrementSignedCount(blockId);
  }
  
  return {
    codeBlock: data,
    role: userRole,
    viewer: viewerData,
    code: viewerData.code || data?.skeletonCode || "",
  };
};

// Handle cleanup when leaving a block
export const cleanupSession = (blockId: string, role: Role): void => {
  if (!blockId) return;
  
  // Decrement signed count when user leaves
  decrementSignedCount(blockId);
  
  // Release mentor role if needed
  releaseMentorRole(blockId, role);
  
  // Delete viewer instance when user leaves
  deleteViewer(blockId);
};

// Handle mentor checking for student leaving
export const handleMentorStatusChange = (
  previousHasMentor: boolean | null, 
  currentHasMentor: boolean | null, 
  role: Role,
  onMentorLeave: () => void
): boolean | null => {
  // Check if mentor status has changed from true to false
  if (previousHasMentor === true && currentHasMentor === false && role === 'student') {
    console.log('Mentor has left the room, redirecting to lobby');
    onMentorLeave();
  }
  
  return currentHasMentor;
}; 