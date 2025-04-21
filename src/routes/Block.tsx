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

                // Check if role is already assigned for this block
                const blockRole = localStorage.getItem(`block-${id}-role`);
                if (!blockRole) {
                    // If no role is assigned, check if anyone else has the mentor role
                    const isMentor = !localStorage.getItem(`block-${id}-has-mentor`);
                    if (isMentor) {
                        localStorage.setItem(`block-${id}-has-mentor`, 'true');
                        localStorage.setItem(`block-${id}-role`, 'mentor');
                        setRole('mentor');
                    } else {
                        localStorage.setItem(`block-${id}-role`, 'student');
                        setRole('student');
                    }
                } else {
                    setRole(blockRole as "mentor" | "student");
                }
            }
        };
        fetchCodeBlock();
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
                        <Chip
                            label={role.toUpperCase()}
                            color={role === "mentor" ? "primary" : "default"}
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                    <Typography variant="body1" paragraph>
                        {codeBlock.description}
                    </Typography>

                    {/* Code Editor */}
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