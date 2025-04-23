import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import type { Schema } from "../../amplify/data/resource";
import { Role, updateViewerSolvedStatus } from "../utils/codeBlockManager";
import { useEffect, useState } from 'react';

interface StudentViewProps {
    codeBlock: Schema["CodeBlock"]["type"];
    code: string;
    role: Role;
    onCodeChange: (value: string) => void;
    viewerId?: string;
}

function StudentView({ codeBlock, code, role, onCodeChange, viewerId }: StudentViewProps) {
    const [isSolved, setIsSolved] = useState(false);

    // Check if code matches solution whenever code or codeBlock changes
    useEffect(() => {
        if (codeBlock?.solution && code) {
            // Compare the user's code with the solution
            // Trim both to ignore whitespace differences
            const normalizedCode = code.trim();
            const normalizedSolution = codeBlock.solution.trim();
            const solved = normalizedCode === normalizedSolution;
            setIsSolved(solved);
            
            // Update solved status in the database if viewerId is provided
            if (viewerId) {
                updateViewerSolvedStatus(viewerId, solved);
            }
        }
    }, [code, codeBlock, viewerId]);

    return (
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
                            color="default"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                </Box>
                <Typography variant="body1" paragraph>
                    {codeBlock.description}
                </Typography>

                {/* Show big smiley face when solution is correct */}
                {isSolved && (
                    <Box 
                        sx={{ 
                            textAlign: 'center', 
                            my: 2, 
                            p: 2, 
                            backgroundColor: 'success.light',
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="h1" sx={{ fontSize: '80px' }}>
                            😊
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'success.dark', fontWeight: 'bold' }}>
                            Great job! Your solution is correct!
                        </Typography>
                    </Box>
                )}

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
                        onChange={onCodeChange}
                        style={{
                            fontSize: '14px',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
}

export default StudentView; 