function Node({ node }) {
  return (
    <li>
      <strong>{node.name}</strong>
      <p>{node.description}</p>

      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((c) => (
            <Node key={c.id} node={c} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function WbsTree({ data }) {
  return (
    <div>
      <h3>WBS Tree</h3>
      <ul>
        {data.map((n) => (
          <Node key={n.id} node={n} />
        ))}
      </ul>
    </div>
  );
}