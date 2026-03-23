import { useState } from 'react';

export default function Scope() {
  const [scopeText, setScopeText] = useState('');

  const handleSave = () => {
    console.log('Scope saved:', scopeText);
    alert('Scope saved successfully!');
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
