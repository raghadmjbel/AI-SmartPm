import { useEffect, useState } from 'react';
import api from '../api';

export default function Scope() {
  const [scopeText, setScopeText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScope = async () => {
      try {
        const response = await api.get('/projects/1');
        setScopeText(response.data.description || '');
      } catch (error) {
        console.error('Failed to load scope', error);
      } finally {
        setLoading(false);
      }
    };
    loadScope();
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/projects/1', {
        name: 'AI SmartPM Project',
        description: scopeText
      });
      alert('Scope saved successfully!');
    } catch (error) {
      console.error('Failed to save scope', error);
      alert('Failed to save scope to API');
    }
  };

  return (
    <div className="main fade">
      <h1>Scope</h1>
      <div className="card">
        <h3>Project Scope</h3>
        <textarea
          value={scopeText}
          onChange={(e) => setScopeText(e.target.value)}
          placeholder="Enter project scope here..."
        />
        <button onClick={handleSave}>Save Scope</button>
      </div>
    </div>
  );
}
