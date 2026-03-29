import { useState } from "react";
import {
  addSpecification,
  deleteSpecification,
} from "../api/projectApi";

export default function SpecificationForm({ projectId, refresh }) {
  const [requirements, setRequirements] = useState("");
  const [constraints, setConstraints] = useState("");

  const handleAdd = async () => {
    await addSpecification(projectId, {
      requirements,
      constraints,
    });
    setRequirements("");
    setConstraints("");
    refresh();
  };

  return (
    <div>
      <h3>Add Requirements</h3>

      <input
        placeholder="Requirements"
        value={requirements}
        onChange={(e) => setRequirements(e.target.value)}
      />

      <input
        placeholder="Constraints"
        value={constraints}
        onChange={(e) => setConstraints(e.target.value)}
      />

      <button onClick={handleAdd}>Add</button>
    </div>
  );
}