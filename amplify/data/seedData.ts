import { generateClient } from "aws-amplify/data";
import { type Schema } from "./resource";

const defaultCodeBlocks = [
  {
    title: "Hello World",
    description: "A simple hello world example",
  },
  {
    title: "Basic Loop",
    description: "Example of a basic for loop in JavaScript",
  },
  {
    title: "Function Declaration",
    description: "How to declare and use functions",
  },
];

export async function seedCodeBlocks() {
  const client = generateClient<Schema>();
  
  // Check if data already exists
  const existingBlocks = await client.models.CodeBlock.list();
  
  if (existingBlocks.data.length === 0) {
    console.log('Seeding CodeBlock table with default data...');
    
    // Create all default code blocks
    const createPromises = defaultCodeBlocks.map(block => 
      client.models.CodeBlock.create(block)
    );
    
    await Promise.all(createPromises);
    console.log('Successfully seeded CodeBlock table');
  } else {
    console.log('CodeBlock table already has data, skipping seed');
  }
} 