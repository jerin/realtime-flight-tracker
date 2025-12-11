import "./App.css";
import FlightMap from "./Map.jsx";

function App() {

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "8px", background: "#111", color: "white" }}>
        <h1 style={{ margin: 0 }}>Realtime Flight Tracker — Demo</h1>
      </header>
      <div style={{ flex: 1 }}>
        <FlightMap />
      </div>
    </div>
  );
}

export default App;
