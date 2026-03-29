import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { specificationsApi, projectsApi } from '../api';

const Specifications = () => {
  const { projectId } = useParams();
  const [specifications, setSpecifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ requirements: '', constraints: '' });
  const [project, setProject] = useState(null);

  useEffect(() => {
    loadProject();
    loadSpecifications();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await projectsApi.getById(projectId);
      setProject(response.data);
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const loadSpecifications = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getById(projectId);
      setSpecifications(response.data.specifications || []);
    } catch (err) {
      setError('فشل في تحميل المواصفات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await specificationsApi.add(projectId, formData);
      setShowForm(false);
      setFormData({ requirements: '', constraints: '' });
      loadSpecifications();
    } catch (err) {
      setError('فشل في إضافة المواصفة');
      console.error(err);
    }
  };

  const handleDelete = async (specId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المواصفة؟')) {
      try {
        await specificationsApi.delete(projectId, specId);
        loadSpecifications();
      } catch (err) {
        setError('فشل في حذف المواصفة');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ requirements: '', constraints: '' });
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="specifications-page">
      <div className="specifications-header">
        <h1>مواصفات المشروع</h1>
        {project && <h2>{project.name}</h2>}
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          إضافة مواصفة جديدة
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>إضافة مواصفة جديدة</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>المتطلبات:</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>القيود:</label>
                <textarea
                  value={formData.constraints}
                  onChange={(e) => setFormData({...formData, constraints: e.target.value})}
                  rows="4"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  إضافة
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="specifications-list">
        {specifications.length === 0 ? (
          <p>لا توجد مواصفات</p>
        ) : (
          specifications.map(spec => (
            <div key={spec.id} className="spec-card">
              <div className="spec-info">
                <h3>المتطلبات</h3>
                <p>{spec.requirements}</p>
                {spec.constraints && (
                  <>
                    <h3>القيود</h3>
                    <p>{spec.constraints}</p>
                  </>
                )}
              </div>
              <div className="spec-actions">
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(spec.id)}
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

export default Specifications;