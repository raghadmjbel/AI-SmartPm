import { useState } from 'react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), name: newTask, status: 'Pending' }]);
      setNewTask('');
    }
  };

  const generateWBS = () => {
    const wbsTasks = [
      { id: Date.now() + 1, name: 'Project Initiation', status: 'Pending' },
      { id: Date.now() + 2, name: 'Requirements Gathering', status: 'Pending' },
      { id: Date.now() + 3, name: 'Design Phase', status: 'Pending' },
      { id: Date.now() + 4, name: 'Development', status: 'Pending' },
      { id: Date.now() + 5, name: 'Testing', status: 'Pending' },
      { id: Date.now() + 6, name: 'Deployment', status: 'Pending' }
    ];
    setTasks(wbsTasks);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="main fade">
      <h1>Tasks</h1>
      <div className="card">
        <h3>Add New Task</h3>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter task name..."
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '10px',
            background: '#020617',
            color: 'white',
            border: '1px solid #334155',
            borderRadius: '8px'
          }}
        />
        <button onClick={addTask}>Add Task</button>
        <button onClick={generateWBS} style={{ marginLeft: '10px' }}>Generate WBS</button>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Task List</h3>
        <table>
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.name}</td>
                <td>{task.status}</td>
                <td>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
