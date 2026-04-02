import React, { useState, useEffect } from "react";

const theme = {
  bg: "rgb(30, 41, 59)",
  card: "rgb(51, 65, 85)",
  text: "#e2e8f0",
  subtext: "#94a3b8",
  primary: "#3b82f6"
};

function Node({ node, level = 0, globalExpand }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  useEffect(() => {
    setExpanded(globalExpand);
  }, [globalExpand]);

  return (
    <li style={{ marginLeft: `${level * 20}px`, listStyle: "none" }}>
      <div
        style={{
          marginBottom: "10px",
          borderLeft: `3px solid ${theme.primary}`,
          padding: "10px 12px",
          background: theme.bg,
          borderRadius: "8px",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.card;
          e.currentTarget.style.boxShadow =
            "0 6px 18px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = theme.bg;
          e.currentTarget.style.boxShadow =
            "0 4px 12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                width: "24px",
                color: theme.primary,
                fontWeight: "bold"
              }}
            >
              {expanded ? "▼" : "▶"}
            </button>
          )}

          {!hasChildren && <span style={{ width: "24px" }}></span>}

          <div>
            <span
              style={{
                fontWeight: 700,
                color: theme.text,
                fontSize: level === 0 ? "1.1em" : "1em"
              }}
            >
              {node.id}. {node.name}
            </span>

            <p
              style={{
                margin: "4px 0 0 0",
                color: theme.subtext,
                fontSize: "0.95em",
                fontStyle: "italic"
              }}
            >
              {node.description}
            </p>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <ul style={{ padding: 0, margin: 0 }}>
          {node.children.map((c) => (
            <Node
              key={c.id}
              node={c}
              level={level + 1}
              globalExpand={globalExpand}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function wbsToText(nodes, indent = 0) {
  let lines = [];
  for (const n of nodes) {
    lines.push(`${"  ".repeat(indent)}- ${n.id}. ${n.name}: ${n.description}`);
    if (n.children && n.children.length > 0) {
      lines = lines.concat(wbsToText(n.children, indent + 1));
    }
  }
  return lines;
}

export default function WbsTree({ data }) {
  const [globalExpand, setGlobalExpand] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <p style={{ color: theme.text }}>No WBS data available</p>;
  }

  const items = Array.isArray(data) ? data : [data];

  const handleCopy = () => {
    const text = wbsToText(items).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        marginTop: "16px",
        background: theme.bg,
        borderRadius: "10px",
        padding: "18px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.6)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px"
        }}
      >
        <h3 style={{ margin: 0, color: theme.primary }}>
          📦 WBS Tree
        </h3>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setGlobalExpand((v) => !v)}
            style={{
              background: theme.primary,
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              padding: "6px 12px",
              cursor: "pointer"
            }}
          >
            {globalExpand ? "Collapse All" : "Expand All"}
          </button>

          <button
            onClick={handleCopy}
            style={{
              background: copied ? "#22c55e" : theme.primary,
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              padding: "6px 12px",
              cursor: "pointer"
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <ul style={{ padding: 0, margin: 0 }}>
        {items.map((n) => (
          <Node key={n.id} node={n} globalExpand={globalExpand} />
        ))}
      </ul>
    </div>
  );
}