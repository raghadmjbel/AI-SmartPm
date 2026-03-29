import { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
      if (response.data.length > 0) {
        setSelectedProject(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      await api.post('/projects', {
        name: newProjectName,
        description: newProjectDesc
      });
      setNewProjectName('');
      setNewProjectDesc('');
      loadProjects();
      alert('Project created successfully');
    } catch (error) {
      console.error('Failed to create project', error);
      alert('Failed to create project');
    }
  };

  const deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
      alert('Project deleted successfully');
    } catch (error) {
      console.error('Failed to delete project', error);
      alert('Failed to delete project');
    }
  };

  const selectProject = (project) => {
    setSelectedProject(project);
  };

  return (
    <div className="main fade">
      <h1>Dashboard</h1>

      <div className="card">
        <h3>Create New Project</h3>
        <input
          type="text"
          placeholder="Project Name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <textarea
          placeholder="Project Description"
          value={newProjectDesc}
          onChange={(e) => setNewProjectDesc(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <button onClick={createProject}>Create Project</button>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Projects List</h3>
        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.description}</td>
                  <td>
                    <button onClick={() => selectProject(project)}>Select</button>
                    <button onClick={() => deleteProject(project.id)} style={{ marginLeft: '5px', background: '#dc2626' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No projects found.</p>
        )}
      </div>

      {selectedProject && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Selected Project: {selectedProject.name}</h3>
          <p><strong>Description:</strong> {selectedProject.description}</p>
          <p><strong>Specifications:</strong> {selectedProject.specifications?.length || 0}</p>
          <p><strong>Artifacts:</strong> {selectedProject.artifacts?.length || 0}</p>
        </div>
      )}
    </div>
  );
}
