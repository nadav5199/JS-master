/**
 * CodeBlocksCard component displays a single code block in the lobby.
 * 
 * Features:
 * - Displays title and description of a code block
 * - Provides hover effects for better user interaction
 * - Navigates to the block detail page when clicked
 * - Ensures consistent card height with text truncation
 * 
 * @param {string} title - The title of the code block
 * @param {string} description - The description of the code block
 * @param {string} id - The unique identifier of the code block
 */
import { Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function CodeBlocksCard({title, description, id}: {title: string, description: string, id: string}) {
    const navigate = useNavigate();
    
    return(
        <Card 
            sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }
            }} 
            onClick={() => navigate(`/block/${id}`)}
        >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="div" gutterBottom>
                    {title}
                </Typography>
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                        mt: 'auto',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {description}
                </Typography>
            </CardContent>
        </Card>
    )
}

export default CodeBlocksCard;
