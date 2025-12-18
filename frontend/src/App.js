import React from "react";
import { Route, Link, Routes, useLocation } from "react-router-dom";
import "./App.css";
import PathfindingVisualizerPage from "./PathfindingVisualizerPage";
import HomePage from "./HomePage";

const AppShell = () => {
  const location = useLocation();

  return (
    <div className="App">
      <header className="header">
        <div className="header-title">
          <h1>Dijkstra&apos;s Algorithm Visualizer</h1>
          <p>Understand shortest paths through interactive visualization & code.</p>
        </div>
        <nav>
          <Link
            to="/"
            className={location.pathname === "/" ? "nav-link-active" : ""}
          >
            Home
          </Link>
          <Link
            to="/visualizer"
            className={
              location.pathname === "/visualizer" ? "nav-link-active" : ""
            }
          >
            Visualizer
          </Link>
        </nav>
      </header>

      <main className="main-layout">
        <div className="content-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/visualizer" element={<PathfindingVisualizerPage />} />
          </Routes>
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
};

function App() {
  return <AppShell />;
}

export default App;
