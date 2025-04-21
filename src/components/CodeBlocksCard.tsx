import { Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function CodeBlocksCard({title, description, id}: {title: string, description: string, id: string}) {
    const navigate = useNavigate();
    
    return(
        <Card 
            sx={{ minWidth: 275, margin: 2, cursor: 'pointer' }} 
            onClick={() => navigate(`/block/${id}`)}
        >
            <CardContent>
                <Typography variant="h5" component="div">
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>
        </Card>
    )
}

export default CodeBlocksCard;
