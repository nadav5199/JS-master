import { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import CodeBlocksCard from "../components/CodeBlocksCard";
import { Container, Typography, Grid, Box, Skeleton, Paper } from "@mui/material";

const client = generateClient<Schema>();

function Lobby() {
    const [codeBlocks, setCodeBlocks] = useState<Array<Schema["CodeBlock"]["type"]>>([]);
    const [loading, setLoading] = useState(true);

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

            {loading ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {[1, 2, 3, 4].map((item) => (
                        <Paper key={item} sx={{ p: 3, height: '100%' }}>
                            <Skeleton variant="rectangular" height={40} width="60%" sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
                            <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
                            <Skeleton variant="rectangular" height={20} width="80%" />
                        </Paper>
                    ))}
                </Box>
            ) : codeBlocks.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    {codeBlocks.map((codeBlock) => (
                        <Box key={codeBlock.id}>
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
