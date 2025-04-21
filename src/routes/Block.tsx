import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";
import { Card, CardContent, Typography, Box, Chip, List, ListItem, ListItemText } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { 
  Role, 
  fetchCodeBlock,
  incrementSignedCount, 
  decrementSignedCount, 
  determineUserRole, 
  releaseMentorRole,
  subscribeToCodeBlock,
  createViewer,
  getExistingViewer,
  updateViewerCode,
  deleteViewer,
  fetchStudentViewers,
  subscribeToViewers
} from "../utils/codeBlockManager";

function Block() {
    const { id } = useParams();
    const [codeBlock, setCodeBlock] = useState<Schema["CodeBlock"]["type"] | null>(null);
    const [code, setCode] = useState("");
    const [role, setRole] = useState<Role>("student");
    const [hasIncremented, setHasIncremented] = useState(false);
    const [viewer, setViewer] = useState<Schema["Viewer"]["type"] | null>(null);
    const [studentViewers, setStudentViewers] = useState<Schema["Viewer"]["type"][]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

    // Initial setup and counter increment
    useEffect(() => {
        const initializeCodeBlock = async () => {
            if (!id) return;
            
            // Fetch code block data
            const data = await fetchCodeBlock(id);
            setCodeBlock(data);
            
            if (!hasIncremented) {
                // Determine user role and increment count only once
                const userRole = await determineUserRole(id);
                setRole(userRole);
                
                // Get existing viewer or create new one
                let viewerData = await getExistingViewer(id);
                
                if (!viewerData) {
                    // Create a new viewer
                    viewerData = await createViewer(id, userRole, data?.skeletonCode || "");
                }
                
                setViewer(viewerData);
                setCode(viewerData.code || data?.skeletonCode || "");
                if (viewerData.role === "student") {
                    // Increment signed count
                    await incrementSignedCount(id);
                }
                setHasIncremented(true);
            }
        };

        initializeCodeBlock();

        // Cleanup function to handle user leaving
        return () => {
            if (id && hasIncremented) {
                // Decrement signed count when user leaves
                decrementSignedCount(id);
                
                // Release mentor role if needed
                releaseMentorRole(id, role);
                
                // Delete viewer instance when user leaves
                deleteViewer(id);
            }
        };
    }, [id, hasIncremented]);

    // Real-time subscription for updates
    useEffect(() => {
        if (!id) return;
        
        // Set up a real-time subscription to the specific code block
        const subscription = subscribeToCodeBlock(id, (updatedCodeBlock) => {
            setCodeBlock(updatedCodeBlock);
        });
        
        return () => {
            subscription.unsubscribe();
        };
    }, [id]);

    // Fetch student viewers if user is a mentor
    useEffect(() => {
        if (!id || role !== 'mentor') return;
        
        // Fetch initial students list
        const fetchStudents = async () => {
            const students = await fetchStudentViewers(id);
            setStudentViewers(students);
            // Select first student by default if available
            if (students.length > 0 && !selectedStudent) {
                setSelectedStudent(students[0].id || null);
            }
        };
        
        fetchStudents();
        
        // Subscribe to student viewers changes
        const subscription = subscribeToViewers(id, (updatedViewers) => {
            setStudentViewers(updatedViewers);
            // Maintain selection or select first if none selected
            if (updatedViewers.length > 0 && (!selectedStudent || !updatedViewers.find(v => v.id === selectedStudent))) {
                setSelectedStudent(updatedViewers[0].id || null);
            }
        });
        
        return () => {
            subscription.unsubscribe();
        };
    }, [id, role, selectedStudent]);

    const handleCodeChange = (value: string) => {
        setCode(value);
        
        // Update viewer code in database when it changes
        if (viewer && viewer.id) {
            updateViewerCode(viewer.id, value);
        }
    };

    const handleStudentSelect = (studentId: string) => {
        setSelectedStudent(studentId);
        // Find the selected student's code
        const student = studentViewers.find(v => v.id === studentId);
        if (student) {
            setCode(student.code || "");
        }
    };

    if (!codeBlock) return <div>Loading...</div>;

    // Render student view
    if (role === 'student') {
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

    // Render mentor view
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
                                            onClick={() => handleStudentSelect(studentViewer.id || "")}
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
        </Box>
    );
}

export default Block;