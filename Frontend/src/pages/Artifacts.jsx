import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { artifactsApi, projectsApi } from '../api';

const Artifacts = () => {
  const { projectId } = useParams();
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [project, setProject] = useState(null);

  useEffect(() => {
    loadProject();
    loadArtifacts();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await projectsApi.getById(projectId);
      setProject(response.data);
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const loadArtifacts = async () => {
    try {
      setLoading(true);
      const response = await artifactsApi.getAll(projectId);
      setArtifacts(response.data);
    } catch (err) {
      setError('فشل في تحميل المخرجات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type) => {
    try {
      setGenerating(type);
      await artifactsApi.generate(projectId, type);
      loadArtifacts();
    } catch (err) {
      setError('فشل في توليد المخرجة');
      console.error(err);
    } finally {
      setGenerating(null);
    }
  };

  const handleDelete = async (artifactId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المخرجة؟')) {
      try {
        await artifactsApi.delete(projectId, artifactId);
        loadArtifacts();
      } catch (err) {
        setError('فشل في حذف المخرجة');
        console.error(err);
      }
    }
  };

  const getArtifactTypeName = (type) => {
    const types = {
      0: 'المتطلبات',
      1: 'التصميم',
      2: 'الكود',
      3: 'الاختبار',
      4: 'التوثيق',
      5: 'النشر'
    };
    return types[type] || type;
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="artifacts-page">
      <div className="artifacts-header">
        <h1>مخرجات المشروع</h1>
        {project && <h2>{project.name}</h2>}
      </div>

      <div className="generate-section">
        <h3>توليد مخرجات جديدة</h3>
        <div className="generate-buttons">
          {[0, 1, 2, 3, 4, 5].map(type => (
            <button
              key={type}
              className="btn btn-primary"
              onClick={() => handleGenerate(type)}
              disabled={generating === type}
            >
              {generating === type ? 'جاري التوليد...' : `توليد ${getArtifactTypeName(type)}`}
            </button>
          ))}
        </div>
      </div>

      <div className="artifacts-list">
        <h3>المخرجات الموجودة</h3>
        {artifacts.length === 0 ? (
          <p>لا توجد مخرجات</p>
        ) : (
          artifacts.map(artifact => (
            <div key={artifact.id} className="artifact-card">
              <div className="artifact-info">
                <h4>{getArtifactTypeName(artifact.type)}</h4>
                <p>الإصدار: {artifact.version}</p>
                <small>تاريخ الإنشاء: {new Date(artifact.createdAt).toLocaleString('ar-SA')}</small>
              </div>
              <div className="artifact-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => window.open(`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(JSON.parse(artifact.contentJson), null, 2))}`, '_blank')}
                >
                  عرض
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(artifact.id)}
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

export default Artifacts;