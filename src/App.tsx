import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Block from './routes/Block';
import Lobby from './routes/Lobby';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/block/:id" element={<Block />} />
      </Routes>
    </Router>
  );
}

export default App;
