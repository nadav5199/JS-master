import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import type { Schema } from "../../amplify/data/resource";
import { Role } from "../utils/codeBlockManager";

interface StudentViewProps {
    codeBlock: Schema["CodeBlock"]["type"];
    code: string;
    role: Role;
    onCodeChange: (value: string) => void;
}

function StudentView({ codeBlock, code, role, onCodeChange }: StudentViewProps) {
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