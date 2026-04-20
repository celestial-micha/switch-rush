const STORAGE_KEY = "switch-rush-best";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreNode = document.getElementById("score");
const bestNode = document.getElementById("best");
const finalScoreNode = document.getElementById("finalScore");
const gameOverMessageNode = document.getElementById("gameOverMessage");
const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const installButton = document.getElementById("installButton");
const flowFillNode = document.getElementById("flowFill");
const flowStateNode = document.getElementById("flowState");
const LANE_COUNT = 3;

const state = {
  best: Number(localStorage.getItem(STORAGE_KEY) || 0),
  mode: "idle",
  width: canvas.width,
  height: canvas.height,
  lastTime: 0,
  score: 0,
  combo: 0,
  pulse: 0,
  flash: 0,
  shake: 0,
  speed: 360,
  obstacleTimer: 0,
  worldOffset: 0,
  particles: [],
  stars: [],
  floaters: [],
  beforeInstallPrompt: null,
  switchCooldown: 0,
  beatTimer: 0,
  flow: 0,
  feverTimer: 0,
  feverBursts: 0,
  laneBag: [],
  player: {
    lane: 1,
    x: 0,
    y: canvas.height - 180,
    radius: 28,
    targetX: 0,
    trail: []
  },
  obstacles: []
};

function isFever() {
  return state.feverTimer > 0;
}

function shuffledLanes() {
  const lanes = Array.from({ length: LANE_COUNT }, (_, index) => index);
  for (let i = lanes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
  }
  return lanes;
}

const audio = (() => {
  let ctxRef;
  let musicTimer = null;
  let musicStep = 0;

  const ensure = () => {
    if (!ctxRef) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      ctxRef = new AudioContextClass();
    }
    if (ctxRef.state === "suspended") {
      ctxRef.resume();
    }
    return ctxRef;
  };

  const note = (frequency, duration, type, volume, attack = 0.004) => {
    const audioCtx = ensure();
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  const midiToHz = (midi) => 440 * (2 ** ((midi - 69) / 12));

  const playMusicStep = () => {
    const audioCtx = ensure();
    if (!audioCtx) return;

    const lead = [69, 72, 74, 72, 67, 71, 74, 76];
    const bass = [45, 45, 48, 45, 43, 43, 47, 50];
    const feverLead = [72, 74, 76, 74, 71, 74, 79, 81];
    const sequence = isFever() ? feverLead : lead;
    const volumeScale = state.mode === "running" ? 1 : 0.55;
    const step = musicStep % sequence.length;

    note(midiToHz(bass[step]), 0.3, "triangle", 0.012 * volumeScale);
    note(midiToHz(sequence[step]), step % 2 === 0 ? 0.22 : 0.16, "sine", 0.013 * volumeScale);

    if (step % 4 === 2) {
      note(midiToHz(sequence[(step + 2) % sequence.length] - 12), 0.15, "triangle", 0.008 * volumeScale);
    }

    musicStep += 1;
  };

  return {
    unlock() {
      const audioCtx = ensure();
      if (!audioCtx || musicTimer) return;
      playMusicStep();
      musicTimer = window.setInterval(playMusicStep, 300);
    },
    switch() {
      note(560, 0.07, "triangle", 0.04);
      note(840, 0.05, "sine", 0.018);
    },
    pass(combo) {
      note(400 + combo * 16, 0.08, "sine", 0.028);
    },
    perfect() {
      note(880, 0.09, "triangle", 0.045);
      note(1320, 0.12, "sine", 0.022);
    },
    beat(fever) {
      note(fever ? 170 : 124, 0.14, "triangle", fever ? 0.026 : 0.018);
      note(fever ? 340 : 248, 0.08, "sine", fever ? 0.014 : 0.01);
    },
    feverStart() {
      note(440, 0.09, "triangle", 0.04);
      note(660, 0.11, "triangle", 0.03);
      note(990, 0.16, "sine", 0.022);
    },
    crash() {
      note(120, 0.24, "sawtooth", 0.06);
      note(85, 0.3, "square", 0.02);
    }
  };
})();

