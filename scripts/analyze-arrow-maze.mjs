import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const rootDir = process.cwd();
const appScriptPath = path.join(rootDir, "site/assets/app.js");

function extractLevels(source) {
  const match = source.match(/const levels = (\[[\s\S]*?\n  \];)/u);
  if (!match) {
    throw new Error("Could not find Arrow Maze levels in site/assets/app.js");
  }

  return vm.runInNewContext(match[1], {}, { timeout: 1000 });
}

const directionMap = {
  U: [0, -1],
  D: [0, 1],
  L: [-1, 0],
  R: [1, 0],
};

function allowedMoves(level, x, y) {
  const tile = level.grid[y]?.[x];
  if (!tile || tile === "G") return [];

  if (tile === "*") {
    return Object.entries(directionMap)
      .map(([mark, [dx, dy]]) => ({
        mark,
        x: x + dx,
        y: y + dy,
      }))
      .filter((move) => level.grid[move.y]?.[move.x]);
  }

  const [dx, dy] = directionMap[tile] || [];
  if (dx === undefined || !level.grid[y + dy]?.[x + dx]) {
    return [];
  }

  return [{ mark: tile, x: x + dx, y: y + dy }];
}

function solveLevel(level) {
  const queue = [
    {
      x: level.start[0],
      y: level.start[1],
      path: [[level.start[0], level.start[1]]],
    },
  ];
  const seen = new Set([level.start.join(",")]);

  while (queue.length) {
    const current = queue.shift();
    if (current.x === level.finish[0] && current.y === level.finish[1]) {
      return current.path;
    }

    for (const move of allowedMoves(level, current.x, current.y)) {
      const key = `${move.x},${move.y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({
        x: move.x,
        y: move.y,
        path: [...current.path, [move.x, move.y]],
      });
    }
  }

  return null;
}

function classifyPressure(metrics) {
  if (metrics.falseChoiceEdges >= 9 || metrics.branchTiles >= 5) {
    return "Branch pressure";
  }
  if (metrics.turns >= 10) {
    return "Turn pressure";
  }
  if (metrics.openOnPath >= 2 || metrics.falseChoiceEdges >= 4) {
    return "Choice timing";
  }
  if (metrics.routeLength >= 16 || metrics.boardArea >= 72) {
    return "Scan endurance";
  }
  return "Route reading";
}

function computeMetrics(level, index) {
  const path = solveLevel(level);
  if (!path) {
    throw new Error(`Level ${level.name || index + 1} has no valid route`);
  }

  const pathKeys = new Set(path.map(([x, y]) => `${x},${y}`));
  let turns = 0;
  let openOnPath = 0;
  let branchTiles = 0;
  let falseChoiceEdges = 0;

  for (let i = 0; i < path.length; i += 1) {
    const [x, y] = path[i];
    const tile = level.grid[y][x];
    const moves = allowedMoves(level, x, y);

    if (tile === "*") {
      openOnPath += 1;
      if (moves.length > 1) {
        branchTiles += 1;
        falseChoiceEdges += moves.filter((move) => !pathKeys.has(`${move.x},${move.y}`)).length;
      }
    }

    if (i > 0 && i < path.length - 1) {
      const [prevX, prevY] = path[i - 1];
      const [nextX, nextY] = path[i + 1];
      const inDirection = `${x - prevX},${y - prevY}`;
      const outDirection = `${nextX - x},${nextY - y}`;
      if (inDirection !== outDirection) {
        turns += 1;
      }
    }
  }

  const boardArea = level.grid.length * level.grid[0].length;
  const openTiles = level.grid.flat().filter((tile) => tile === "*").length;
  const routeLength = path.length - 1;
  const pressure = classifyPressure({
    routeLength,
    boardArea,
    openOnPath,
    branchTiles,
    falseChoiceEdges,
    turns,
  });

  return {
    index: index + 1,
    name: level.name,
    boardArea,
    routeLength,
    goalSteps: level.goalSteps,
    openTiles,
    openOnPath,
    turns,
    branchTiles,
    falseChoiceEdges,
    pressure,
  };
}

function formatTable(rows) {
  const headers = [
    "Lv",
    "Name",
    "Route",
    "Area",
    "Turns",
    "Open",
    "OpenOnPath",
    "FalseEdges",
    "Pressure",
  ];

  const body = rows.map((row) => [
    String(row.index),
    row.name,
    String(row.routeLength),
    String(row.boardArea),
    String(row.turns),
    String(row.openTiles),
    String(row.openOnPath),
    String(row.falseChoiceEdges),
    row.pressure,
  ]);

  const widths = headers.map((header, column) =>
    Math.max(header.length, ...body.map((row) => row[column].length))
  );

  const line = (cells) =>
    cells
      .map((cell, index) => cell.padEnd(widths[index], " "))
      .join(" | ");

  const separator = widths.map((width) => "-".repeat(width)).join("-|-");
  return [line(headers), separator, ...body.map(line)].join("\n");
}

const source = fs.readFileSync(appScriptPath, "utf8");
const levels = extractLevels(source);
const rows = levels.map(computeMetrics);

const summary = {
  levelCount: rows.length,
  routeRange: [Math.min(...rows.map((row) => row.routeLength)), Math.max(...rows.map((row) => row.routeLength))],
  areaRange: [Math.min(...rows.map((row) => row.boardArea)), Math.max(...rows.map((row) => row.boardArea))],
  turnRange: [Math.min(...rows.map((row) => row.turns)), Math.max(...rows.map((row) => row.turns))],
  falseEdgeRange: [
    Math.min(...rows.map((row) => row.falseChoiceEdges)),
    Math.max(...rows.map((row) => row.falseChoiceEdges)),
  ],
};

console.log("Arrow Maze difficulty factors\n");
console.log(JSON.stringify(summary, null, 2));
console.log("");
console.log(formatTable(rows));
