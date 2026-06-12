import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const rootDir = process.cwd();
const gamePagePath = path.join(rootDir, "site/games/arrow-maze/index.html");
const appScriptPath = path.join(rootDir, "site/assets/app.js");
const issues = [];

function fail(message) {
  issues.push(message);
}

function extractLevels(source) {
  const match = source.match(/const levels = (\[[\s\S]*?\n  \];)/u);
  if (!match) {
    fail("Could not find Arrow Maze levels in site/assets/app.js");
    return [];
  }

  try {
    return vm.runInNewContext(match[1], {}, { timeout: 1000 });
  } catch (error) {
    fail(`Could not parse Arrow Maze levels: ${error.message}`);
    return [];
  }
}

function solveLevel(level) {
  const directionMap = {
    U: [0, -1, "ArrowUp"],
    D: [0, 1, "ArrowDown"],
    L: [-1, 0, "ArrowLeft"],
    R: [1, 0, "ArrowRight"],
  };
  const moves = Object.entries(directionMap);
  const startKey = level.start.join(",");
  const queue = [{ x: level.start[0], y: level.start[1], path: [] }];
  const seen = new Set([startKey]);

  while (queue.length) {
    const current = queue.shift();
    if (current.x === level.finish[0] && current.y === level.finish[1]) {
      return current.path;
    }

    const tile = level.grid[current.y]?.[current.x];
    const allowed = tile === "*" ? moves : [[tile, directionMap[tile]]].filter(([, value]) => value);

    for (const [, direction] of allowed) {
      const nextX = current.x + direction[0];
      const nextY = current.y + direction[1];
      if (!level.grid[nextY]?.[nextX]) continue;

      const key = `${nextX},${nextY}`;
      if (seen.has(key)) continue;

      seen.add(key);
      queue.push({
        x: nextX,
        y: nextY,
        path: [...current.path, direction[2]],
      });
    }
  }

  return null;
}

if (!fs.existsSync(gamePagePath)) {
  fail("Missing Arrow Maze page at site/games/arrow-maze/index.html");
} else {
  const html = fs.readFileSync(gamePagePath, "utf8");
  const requiredSnippets = [
    "<h1>Arrow Maze</h1>",
    "data-arrow-maze",
    "What is Arrow Maze?",
    "How to Play",
    "Controls",
    "Tips and Strategy",
    "Why Play Arrow Maze?",
    "Related Arrow Games",
    "Credits / License",
    "Arrow Maze is an original browser game built for this site; no",
    "external game source used",
    "Replay Run",
    "Target-step goals",
  ];

  for (const snippet of requiredSnippets) {
    if (!html.includes(snippet)) {
      fail(`Arrow Maze page missing required content: ${snippet}`);
    }
  }

  const faqCount = (html.match(/<details>/gu) || []).length;
  if (faqCount < 6) {
    fail(`Arrow Maze page should include at least 6 FAQ entries, found ${faqCount}`);
  }

  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/gu, " ")
    .replace(/<style[\s\S]*?<\/style>/gu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
  const wordCount = visibleText ? visibleText.split(/\s+/u).length : 0;
  if (wordCount < 600) {
    fail(`Arrow Maze page should include at least 600 visible words, found ${wordCount}`);
  }
}

if (!fs.existsSync(appScriptPath)) {
  fail("Missing game script at site/assets/app.js");
} else {
  const source = fs.readFileSync(appScriptPath, "utf8");
  const levels = extractLevels(source);

  if (levels.length !== 15) {
    fail(`Arrow Maze should include 15 levels, found ${levels.length}`);
  }

  levels.forEach((level, index) => {
    const label = level.name || `Level ${index + 1}`;
    const finishTile = level.grid[level.finish?.[1]]?.[level.finish?.[0]];
    if (finishTile !== "G") {
      fail(`${label} finish coordinate should point to a G tile`);
    }

    const solution = solveLevel(level);
    if (!solution) {
      fail(`${label} has no valid path from start to finish`);
      return;
    }

    if (!Number.isInteger(level.goalSteps) || level.goalSteps <= 0) {
      fail(`${label} should include a positive integer goalSteps value`);
    }

    if (level.goalSteps !== solution.length) {
      fail(
        `${label} goalSteps should match the shortest valid route (${solution.length}), found ${level.goalSteps}`
      );
    }

    if (solution.length === 0) {
      fail(`${label} solution should require at least one move`);
    }
  });
}

if (issues.length) {
  console.error("Arrow Maze verification failed:\n");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log("Arrow Maze verification passed.");
