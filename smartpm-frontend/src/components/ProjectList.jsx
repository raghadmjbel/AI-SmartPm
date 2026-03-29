import { useState } from "react";
import { Link } from "react-router-dom";
import { deleteProject, updateProject } from "../api/projectApi";

export default function ProjectList({ projects, refresh }) {
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleDelete = async (id) => {
    await deleteProject(id);
    refresh();
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setName(p.name);
    setDescription(p.description);
  };

  const saveEdit = async (id) => {
    await updateProject(id, {
      name,
      description,
    });

    setEditId(null);
    refresh();
  };

  return (
    <div>
      <h3 className="section-title">📁 Projects</h3>

      {projects.length === 0 && (
        <p className="empty">No projects yet</p>
      )}

      {projects.map((p) => (
        <div className="project-card" key={p.id}>
          <div style={{ flex: 1 }}>
            <Link className="project-name" to={`/project/${p.id}`}>
              {p.name}
            </Link>
            <p className="project-desc">{p.description}</p>

            {/* INLINE EDIT MODE */}
            {editId === p.id && (
              <div className="edit-box">
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  className="input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <button
                  className="save-btn"
                  onClick={() => saveEdit(p.id)}
                >
                  Save
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => setEditId(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="actions">
            {editId !== p.id && (
              <button
                className="edit-btn"
                onClick={() => startEdit(p)}
              >
                Edit
              </button>
            )}

            <button
              className="delete-btn"
              onClick={() => handleDelete(p.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <style>{`
        .section-title {
          color: white;
          margin-bottom: 15px;
        }

        .empty {
          color: #94a3b8;
        }

        .project-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: #1f2937;
          padding: 12px;
          margin-bottom: 10px;
          border-radius: 10px;
          gap: 10px;
        }

        .project-name {
          color: #60a5fa;
          font-size: 18px;
          text-decoration: none;
        }

        .project-desc {
          color: #9ca3af;
          font-size: 12px;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .edit-btn {
          padding: 6px 10px;
          background: #f59e0b;
          color: black;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 12px;
        }

        .delete-btn {
          padding: 6px 10px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }

        .input {
          width: 100%;
          margin-top: 5px;
          padding: 6px;
          border-radius: 6px;
          border: none;
          background: #111827;
          color: white;
        }

        .save-btn {
          margin-top: 5px;
          padding: 6px 10px;
          background: #22c55e;
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          margin-right: 5px;
        }

        .cancel-btn {
          margin-top: 5px;
          padding: 6px 10px;
          background: #6b7280;
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
        }

        .edit-box {
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}