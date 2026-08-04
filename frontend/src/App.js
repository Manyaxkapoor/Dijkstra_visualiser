import React from "react";
import "./App.css";
import PathfindingVisualizerPage from "./PathfindingVisualizerPage";

const App = () => (
    <div className="App">
      <header className="header">
        <div className="header-title">
          <h1>Dijkstra&apos;s Algorithm Visualizer</h1>
          <p>Explore shortest paths by shaping the graph yourself.</p>
        </div>
      </header>

      <main className="main-layout">
        <div className="content-container">
          <PathfindingVisualizerPage />
        </div>
      </main>

      <footer className="footer">
        <p>
          © All rights reserved. |{" "}
          <a
            href="https://www.linkedin.com/in/manyaakapoor/"
            style={{ color: "white" }}
          >
            LinkedIn
          </a>{" "}
          |{" "}
          <a href="https://github.com/manyaxkapoor" style={{ color: "white" }}>
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );

export default App;
