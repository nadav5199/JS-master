import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export type Role = "mentor" | "student";

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
  const viewer = await client.models.Viewer.create({
    role: userRole,
    code: initialCode,
    codeId: codeId
  });
  
  // Store the viewer ID in local storage for reference
  if (viewer.data && viewer.data.id) {
    localStorage.setItem(`block-${codeId}-viewer`, viewer.data.id);
  }
  
  if (!viewer.data) {
    throw new Error("Failed to create viewer");
  }
  
  return viewer.data;
};

// Get existing viewer or return null if not found
export const getExistingViewer = async (codeId: string): Promise<Schema["Viewer"]["type"] | null> => {
  const viewerId = localStorage.getItem(`block-${codeId}-viewer`);
  
  if (viewerId) {
    const result = await client.models.Viewer.get({ id: viewerId });
    return result.data;
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
  const viewerId = localStorage.getItem(`block-${blockId}-viewer`);
  
  if (viewerId) {
    try {
      await client.models.Viewer.delete({
        id: viewerId
      });
      // Remove viewer ID from local storage
      localStorage.removeItem(`block-${blockId}-viewer`);
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