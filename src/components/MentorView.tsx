// src/components/MentorView.tsx
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import type { Schema } from "../../amplify/data/resource";
import { Role } from "../utils/codeBlockManager";
import StudentList from "./StudentList";

interface MentorViewProps {
    codeBlock: Schema["CodeBlock"]["type"];
    code: string;
    role: Role;
    studentViewers: Schema["Viewer"]["type"][];
    selectedStudent: string | null;
    onStudentSelect: (studentId: string) => void;
    studentCodeMap: Record<string, string>;
}

function MentorView({
    codeBlock,
    role,
    studentViewers,
    selectedStudent,
    onStudentSelect,
    studentCodeMap
}: MentorViewProps) {
    // Get the selected student's code from the map
    const selectedStudentCode = selectedStudent ? studentCodeMap[selectedStudent] || "" : "";

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
                    <Box sx={{ width: '25%', borderRight: '1px solid #e0e0e0', pr: 2, height: '400px', overflow: 'hidden' }}>
                        <StudentList
                            studentViewers={studentViewers}
                            selectedStudent={selectedStudent}
                            onStudentSelect={onStudentSelect}
                        />
                    </Box>

                    {/* Student Code View */}
                    <Box sx={{ width: '75%', pl: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {selectedStudent ? `Student Code (Read Only)` : 'Select a student to view their code'}:
                        </Typography>
                        {selectedStudent ? (
                            <CodeMirror
                                value={selectedStudentCode}
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