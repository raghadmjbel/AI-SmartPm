import { useState } from 'react';

export default function Requirements() {
  const [requirements, setRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState('');

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, { id: Date.now(), text: newRequirement }]);
      setNewRequirement('');
    }
  };

  const deleteRequirement = (id) => {
    setRequirements(requirements.filter(req => req.id !== id));
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
        
        {requirements.length > 0 && (
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
                    <button onClick={() => deleteRequirement(req.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
