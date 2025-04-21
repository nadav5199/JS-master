import { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { seedCodeBlocks } from "../../amplify/data/seedData";
import CodeBlocksCard from "../components/CodeBlocksCard";

const client = generateClient<Schema>();

function Lobby() {
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
            {codeBlocks.map((codeBlock) => (
                <CodeBlocksCard
                    key={codeBlock.id}
                    id={codeBlock.id ?? ""}
                    title={codeBlock.title ?? ""}
                    description={codeBlock.description ?? ""}
                />
            ))}
        </main>
    );
}

export default Lobby;