bestNode.textContent = String(state.best);

function laneX(lane) {
  const left = state.width * 0.26;
  const gap = state.width * 0.24;
  return left + gap * lane;
}

function syncFlowUi() {
  const value = Math.max(0, Math.min(100, state.flow));
  flowFillNode.style.width = `${value}%`;
  flowStateNode.textContent = isFever() ? "FEVER x2" : value >= 75 ? "FLOW HOT" : "FLOW";
}

function buildStars() {
  state.stars = [];
  for (let i = 0; i < 42; i += 1) {
    state.stars.push({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      size: 1 + Math.random() * 2.2,
      depth: 0.3 + Math.random() * 1.1
    });
  }
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const width = 720;
  const height = 1280;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  state.width = width;
  state.height = height;
  state.player.y = height - 180;
  state.player.targetX = laneX(state.player.lane);
  state.player.x = state.player.targetX;
  buildStars();
}

function createParticles(x, y, color, amount, spread, lifeScale = 1) {
  for (let i = 0; i < amount; i += 1) {
    const angle = (Math.PI * 2 * i) / amount + Math.random() * 0.45;
    const speed = spread * (0.45 + Math.random() * 0.85);
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: (0.35 + Math.random() * 0.35) * lifeScale,
      radius: 2 + Math.random() * 6,
      color
    });
  }
}

function addFloater(text, x, y, color, big = false) {
  state.floaters.push({
    text,
    x,
    y,
    life: big ? 1.05 : 0.85,
    color,
    size: big ? 34 : 24
  });
}

function startFever() {
  state.feverTimer = 6;
  state.flow = 100;
  state.feverBursts += 1;
  state.flash = 0.22;
  state.pulse = 0.8;
  state.shake = 10;
  createParticles(state.width / 2, state.height * 0.52, "#f97316", 28, 260, 1.15);
  addFloater("FEVER x2", state.width / 2, state.height * 0.42, "#f8fafc", true);
  audio.feverStart();
  syncFlowUi();
}

function resetGame() {
  state.mode = "running";
  state.score = 0;
  state.combo = 0;
  state.pulse = 0;
  state.flash = 0;
  state.shake = 0;
  state.speed = 360;
  state.obstacleTimer = 0.82;
  state.worldOffset = 0;
  state.particles = [];
  state.floaters = [];
  state.obstacles = [];
  state.switchCooldown = 0;
  state.beatTimer = 0.2;
  state.flow = 0;
  state.feverTimer = 0;
  state.feverBursts = 0;
  state.laneBag = shuffledLanes();
  state.player.lane = 1;
  state.player.targetX = laneX(1);
  state.player.x = state.player.targetX;
  state.player.trail = [];
  scoreNode.textContent = "0";
  syncFlowUi();
  startOverlay.classList.remove("overlay-visible");
  gameOverOverlay.classList.remove("overlay-visible");
}

function spawnObstacle() {
  if (state.laneBag.length === 0) {
    state.laneBag = shuffledLanes();
  }
  const lane = state.laneBag.shift();
  const height = 80;
  const width = 84;
  const y = -height - 40;
  state.obstacles.push({
    lane,
    y,
    width,
    height,
    passed: false,
    hue: isFever() ? 190 + Math.random() * 40 : 16 + Math.random() * 36
  });
}

function updateScore(amount) {
  state.score += amount;
  scoreNode.textContent = String(state.score);
}

