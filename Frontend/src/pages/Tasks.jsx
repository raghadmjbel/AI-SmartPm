import { useState } from 'react';
import axios from 'axios';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [wbs, setWbs] = useState([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), name: newTask, status: 'Pending' }]);
      setNewTask('');
    }
  };

  const generateWBS = () => {
    const wbsTree = [
      {
        id: 1,
        name: 'Project',
        status: 'Pending',
        children: [
          {
            id: 11,
            name: 'Project Initiation',
            status: 'Pending',
            children: [
              { id: 111, name: 'Stakeholder Analysis', status: 'Pending', children: [] },
              { id: 112, name: 'Project Charter', status: 'Pending', children: [] }
            ]
          },
          {
            id: 12,
            name: 'Requirements Gathering',
            status: 'Pending',
            children: [
              { id: 121, name: 'Interviews', status: 'Pending', children: [] },
              { id: 122, name: 'Workshops', status: 'Pending', children: [] }
            ]
          },
          {
            id: 13,
            name: 'Design Phase',
            status: 'Pending',
            children: [
              { id: 131, name: 'Architecture', status: 'Pending', children: [] },
              { id: 132, name: 'UI/UX', status: 'Pending', children: [] }
            ]
          },
          { id: 14, name: 'Development', status: 'Pending', children: [] },
          { id: 15, name: 'Testing', status: 'Pending', children: [] },
          { id: 16, name: 'Deployment', status: 'Pending', children: [] }
        ]
      }
    ];
    setWbs(wbsTree);
    setTasks([].concat(...wbsTree[0].children.map(child => [{ id: child.id, name: child.name, status: child.status }])));
  };

  const generateAIWbs = async () => {
    try {
      const response = await axios.post('http://192.168.x.x:5054/api/projects/1/generate/wbs');
      const aiTasks = (response.data.data || []).map((t, index) => ({
        id: Date.now() + Math.random() + index,
        name: t.task,
        status: 'Pending',
        children: t.subtasks ? t.subtasks.map((st, i) => ({ id: Date.now() + Math.random() + i, name: st.task, status: 'Pending', children: [] })) : []
      }));
      setWbs(aiTasks.length ? [{ id: Date.now(), name: 'AI Generated WBS', status: 'Pending', children: aiTasks }] : []);
      setTasks(prevTasks => [...prevTasks, ...aiTasks.map(item => ({ id: item.id, name: item.name, status: item.status }))]);
    } catch (error) {
      alert('خطأ في الاتصال بالسيرفر!');
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const deleteArtifact = async (artifactId) => {
    try {
      await api.delete(`/projects/1/projectartifacts/${artifactId}`);
      alert('Artifact deleted successfully');
      // Reload tasks if needed
    } catch (error) {
      console.error('Failed to delete artifact', error);
      alert('Failed to delete artifact');
    }
  };

  const renderTree = (nodes, level = 0) => {
    return nodes.map((node) => (
      <div key={node.id} style={{ marginLeft: level * 20, borderLeft: level ? '1px solid #334155' : 'none', paddingLeft: level ? 10 : 0, marginTop: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#0f172a', borderRadius: '6px', alignItems: 'center' }}>
          <span>{node.name}</span>
          <span style={{ color: node.status === 'High' ? '#ff6b6b' : node.status === 'Medium' ? '#ffa726' : '#66bb6a' }}>{node.status}</span>
        </div>
        {node.children && node.children.length > 0 && renderTree(node.children, level + 1)}
      </div>
    ));
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
        <button onClick={generateAIWbs} style={{ marginLeft: '10px', background: '#10b981' }}>
          Generate by AI 🤖
        </button>
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

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>WBS Tree View</h3>
        {wbs.length > 0 ? (
          <div>{renderTree(wbs)}</div>
        ) : (
          <p style={{ color: '#94a3b8' }}>No WBS generated yet. Use Generate WBS or Generate by AI.</p>
        )}
      </div>
    </div>
  );
}
