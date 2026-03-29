import { useEffect, useState } from "react";

export default function StreamingBox({ text }) {
  const [output, setOutput] = useState("");

  useEffect(() => {
    setOutput("");
    let i = 0;

    const interval = setInterval(() => {
      setOutput((prev) => prev + text[i]);
      i++;

      if (i >= text.length) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, [text]);

  return <pre className="card">{output}</pre>;
}