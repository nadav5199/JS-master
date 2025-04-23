/**
 * Lobby page component that displays a grid of available code blocks.
 * 
 * Features:
 * - Fetches code blocks from the AWS Amplify backend
 * - Displays code blocks in a responsive grid layout
 * - Shows loading skeletons while data is being fetched
 * - Handles empty state when no code blocks are available
 */
import { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import CodeBlocksCard from "../components/CodeBlocksCard";
import { Container, Typography, Box, Skeleton, Paper } from "@mui/material";

// Initialize Amplify Data client
const client = generateClient<Schema>();

function Lobby() {
    // State for storing code blocks and loading status
    const [codeBlocks, setCodeBlocks] = useState<Array<Schema["CodeBlock"]["type"]>>([]);
    const [loading, setLoading] = useState(true);

    // Fetch code blocks when component mounts
    useEffect(() => {
        setLoading(true);
        client.models.CodeBlock.observeQuery().subscribe({
            next: (data) => {
                setCodeBlocks([...data.items]);
                setLoading(false);
            },
        });
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Page Title */}
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                    fontWeight: 'bold',
                    textAlign: 'center',
                    mb: 4,
                    textTransform: 'capitalize'
                }}
            >
                Choose a Code Block
            </Typography>

            {/* Loading State */}
            {loading ? (
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
                    gap: 3,
                    minHeight: '200px'
                }}>
                    {[1, 2, 3, 4].map((item) => (
                        <Paper key={item} sx={{ p: 3, height: '100%', minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
                            <Skeleton variant="rectangular" height={40} width="60%" sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
                            <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
                            <Skeleton variant="rectangular" height={20} width="80%" />
                        </Paper>
                    ))}
                </Box>
            ) : codeBlocks.length > 0 ? (
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
                    gap: 3,
                    minHeight: '200px'
                }}>
                    {codeBlocks.map((codeBlock) => (
                        <Box key={codeBlock.id} sx={{ height: '100%', minHeight: '180px' }}>
                            <CodeBlocksCard
                                id={codeBlock.id ?? ""}
                                title={codeBlock.title ?? ""}
                                description={codeBlock.description ?? ""}
                            />
                        </Box>
                    ))}
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary">
                        No code blocks available yet.
                    </Typography>
                </Box>
            )}
        </Container>
    );
}

export default Lobby;
