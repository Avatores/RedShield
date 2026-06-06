import { useState } from "react";

export default function Scenarios() {
  const [scenarios] = useState([
    {
      name: "Prompt Injection",
      category: "Injection",
      severity: "High",
    },
    {
      name: "Jailbreak Attempt",
      category: "Safety",
      severity: "High",
    },
    {
      name: "Data Leakage Test",
      category: "Security",
      severity: "Medium",
    },
  ]);

  return (
    <div>
      <h1>Attack Scenarios</h1>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Severity</th>
          </tr>
        </thead>

        <tbody>
          {scenarios.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td>
              <td>{s.category}</td>
              <td>{s.severity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}