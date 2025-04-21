import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Card, CardContent, Typography, Box } from '@mui/material';

const client = generateClient<Schema>();

function Block() {
    const { id } = useParams();
    const [codeBlock, setCodeBlock] = useState<Schema["CodeBlock"]["type"] | null>(null);

    useEffect(() => {
        const fetchCodeBlock = async () => {
            if (id) {
                const result = await client.models.CodeBlock.get({ id });
                setCodeBlock(result.data);
            }
        };
        fetchCodeBlock();
    }, [id]);

    if (!codeBlock) return <div>Loading...</div>;

    return (
        <Box sx={{ padding: 3 }}>
            <Card>
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        {codeBlock.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {codeBlock.description}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Code:
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Block;
