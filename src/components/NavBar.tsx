import { AppBar, Toolbar, Typography, Button, Box, Container, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CodeIcon from '@mui/icons-material/Code';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    return (
        <AppBar position="static" elevation={0} sx={{ 
            marginBottom: 3,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
        }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <CodeIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        <Typography variant="h6" component="div" sx={{ 
                            fontWeight: 600,
                            letterSpacing: '.1rem',
                            mr: 2,
                            display: 'flex',
                        }}>
                            Code Practice
                        </Typography>
                    </Box>
                    
                    <Box sx={{ flexGrow: 1 }} />
                    
                    <Button 
                        color="inherit"
                        onClick={() => navigate('/')}
                        sx={{ 
                            borderRadius: '20px',
                            px: 2,
                            backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.15)' : 'transparent',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.25)'
                            }
                        }}
                    >
                        Home
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default NavBar; 