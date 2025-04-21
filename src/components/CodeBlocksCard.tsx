import { Card, CardContent, Typography } from '@mui/material';

function CodeBlocksCard({title, description}: {title: string, description: string}) {
    return(
        <Card sx={{ minWidth: 275, margin: 2 }}>
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
