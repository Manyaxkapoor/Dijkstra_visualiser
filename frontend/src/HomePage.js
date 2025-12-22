import React, { useState } from "react";
import "./HomePage.css";

const HomePage = () => {
  const API_BASE = process.env.REACT_APP_API_URL;
  const [code, setCode] = useState({
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <climits>
using namespace std;

#define INF INT_MAX

void dijkstra(vector<vector<pair<int, int>>> &graph, int source) {
  int V = graph.size();
  vector<int> dist(V, INF);
  priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
  dist[source] = 0;
  pq.push({0, source});

  while (!pq.empty()) {
    int u = pq.top().second;
    pq.pop();

    for (auto &neighbor : graph[u]) {
      int v = neighbor.first;
      int weight = neighbor.second;

      if (dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
        pq.push({dist[v], v});
      }
    }
  }

  // Print shortest distances from source to all vertices
  cout << "Shortest distances from source " << source << ":" << endl;
  for (int i = 0; i < V; ++i)
    cout << "Vertex " << i << ": " << dist[i] << endl;
}

int main() {
  int V = 5;
  vector<vector<pair<int, int>>> graph(V);

  // Example graph setup
  graph[0].push_back({1, 2});
  graph[0].push_back({2, 4});
  graph[1].push_back({2, 1});
  graph[1].push_back({3, 7});
  graph[2].push_back({3, 3});
  graph[3].push_back({4, 1});

  dijkstra(graph, 0);

  return 0;
}`,
  });

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");

  const handleCodeChange = (e) => {
    setCode({ ...code, [selectedLanguage]: e.target.value });
  };

  const runCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/${selectedLanguage}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: code[selectedLanguage] }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log(result);

      if (result.status === "success") {
        setOutput(result.stdout);
      } else {
        setOutput(result.stderr || result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setOutput("Error executing code. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <section className="intro">
        <h2>What is Dijkstra's Algorithm?</h2>
        <p>
          Dijkstra&apos;s algorithm finds the shortest paths from a source node to all
          other nodes in a weighted graph with non-negative edge weights. It was
          introduced by Edsger W. Dijkstra in 1956 and underpins modern routing,
          navigation and network optimization systems.
        </p>
        <p>
          The core idea is to repeatedly expand the closest unexplored node,
          relaxing (updating) distances to its neighbours until the best-known
          distance to every reachable node is fixed. This visualizer lets you
          see that process step-by-step on a grid.
        </p>
      </section>
      <section className="code-editor">
        <h2>Code Editor</h2>
        <textarea
          className="code-input"
          value={code[selectedLanguage]}
          onChange={handleCodeChange}
          placeholder="Enter your code here..."
        />
        <div className="language-select">
          <label htmlFor="language">Select language:</label>
          <select
            id="language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="cpp">C++</option>
          </select>
        </div>
        <button className="primary-button" onClick={runCode} disabled={loading}>
          {loading ? "Running..." : "Run code"}
        </button>
      </section>
      <section className="output">
        <h2>Output</h2>
        <pre className="pretag">{output}</pre>
      </section>
      <section className="applications">
        <h2>Applications</h2>
        <p>
          Dijkstra&apos;s algorithm powers GPS navigation, network routing,
          scheduling, and many optimization problems where we care about
          cheapest or fastest routes. Understanding the algorithm visually makes
          it much easier to reason about graphs and shortest path problems.
        </p>
      </section>
    </div>
  );
};

export default HomePage;
