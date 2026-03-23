import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Scope from './pages/Scope';
import Requirements from './pages/Requirements';
import Tasks from './pages/Tasks';
import Gantt from './pages/Gantt';
import Risks from './pages/Risks';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scope" element={<Scope />} />
        <Route path="/requirements" element={<Requirements />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/gantt" element={<Gantt />} />
        <Route path="/risks" element={<Risks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
