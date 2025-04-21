import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Block from './routes/Block';
import Lobby from './routes/Lobby';
import NavBar from './components/NavBar';
import { Box } from '@mui/material';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar />
        <Box component="main" sx={{ flexGrow: 1 }}>
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
