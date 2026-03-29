import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ThemeCustomizer from './components/ThemeCustomizer';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Artifacts from './pages/Artifacts';
import Specifications from './pages/Specifications';
import Scope from './pages/Scope';
import Requirements from './pages/Requirements';
import Tasks from './pages/Tasks';
import Gantt from './pages/Gantt';
import Risks from './pages/Risks';
import { applyTheme } from './utils/themeUtils';
import './styles/App.css';

function App() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false);

  useEffect(() => {
    // Apply saved theme on app load
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) {
      const parsedTheme = JSON.parse(savedTheme);
      applyTheme(parsedTheme);
    }

    const handleOpenThemeCustomizer = () => setThemeCustomizerOpen(true);
    window.addEventListener('openThemeCustomizer', handleOpenThemeCustomizer);

    return () => {
      window.removeEventListener('openThemeCustomizer', handleOpenThemeCustomizer);
    };
  }, []);

  return (
    <BrowserRouter>
      <Sidebar />
      <ThemeCustomizer
        isOpen={themeCustomizerOpen}
        onClose={() => setThemeCustomizerOpen(false)}
      />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId/artifacts" element={<Artifacts />} />
        <Route path="/projects/:projectId/specifications" element={<Specifications />} />
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
