import { useState } from "react";

export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Tab Buttons */}
      <div className="tabs">
        {tabs.map((t, i) => (
          <button
            key={i}
            className={i === active ? "tab active" : "tab"}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="tab-content">
        {tabs[active].content}
      </div>
    </div>
  );
}