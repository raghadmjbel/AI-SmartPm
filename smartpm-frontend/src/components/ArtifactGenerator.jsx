import { useState } from "react";
import { generateArtifact } from "../api/projectApi";

const types = [
  "WBS",
  "TaskList",
  "Gantt",
  "RiskRegister",
  "UserStories",
];

export default function ArtifactGenerator({ projectId, refresh }) {
  const [statusMessage, setStatusMessage] = useState("");

  const handleGenerate = async (type) => {
    setStatusMessage("");

    try {
      const res = await generateArtifact(projectId, type);
      const cacheStatus = res?.data?.cacheStatus;

      if (cacheStatus === "HIT") {
        setStatusMessage("already exist in cache. (hit)");
      } else if (cacheStatus === "FORCED") {
        setStatusMessage("Regenerated due to force mode.");
      } else {
        setStatusMessage("Generated fresh artifact. (cache miss)");
      }
    } catch (error) {
      setStatusMessage("Failed to generate artifact.");
      console.error("Artifact generation failed", error);
    }

    await refresh(true);
  };

  return (
    <div className="card">
      <h3>🤖 Generate AI Artifacts</h3>

      <div className="grid">
        {types.map((t) => (
          <button
            key={t}
            className="btn"
            onClick={() => handleGenerate(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {statusMessage && (
        <p style={{ marginTop: "12px", color: "#38bdf8" }}>{statusMessage}</p>
      )}
    </div>
  );
}