function movePlayer(direction) {
  if (state.mode !== "running" || state.switchCooldown > 0) return;
  audio.unlock();

  const previousLane = state.player.lane;
  state.player.lane = Math.max(0, Math.min(LANE_COUNT - 1, state.player.lane + direction));
  if (state.player.lane === previousLane) return;
  state.player.targetX = laneX(state.player.lane);
  state.switchCooldown = 0.06;
  state.pulse = 1;
  createParticles(state.player.x, state.player.y, "#22d3ee", 12, 150);
  audio.switch();
  if (navigator.vibrate) navigator.vibrate(14);

  for (const obstacle of state.obstacles) {
    if (obstacle.lane !== previousLane || obstacle.passed) continue;
    const distance = state.player.y - (obstacle.y + obstacle.height);
    if (distance > 0 && distance < 120) {
      state.flow = Math.min(100, state.flow + 22);
      state.combo += 1;
      updateScore(isFever() ? 2 : 1);
      addFloater("PERFECT +1", state.player.x, state.player.y - 70, "#22d3ee");
      createParticles(state.player.x, state.player.y, "#f8fafc", 16, 180);
      audio.perfect();
      if (!isFever() && state.flow >= 100) {
        startFever();
      } else {
        syncFlowUi();
      }
      break;
    }
  }
}

function endGame() {
  state.mode = "gameover";
  state.flash = 1;
  state.shake = 20;
  audio.crash();
  if (navigator.vibrate) navigator.vibrate([40, 30, 80]);

  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem(STORAGE_KEY, String(state.best));
    bestNode.textContent = String(state.best);
  }

  finalScoreNode.textContent = String(state.score);
  if (state.score >= 60) {
    gameOverMessageNode.textContent = "这局已经有爆款手感了，再来一把很可能就是新纪录。";
  } else if (state.feverBursts > 0) {
    gameOverMessageNode.textContent = "你已经打出 FEVER 了，下一局只要更稳，分会涨得很快。";
  } else {
    gameOverMessageNode.textContent = "规则仍然只有一个动作，但高分需要把切线时机压到极限。";
  }
  gameOverOverlay.classList.add("overlay-visible");
}

function updateRunning(dt) {
  state.speed += dt * 5.2;
  state.worldOffset += state.speed * dt;
  state.obstacleTimer -= dt;
  state.switchCooldown = Math.max(0, state.switchCooldown - dt);
  state.pulse = Math.max(0, state.pulse - dt * 2.7);
  state.flash = Math.max(0, state.flash - dt * 2.4);
  state.shake = Math.max(0, state.shake - dt * 42);

  if (isFever()) {
    state.feverTimer = Math.max(0, state.feverTimer - dt);
    state.flow = 45 + (state.feverTimer / 6) * 55;
    state.speed += dt * 10.5;
    state.shake = Math.max(state.shake, 2.2);
  } else {
    state.flow = Math.max(0, state.flow - dt * 2.1);
  }
  syncFlowUi();

  state.beatTimer -= dt;
  const beatInterval = isFever() ? 0.32 : Math.max(0.4, 0.58 - (state.speed - 360) / 3600);
  if (state.beatTimer <= 0) {
    state.beatTimer = beatInterval;
    audio.beat(isFever());
  }

  if (state.obstacleTimer <= 0) {
    spawnObstacle();
    const interval = Math.max(0.6, 0.96 - state.speed / 2200);
    state.obstacleTimer = isFever() ? interval * 0.92 : interval;
  }

  state.player.x += (state.player.targetX - state.player.x) * Math.min(1, dt * 16);
  state.player.trail.push({ x: state.player.x, y: state.player.y, life: 0.34 });
  if (state.player.trail.length > 16) {
    state.player.trail.shift();
  }
  state.player.trail.forEach((item) => {
    item.life -= dt;
  });
  state.player.trail = state.player.trail.filter((item) => item.life > 0);

  state.obstacles.forEach((obstacle) => {
    obstacle.y += state.speed * dt;

    const sameLane = obstacle.lane === state.player.lane;
    const overlapY =
      obstacle.y < state.player.y + state.player.radius &&
      obstacle.y + obstacle.height > state.player.y - state.player.radius;

    if (sameLane && overlapY) {
      createParticles(state.player.x, state.player.y, "#fb7185", 26, 240);
      endGame();
      return;
    }

    const passedThreshold = state.player.y + state.player.radius + 12;
    if (!obstacle.passed && obstacle.y > passedThreshold) {
      obstacle.passed = true;
      state.combo += 1;
      state.flow = Math.min(100, state.flow + (isFever() ? 10 : 14));
      state.speed += isFever() ? 7 : 6;
      updateScore(isFever() ? 2 : 1);
      state.flash = isFever() ? 0.4 : 0.24;
      createParticles(laneX(obstacle.lane), obstacle.y, isFever() ? "#22d3ee" : "#f97316", 10, 110);
      audio.pass(Math.min(state.combo, 16));

      if (state.combo % 10 === 0) {
        addFloater(`${state.combo} STREAK`, state.width / 2, 156, "#f97316", true);
        state.pulse = 1.15;
      }

      if (!isFever() && state.flow >= 100) {
        startFever();
      }
    }
  });

  state.obstacles = state.obstacles.filter((obstacle) => obstacle.y < state.height + 180);
}

