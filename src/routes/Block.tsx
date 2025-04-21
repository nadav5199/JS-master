import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
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
  deleteViewer
} from "../utils/codeBlockManager";

function Block() {
    const { id } = useParams();
    const [codeBlock, setCodeBlock] = useState<Schema["CodeBlock"]["type"] | null>(null);
    const [code, setCode] = useState("");
    const [role, setRole] = useState<Role>("student");
    const [hasIncremented, setHasIncremented] = useState(false);
    const [viewer, setViewer] = useState<Schema["Viewer"]["type"] | null>(null);

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

    const handleCodeChange = (value: string) => {
        setCode(value);
        
        // Update viewer code in database when it changes
        if (viewer && viewer.id) {
            updateViewerCode(viewer.id, value);
        }
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