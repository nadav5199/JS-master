import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { seedCodeBlocks } from "../amplify/data/seedData";


const client = generateClient<Schema>();

function App() {
  const [codeBlocks, setCodeBlocks] = useState<Array<Schema["CodeBlock"]["type"]>>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await seedCodeBlocks();
      } catch (error) {
        console.error('Error seeding CodeBlock table:', error);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    client.models.CodeBlock.observeQuery().subscribe({
      next: (data) => setCodeBlocks([...data.items]),
    });
  }, []);


  return (
    <main>
      <h1>choose a code block</h1>
      <ul>
        {codeBlocks.map((codeBlock) => (
          <li key={codeBlock.id}>{codeBlock.title}</li>
        ))}
      </ul>
    </main>
  );
}

export default App;
