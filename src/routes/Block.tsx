import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";
import { Box } from '@mui/material';
import { 
  Role, 
  subscribeToCodeBlock,
  subscribeToViewers,
  updateViewerCode,
  fetchStudentViewers,
  subscribeToStudentCode,
  initializeSession,
  cleanupSession,
  handleMentorStatusChange
} from "../utils/codeBlockManager";
import StudentView from "../components/StudentView.tsx";
import MentorView from "../components/MentorView.tsx";

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
        const setup = async () => {
            if (!id) return;
            
            const sessionData = await initializeSession(id);
            if (sessionData) {
                setCodeBlock(sessionData.codeBlock);
                setRole(sessionData.role);
                setViewer(sessionData.viewer);
                setCode(sessionData.code);
                setPreviousHasMentor(sessionData.codeBlock.hasMentor);
                setHasIncremented(true);
            }
        };

        setup();

        // Cleanup function to handle user leaving
        return () => {
            if (id && hasIncremented) {
                cleanupSession(id, role);
            }
        };
    }, [id, hasIncremented]);

    // Real-time subscription for updates
    useEffect(() => {
        if (!id) return;
        
        // Set up a real-time subscription to the specific code block
        const subscription = subscribeToCodeBlock(id, (updatedCodeBlock) => {
            setCodeBlock(updatedCodeBlock);
            
            // Check if mentor status has changed
            const newHasMentor = handleMentorStatusChange(
                previousHasMentor, 
                updatedCodeBlock.hasMentor, 
                role,
                () => navigate('/')
            );
            
            // Update previous state
            setPreviousHasMentor(newHasMentor);
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

    // Subscribe to student code changes
    useEffect(() => {
        if (!id || role !== 'mentor') return;
        
        const subscriptions = subscribeToStudentCode(studentViewers, (studentId, studentCode) => {
            setStudentCodeMap(prev => ({
                ...prev,
                [studentId]: studentCode
            }));
        });
        
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
        setSelectedStudent(studentId);
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
                    viewerId={viewer?.id || undefined}
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