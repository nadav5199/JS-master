import { Card, CardContent, Typography, Box, Chip, List, ListItem, ListItemText } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import type { Schema } from "../../amplify/data/resource";
import { Role } from "../utils/codeBlockManager";

interface MentorViewProps {
    codeBlock: Schema["CodeBlock"]["type"];
    code: string;
    role: Role;
    studentViewers: Schema["Viewer"]["type"][];
    selectedStudent: string | null;
    onStudentSelect: (studentId: string) => void;
}

function MentorView({ codeBlock, code, role, studentViewers, selectedStudent, onStudentSelect }: MentorViewProps) {
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
                            color="primary"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                </Box>
                <Typography variant="body1" paragraph>
                    {codeBlock.description}
                </Typography>

                {/* Student Selection and Code Viewing Section */}
                <Box sx={{ display: 'flex', mt: 3 }}>
                    {/* Student List */}
                    <Box sx={{ width: '25%', borderRight: '1px solid #e0e0e0', pr: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Students
                        </Typography>
                        {studentViewers.length > 0 ? (
                            <List>
                                {studentViewers.map((studentViewer) => (
                                    <ListItem 
                                        key={studentViewer.id}
                                        onClick={() => onStudentSelect(studentViewer.id || "")}
                                        sx={{ 
                                            borderRadius: 1, 
                                            mb: 1,
                                            bgcolor: selectedStudent === studentViewer.id ? 'action.selected' : 'transparent',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            },
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <ListItemText 
                                            primary={`Student ${studentViewers.indexOf(studentViewer) + 1}`} 
                                            secondary={`ID: ${studentViewer.id ? studentViewer.id.substring(0, 8) : 'unknown'}...`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No students connected yet.
                            </Typography>
                        )}
                    </Box>

                    {/* Student Code View */}
                    <Box sx={{ width: '75%', pl: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {selectedStudent ? `Student Code (Read Only)` : 'Select a student to view their code'}:
                        </Typography>
                        {selectedStudent ? (
                            <CodeMirror
                                value={code}
                                height="400px"
                                theme={oneDark}
                                extensions={[javascript({ jsx: true })]}
                                editable={false}
                                style={{
                                    fontSize: '14px',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}
                            />
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Select a student from the list to view their code.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default MentorView; 