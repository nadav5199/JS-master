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
  const result = await client.models.CodeBlock.get({ id: blockId });
  
  if (!result.data?.hasMentor) {
    // If no mentor, become the mentor
    await client.models.CodeBlock.update({
      id: blockId,
      hasMentor: true
    });
    localStorage.setItem(`block-${blockId}-role`, 'mentor');
    return 'mentor';
  } else {
    // If there's already a mentor, check if we are the mentor
    const storedRole = localStorage.getItem(`block-${blockId}-role`);
    if (storedRole === 'mentor') {
      return 'mentor';
    } else {
      localStorage.setItem(`block-${blockId}-role`, 'student');
      return 'student';
    }
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
  const result = await client.models.Viewer.list({
    filter: { 
      codeId: { eq: codeId },
      role: { eq: "student" }
    }
  });
  
  return result.data || [];
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
      onUpdate(data.items);
    },
    error: (error) => console.error('Viewer subscription error:', error)
  });

  return subscription;
}; 