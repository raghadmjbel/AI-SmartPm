export default function Gantt() {
  const tasks = [
    { name: 'Task A', start: '2026-03-01', end: '2026-03-10', progress: 50 },
    { name: 'Task B', start: '2026-03-11', end: '2026-03-20', progress: 30 }
  ];

  return (
    <div className="main fade">
      <h1>Gantt Chart</h1>
      <div className="card">
        <h3>Project Timeline</h3>
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
      </div>
    </div>
  );
}
