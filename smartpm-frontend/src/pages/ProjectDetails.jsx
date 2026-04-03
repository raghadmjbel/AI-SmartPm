import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getProject,
  getArtifacts,
  deleteSpecification,
} from "../api/projectApi";

import SpecificationForm from "../components/SpecificationForm";
import ArtifactGenerator from "../components/ArtifactGenerator";
import WbsTree from "../components/WbsTree";
import Tabs from "../components/Tabs";
import GanttChart from "../components/GanttChart";

export default function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [collapsedTables, setCollapsedTables] = useState({});

  const load = async () => {
    const res = await getProject(id);
    setProject(res.data);
  };

  const loadArtifacts = async () => {
    const res = await getArtifacts(id);
    setArtifacts(res.data);
  };

  useEffect(() => {
    load();
    loadArtifacts();
  }, []);

  if (!project) return <div className="container">Loading...</div>;

  const toggleCollapse = (artifactId) => {
    setCollapsedTables((prev) => ({
      ...prev,
      [artifactId]: !prev[artifactId],
    }));
  };

const copyTasks = (tasks) => {
  const header = "| ID | Name | Duration |\n|----|------|----------|";

  const rows = tasks.map(
    (t) => `| ${t.id} | ${t.name} | ${t.durationDays}d |`
  );

  const text = [header, ...rows].join("\n");

  navigator.clipboard.writeText(text);
};

  return (
    <div className="container">
      <h1>📁 Project Dashboard</h1>

      {/* Project Info */}
      <div className="card">
        <h2>{project.name}</h2>
        <p>{project.description}</p>
      </div>

      <Tabs
        tabs={[
          {
            label: "📌 Overview",
            content: (
              <div className="card">
                <h3>Project Summary</h3>
                <p>{project.description}</p>

                <h4>Specs</h4>
                {project.specifications?.map((s) => (
                  <div key={s.id} className="card">
                    <p><b>Req:</b> {s.requirements}</p>
                    <p><b>Const:</b> {s.constraints}</p>

                    <button
                      onClick={async () => {
                        await deleteSpecification(id, s.id);
                        load();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}

                <SpecificationForm projectId={id} refresh={load} />
              </div>
            ),
          },

          {
            label: "🤖 Artifacts",
            content: (
              <div className="card">
                <ArtifactGenerator projectId={id} refresh={loadArtifacts} />

                {artifacts.map((a) => {
                  const typeNames = {
                    0: "WBS",
                    1: "TaskList",
                    2: "Gantt",
                    3: "RiskRegister",
                    4: "UserStories",
                  };

                  const typeName = typeNames[a.type] || `Type ${a.type}`;

                  return (
                    <div
                      key={a.id}
                      className="card"
                      style={{
                        background: "rgb(30, 41, 59)",
                        color: "#e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      }}
                    >
                      <p><b>Type:</b> {typeName}</p>
                      <p><b>Version:</b> {a.version}</p>

                      {/* ================= TASK LIST ================= */}
                      {a.type === 1 && (() => {
                        try {
                          const parsed = JSON.parse(a.contentJson);
                          const tasks = parsed.tasks || [];
                          const collapsed = collapsedTables[a.id];

                          return (
                            <div style={{ marginTop: "10px" }}>
                              {/* HEADER */}
                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "10px"
                              }}>
                                <h4>📋 Tasks ({tasks.length})</h4>

                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    style={btn}
                                    onClick={() => toggleCollapse(a.id)}
                                  >
                                    {collapsed ? "Expand" : "Collapse"}
                                  </button>

                                  <button
                                    style={btn}
                                    onClick={() => copyTasks(tasks)}
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>

                              {/* TABLE */}
                              {!collapsed && (
                                <table style={table}>
                                  <thead>
                                    <tr style={theadRow}>
                                      <th style={th}>ID</th>
                                      <th style={th}>Name</th>
                                      <th style={thCenter}>Duration</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {tasks.map((t, i) => (
                                      <tr
                                        key={i}
                                        style={row}
                                        onMouseEnter={e => e.currentTarget.style.background = "#334155"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                      >
                                        <td style={tdId}>{t.id}</td>
                                        <td style={td}>{t.name}</td>
                                        <td style={tdCenter}>{t.durationDays}d</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          );
                        } catch {
                          return <p>Invalid TaskList data</p>;
                        }
                      })()}

                      {/* ================= WBS ================= */}
                      {a.type === 0 && (() => {
                        try {
                          const parsed = JSON.parse(a.contentJson);
                          return <WbsTree data={parsed.wbs || parsed} />;
                        } catch {
                          return <p>Invalid WBS</p>;
                        }
                      })()}

                      {/* ================= GANTT ================= */}
                      {a.type === 2 && (() => {
                        try {
                          const parsed = JSON.parse(a.contentJson);
                          return <GanttChart data={parsed} />;
                        } catch {
                          return <p>Invalid Gantt</p>;
                        }
                      })()}

                      {/* ================= RISK REGISTER ================= */}
                      {a.type === 3 && (() => {
                        try {
                          const parsed = JSON.parse(a.contentJson);
                          const risks = parsed.risks || [];
                          const collapsed = collapsedTables[a.id];

                          return (
                            <div style={{ marginTop: "10px" }}>
                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "10px"
                              }}>
                                <h4>⚠️ Risks ({risks.length})</h4>

                                <button
                                  style={btn}
                                  onClick={() => toggleCollapse(a.id)}
                                >
                                  {collapsed ? "Expand" : "Collapse"}
                                </button>
                              </div>

                              {!collapsed && (
                                <table style={table}>
                                  <thead>
                                    <tr style={theadRow}>
                                      <th style={th}>ID</th>
                                      <th style={th}>Name</th>
                                      <th style={thCenter}>Probability</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {risks.map((r, i) => (
                                      <tr key={i} style={row}>
                                        <td style={tdId}>{r.id}</td>
                                        <td style={td}>{r.name}</td>
                                        <td style={tdCenter}>{Math.round((r.probability ?? 0) * 100)}%</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          );
                        } catch (e) {
                          console.error("Failed to parse RiskRegister data:", e);
                          return <p>Invalid RiskRegister data</p>;
                        }
                      })()}

                      {/* ================= USER STORIES ================= */}
                      {a.type === 4 && (() => {
                        try {
                          const parsed = JSON.parse(a.contentJson);
                          const stories = parsed.user_stories || [];
                          const collapsed = collapsedTables[a.id];

                          return (
                            <div style={{ marginTop: "10px" }}>
                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "10px"
                              }}>
                                <h4>📖 User Stories ({stories.length})</h4>
                                <button
                                  style={btn}
                                  onClick={() => toggleCollapse(a.id)}
                                >
                                  {collapsed ? "Expand" : "Collapse"}
                                </button>
                              </div>

                              {!collapsed && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                  {stories.map((s, i) => (
                                    <div key={i} style={{ padding: "10px", border: "1px solid #334155", borderRadius: "6px", background: "#0f172a" }}>
                                      <p><b>ID:</b> {s.id || `US${i + 1}`}</p>
                                      <p><b>Role:</b> {s.role || "Unknown"}</p>
                                      <p><b>Goal:</b> {s.goal || "No goal provided"}</p>
                                      <p><b>Benefit:</b> {s.benefit || "No benefit provided"}</p>
                                      <p><b>Acceptance Criteria:</b></p>
                                      <ul>
                                        {(s.acceptance_criteria || []).map((crit, idx) => (
                                          <li key={idx}>{crit}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        } catch (e) {
                          console.error("Failed to parse UserStories data:", e);
                          return <p>Invalid UserStories data</p>;
                        }
                      })()}
                    </div>
                  );
                })}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

/* ================= STYLES ================= */

const btn = {
  background: "rgb(59, 130, 246)",
  color: "#e2e8f0",
  border: "none",
  padding: "6px 12px",
  borderRadius: "5px",
  cursor: "pointer",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const theadRow = {
  background: "#1e293b",
  borderBottom: "2px solid #334155",
};

const th = {
  padding: "10px",
  textAlign: "left",
  color: "#cbd5f5",
};

const thCenter = {
  ...th,
  textAlign: "center",
};

const row = {
  borderBottom: "1px solid #334155",
  transition: "0.2s",
};

const td = {
  padding: "10px",
};

const tdCenter = {
  padding: "10px",
  textAlign: "center",
};

const tdId = {
  padding: "10px",
  color: "#38bdf8",
  fontWeight: "600",
};