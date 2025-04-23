import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";
import { Box } from '@mui/material';
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
import StudentView from "../components/StudentView.tsx";
import MentorView from "../components/MentorView.tsx";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function Block() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [codeBlock, setCodeBlock] = useState<Schema["CodeBlock"]["type"] | null>(null);
    const [code, setCode] = useState("");
    const [role, setRole] = useState<Role>("student");
    const [hasIncremented, setHasIncremented] = useState(false);
    const [viewer, setViewer] = useState<Schema["Viewer"]["type"] | null>(null);
    const [studentViewers, setStudentViewers] = useState<Schema["Viewer"]["type"][]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [studentCodeMap, setStudentCodeMap] = useState<Record<string, string>>({});
    const [previousHasMentor, setPreviousHasMentor] = useState<boolean | null>(null);

    // Initial setup and counter increment
    useEffect(() => {
        const initializeCodeBlock = async () => {
            if (!id) return;
            
            // Fetch code block data
            const data = await fetchCodeBlock(id);
            setCodeBlock(data);
            
            if (data) {
                setPreviousHasMentor(data.hasMentor);
            }
            
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
            
            // Check if mentor status has changed from true to false
            if (previousHasMentor === true && updatedCodeBlock.hasMentor === false && role === 'student') {
                console.log('Mentor has left the room, redirecting to lobby');
                // Redirect to lobby if we're a student and mentor has left
                navigate('/');
            }
            
            // Update previous state
            setPreviousHasMentor(updatedCodeBlock.hasMentor ?? null);
        });
        
        return () => {
            subscription.unsubscribe();
        };
    }, [id, previousHasMentor, role, navigate]);

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
            // Only auto-select if no student is currently selected
            if (!selectedStudent && updatedViewers.length > 0) {
                setSelectedStudent(updatedViewers[0].id || null);
            }
        });
        
        return () => {
            subscription.unsubscribe();
        };
    }, [id, role, selectedStudent]);

    // Add a new useEffect hook to subscribe to selected student's code changes
    useEffect(() => {
        if (!id || role !== 'mentor') return;
        
        // Create subscriptions for all student viewers
        const subscriptions = studentViewers.map(student => {
            if (!student.id) return null;
            
            // First get the initial code
            client.models.Viewer.get({ id: student.id }).then(result => {
                if (result.data) {
                    setStudentCodeMap(prev => ({
                        ...prev,
                        [student.id || '']: result.data?.code || ''
                    }));
                }
            });
            
            // Then subscribe to changes
            return client.models.Viewer.observeQuery({
                filter: { id: { eq: student.id } }
            }).subscribe({
                next: (data) => {
                    if (data.items.length > 0) {
                        const updatedStudent = data.items[0];
                        setStudentCodeMap(prev => ({
                            ...prev,
                            [student.id || '']: updatedStudent.code || ''
                        }));
                    }
                },
                error: (error) => console.error(`Student code subscription error for ${student.id}:`, error)
            });
        }).filter(Boolean);
        
        return () => {
            subscriptions.forEach(sub => sub?.unsubscribe());
        };
    }, [id, role, studentViewers]);

    const handleCodeChange = (value: string) => {
        setCode(value);
        
        // Update viewer code in database when it changes
        if (viewer && viewer.id) {
            updateViewerCode(viewer.id, value);
        }
    };

    const handleStudentSelect = (studentId: string) => {
        console.log('Selected student:', studentId);
        setSelectedStudent(studentId);
        // No need to update code here - the MentorView will get it from the code map
    };

    if (!codeBlock) return <div>Loading...</div>;

    // Render appropriate view based on role
    return (
        <Box sx={{ padding: 3 }}>
            {role === 'student' ? (
                <StudentView 
                    codeBlock={codeBlock}
                    code={code}
                    role={role}
                    onCodeChange={handleCodeChange}
                />
            ) : (
                <MentorView 
                    codeBlock={codeBlock}
                    code={code}
                    role={role}
                    studentViewers={studentViewers}
                    selectedStudent={selectedStudent}
                    onStudentSelect={handleStudentSelect}
                    studentCodeMap={studentCodeMap}
                />
            )}
        </Box>
    );
}

export default Block;