import { useEffect, useState } from 'react';
import api from '../api';

export default function Gantt() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGantt = async () => {
      try {
        const response = await api.get('/projects/1/artifacts/gantt');
        const data = JSON.parse(response.data.contentJson);
        if (Array.isArray(data)) {
          setTasks(data);
        } else if (data.tasks) {
          setTasks(data.tasks);
        }
      } catch (error) {
        console.warn('Gantt artifact not found, using fallback', error);
        setTasks([
          { name: 'Task A', start: '2026-03-01', end: '2026-03-10', progress: 50 },
          { name: 'Task B', start: '2026-03-11', end: '2026-03-20', progress: 30 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadGantt();
  }, []);

  const generateGantt = async () => {
    try {
      await api.post('/projects/1/generate/gantt');
      const response = await api.get('/projects/1/artifacts/gantt');
      const data = JSON.parse(response.data.contentJson);
      setTasks(Array.isArray(data) ? data : data.tasks || []);
      alert('Gantt generated successfully');
    } catch (error) {
      console.error('Failed to generate Gantt', error);
      alert('Failed to generate Gantt');
    }
  };

  return (
    <div className="main fade">
      <h1>Gantt Chart</h1>
      <div className="card">
        <h3>Project Timeline</h3>
        <button onClick={generateGantt} style={{ marginBottom: '12px' }}>Generate Gantt from API</button>
        {loading ? (
          <p>Loading Gantt data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, idx) => (
                <tr key={idx}>
                  <td>{task.name}</td>
                  <td>{task.start}</td>
                  <td>{task.end}</td>
                  <td>
                    <div style={{
                      background: '#334155',
                      height: '20px',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#38bdf8',
                        height: '100%',
                        width: `${task.progress}%`
                      }} />
                    </div>
                    {task.progress}%
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
