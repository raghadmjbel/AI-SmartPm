import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getAll();
      setProjects(response.data);
    } catch (err) {
      setError('فشل في تحميل المشاريع');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectsApi.update(editingProject.id, formData);
      } else {
        await projectsApi.create(formData);
      }
      setShowForm(false);
      setEditingProject(null);
      setFormData({ name: '', description: '' });
      loadProjects();
    } catch (err) {
      setError('فشل في حفظ المشروع');
      console.error(err);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      try {
        await projectsApi.delete(id);
        loadProjects();
      } catch (err) {
        setError('فشل في حذف المشروع');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData({ name: '', description: '' });
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>إدارة المشاريع</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          إضافة مشروع جديد
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingProject ? 'تعديل المشروع' : 'إضافة مشروع جديد'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>اسم المشروع:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>الوصف:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="4"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingProject ? 'تحديث' : 'إضافة'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="projects-list">
        {projects.length === 0 ? (
          <p>لا توجد مشاريع</p>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-info">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <small>المعرف: {project.id}</small>
              </div>
              <div className="project-actions">
                <Link to={`/projects/${project.id}/artifacts`} className="btn btn-secondary">
                  المخرجات
                </Link>
                <Link to={`/projects/${project.id}/specifications`} className="btn btn-secondary">
                  المواصفات
                </Link>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(project)}
                >
                  تعديل
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(project.id)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;