import { Chart } from "react-google-charts";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

/* ================= SAFE HELPERS ================= */
const cleanNumber = (v) => {
  const n = Number(String(v).replace("%", "").trim());
  return Number.isFinite(n) ? n : 0;
};

const toDate = (v) => {
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date() : d;
};

/* ================= MAIN COMPONENT ================= */
export default function GanttChart({ data }) {
  const [fullscreen, setFullscreen] = useState(false);

  /* ================= NORMALIZE TASKS ================= */
  const tasks = useMemo(() => {
    const raw = data?.gantt?.tasks || data?.tasks || [];

    return raw.map((t, index) => {
      const start = toDate(t.start_date || t.start);
      const end = toDate(t.end_date || t.end);

      const safeEnd =
        end > start ? end : new Date(start.getTime() + 2 * 86400000);

      return {
        id: String(t.id ?? index),
        name: t.name || "Task",
        start,
        end: safeEnd,
        progress: cleanNumber(t.progress),
        dependencies: Array.isArray(t.dependencies)
          ? t.dependencies.join(",")
          : t.dependencies || "",
      };
    });
  }, [data]);

  /* ================= GOOGLE CHART DATA ================= */
  const chartData = useMemo(() => {
    return [
      [
        { type: "string", label: "Task ID" },
        { type: "string", label: "Task Name" },
        { type: "date", label: "Start Date" },
        { type: "date", label: "End Date" },
        { type: "number", label: "Duration" },
        { type: "number", label: "Percent Complete" },
        { type: "string", label: "Dependencies" },
      ],
      ...tasks.map((t) => [
        t.id,
        t.name,
        t.start,
        t.end,
        null,
        typeof t.progress === "number" && Number.isFinite(t.progress)
          ? t.progress
          : 0,
        t.dependencies,
      ]),
    ];
  }, [tasks]);

  /* ================= EXPORT EXCEL ================= */
  const exportToExcel = () => {
    const sheet = [
      ["Task ID", "Task Name", "Start", "End", "Progress", "Dependencies"],
      ...tasks.map((t) => [
        t.id,
        t.name,
        t.start.toISOString().split("T")[0],
        t.end.toISOString().split("T")[0],
        t.progress,
        t.dependencies,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gantt");
    XLSX.writeFile(wb, "gantt.xlsx");
  };

  /* ================= EXPORT SVG ================= */
  const downloadSVG = () => {
    const svgElement = document.querySelector("svg");

    if (!svgElement) {
      alert("SVG not found. Please wait for chart to load.");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);

    const blob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "gantt-chart.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* ================= RENDER ================= */
  return (
    <div
      style={{
        position: fullscreen ? "fixed" : "relative",
        inset: fullscreen ? 0 : "auto",
        zIndex: fullscreen ? 9999 : "auto",
        background: "rgb(15,23,42)",
        padding: "16px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <h3 style={{ color: "#e2e8f0" }}>📊 Gantt Chart</h3>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={exportToExcel}>📥 Excel</button>
          <button onClick={downloadSVG}>🖼️ SVG</button>
          <button onClick={() => setFullscreen((s) => !s)}>
            {fullscreen ? "Exit" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* CHART */}
      <div
        style={{
          background: "rgb(30,41,59)",
          borderRadius: "12px",
          padding: "10px",
        }}
      >
        <Chart
          chartType="Gantt"
          width="100%"
          height="450px"
          data={chartData}
          options={{
            gantt: {
              trackHeight: 38,
              barHeight: 18,
              labelStyle: {
                fontName: "Arial",
                fontSize: 12,
                bold: true, // ✅ make label bold
                color: "#e2e8f0",
              },
              criticalPathEnabled: true, // highlight critical path
              percentEnabled: true,
            },
            hAxis: {
              format: "dd MMM yyyy", // ✅ full date display
              textStyle: {
                fontName: "Arial",
                bold: true,
                color: "#e2e8f0",
              },
            },
          }}
        />
      </div>
    </div>
  );
}