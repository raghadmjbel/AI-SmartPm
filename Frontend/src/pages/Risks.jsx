import { useState } from 'react';

export default function Risks() {
  const [risks, setRisks] = useState([
    { id: 1, risk: 'Resource Shortage', level: 'High' },
    { id: 2, risk: 'Schedule Delay', level: 'Medium' }
  ]);

  return (
    <div className="main fade">
      <h1>Risks</h1>
      <div className="card">
        <h3>Project Risks</h3>
        <table>
          <thead>
            <tr>
              <th>Risk</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => (
              <tr key={risk.id}>
                <td>{risk.risk}</td>
                <td style={{
                  color: risk.level === 'High' ? '#ff6b6b' : risk.level === 'Medium' ? '#ffa726' : '#66bb6a'
                }}>
                  {risk.level}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
