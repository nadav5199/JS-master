/**
 * Main application component that sets up routing and layout structure.
 * 
 * This component configures:
 * - React Router for navigation between different views
 * - Global layout with NavBar and content area
 * - Route configuration for Lobby and Code Block pages
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Block from './routes/Block';
import Lobby from './routes/Lobby';
import NavBar from './components/NavBar';
import { Box } from '@mui/material';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <NavBar />
        <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/block/:id" element={<Block />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
