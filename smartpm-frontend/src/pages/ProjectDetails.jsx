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

  const wbsArtifact = artifacts.find((a) => a.type === "WBS");

  let wbsData = null;
  if (wbsArtifact) {
    try {
      wbsData = JSON.parse(wbsArtifact.contentJson);
    } catch {}
  }

  return (
    <div className="container">
      <h1>📁 Project Dashboard</h1>

      {/* Project Header (READ ONLY NOW) */}
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

                {artifacts.map((a) => (
                  <div key={a.id} className="card">
                    <p><b>Type:</b> {a.type}</p>
                    <p><b>Version:</b> {a.version}</p>

                    {a.type === "WBS" && (
                      <WbsTree data={JSON.parse(a.contentJson)} />
                    )}
                  </div>
                ))}
              </div>
            ),
          },

          {
            label: "📊 Gantt Chart",
            content: (
              <div className="card">
                {wbsData ? (
                  <GanttChart data={wbsData} />
                ) : (
                  <p>No WBS generated yet</p>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}