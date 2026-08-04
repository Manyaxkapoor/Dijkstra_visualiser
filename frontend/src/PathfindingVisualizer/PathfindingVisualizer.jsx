import React, { Component } from "react";

import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";

import "./PathfindingVisualizer.css";

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;
const SPEEDS = {
  slow: {visit: 34, path: 80},
  normal: {visit: 16, path: 35},
  fast: {visit: 5, path: 18},
};

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      isVisualizing: false,
      editMode: "wall",
      speed: "normal",
      status: "Ready to explore",
      stats: {visited: 0, path: 0, distance: null},
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({grid});
  }

  handleMouseDown(row, col) {
    if (this.state.isVisualizing) return;
    const node = this.state.grid[row][col];

    if (this.state.editMode === "start" || this.state.editMode === "finish") {
      if (
        (this.state.editMode === "start" && node.isFinish) ||
        (this.state.editMode === "finish" && node.isStart)
      ) {
        return;
      }
      const newGrid = getNewGridWithEndpoint(
        this.state.grid,
        row,
        col,
        this.state.editMode
      );
      this.setState({grid: newGrid, mouseIsPressed: false});
      return;
    }

    if (node.isStart || node.isFinish) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid, mouseIsPressed: true});
  }

  handleMouseEnter(row, col) {
    if (
      !this.state.mouseIsPressed ||
      this.state.isVisualizing ||
      this.state.editMode !== "wall"
    ) return;
    const node = this.state.grid[row][col];
    if (node.isStart || node.isFinish) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid});
  }

  handleMouseUp() {
    this.setState({mouseIsPressed: false});
  }

  setEditMode(editMode) {
    if (this.state.isVisualizing) return;
    this.setState({editMode, mouseIsPressed: false});
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder, speed) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder, speed);
        }, speed.visit * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (element) element.classList.add("node-visited");
      }, speed.visit * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder, speed) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (element) element.classList.add("node-shortest-path");
        if (i === nodesInShortestPathOrder.length - 1) {
          this.setState({isVisualizing: false, status: "Path found"});
        }
      }, speed.path * i);
    }
    if (nodesInShortestPathOrder.length === 0) {
      this.setState({isVisualizing: false, status: "No path found"});
    }
  }

  visualizeDijkstra() {
    if (!this.state.grid.length || this.state.isVisualizing) return;

    // Run on clean node state so repeated visualizations are independent.
    const grid = this.state.grid.map(row =>
      row.map(node => ({
        ...node,
        distance: Infinity,
        isVisited: false,
        previousNode: null,
      }))
    );
    const startNode = findNode(grid, node => node.isStart);
    const finishNode = findNode(grid, node => node.isFinish);
    if (!startNode || !finishNode) return;
    document.querySelectorAll(".node").forEach(element => {
      element.classList.remove("node-visited", "node-shortest-path");
    });
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    const speed = SPEEDS[this.state.speed];
    this.setState({
      grid,
      isVisualizing: true,
      status: "Exploring the graph...",
      stats: {
        visited: visitedNodesInOrder.length,
        path: Math.max(0, nodesInShortestPathOrder.length - 1),
        distance: finishNode.distance === Infinity ? null : finishNode.distance,
      },
    }, () =>
      this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder, speed)
    );
  }

  clearBoard() {
    if (this.state.isVisualizing) return;
    const grid = this.state.grid.map(row =>
      row.map(node => ({
        ...node,
        isWall: false,
        distance: Infinity,
        isVisited: false,
        previousNode: null,
      }))
    );
    this.clearAnimationClasses();
    this.setState({grid, status: "Ready to explore", stats: {visited: 0, path: 0, distance: null}});
  }

  randomizeWalls() {
    if (this.state.isVisualizing) return;
    const grid = this.state.grid.map(row =>
      row.map(node => ({
        ...node,
        isWall: !node.isStart && !node.isFinish && Math.random() < 0.27,
        distance: Infinity,
        isVisited: false,
        previousNode: null,
      }))
    );
    this.clearAnimationClasses();
    this.setState({grid, status: "Random walls generated", stats: {visited: 0, path: 0, distance: null}});
  }

  clearAnimationClasses() {
    document.querySelectorAll(".node").forEach(element => {
      element.classList.remove("node-visited", "node-shortest-path");
    });
  }

  render() {
    const {grid, mouseIsPressed, isVisualizing, editMode, speed, status, stats} = this.state;

    return (
      <>
        <div className="visualizer-card">
          <div className="visualizer-header">
            <div className="visualizer-header-left">
              <h2>Dijkstra pathfinding visualizer</h2>
              <p>Shape the board, choose your endpoints, then watch the shortest route unfold.</p>
            </div>
            <div className="visualizer-controls">
              <button
                className={`mode-button ${editMode === "wall" ? "mode-button-active" : ""}`}
                onClick={() => this.setEditMode("wall")}
                disabled={isVisualizing}
              >
                Draw walls
              </button>
              <button
                className={`mode-button ${editMode === "start" ? "mode-button-active" : ""}`}
                onClick={() => this.setEditMode("start")}
                disabled={isVisualizing}
              >
                Set start
              </button>
              <button
                className={`mode-button ${editMode === "finish" ? "mode-button-active" : ""}`}
                onClick={() => this.setEditMode("finish")}
                disabled={isVisualizing}
              >
                Set finish
              </button>
              <button
                className="primary-button"
                onClick={() => this.visualizeDijkstra()}
                disabled={isVisualizing}
              >
                Visualize Dijkstra&apos;s Algorithm
              </button>
            </div>
          </div>
          <div className="utility-bar">
            <div className="utility-actions">
              <button className="secondary-button" onClick={() => this.randomizeWalls()} disabled={isVisualizing}>
                Randomize walls
              </button>
              <button className="secondary-button" onClick={() => this.clearBoard()} disabled={isVisualizing}>
                Clear board
              </button>
              <label className="speed-control">
                Speed
                <select value={speed} onChange={event => this.setState({speed: event.target.value})} disabled={isVisualizing}>
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </label>
            </div>
            <span className={`run-status ${status === "Exploring the graph..." ? "run-status-active" : ""}`}>
              <i /> {status}
            </span>
          </div>
          <div className="visualizer-subheader">
            <span className="mode-hint">
              {editMode === "wall"
                ? "Click or drag to draw walls"
                : editMode === "start"
                ? "Click a node to move the start"
                : "Click a node to move the finish"}
            </span>
            <div className="legend" aria-label="Node legend">
              <span><i className="legend-dot legend-start" /> Start</span>
              <span><i className="legend-dot legend-finish" /> Finish</span>
              <span><i className="legend-dot legend-wall" /> Wall</span>
              <span><i className="legend-dot legend-path" /> Shortest path</span>
            </div>
          </div>
          <div className="grid-shell">
            <div className="grid">
            {grid.map((row, rowIdx) => {
              return (
                <div className="grid-row" key={rowIdx}>
                  {row.map((node, nodeIdx) => {
                    const { row, col, isFinish, isStart, isWall } = node;
                    return (
                      <Node
                        key={nodeIdx}
                        col={col}
                        isFinish={isFinish}
                        isStart={isStart}
                        isWall={isWall}
                        mouseIsPressed={mouseIsPressed}
                        onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                        onMouseEnter={(row, col) =>
                          this.handleMouseEnter(row, col)
                        }
                        onMouseUp={() => this.handleMouseUp()}
                        row={row}
                      ></Node>
                    );
                  })}
                </div>
              );
            })}
            </div>
          </div>
          <div className="stats-bar" aria-label="Run statistics">
            <div><strong>{stats.visited}</strong><span>Nodes explored</span></div>
            <div><strong>{stats.path || "—"}</strong><span>Path steps</span></div>
            <div><strong>{stats.distance ?? "—"}</strong><span>Distance</span></div>
          </div>
        </div>
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const findNode = (grid, predicate) => {
  for (const row of grid) {
    const node = row.find(predicate);
    if (node) return node;
  }
  return null;
};

const getNewGridWithEndpoint = (grid, row, col, endpoint) => {
  return grid.map(currentRow =>
    currentRow.map(node => ({
      ...node,
      isStart: endpoint === "start" ? node.row === row && node.col === col : node.isStart,
      isFinish: endpoint === "finish" ? node.row === row && node.col === col : node.isFinish,
      isWall: node.row === row && node.col === col ? false : node.isWall,
    }))
  );
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
