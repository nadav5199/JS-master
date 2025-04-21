import { generateClient } from "aws-amplify/data";
import { type Schema } from "./resource";

const defaultCodeBlocks = [
  {
    title: "Async Case",
    description: "Use async/await to fetch todos and return the title of the first item.",
  },
  {
    title: "Array Unique",
    description: "Write unique(arr) that returns a new array without duplicates.",
  },
  {
    title: "Debounce Me",
    description: "Create debounce(fn, delay) that defers fn until inactivity of delay ms.",
  },
  {
    title: "Promise All",
    description: "Write promiseAll(promises) that returns an array of results from promises.",
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