import { seedCodeBlocks } from '../amplify/data/seedData';

try {
  await seedCodeBlocks();
} catch (error) {
  console.error('Error seeding CodeBlock table:', error);
} 