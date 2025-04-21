import { generateClient } from "aws-amplify/data";
import { type Schema } from "./resource";

const defaultCodeBlocks = [
  {
    title: "Async/Await with Fetch",
    description: "Create an async function that fetches user data from an API and returns the user's name. Use async/await syntax.",
    skeletonCode: `async function fetchUserName(userId) {
  // Use fetch to get data from 'https://api.example.com/users/{userId}'
  // Return the user's name from the response
}`,
    solution: `async function fetchUserName(userId) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    const data = await response.json();
    return data.name;
  } catch (error) {
    throw new Error('Failed to fetch user');
  }
}`
  },
  {
    title: "Array Methods with Map and Filter",
    description: "Use map() and filter() to transform an array of numbers: filter out odd numbers and double the even ones.",
    skeletonCode: `function transformArray(numbers) {
  // Filter out odd numbers
  // Double the remaining even numbers
  // Return the result
}`,
    solution: `function transformArray(numbers) {
  return numbers
    .filter(num => num % 2 === 0)
    .map(num => num * 2);
}`
  },
  {
    title: "Promise Chaining",
    description: "Create a chain of promises that processes data sequentially: fetch data, validate it, and transform it.",
    skeletonCode: `function processData(input) {
  // Return a promise chain that:
  // 1. Validates the input (must be a number > 0)
  // 2. Doubles the number
  // 3. Converts to string
}`,
    solution: `function processData(input) {
  return Promise.resolve(input)
    .then(num => {
      if (typeof num !== 'number' || num <= 0) {
        throw new Error('Invalid input');
      }
      return num;
    })
    .then(num => num * 2)
    .then(num => String(num));
}`
  },
  {
    title: "Destructuring and Rest Parameters",
    description: "Create a function that uses destructuring and rest parameters to extract and process array elements.",
    skeletonCode: `function extractAndSum(array) {
  // Use destructuring to get first two elements
  // Use rest parameter to get remaining elements
  // Return sum of all elements
}`,
    solution: `function extractAndSum(array) {
  const [first, second, ...rest] = array;
  return first + second + rest.reduce((sum, num) => sum + num, 0);
}`
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