function updateParticles(dt) {
  state.particles.forEach((particle) => {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.97;
    particle.vy *= 0.97;
  });
  state.particles = state.particles.filter((particle) => particle.life > 0);

  state.floaters.forEach((floater) => {
    floater.life -= dt;
    floater.y -= dt * 66;
  });
  state.floaters = state.floaters.filter((floater) => floater.life > 0);
}

function update(dt) {
  if (state.mode === "running") {
    updateRunning(dt);
  } else {
    state.flash = Math.max(0, state.flash - dt * 2.2);
    state.shake = Math.max(0, state.shake - dt * 30);
  }
  updateParticles(dt);
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
  gradient.addColorStop(0, "#071120");
  gradient.addColorStop(1, "#13213a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  state.stars.forEach((star) => {
    const y = (star.y + state.worldOffset * star.depth) % (state.height + 40) - 20;
    ctx.fillStyle = "rgba(148, 163, 184, 0.65)";
    ctx.fillRect(star.x, y, star.size, star.size * 1.8);
  });

  ctx.fillStyle = "rgba(34, 211, 238, 0.06)";
  for (let i = 0; i < 22; i += 1) {
    const y = ((state.worldOffset * 0.45) + i * 104) % (state.height + 104) - 104;
    const width = state.width * (0.22 + ((i % 3) * 0.08));
    const x = (state.width - width) / 2;
    ctx.fillRect(x, y, width, 3);
  }

  const halo = ctx.createRadialGradient(
    state.width / 2,
    state.height * 0.16,
    20,
    state.width / 2,
    state.height * 0.16,
    280
  );
  halo.addColorStop(0, "rgba(34, 211, 238, 0.18)");
  halo.addColorStop(1, "rgba(34, 211, 238, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, state.width, state.height);
}

function drawTrack() {
  const left = laneX(0);
  const right = laneX(LANE_COUNT - 1);
  const top = 128;
  const bottom = state.height - 64;

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";

  Array.from({ length: LANE_COUNT }, (_, index) => laneX(index)).forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  });

  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(right, top);
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();

}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawObstacles() {
  state.obstacles.forEach((obstacle) => {
    const x = laneX(obstacle.lane) - obstacle.width / 2;
    const gradient = ctx.createLinearGradient(x, obstacle.y, x + obstacle.width, obstacle.y + obstacle.height);
    gradient.addColorStop(0, `hsla(${obstacle.hue}, 92%, 58%, 0.98)`);
    gradient.addColorStop(1, "rgba(251, 113, 133, 0.95)");
    ctx.fillStyle = gradient;
    roundRect(ctx, x, obstacle.y, obstacle.width, obstacle.height, 28);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    roundRect(ctx, x + 12, obstacle.y + 12, obstacle.width - 24, 10, 8);
    ctx.fill();
  });
}

