import { Chart } from "react-google-charts";

function flattenWbs(nodes, parent = null, list = []) {
  nodes.forEach((n) => {
    list.push({
      id: n.id,
      name: n.name,
      start: new Date(),
      end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      progress: 0,
    });

    if (n.children?.length) {
      flattenWbs(n.children, n.id, list);
    }
  });

  return list;
}

export default function GanttChart({ data }) {
  const tasks = flattenWbs(data);

  const chartData = [
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
      t.progress,
      null,
    ]),
  ];

  return (
    <Chart
      chartType="Gantt"
      width="100%"
      height="400px"
      data={chartData}
    />
  );
}