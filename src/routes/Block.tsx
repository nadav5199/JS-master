import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const client = generateClient<Schema>();

function Block() {
    const { id } = useParams();
    const [codeBlock, setCodeBlock] = useState<Schema["CodeBlock"]["type"] | null>(null);
    const [code, setCode] = useState("");
    const [role, setRole] = useState<"mentor" | "student">("student");

    useEffect(() => {
        const fetchCodeBlock = async () => {
            if (id) {
                const result = await client.models.CodeBlock.get({ id });
                setCodeBlock(result.data);
                setCode(result.data?.skeletonCode || "");

                // Increment signed count when a user enters the page
                const currentSignedCount = result.data?.signed || 0;
                await client.models.CodeBlock.update({
                    id: id,
                    signed: currentSignedCount + 1
                });

                if (!result.data?.hasMentor) {
                    // If no mentor, become the mentor and update the CodeBlock
                    await client.models.CodeBlock.update({
                        id: id,
                        hasMentor: true
                    });
                    setRole('mentor');
                    localStorage.setItem(`block-${id}-role`, 'mentor');
                } else {
                    // If there's already a mentor, check if we are the mentor
                    const storedRole = localStorage.getItem(`block-${id}-role`);
                    if (storedRole === 'mentor') {
                        setRole('mentor');
                    } else {
                        setRole('student');
                        localStorage.setItem(`block-${id}-role`, 'student');
                    }
                }
            }
        };

        fetchCodeBlock();

        // Cleanup function to handle user leaving
        return () => {
            if (id) {
                // Decrement signed count when user leaves
                client.models.CodeBlock.get({ id }).then((result) => {
                    const currentSignedCount = result.data?.signed || 0;
                    if (currentSignedCount > 0) {
                        client.models.CodeBlock.update({
                            id: id,
                            signed: currentSignedCount - 1
                        });
                    }
                    
                    // If user is mentor, also reset hasMentor flag
                    if (role === 'mentor') {
                        client.models.CodeBlock.update({
                            id: id,
                            hasMentor: false
                        });
                    }
                });
            }
        };
    }, [id]);

    const handleCodeChange = (value: string) => {
        setCode(value);
    };

    if (!codeBlock) return <div>Loading...</div>;

    return (
        <Box sx={{ padding: 3 }}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4">
                            {codeBlock.title}
                        </Typography>
                        <Box>
                            <Chip
                                label={`${codeBlock.signed} viewer${codeBlock.signed !== 1 ? 's' : ''}`}
                                color="secondary"
                                sx={{ fontWeight: 'bold', mr: 1 }}
                            />
                            <Chip
                                label={role.toUpperCase()}
                                color={role === "mentor" ? "primary" : "default"}
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Box>
                    </Box>
                    <Typography variant="body1" paragraph>
                        {codeBlock.description}
                    </Typography>

                    {/* Code bb Editor */}
                    <Box sx={{ my: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Your Code:
                        </Typography>
                        <CodeMirror
                            value={code}
                            height="200px"
                            theme={oneDark}
                            extensions={[javascript({ jsx: true })]}
                            onChange={handleCodeChange}
                            style={{
                                fontSize: '14px',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Block;