function drawPlayer() {
  state.player.trail.forEach((ghost, index) => {
    const alpha = (index + 1) / state.player.trail.length;
    ctx.fillStyle = `rgba(34, 211, 238, ${alpha * 0.14})`;
    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y, state.player.radius * (0.56 + alpha * 0.18), 0, Math.PI * 2);
    ctx.fill();
  });

  const pulseRadius = state.player.radius + state.pulse * 24;
  ctx.fillStyle = `rgba(34, 211, 238, ${state.pulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, pulseRadius, 0, Math.PI * 2);
  ctx.fill();

  const gradient = ctx.createLinearGradient(
    state.player.x,
    state.player.y - state.player.radius,
    state.player.x,
    state.player.y + state.player.radius
  );
  gradient.addColorStop(0, "#f8fafc");
  gradient.addColorStop(1, "#22d3ee");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, state.player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, state.player.radius * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticles() {
  state.particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawFloaters() {
  ctx.textAlign = "center";
  state.floaters.forEach((floater) => {
    ctx.globalAlpha = Math.max(0, floater.life);
    ctx.fillStyle = floater.color;
    ctx.font = `800 ${floater.size}px Segoe UI`;
    ctx.fillText(floater.text, floater.x, floater.y);
  });
  ctx.globalAlpha = 1;
}

function drawCombo() {
  if (state.mode !== "running" || state.combo < 3) return;
  ctx.fillStyle = "rgba(248, 250, 252, 0.92)";
  ctx.font = "800 42px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(`${state.combo} STREAK`, state.width / 2, 100);
  ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
  ctx.font = "600 22px Segoe UI";
  ctx.fillText(isFever() ? "score x2 active" : "hold the rhythm", state.width / 2, 132);
}

function drawFlash() {
  if (state.flash <= 0) return;
  ctx.fillStyle = `rgba(255, 255, 255, ${state.flash * 0.12})`;
  ctx.fillRect(0, 0, state.width, state.height);
}

function draw() {
  ctx.save();
  if (state.shake > 0) {
    const shakeX = (Math.random() - 0.5) * state.shake;
    const shakeY = (Math.random() - 0.5) * state.shake;
    ctx.translate(shakeX, shakeY);
  }

  drawBackground();
  drawTrack();
  drawObstacles();
  drawParticles();
  drawPlayer();
  drawFloaters();
  drawCombo();
  drawFlash();
  ctx.restore();
}

function loop(timestamp) {
  if (!state.lastTime) state.lastTime = timestamp;
  const dt = Math.min(0.033, (timestamp - state.lastTime) / 1000);
  state.lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function handlePrimaryAction() {
  audio.unlock();
  if (state.mode === "idle" || state.mode === "gameover") {
    resetGame();
  }
}

function handleMove(direction) {
  audio.unlock();
  if (state.mode === "idle" || state.mode === "gameover") {
    resetGame();
    return;
  }
  movePlayer(direction);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  if (state.mode === "idle" || state.mode === "gameover") {
    handlePrimaryAction();
    return;
  }
  const bounds = canvas.getBoundingClientRect();
  const relativeX = event.clientX - bounds.left;
  handleMove(relativeX < bounds.width / 2 ? -1 : 1);
});
window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft") {
    event.preventDefault();
    handleMove(-1);
  }
  if (event.code === "ArrowRight") {
    event.preventDefault();
    handleMove(1);
  }
  if (event.code === "Space") {
    event.preventDefault();
    handlePrimaryAction();
  }
});

startButton.addEventListener("click", resetGame);
restartButton.addEventListener("click", resetGame);

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.beforeInstallPrompt = event;
  installButton.classList.remove("hidden");
});

installButton.addEventListener("click", async () => {
  if (!state.beforeInstallPrompt) return;
  state.beforeInstallPrompt.prompt();
  await state.beforeInstallPrompt.userChoice;
  state.beforeInstallPrompt = null;
  installButton.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
  installButton.classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

resizeCanvas();
syncFlowUi();
requestAnimationFrame(loop);
