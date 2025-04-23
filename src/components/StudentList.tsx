// src/components/StudentList.tsx
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Schema } from "../../amplify/data/resource";

interface StudentListProps {
    studentViewers: Schema["Viewer"]["type"][];
    selectedStudent: string | null;
    onStudentSelect: (studentId: string) => void;
}

function StudentList({
    studentViewers,
    selectedStudent,
    onStudentSelect
}: StudentListProps) {
    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Students ({studentViewers.length})
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
                            {studentViewer.solved && (
                                <ListItemIcon sx={{ minWidth: '30px' }}>
                                    <CheckCircleIcon color="success" />
                                </ListItemIcon>
                            )}
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
    );
}

export default StudentList;