import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <AppBar position="static" sx={{ marginBottom: 2 }}>
            <Toolbar>
                <Typography 
                    variant="h6" 
                    sx={{ flexGrow: 1, cursor: 'pointer' }} 
                    onClick={() => navigate('/')}
                >
                    Code Practice
                </Typography>
                <Button 
                    color="inherit"
                    onClick={() => navigate('/')}
                    sx={{ 
                        backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent'
                    }}
                >
                    Home
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default NavBar; 