document.addEventListener("DOMContentLoaded", () => {
  initComingSoonModal();
  initAdSlots();
  document.querySelectorAll("[data-arrow-maze]").forEach(initArrowMaze);
});

function initComingSoonModal() {
  const modal = document.createElement("div");
  modal.className = "coming-soon-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="coming-soon-modal__overlay" data-coming-soon-close></div>
    <div
      class="coming-soon-modal__dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
      aria-describedby="coming-soon-body"
    >
      <button
        class="coming-soon-modal__close"
        type="button"
        aria-label="Close"
        data-coming-soon-close
      >
        ×
      </button>
      <p class="coming-soon-modal__eyebrow">Coming Soon</p>
      <h2 id="coming-soon-title">Arrow Out is under development</h2>
      <p id="coming-soon-body">
        This game is not playable yet. Please check back soon.
      </p>
      <div class="coming-soon-modal__actions">
        <a class="button button-primary" href="/games/arrow-maze/">Play Arrow Maze</a>
        <button class="button button-secondary" type="button" data-coming-soon-close>
          Close
        </button>
      </div>
    </div>
  `;

  document.body.append(modal);

  const dialog = modal.querySelector(".coming-soon-modal__dialog");
  const closeButtons = [...modal.querySelectorAll("[data-coming-soon-close]")];
  let lastTrigger = null;

  function getFocusable() {
    return [...modal.querySelectorAll('a[href], button:not([disabled])')];
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", onKeyDown);
    lastTrigger?.focus();
  }

  function openModal(trigger) {
    lastTrigger = trigger;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    document.addEventListener("keydown", onKeyDown);
    window.requestAnimationFrame(() => {
      const [firstFocusable] = getFocusable();
      firstFocusable?.focus();
    });
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== "Tab" || modal.hidden) return;

    const focusable = getFocusable();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.dataset.comingSoonClose !== undefined) {
      closeModal();
    }
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(
      '[data-coming-soon="arrow-out"], a[href="/games/arrow-out.html"]'
    );
    if (!trigger) return;

    event.preventDefault();
    openModal(trigger);
  });
}

function initAdSlots() {
  const runtime = getAdRuntime();
  document.documentElement.dataset.adsEnabled = runtime.enabled ? "true" : "false";

  document.querySelectorAll("[data-ad-slot]").forEach((slot) => {
    if (!runtime.enabled) {
      slot.hidden = true;
      return;
    }

    slot.hidden = false;
    slot.dataset.adState = runtime.showPlaceholders ? "preview" : "idle";

    if (!runtime.showPlaceholders) {
      slot.replaceChildren();
      return;
    }

    const slotName = slot.dataset.adSlot || "display-slot";
    const format = slot.dataset.adFormat || "display";
    const copy = adCopyFor(slotName);
    slot.innerHTML = `
      <div class="ad-slot__frame">
        <span class="ad-slot__eyebrow">Ad Preview</span>
        <strong class="ad-slot__title">${slotName}</strong>
        <p class="ad-slot__copy">${copy}</p>
        <p class="ad-slot__meta">Format: ${format} only. High-interruption placements stay off in this build.</p>
      </div>
    `;
  });
}

function getAdRuntime() {
  const defaults = {
    enabled: true,
    showPlaceholders: true,
    socialBarEnabled: false,
  };

  const overrides = window.arrowAds || {};
  return {
    ...defaults,
    ...overrides,
  };
}

function adCopyFor(slotName) {
  const copyMap = {
    "home-inline-1":
      "Reserved for a standard in-content unit after the featured game cards.",
    "home-inline-2":
      "Reserved for a second low-interruption display slot near the end of the homepage reading path.",
    "maze-inline-1":
      "Reserved for a display unit after the playable Arrow Maze area, never above the canvas or near controls.",
    "maze-sidebar-1":
      "Reserved for one desktop-only sidebar unit under Quick Answers.",
    "maze-inline-2":
      "Reserved for a post-FAQ display slot before related links.",
    "category-inline-1":
      "Reserved for a display slot between the category intro and the game grid.",
    "category-inline-2":
      "Reserved for a display slot after the category grid and before the closing explainer.",
    "article-inline-1":
      "Reserved for an in-content unit after the article intro paragraph.",
    "article-inline-2":
      "Reserved for a closing display slot after recommendations and before the footer.",
  };

  return copyMap[slotName] || "Reserved for a conservative in-content display placement.";
}

function initArrowMaze(root) {
  const canvas = root.querySelector("[data-maze-canvas]");
  const levelEl = root.querySelector("[data-maze-level]");
  const stepsEl = root.querySelector("[data-maze-steps]");
  const goalEl = root.querySelector("[data-maze-goal]");
  const completeEl = root.querySelector("[data-maze-complete]");
  const perfectEl = root.querySelector("[data-maze-perfect]");
  const statusEl = root.querySelector("[data-maze-status]");
  const restartButton = root.querySelector("[data-maze-restart]");
  const nextButton = root.querySelector("[data-maze-next]");
  const storageKey = "arrow-maze-progress-v2";

  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const directions = {
    up: { x: 0, y: -1, mark: "U" },
    down: { x: 0, y: 1, mark: "D" },
    left: { x: -1, y: 0, mark: "L" },
    right: { x: 1, y: 0, mark: "R" },
  };
  const levels = [
    {
      "name": "First Route",
      "goalSteps": 8,
      "start": [0, 0],
      "finish": [4, 4],
      "grid": [
        ["R", "R", "D", "L", "D"],
        ["U", "L", "D", "R", "D"],
        ["R", "R", "R", "D", "D"],
        ["U", "L", "U", "D", "D"],
        ["R", "R", "R", "R", "G"]
      ]
    },
    {
      "name": "Corner Reading",
      "goalSteps": 9,
      "start": [1, 0],
      "finish": [5, 5],
      "grid": [
        ["D", "D", "L", "R", "D", "L"],
        ["R", "R", "D", "L", "D", "U"],
        ["U", "L", "R", "R", "D", "L"],
        ["R", "D", "U", "L", "D", "U"],
        ["U", "R", "R", "R", "D", "L"],
        ["R", "U", "L", "L", "R", "G"]
      ]
    },
    {
      "name": "Open Turn",
      "goalSteps": 9,
      "start": [0, 2],
      "finish": [5, 0],
      "grid": [
        ["U", "U", "U", "U", "U", "G"],
        ["L", "U", "L", "R", "R", "U"],
        ["R", "R", "*", "L", "U", "R"],
        ["L", "U", "R", "R", "U", "R"],
        ["L", "L", "U", "L", "U", "R"],
        ["D", "D", "D", "D", "D", "D"]
      ]
    },
    {
      "name": "Final Choices",
      "goalSteps": 9,
      "start": [3, 6],
      "finish": [0, 0],
      "grid": [
        ["G", "L", "D", "R", "D", "L", "D"],
        ["U", "L", "D", "U", "R", "D", "L"],
        ["U", "L", "*", "L", "U", "D", "U"],
        ["U", "U", "U", "L", "D", "R", "D"],
        ["D", "U", "L", "U", "D", "U", "L"],
        ["D", "U", "U", "L", "R", "*", "L"],
        ["R", "R", "U", "U", "L", "L", "U"]
      ]
    },
    {
      "name": "Long Chain",
      "goalSteps": 10,
      "start": [0, 5],
      "finish": [6, 1],
      "grid": [
        ["R", "R", "D", "L", "D", "R", "D"],
        ["U", "L", "R", "R", "D", "U", "G"],
        ["D", "R", "U", "L", "R", "R", "U"],
        ["D", "U", "L", "D", "U", "L", "L"],
        ["R", "R", "D", "R", "U", "D", "U"],
        ["R", "R", "R", "U", "L", "U", "L"],
        ["U", "L", "L", "R", "R", "U", "L"]
      ]
    },
    {
      "name": "Twin Stars",
      "start": [0, 3],
      "finish": [6, 6],
      "grid": [
        ["U", "U", "R", "R", "R", "D", "U"],
        ["L", "R", "U", "L", "L", "D", "R"],
        ["L", "D", "R", "R", "*", "D", "R"],
        ["R", "R", "*", "U", "U", "*", "D"],
        ["L", "L", "U", "L", "U", "L", "D"],
        ["L", "U", "L", "U", "L", "U", "D"],
        ["D", "D", "D", "D", "D", "D", "G"]
      ],
      "goalSteps": 11
    },
    {
      "name": "Switchback",
      "start": [0, 5],
      "finish": [5, 0],
      "grid": [
        ["U", "U", "U", "U", "R", "G"],
        ["L", "U", "*", "R", "U", "R"],
        ["L", "R", "U", "L", "L", "R"],
        ["L", "R", "R", "*", "L", "R"],
        ["L", "U", "*", "U", "U", "R"],
        ["R", "R", "U", "D", "D", "D"]
      ],
      "goalSteps": 12
    },
    {
      "name": "Fork Count",
      "start": [1, 7],
      "finish": [7, 1],
      "grid": [
        ["U", "U", "U", "U", "U", "U", "U", "U"],
        ["L", "U", "L", "U", "L", "R", "R", "G"],
        ["L", "L", "U", "L", "U", "U", "*", "D"],
        ["L", "U", "L", "U", "*", "R", "U", "R"],
        ["L", "L", "U", "D", "U", "L", "L", "R"],
        ["L", "U", "R", "R", "*", "U", "L", "R"],
        ["L", "R", "U", "*", "U", "L", "U", "R"],
        ["D", "R", "R", "U", "D", "D", "D", "D"]
      ],
      "goalSteps": 12
    },
    {
      "name": "Loop Breaker",
      "start": [1, 6],
      "finish": [6, 0],
      "grid": [
        ["U", "U", "U", "U", "U", "U", "G"],
        ["L", "U", "L", "U", "L", "R", "U"],
        ["L", "L", "U", "R", "R", "*", "R"],
        ["L", "U", "D", "*", "L", "L", "R"],
        ["L", "R", "R", "R", "U", "L", "R"],
        ["L", "U", "U", "*", "L", "U", "R"],
        ["D", "R", "R", "U", "D", "D", "D"]
      ],
      "goalSteps": 13
    },
    {
      "name": "False Dock",
      "start": [0, 0],
      "finish": [6, 5],
      "grid": [
        ["R", "R", "D", "U", "U", "U", "U"],
        ["L", "D", "R", "R", "D", "U", "R"],
        ["L", "R", "*", "L", "L", "L", "R"],
        ["L", "U", "R", "R", "R", "*", "D"],
        ["L", "L", "U", "L", "U", "R", "D"],
        ["D", "D", "D", "D", "D", "D", "G"]
      ],
      "goalSteps": 15
    },
    {
      "name": "Pressure Lane",
      "start": [0, 6],
      "finish": [7, 0],
      "grid": [
        ["U", "U", "U", "U", "U", "U", "R", "G"],
        ["L", "U", "L", "U", "R", "R", "*", "R"],
        ["L", "L", "U", "L", "*", "L", "L", "R"],
        ["L", "U", "*", "R", "R", "U", "L", "R"],
        ["L", "R", "U", "L", "L", "D", "U", "R"],
        ["L", "U", "*", "R", "U", "U", "L", "R"],
        ["R", "R", "U", "D", "D", "D", "D", "D"]
      ],
      "goalSteps": 15
    },
    {
      "name": "Long Signal",
      "start": [0, 7],
      "finish": [8, 0],
      "grid": [
        ["U", "U", "U", "U", "U", "U", "U", "R", "G"],
        ["L", "U", "L", "U", "L", "U", "R", "U", "D"],
        ["L", "L", "U", "L", "U", "L", "*", "D", "R"],
        ["L", "U", "L", "U", "*", "R", "U", "U", "R"],
        ["L", "L", "U", "L", "U", "*", "U", "L", "R"],
        ["L", "U", "L", "R", "R", "U", "L", "U", "R"],
        ["L", "R", "*", "R", "*", "U", "U", "L", "R"],
        ["R", "R", "U", "D", "D", "D", "D", "D", "D"]
      ],
      "goalSteps": 15
    },
    {
      "name": "Last Relay",
      "start": [0, 4],
      "finish": [8, 8],
      "grid": [
        ["U", "U", "U", "U", "U", "U", "U", "U", "U"],
        ["L", "U", "R", "R", "R", "D", "L", "U", "R"],
        ["L", "R", "*", "L", "L", "D", "D", "L", "R"],
        ["L", "D", "R", "R", "*", "*", "R", "D", "R"],
        ["R", "R", "*", "L", "U", "L", "D", "*", "D"],
        ["L", "U", "L", "U", "L", "U", "R", "R", "D"],
        ["L", "L", "U", "L", "U", "L", "R", "*", "L"],
        ["L", "U", "L", "U", "L", "U", "L", "R", "D"],
        ["D", "D", "D", "D", "D", "D", "D", "D", "G"]
      ],
      "goalSteps": 16
    },
    {
      "name": "Spiral Exit",
      "start": [1, 8],
      "finish": [8, 1],
      "grid": [
        ["U", "U", "U", "U", "U", "U", "U", "U", "U"],
        ["L", "U", "L", "U", "L", "U", "L", "R", "G"],
        ["L", "L", "U", "L", "U", "R", "R", "*", "D"],
        ["L", "U", "L", "U", "L", "*", "L", "U", "R"],
        ["L", "L", "U", "L", "R", "R", "U", "L", "R"],
        ["L", "U", "L", "D", "*", "L", "L", "U", "R"],
        ["L", "U", "R", "*", "R", "U", "U", "L", "R"],
        ["L", "R", "U", "L", "*", "U", "L", "U", "R"],
        ["D", "R", "R", "R", "U", "D", "D", "D", "D"]
      ],
      "goalSteps": 18
    },
    {
      "name": "Backtrack Wall",
      "goalSteps": 21,
      "start": [0, 1],
      "finish": [7, 7],
      "grid": [
        ["U", "U", "U", "U", "U", "U", "U", "U"],
        ["R", "R", "D", "U", "R", "D", "L", "R"],
        ["L", "L", "R", "R", "U", "D", "U", "R"],
        ["L", "U", "L", "D", "L", "L", "L", "R"],
        ["L", "L", "U", "R", "R", "D", "U", "R"],
        ["L", "U", "L", "U", "D", "L", "L", "R"],
        ["L", "L", "U", "L", "R", "R", "D", "R"],
        ["D", "D", "D", "D", "D", "D", "R", "G"]
      ]
    }
  ];

  const state = {
    levelIndex: 0,
    player: [0, 0],
    steps: 0,
    won: false,
    progress: loadProgress(),
  };

  const initialLevelIndex = getInitialLevelIndex();

  function createEmptyProgress() {
    return {
      bestSteps: Array(levels.length).fill(null),
    };
  }

  function normalizeBestSteps(value) {
    if (!Array.isArray(value)) {
      return createEmptyProgress().bestSteps;
    }

    return levels.map((level, index) => {
      const best = Number(value[index]);
      if (!Number.isInteger(best) || best <= 0) {
        return null;
      }
      return Math.max(best, level.goalSteps);
    });
  }

  function loadProgress() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return createEmptyProgress();

      const parsed = JSON.parse(raw);
      return {
        bestSteps: normalizeBestSteps(parsed.bestSteps),
      };
    } catch {
      return createEmptyProgress();
    }
  }

  function saveProgress() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state.progress));
    } catch {
      // Local progress is a nice-to-have, not a requirement for play.
    }
  }

  function currentLevel() {
    return levels[state.levelIndex];
  }

  function getInitialLevelIndex() {
    try {
      const params = new URLSearchParams(window.location.search);
      const requestedLevel = Number(params.get("level"));
      if (!Number.isInteger(requestedLevel)) {
        return 0;
      }

      return Math.min(levels.length - 1, Math.max(0, requestedLevel - 1));
    } catch {
      return 0;
    }
  }

  function completionCount() {
    return state.progress.bestSteps.filter((steps) => Number.isInteger(steps)).length;
  }

  function perfectCount() {
    return state.progress.bestSteps.reduce((count, steps, index) => {
      if (!Number.isInteger(steps)) return count;
      return count + (steps <= levels[index].goalSteps ? 1 : 0);
    }, 0);
  }

  function bestForCurrentLevel() {
    const best = state.progress.bestSteps[state.levelIndex];
    return Number.isInteger(best) ? best : null;
  }

  function defaultStatus() {
    const level = currentLevel();
    const best = bestForCurrentLevel();
    const bestText = best ? ` Best so far: ${best} steps.` : "";
    return `${level.name}: finish in ${level.goalSteps} steps or less.${bestText}`;
  }

  function resetLevel(message) {
    const level = currentLevel();
    state.player = [...level.start];
    state.steps = 0;
    state.won = false;
    if (statusEl) {
      statusEl.textContent = message || defaultStatus();
    }
    updateHud();
    draw();
  }

  function updateHud() {
    if (levelEl) levelEl.textContent = String(state.levelIndex + 1);
    if (stepsEl) stepsEl.textContent = String(state.steps);
    if (goalEl) goalEl.textContent = String(currentLevel().goalSteps);
    if (completeEl) completeEl.textContent = String(completionCount());
    if (perfectEl) perfectEl.textContent = String(perfectCount());
    if (nextButton) {
      nextButton.disabled = !state.won;
      nextButton.textContent =
        state.won && state.levelIndex === levels.length - 1 ? "Replay Run" : "Next Level";
    }
  }

  function tileAt(x, y) {
    const level = currentLevel();
    return level.grid[y]?.[x] || null;
  }

  function handleWin() {
    const level = currentLevel();
    const previousBest = state.progress.bestSteps[state.levelIndex];
    const isNewBest = !Number.isInteger(previousBest) || state.steps < previousBest;
    const storedBest = isNewBest ? state.steps : previousBest;

    if (isNewBest) {
      state.progress.bestSteps[state.levelIndex] = state.steps;
      saveProgress();
    }

    state.won = true;

    const metGoal = state.steps <= level.goalSteps;
    const bestSuffix = storedBest ? ` Best: ${storedBest} steps.` : "";
    if (state.levelIndex === levels.length - 1) {
      const goalHits = perfectCount();
      if (statusEl) {
        statusEl.textContent =
          goalHits === levels.length
            ? `Run clear. All ${levels.length} target routes hit. Replay the run anytime.`
            : `Run clear. Goals hit: ${goalHits}/${levels.length}. Replay the run to improve your route score.`;
      }
    } else if (statusEl) {
      statusEl.textContent = metGoal
        ? `Level complete in ${state.steps} steps. Goal hit.${bestSuffix}`
        : `Level complete in ${state.steps} steps. Goal is ${level.goalSteps}.${bestSuffix}`;
    }

    updateHud();
    draw();
  }

  function move(directionName) {
    if (state.won) {
      if (statusEl) {
        statusEl.textContent =
          state.levelIndex === levels.length - 1
            ? "Run complete. Choose Replay Run or Restart Level."
            : "Level complete. Choose Next Level or Restart Level.";
      }
      return;
    }

    const direction = directions[directionName];
    if (!direction) return;

    const [x, y] = state.player;
    const tile = tileAt(x, y);
    if (tile && tile !== "*" && tile !== "G" && tile !== direction.mark) {
      if (statusEl) {
        statusEl.textContent = `This tile points ${directionLabel(tile)}. Try that direction.`;
      }
      return;
    }

    const nextX = x + direction.x;
    const nextY = y + direction.y;
    if (!tileAt(nextX, nextY)) {
      if (statusEl) statusEl.textContent = "That move leaves the maze. Choose another route.";
      return;
    }

    state.player = [nextX, nextY];
    state.steps += 1;

    const level = currentLevel();
    if (nextX === level.finish[0] && nextY === level.finish[1]) {
      handleWin();
    } else if (statusEl) {
      const nextTile = tileAt(nextX, nextY);
      statusEl.textContent =
        nextTile === "*"
          ? `Open tile ahead. Goal stays at ${level.goalSteps} steps.`
          : `Next arrow points ${directionLabel(nextTile)}. Goal: ${level.goalSteps} steps.`;
    }

    if (!state.won) {
      updateHud();
      draw();
    }
  }

  function directionLabel(mark) {
    return {
      U: "up",
      D: "down",
      L: "left",
      R: "right",
      G: "finish",
      "*": "anywhere",
    }[mark] || "nowhere";
  }

  function draw() {
    const level = currentLevel();
    const rows = level.grid.length;
    const cols = Math.max(...level.grid.map((row) => row.length));
    const availableSize = root.clientWidth > 0 ? root.clientWidth - 44 : 320;
    const maxBoardSize = Math.round(Math.max(220, Math.min(640, availableSize)));
    const cell = maxBoardSize / Math.max(rows, cols);
    const canvasWidth = Math.round(cell * cols);
    const canvasHeight = Math.round(cell * rows);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.lineWidth = 1;

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const tile = level.grid[y][x];
        if (!tile) continue;
        const px = x * cell;
        const py = y * cell;
        ctx.fillStyle = tile === "G" ? "#f4c95d" : (x + y) % 2 ? "#f8f3e6" : "#fffdf7";
        ctx.fillRect(px, py, cell, cell);
        ctx.strokeStyle = "#d7d0c2";
        ctx.strokeRect(px + 0.5, py + 0.5, cell - 1, cell - 1);

        if (tile === "G") {
          drawFinish(px, py, cell);
        } else if (tile === "*") {
          drawOpenTile(px, py, cell);
        } else {
          drawArrow(tile, px, py, cell);
        }
      }
    }

    drawPlayer(state.player[0] * cell, state.player[1] * cell, cell);
  }

  function drawArrow(mark, x, y, cell) {
    const angle = { U: -Math.PI / 2, D: Math.PI / 2, L: Math.PI, R: 0 }[mark];
    if (angle === undefined) return;

    ctx.save();
    ctx.translate(x + cell / 2, y + cell / 2);
    ctx.rotate(angle);
    ctx.fillStyle = "#1f7a5a";
    ctx.beginPath();
    ctx.moveTo(cell * 0.28, 0);
    ctx.lineTo(-cell * 0.08, -cell * 0.22);
    ctx.lineTo(-cell * 0.08, -cell * 0.08);
    ctx.lineTo(-cell * 0.32, -cell * 0.08);
    ctx.lineTo(-cell * 0.32, cell * 0.08);
    ctx.lineTo(-cell * 0.08, cell * 0.08);
    ctx.lineTo(-cell * 0.08, cell * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawFinish(x, y, cell) {
    ctx.save();
    ctx.fillStyle = "#f3c552";
    ctx.fillRect(x, y, cell, cell);

    ctx.fillStyle = "#fff7da";
    ctx.fillRect(x + cell * 0.08, y + cell * 0.08, cell * 0.84, cell * 0.84);

    ctx.strokeStyle = "#7a4e12";
    ctx.lineWidth = Math.max(2, cell * 0.05);
    ctx.strokeRect(x + cell * 0.08, y + cell * 0.08, cell * 0.84, cell * 0.84);

    ctx.fillStyle = "#7a4e12";
    ctx.fillRect(x + cell * 0.24, y + cell * 0.16, cell * 0.04, cell * 0.44);

    ctx.fillStyle = "#d8593f";
    ctx.beginPath();
    ctx.moveTo(x + cell * 0.28, y + cell * 0.18);
    ctx.lineTo(x + cell * 0.62, y + cell * 0.24);
    ctx.lineTo(x + cell * 0.28, y + cell * 0.38);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fff4ce";
    ctx.beginPath();
    ctx.arc(x + cell * 0.64, y + cell * 0.42, cell * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#c57a16";
    ctx.beginPath();
    ctx.arc(x + cell * 0.64, y + cell * 0.42, cell * 0.09, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6b4615";
    ctx.font = `900 ${Math.round(cell * 0.26)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GO", x + cell / 2, y + cell * 0.76);
    ctx.restore();
  }

  function drawOpenTile(x, y, cell) {
    ctx.fillStyle = "#5f6f6c";
    ctx.font = `700 ${Math.round(cell * 0.48)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", x + cell / 2, y + cell / 2);
  }

  function drawPlayer(x, y, cell) {
    ctx.fillStyle = "#1d2b2a";
    ctx.beginPath();
    ctx.arc(x + cell / 2, y + cell / 2, cell * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fffdf7";
    ctx.lineWidth = Math.max(3, cell * 0.05);
    ctx.stroke();
  }

  restartButton?.addEventListener("click", () => resetLevel("Level restarted."));
  nextButton?.addEventListener("click", () => {
    if (!state.won) return;
    if (state.levelIndex === levels.length - 1) {
      state.levelIndex = 0;
      resetLevel("Replay run started. Try to hit every target route.");
      return;
    }
    state.levelIndex += 1;
    resetLevel();
  });

  root.querySelectorAll("[data-maze-move]").forEach((button) => {
    button.addEventListener("click", () => move(button.dataset.mazeMove));
  });

  document.addEventListener("keydown", (event) => {
    const keyMap = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    if (!root.isConnected || !keyMap[event.key]) return;
    event.preventDefault();
    move(keyMap[event.key]);
  });

  window.addEventListener("resize", draw);
  state.levelIndex = initialLevelIndex;
  const initialMessage =
    initialLevelIndex > 0
      ? `Level jump active. Starting on ${currentLevel().name}.`
      : undefined;

  resetLevel(initialMessage);
  window.requestAnimationFrame(draw);
  window.addEventListener("load", draw, { once: true });
}
