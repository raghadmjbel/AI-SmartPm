import { generateArtifact } from "../api/projectApi";

const types = [
  "WBS",
  "TaskList",
  "Gantt",
  "RiskRegister",
  "UserStories",
  "TestCases",
];

export default function ArtifactGenerator({ projectId, refresh }) {
  return (
    <div className="card">
      <h3>🤖 Generate AI Artifacts</h3>

      <div className="grid">
        {types.map((t) => (
          <button
            key={t}
            className="btn"
            onClick={async () => {
              await generateArtifact(projectId, t);
              refresh();
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}