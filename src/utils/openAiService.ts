import OpenAI from 'openai';

// Initialize the OpenAI client
// The API key will be available from Amplify environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side use in development
});

export const getHint = async (
  currentCode: string, 
  problemDescription: string,
  skeletonCode: string,
  solution: string
): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful coding assistant providing hints to students. Give short, specific hints that guide without revealing the complete solution."
        },
        {
          role: "user",
          content: `
            I'm working on this coding problem:
            
            Problem: ${problemDescription}
            
            Initial skeleton code:
            ${skeletonCode}
            
            My current code:
            ${currentCode}
            
            and this is the solution:
            ${solution}
            
            Please give me a small hint to help me progress without revealing the complete solution.
          `
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "No hint available";
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to generate hint');
  }
}; 

export const getChatResponse = async (
  question: string, 
  currentCode: string, 
  problemDescription: string,
  skeletonCode: string,
  solution: string,
  chatHistory: Array<{role: 'user' | 'assistant', content: string}>
): Promise<string> => {
  try {
    // Build messages array with system prompt and chat history
    const messages = [
      {
        role: "system",
        content: "You are a helpful coding teacher assistant. Help students understand concepts but avoid giving direct solutions. Your explanations should be clear, educational, and guide the student's learning process."
      },
      // Context message with problem details
      {
        role: "user",
        content: `
          I'm working on this coding problem:
          
          Problem: ${problemDescription}
          
          Initial skeleton code:
          ${skeletonCode}
          
          My current code:
          ${currentCode}
          
          The solution pattern (for your reference only, don't reveal directly):
          ${solution}
        `
      },
      {
        role: "assistant",
        content: "I understand the problem you're working on. What questions do you have about it? I'm here to help guide you without giving away the complete solution."
      },
      // Add previous chat history
      ...chatHistory,
      // Add current question
      {
        role: "user",
        content: question
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as any, // Type assertion to match OpenAI API expectations
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Error calling OpenAI API for chat:', error);
    throw new Error('Failed to get a response from the teacher assistant');
  }
}; 