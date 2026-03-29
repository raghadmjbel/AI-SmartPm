import { useEffect, useState } from 'react';
import api from '../api';

export default function Requirements() {
  const [requirements, setRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequirements = async () => {
      try {
        const response = await api.get('/projects/1');
        const specs = response.data.specifications || [];
        if (specs.length > 0) {
          try {
            const parsed = JSON.parse(specs[0].requirements);
            setRequirements(Array.isArray(parsed) ? parsed : [{ id: Date.now(), text: parsed.toString() }]);
          } catch {
            setRequirements([{ id: Date.now(), text: specs[0].requirements || '' }]);
          }
        }
      } catch (error) {
        console.error('Failed to load requirements', error);
      } finally {
        setLoading(false);
      }
    };

    loadRequirements();
  }, []);

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, { id: Date.now(), text: newRequirement }]);
      setNewRequirement('');
    }
  };

  const deleteRequirement = (id) => {
    setRequirements(requirements.filter(req => req.id !== id));
  };

  const saveRequirements = async () => {
    try {
      const payload = {
        requirements: JSON.stringify(requirements.map(r => r.text)),
        constraints: ''
      };
      await api.post('/projects/1/projectspecifications', payload);
      alert('Requirements saved to API successfully');
    } catch (error) {
      console.error('Failed to save requirements', error);
      alert('Failed to save requirements to server.');
    }
  };

  return (
    <div className="main fade">
      <h1>Requirements</h1>
      <div className="card">
        <h3>Project Requirements</h3>
        <textarea
          value={newRequirement}
          onChange={(e) => setNewRequirement(e.target.value)}
          placeholder="Enter requirement..."
        />
        <button onClick={addRequirement}>Add Requirement</button>
        <button onClick={saveRequirements} style={{ marginLeft: '10px' }}>Save Req to API</button>

        {loading ? (
          <p>Loading requirements...</p>
        ) : requirements.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req) => (
                <tr key={req.id}>
                  <td>{req.text}</td>
                  <td>
                    <button onClick={() => deleteRequirement(req.id)}>Delete Local</button>
                    <button onClick={() => deleteRequirementFromAPI(req.id)} style={{ marginLeft: '5px', background: '#dc2626' }}>Delete from API</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No requirements loaded yet.</p>
        )}
      </div>
    </div>
  );
}
