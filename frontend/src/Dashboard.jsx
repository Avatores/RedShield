export default function Dashboard() {
  return (
    <div>
      <h1>AI Red Teaming Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div>
          <h3>Total Tests</h3>
          <p>12</p>
        </div>

        <div>
          <h3>Unsafe Outputs</h3>
          <p>3</p>
        </div>

        <div>
          <h3>Avg Risk Score</h3>
          <p>62%</p>
        </div>
      </div>
    </div>
  );
}