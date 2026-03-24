import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Risks() {
  const [risks, setRisks] = useState([
    { id: 1, risk: 'Resource Shortage', level: 'High' },
    { id: 2, risk: 'Schedule Delay', level: 'Medium' }
  ]);

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const response = await axios.get('http://192.168.x.x:5054/api/projects/1/artifacts');
        const risksArtifact = response.data.find(a => a.type === 'RiskRegister');
        if (risksArtifact) {
          setRisks(JSON.parse(risksArtifact.contentJson));
        }
      } catch (err) {
        console.log('No risks found');
      }
    };
    fetchRisks();
  }, []);

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
