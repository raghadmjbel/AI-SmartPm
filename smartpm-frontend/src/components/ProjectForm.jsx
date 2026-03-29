import { useState } from "react";
import { createProject } from "../api/projectApi";

export default function ProjectForm({ refresh }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!name || !description) return;

    await createProject({ name, description });
    setName("");
    setDescription("");
    refresh();
  };

  return (
    <div>
      <h3 className="section-title">➕ Create New Project</h3>

      <input
        className="input"
        placeholder="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="input"
        placeholder="Project Scope"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button className="btn" onClick={handleSubmit}>
        Create Project
      </button>

      <style>{`
        .section-title {
          color: white;
          margin-bottom: 15px;
        }

        .input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 8px;
          border: none;
          outline: none;
          background: #1f2937;
          color: white;
        }

        .btn {
          width: 100%;
          padding: 10px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}