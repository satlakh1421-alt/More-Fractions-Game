/**
 * FRACTION ORBIT: GRAVITON SLINGSHOT
 * Educational Mini-Game - Cambridge Primary Maths (Stage 5, Floor 2)
 * Topic: More Fractions - Estimating and Rounding
 * 
 * Platform Standards Compliant:
 * - Uses root.getElementById / root.querySelector (never document.getElementById)
 * - Emits game.end({ score, stars, success, maxScore, meta }) on Submit
 * - Try Again button resets game
 * - No external assets / URLs (Web Audio API synth + procedural Canvas)
 * - Touch & tablet friendly (PointerEvents + touch-action: none)
 * - IIFE encapsulation (zero global variables on window)
 */

(() => {
  'use strict';

  // Platform root & game API bindings (with standalone fallback for local testing)
  const root = typeof window.root !== 'undefined' ? window.root : document;
  const game = typeof window.game !== 'undefined' ? window.game : {
    end: (data) => console.log('[Game API] game.end called with:', data),
    emit: (name, data) => console.log('[Game API] emit:', name, data)
  };

  // --- AUDIO SYNTHESIZER (Web Audio API - 100% Offline & Asset-Free) ---
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.bgOsc = null;
      this.bgGain = null;
      this.bgInterval = null;
      this.initOnFirstInteraction = this.initOnFirstInteraction.bind(this);

      // Listen on root or window for user gesture to initialize AudioContext
      const startAudio = () => {
        this.init();
        window.removeEventListener('pointerdown', startAudio);
        window.removeEventListener('keydown', startAudio);
      };
      window.addEventListener('pointerdown', startAudio, { once: true });
      window.addEventListener('keydown', startAudio, { once: true });
    }

    init() {
      if (this.ctx) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      } catch (e) {
        console.warn('Web Audio not supported');
      }
    }

    initOnFirstInteraction() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.isMuted) {
        this.stopBGM();
      } else {
        this.initOnFirstInteraction();
        this.startBGM();
      }
      return !this.isMuted;
    }

    // Slingshot Pull Tension Sound (dynamically rising pitch)
    playTension(factor) {
      if (this.isMuted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const freq = 120 + Math.min(factor * 280, 400);
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
      } catch (e) {}
    }

    // Launch Whoosh
    playLaunch() {
      if (this.isMuted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.28);
      } catch (e) {}
    }

    // Star Gem Pickup Chime
    playGemPickup() {
      if (this.isMuted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
      } catch (e) {}
    }

    // Correct Dock Capture: Triumphant Major Arpeggio Chord
    playCorrectDock() {
      if (this.isMuted || !this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
          gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + idx * 0.06);
          osc.stop(this.ctx.currentTime + idx * 0.06 + 0.35);
        });
      } catch (e) {}
    }

    // Wrong Dock / Shield Deflect Buzz
    playWrongDock() {
      if (this.isMuted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      } catch (e) {}
    }

    // Level Cleared Fanfare
    playLevelVictory() {
      if (this.isMuted || !this.ctx) return;
      try {
        const chord = [440, 554.37, 659.25, 880];
        chord.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.16, this.ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + idx * 0.08);
          osc.stop(this.ctx.currentTime + 0.7);
        });
      } catch (e) {}
    }

    // Background Cosmic Melodic Arpeggio Loop
    startBGM() {
      if (this.isMuted || !this.ctx || this.bgInterval) return;
      const scale = [261.63, 329.63, 392.00, 493.88, 523.25, 392.00];
      let step = 0;
      this.bgInterval = setInterval(() => {
        if (this.isMuted || !this.ctx) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          const f = scale[step % scale.length];
          osc.frequency.setValueAtTime(f, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.4);
          step++;
        } catch (e) {}
      }, 420);
    }

    stopBGM() {
      if (this.bgInterval) {
        clearInterval(this.bgInterval);
        this.bgInterval = null;
      }
    }
  }

  const sound = new SoundManager();

  // --- GAME DATA DEFINITIONS (Cambridge Stage 5: Ordering and Comparing Fractions) ---
  const LEVEL_CONFIGS = [
    {
      level: 1,
      name: "Sector 1: Benchmark Orbit (Compare to ½)",
      desc: "Compare fractions to ½: Launch pod into < ½, = ½, or > ½!",
      timeLimit: 50,
      docks: [
        { label: "< ½", targetVal: "less", displayVal: "Less than ½ (< ½)", xPercent: 0.22, yPercent: 0.24, radius: 46, color: "#6366f1" },
        { label: "= ½", targetVal: "equal", displayVal: "Equal to ½ (= ½)", xPercent: 0.50, yPercent: 0.18, radius: 46, color: "#06b6d4" },
        { label: "> ½", targetVal: "greater", displayVal: "Greater than ½ (> ½)", xPercent: 0.78, yPercent: 0.24, radius: 46, color: "#10b981" }
      ],
      pods: [
        { fractionText: "⁴⁄₉", num: 4, den: 9, whole: 0, target: "less", explanation: "⁴⁄₉: 4 is less than 4.5 (half of 9), so ⁴⁄₉ < ½!" },
        { fractionText: "³⁄₆", num: 3, den: 6, whole: 0, target: "equal", explanation: "³⁄₆ simplifies to ½, so ³⁄₆ = ½!" },
        { fractionText: "⁷⁄₁₀", num: 7, den: 10, whole: 0, target: "greater", explanation: "⁷⁄₁₀: 7 is greater than 5 (half of 10), so ⁷⁄₁₀ > ½!" },
        { fractionText: "²⁄₅", num: 2, den: 5, whole: 0, target: "less", explanation: "²⁄₅: 2 is less than 2.5 (half of 5), so ²⁄₅ < ½!" },
        { fractionText: "⁵⁄₈", num: 5, den: 8, whole: 0, target: "greater", explanation: "⁵⁄₈: 5 is greater than 4 (half of 8), so ⁵⁄₈ > ½!" },
        { fractionText: "⁴⁄₈", num: 4, den: 8, whole: 0, target: "equal", explanation: "⁴⁄₈ simplifies to ½, so ³⁄₆ = ½!" }
      ],
      gemsCount: 3,
      hasObstacles: false
    },
    {
      level: 2,
      name: "Sector 2: Whole Number Gravity (Compare to 1)",
      desc: "Compare fractions to 1 Whole: Launch pod into < 1, = 1, or > 1!",
      timeLimit: 55,
      docks: [
        { label: "< 1", targetVal: "less", displayVal: "Less than 1 Whole (< 1)", xPercent: 0.22, yPercent: 0.24, radius: 46, color: "#38bdf8" },
        { label: "= 1", targetVal: "equal", displayVal: "Equal to 1 Whole (= 1)", xPercent: 0.50, yPercent: 0.18, radius: 46, color: "#a855f7" },
        { label: "> 1", targetVal: "greater", displayVal: "Greater than 1 (> 1)", xPercent: 0.78, yPercent: 0.24, radius: 46, color: "#10b981" }
      ],
      pods: [
        { fractionText: "⁵⁄₆", num: 5, den: 6, whole: 0, target: "less", explanation: "⁵⁄₆ has numerator < denominator, so ⁵⁄₆ < 1!" },
        { fractionText: "⁸⁄₈", num: 8, den: 8, whole: 1, target: "equal", explanation: "⁸⁄₈ has numerator equal to denominator, so ⁸⁄₈ = 1 Whole!" },
        { fractionText: "⁷⁄₄", num: 7, den: 4, whole: 1, target: "greater", explanation: "⁷⁄₄ is an improper fraction (1 ¾), so ⁷⁄₄ > 1!" },
        { fractionText: "⁹⁄₁₀", num: 9, den: 10, whole: 0, target: "less", explanation: "⁹⁄₁₀ is less than 10/10, so ⁹⁄₁₀ < 1!" },
        { fractionText: "⁵⁄₃", num: 5, den: 3, whole: 1, target: "greater", explanation: "⁵⁄₃ is an improper fraction (1 ⅔), so ⁵⁄₃ > 1!" },
        { fractionText: "⁴⁄₄", num: 4, den: 4, whole: 1, target: "equal", explanation: "⁴⁄₄ equals 1 Whole!" }
      ],
      gemsCount: 4,
      hasObstacles: true
    },
    {
      level: 3,
      name: "Sector 3: Cosmic Arena (Compare to ¾)",
      desc: "Compare fractions to ¾: Launch pod into < ¾, = ¾, or > ¾!",
      timeLimit: 60,
      docks: [
        { label: "< ¾", targetVal: "less", displayVal: "Less than ¾ (< ¾)", xPercent: 0.22, yPercent: 0.24, radius: 46, color: "#6366f1" },
        { label: "= ¾", targetVal: "equal", displayVal: "Equal to ¾ (= ¾)", xPercent: 0.50, yPercent: 0.18, radius: 46, color: "#f59e0b" },
        { label: "> ¾", targetVal: "greater", displayVal: "Greater than ¾ (> ¾)", xPercent: 0.78, yPercent: 0.24, radius: 46, color: "#10b981" }
      ],
      pods: [
        { fractionText: "¹⁄₂", num: 1, den: 2, whole: 0, target: "less", explanation: "¹⁄₂ is equivalent to 2/4, which is less than ¾!" },
        { fractionText: "⁶⁄₈", num: 6, den: 8, whole: 0, target: "equal", explanation: "⁶⁄₈ simplifies directly to ¾!" },
        { fractionText: "⁷⁄₈", num: 7, den: 8, whole: 0, target: "greater", explanation: "⁷⁄₈ has 7 eighths, which is greater than 6 eighths (¾)!" },
        { fractionText: "⁹⁄₁₂", num: 9, den: 12, whole: 0, target: "equal", explanation: "⁹⁄₁₂ simplifies directly to ¾!" },
        { fractionText: "⁴⁄₅", num: 4, den: 5, whole: 0, target: "greater", explanation: "⁴⁄₅ (80%) is greater than ¾ (75%)!" },
        { fractionText: "¹⁄₄", num: 1, den: 4, whole: 0, target: "less", explanation: "¹⁄₄ is less than ¾!" }
      ],
      gemsCount: 5,
      hasObstacles: true
    }
  ];

  // --- STATE VARIABLES ---
  let currentLevelIdx = 0;
  let currentPodIdx = 0;
  let score = 0;
  let comboStreak = 0;
  let bestStreak = 0;
  let lives = 3;
  let timeRemaining = 50;
  let timerInterval = null;
  let isGameActive = false;
  let correctHits = 0;
  let totalAttempts = 0;

  // Slingshot & Projectile State
  let slingshotBase = { x: 0, y: 0 };
  let projectile = null; // { x, y, vx, vy, radius, active, captured, dockRef }
  let isAiming = false;
  let aimStart = { x: 0, y: 0 };
  let aimCurrent = { x: 0, y: 0 };
  let particles = [];
  let floatingGems = [];
  let movingObstacles = [];
  let animFrameId = null;

  // Visual Elements Cached via root.getElementById
  const elements = {
    screenStart: root.getElementById('screen-start'),
    screenInstructions: root.getElementById('screen-instructions'),
    screenGame: root.getElementById('screen-game'),
    screenEnd: root.getElementById('screen-end'),

    // Nav controls
    btnSoundToggle: root.getElementById('btn-sound-toggle'),
    soundIcon: root.getElementById('sound-icon'),
    btnFullscreenToggle: root.getElementById('btn-fullscreen-toggle'),
    fullscreenIcon: root.getElementById('fullscreen-icon'),
    btnRestartNav: root.getElementById('btn-restart-nav'),

    // Menu buttons
    btnPlay: root.getElementById('btn-play'),
    btnInstructions: root.getElementById('btn-instructions'),
    btnStartFromInstructions: root.getElementById('btn-start-from-instructions'),
    btnBackToStart: root.getElementById('btn-back-to-start'),

    // HUD Elements
    hudLevelVal: root.getElementById('hud-level-val'),
    hudTimerVal: root.getElementById('hud-timer-val'),
    timerBarFill: root.getElementById('timer-bar-fill'),
    hudFracText: root.getElementById('hud-frac-text'),
    hudFracHint: root.getElementById('hud-frac-hint'),
    hudScoreVal: root.getElementById('hud-score-val'),
    hudComboBadge: root.getElementById('hud-combo-badge'),
    hudLivesContainer: root.getElementById('hud-lives-container'),

    // Canvas
    canvasGame: root.getElementById('canvas-game'),
    canvasHeroPreview: root.getElementById('canvas-hero-preview'),
    canvasPracticeSim: root.getElementById('canvas-practice-sim'),
    simFeedbackBadge: root.getElementById('sim-feedback-badge'),

    // Feedback & Modals
    dockFeedbackBanner: root.getElementById('dock-feedback-banner'),
    feedbackIcon: root.getElementById('feedback-icon'),
    feedbackTitle: root.getElementById('feedback-title'),
    feedbackSubtitle: root.getElementById('feedback-subtitle'),
    feedbackPoints: root.getElementById('feedback-points'),
    levelUpModal: root.getElementById('level-up-modal'),
    modalLevelTitle: root.getElementById('modal-level-title'),
    modalLevelDesc: root.getElementById('modal-level-desc'),
    btnNextLevel: root.getElementById('btn-next-level'),

    // End Screen Elements
    endStatusBadge: root.getElementById('end-status-badge'),
    endTitle: root.getElementById('end-title'),
    endSubtitle: root.getElementById('end-subtitle'),
    star1: root.getElementById('star-1'),
    star2: root.getElementById('star-2'),
    star3: root.getElementById('star-3'),
    starSummaryText: root.getElementById('star-summary-text'),
    statFinalScore: root.getElementById('stat-final-score'),
    statAccuracy: root.getElementById('stat-accuracy'),
    statSector: root.getElementById('stat-sector'),
    statBestStreak: root.getElementById('stat-best-streak'),
    btnTryAgain: root.getElementById('btn-try-again'),
    btnSubmitScore: root.getElementById('btn-submit-score')
  };

  const gameCtx = elements.canvasGame.getContext('2d');

  // --- SCREEN SWITCHING UTILITY ---
  function switchScreen(targetScreen) {
    const screens = [elements.screenStart, elements.screenInstructions, elements.screenGame, elements.screenEnd];
    screens.forEach(s => {
      s.classList.remove('active');
    });
    targetScreen.classList.add('active');

    // Show/hide restart button in top nav
    if (targetScreen === elements.screenGame) {
      elements.btnRestartNav.style.display = 'flex';
      resizeCanvas();
    } else {
      elements.btnRestartNav.style.display = 'none';
    }
  }

  // --- CANVAS RESIZING ---
  function resizeCanvas() {
    if (!elements.canvasGame) return;
    const rect = elements.canvasGame.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    elements.canvasGame.width = rect.width * dpr;
    elements.canvasGame.height = rect.height * dpr;
    gameCtx.resetTransform();
    gameCtx.scale(dpr, dpr);

    slingshotBase.x = rect.width / 2;
    slingshotBase.y = rect.height - 85;

    // Reset projectile position if waiting to shoot
    if (projectile && !projectile.active && !projectile.captured) {
      projectile.x = slingshotBase.x;
      projectile.y = slingshotBase.y;
    }
  }

  window.addEventListener('resize', resizeCanvas);

  // --- INITIALIZE GAME RUN ---
  function startNewGame() {
    sound.initOnFirstInteraction();
    sound.startBGM();

    currentLevelIdx = 0;
    currentPodIdx = 0;
    score = 0;
    comboStreak = 0;
    bestStreak = 0;
    lives = 3;
    correctHits = 0;
    totalAttempts = 0;

    updateHUD();
    switchScreen(elements.screenGame);
    loadLevel(currentLevelIdx);
  }

  // --- LOAD LEVEL ---
  function loadLevel(idx) {
    currentLevelIdx = idx;
    currentPodIdx = 0;
    const cfg = LEVEL_CONFIGS[currentLevelIdx];
    timeRemaining = cfg.timeLimit;

    // Build Floating Star Gems
    buildFloatingGems(cfg.gemsCount);

    // Build Obstacles if any
    buildObstacles(cfg.hasObstacles);

    // Reset Slingshot Pod
    spawnNextPod();

    // Start Level Timer
    startLevelTimer();

    updateHUD();
    isGameActive = true;

    if (!animFrameId) {
      lastTimestamp = performance.now();
      animFrameId = requestAnimationFrame(gameLoop);
    }
  }

  function spawnNextPod() {
    const cfg = LEVEL_CONFIGS[currentLevelIdx];
    if (currentPodIdx >= cfg.pods.length) {
      // Level Complete!
      handleLevelComplete();
      return;
    }

    const podData = cfg.pods[currentPodIdx];
    elements.hudFracText.textContent = podData.fractionText;
    elements.hudFracHint.textContent = `Target: ${cfg.desc.split('!')[0]}`;

    const rect = elements.canvasGame.getBoundingClientRect();
    const width = rect.width || 600;
    const height = rect.height || 500;
    slingshotBase.x = width / 2;
    slingshotBase.y = height - 85;

    projectile = {
      x: slingshotBase.x,
      y: slingshotBase.y,
      vx: 0,
      vy: 0,
      radius: 26,
      active: false,
      captured: false,
      data: podData,
      trail: [],
      pulse: 0
    };
  }

  function buildFloatingGems(count) {
    floatingGems = [];
    const rect = elements.canvasGame.getBoundingClientRect();
    const w = rect.width || 600;
    const h = rect.height || 500;

    for (let i = 0; i < count; i++) {
      const xRatio = 0.25 + (0.5 / (count + 1)) * (i + 1);
      const yRatio = 0.42 + (Math.sin(i * 1.5) * 0.12);
      floatingGems.push({
        x: w * xRatio,
        y: h * yRatio,
        radius: 14,
        collected: false,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function buildObstacles(enabled) {
    movingObstacles = [];
    if (!enabled) return;
    const rect = elements.canvasGame.getBoundingClientRect();
    const w = rect.width || 600;
    const h = rect.height || 500;

    // Gentle floating satellite with protective barrier
    movingObstacles.push({
      x: w * 0.5,
      y: h * 0.36,
      radius: 20,
      speed: 1.2,
      minX: w * 0.25,
      maxX: w * 0.75,
      dir: 1
    });
  }

  // --- TIMER HANDLING ---
  function startLevelTimer() {
    clearInterval(timerInterval);
    const cfg = LEVEL_CONFIGS[currentLevelIdx];
    const totalTime = cfg.timeLimit;

    updateTimerDisplay(totalTime);

    timerInterval = setInterval(() => {
      if (!isGameActive) return;
      timeRemaining--;
      updateTimerDisplay(totalTime);

      if (timeRemaining <= 10 && timeRemaining > 0) {
        sound.playTension(0.2);
      }

      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        handleTimeUp();
      }
    }, 1000);
  }

  function updateTimerDisplay(totalTime) {
    elements.hudTimerVal.textContent = `${timeRemaining}s`;
    const pct = Math.max(0, (timeRemaining / totalTime) * 100);
    elements.timerBarFill.style.width = `${pct}%`;
    if (pct < 25) {
      elements.timerBarFill.classList.add('urgent');
    } else {
      elements.timerBarFill.classList.remove('urgent');
    }
  }

  function handleTimeUp() {
    isGameActive = false;
    showDockFeedback(false, "Time Expired!", "Oxygen depleted in this sector", 0);
    setTimeout(() => {
      finishGame(false);
    }, 1200);
  }

  // --- HUD UPDATES ---
  function updateHUD() {
    elements.hudLevelVal.textContent = `${currentLevelIdx + 1} / ${LEVEL_CONFIGS.length}`;
    elements.hudScoreVal.textContent = score;
    elements.hudComboBadge.textContent = `${Math.max(1, comboStreak)}x Combo`;

    // Hearts
    const hearts = elements.hudLivesContainer.querySelectorAll('.heart');
    hearts.forEach((h, i) => {
      if (i < lives) {
        h.classList.remove('lost');
      } else {
        h.classList.add('lost');
      }
    });
  }

  // --- FLOATING FEEDBACK BANNER ---
  let feedbackTimeout = null;
  function showDockFeedback(isSuccess, title, subtitle, pts) {
    clearTimeout(feedbackTimeout);
    elements.dockFeedbackBanner.classList.remove('show', 'wrong');
    if (!isSuccess) {
      elements.dockFeedbackBanner.classList.add('wrong');
      elements.feedbackIcon.textContent = '⚠️';
    } else {
      elements.feedbackIcon.textContent = '🌟';
    }
    elements.feedbackTitle.textContent = title;
    elements.feedbackSubtitle.textContent = subtitle;
    elements.feedbackPoints.textContent = pts > 0 ? `+${pts}` : '+0';
    elements.dockFeedbackBanner.classList.add('show');

    feedbackTimeout = setTimeout(() => {
      elements.dockFeedbackBanner.classList.remove('show', 'wrong');
    }, 2800);
  }

  // --- INPUT / POINTER DRAGGING (Cross-Platform iPad & PC) ---
  function getCanvasCoords(e) {
    const rect = elements.canvasGame.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  elements.canvasGame.addEventListener('pointerdown', (e) => {
    if (!isGameActive || !projectile || projectile.active || projectile.captured) return;
    sound.initOnFirstInteraction();

    const pt = getCanvasCoords(e);
    const dist = Math.hypot(pt.x - slingshotBase.x, pt.y - slingshotBase.y);

    // Allow dragging from near the slingshot or anywhere in the lower third
    const rect = elements.canvasGame.getBoundingClientRect();
    if (dist < 80 || pt.y > rect.height * 0.65) {
      isAiming = true;
      aimStart = { x: slingshotBase.x, y: slingshotBase.y };
      aimCurrent = { x: pt.x, y: pt.y };
      elements.canvasGame.setPointerCapture(e.pointerId);
    }
  });

  elements.canvasGame.addEventListener('pointermove', (e) => {
    if (!isAiming || !projectile || projectile.active) return;
    const pt = getCanvasCoords(e);
    aimCurrent = pt;

    // Constrain pull vector
    const dx = aimCurrent.x - slingshotBase.x;
    const dy = aimCurrent.y - slingshotBase.y;
    const maxPull = 120;
    const pullDist = Math.hypot(dx, dy);

    if (pullDist > maxPull) {
      const angle = Math.atan2(dy, dx);
      aimCurrent.x = slingshotBase.x + Math.cos(angle) * maxPull;
      aimCurrent.y = slingshotBase.y + Math.sin(angle) * maxPull;
    }

    projectile.x = aimCurrent.x;
    projectile.y = aimCurrent.y;

    // Audio feedback on tension
    if (Math.random() < 0.2) {
      sound.playTension(pullDist / maxPull);
    }
  });

  elements.canvasGame.addEventListener('pointerup', (e) => {
    if (!isAiming || !projectile || projectile.active) return;
    isAiming = false;

    try {
      elements.canvasGame.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const dx = slingshotBase.x - projectile.x;
    const dy = slingshotBase.y - projectile.y;
    const pullDist = Math.hypot(dx, dy);

    // If dragged enough, launch!
    if (pullDist > 18) {
      sound.playLaunch();
      // Power multiplied by factor of 4.5x (from 0.22 to 0.99)
      const speedScale = 0.99;
      projectile.vx = dx * speedScale;
      projectile.vy = dy * speedScale;
      projectile.active = true;
      totalAttempts++;
    } else {
      // Snap back if barely moved
      projectile.x = slingshotBase.x;
      projectile.y = slingshotBase.y;
    }
  });

  elements.canvasGame.addEventListener('pointercancel', () => {
    if (isAiming && projectile && !projectile.active) {
      isAiming = false;
      projectile.x = slingshotBase.x;
      projectile.y = slingshotBase.y;
    }
  });

  // --- PHYSICS ENGINE & COLLISION DETECTION (Sub-stepped for 4.5x High Power) ---
  let lastTimestamp = 0;

  function gameLoop(now) {
    const dt = Math.min((now - lastTimestamp) / 1000, 0.05);
    lastTimestamp = now;

    if (elements.screenGame.classList.contains('active')) {
      updatePhysics(dt);
      renderGame();
    }

    animFrameId = requestAnimationFrame(gameLoop);
  }

  function updatePhysics(dt) {
    const rect = elements.canvasGame.getBoundingClientRect();
    const w = rect.width || 600;
    const h = rect.height || 500;
    const cfg = LEVEL_CONFIGS[currentLevelIdx];

    // Update Obstacles
    movingObstacles.forEach(obs => {
      obs.x += obs.speed * obs.dir;
      if (obs.x >= obs.maxX) obs.dir = -1;
      if (obs.x <= obs.minX) obs.dir = 1;
    });

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt * 2.2;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    if (!projectile || !projectile.active || projectile.captured) return;

    // Sub-stepping (4 steps per frame) prevents tunneling at 4.5x velocity
    const subSteps = 4;
    const subDt = dt / subSteps;
    const gravity = 520; // px/s^2 balanced for high-power parabolic flight

    for (let step = 0; step < subSteps; step++) {
      if (!projectile.active || projectile.captured) break;

      projectile.vy += gravity * subDt;
      projectile.x += projectile.vx * subDt * 60;
      projectile.y += projectile.vy * subDt * 60;

      // Stardust trail update
      projectile.trail.push({ x: projectile.x, y: projectile.y, alpha: 1 });
      if (projectile.trail.length > 24) projectile.trail.shift();

      // Check Star Gem Collect
      floatingGems.forEach(gem => {
        if (!gem.collected) {
          const d = Math.hypot(projectile.x - gem.x, projectile.y - gem.y);
          if (d < projectile.radius + gem.radius + 6) {
            gem.collected = true;
            score += 50;
            sound.playGemPickup();
            updateHUD();
            createGemSparks(gem.x, gem.y);
          }
        }
      });

      // Check Obstacle Collision
      movingObstacles.forEach(obs => {
        const d = Math.hypot(projectile.x - obs.x, projectile.y - obs.y);
        if (d < projectile.radius + obs.radius) {
          // Bounce off obstacle
          projectile.vx = -projectile.vx * 0.65;
          projectile.vy = -projectile.vy * 0.65;
          sound.playWrongDock();
          createDeflectionSparks(projectile.x, projectile.y, '#f59e0b');
        }
      });

      // Check Gravitational Pull & Dock Landing
      cfg.docks.forEach(dock => {
        const dockX = w * dock.xPercent;
        const dockY = h * dock.yPercent;
        const dist = Math.hypot(projectile.x - dockX, projectile.y - dockY);

        // Magnetic suction gravity well (tuned for 4.5x speed)
        if (dist < dock.radius * 2.6 && dist > 10) {
          const pullFactor = 0.22;
          projectile.vx += (dockX - projectile.x) * pullFactor * subDt * 60;
          projectile.vy += (dockY - projectile.y) * pullFactor * subDt * 60;
        }

        // Inside Dock capture zone
        if (dist < dock.radius + 8 && !projectile.captured) {
          handleDockCapture(dock, dockX, dockY);
        }
      });

      // Off-screen boundary check
      if (projectile.y > h + 50 || projectile.x < -50 || projectile.x > w + 50) {
        handleMiss();
        break;
      }
    }
  }

  function handleDockCapture(dock, dockX, dockY) {
    projectile.captured = true;
    projectile.active = false;
    projectile.x = dockX;
    projectile.y = dockY;

    const podData = projectile.data;
    const isCorrect = (dock.targetVal === podData.target);

    if (isCorrect) {
      correctHits++;
      comboStreak++;
      if (comboStreak > bestStreak) bestStreak = comboStreak;

      const basePoints = 120;
      const streakBonus = (comboStreak - 1) * 30;
      const earnedPoints = basePoints + streakBonus;
      score += earnedPoints;

      sound.playCorrectDock();
      createSuccessExplosion(dockX, dockY, dock.color);
      showDockFeedback(true, "Target Rounded!", `${podData.fractionText} -> ${dock.displayVal}. ${podData.explanation}`, earnedPoints);

      updateHUD();

      setTimeout(() => {
        currentPodIdx++;
        spawnNextPod();
      }, 1400);

    } else {
      comboStreak = 0;
      lives--;
      sound.playWrongDock();
      createDeflectionSparks(dockX, dockY, '#f43f5e');

      showDockFeedback(false, "Incorrect Dock!", `Expected: ${podData.target}. ${podData.explanation}`, 0);
      updateHUD();

      if (lives <= 0) {
        setTimeout(() => {
          finishGame(false);
        }, 1500);
      } else {
        setTimeout(() => {
          // Retry same pod with guidance
          spawnNextPod();
        }, 1600);
      }
    }
  }

  function handleMiss() {
    projectile.active = false;
    createDeflectionSparks(slingshotBase.x, slingshotBase.y, '#38bdf8');
    showDockFeedback(false, "Missed Trajectory!", "Pod recaptured by tractor beam. Aim your arc again!", 0);

    setTimeout(() => {
      if (projectile) {
        projectile.x = slingshotBase.x;
        projectile.y = slingshotBase.y;
        projectile.vx = 0;
        projectile.vy = 0;
        projectile.trail = [];
      }
    }, 600);
  }

  function handleLevelComplete() {
    isGameActive = false;
    clearInterval(timerInterval);
    sound.playLevelVictory();

    if (currentLevelIdx < LEVEL_CONFIGS.length - 1) {
      // Show Sector Transition Modal
      const nextCfg = LEVEL_CONFIGS[currentLevelIdx + 1];
      elements.modalLevelTitle.textContent = `Sector ${currentLevelIdx + 1} Cleared!`;
      elements.modalLevelDesc.textContent = `Prepare for ${nextCfg.name}: ${nextCfg.desc}`;
      elements.levelUpModal.classList.add('active');
    } else {
      // Completed all 3 levels!
      finishGame(true);
    }
  }

  elements.btnNextLevel.addEventListener('click', () => {
    elements.levelUpModal.classList.remove('active');
    loadLevel(currentLevelIdx + 1);
  });

  // --- PARTICLE EFFECTS ---
  function createGemSparks(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      const spd = 2 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: '#facc15',
        radius: 3 + Math.random() * 2,
        life: 1
      });
    }
  }

  function createSuccessExplosion(x, y, color) {
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 6;
      particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: color || '#38bdf8',
        radius: 3 + Math.random() * 4,
        life: 1
      });
    }
  }

  function createDeflectionSparks(x, y, color) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: color || '#ef4444',
        radius: 2 + Math.random() * 3,
        life: 0.8
      });
    }
  }

  // --- RENDERING CANVAS ---
  function renderGame() {
    const rect = elements.canvasGame.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const cfg = LEVEL_CONFIGS[currentLevelIdx];

    gameCtx.clearRect(0, 0, w, h);

    // Draw Subtle Starfield Background
    drawStarfield(gameCtx, w, h);

    // Draw Gravitational Rounding Docks
    cfg.docks.forEach(dock => {
      drawDock(gameCtx, w * dock.xPercent, h * dock.yPercent, dock);
    });

    // Draw Moving Obstacles
    movingObstacles.forEach(obs => {
      drawObstacle(gameCtx, obs);
    });

    // Draw Floating Star Gems
    floatingGems.forEach(gem => {
      drawGem(gameCtx, gem);
    });

    // Draw Trajectory Prediction Arc when aiming
    if (isAiming && projectile && !projectile.active) {
      drawTrajectoryArc(gameCtx, slingshotBase.x, slingshotBase.y, projectile.x, projectile.y, w, h);
    }

    // Draw Slingshot Platform
    drawSlingshot(gameCtx, slingshotBase.x, slingshotBase.y, projectile ? projectile.x : slingshotBase.x, projectile ? projectile.y : slingshotBase.y, isAiming);

    // Draw Projectile Pod & Trail
    if (projectile) {
      drawProjectile(gameCtx, projectile);
    }

    // Draw Particles
    particles.forEach(p => {
      gameCtx.save();
      gameCtx.globalAlpha = p.life;
      gameCtx.fillStyle = p.color;
      gameCtx.beginPath();
      gameCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      gameCtx.fill();
      gameCtx.restore();
    });
  }

  function drawStarfield(ctx, w, h) {
    ctx.save();
    // Static glowing ambient spots
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.3, 20, w * 0.5, h * 0.3, w * 0.7);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function drawDock(ctx, x, y, dock) {
    ctx.save();

    // Outer gravity well rings
    const time = performance.now() * 0.002;
    const pulseR = dock.radius + Math.sin(time + x) * 4;

    ctx.beginPath();
    ctx.arc(x, y, pulseR + 10, 0, Math.PI * 2);
    ctx.strokeStyle = dock.color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.25;
    ctx.stroke();

    // Swirling vortex aura
    ctx.beginPath();
    ctx.arc(x, y, pulseR, 0, Math.PI * 2);
    ctx.fillStyle = dock.color;
    ctx.globalAlpha = 0.12;
    ctx.fill();

    // Main Dock Body
    ctx.beginPath();
    ctx.arc(x, y, dock.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.globalAlpha = 0.95;
    ctx.fill();
    ctx.strokeStyle = dock.color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 1;
    ctx.stroke();

    // Inner glowing ring
    ctx.beginPath();
    ctx.arc(x, y, dock.radius - 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label Text (e.g. 0, ½, 1, 2, 3...)
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${dock.radius > 40 ? 22 : 18}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dock.label, x, y - 2);

    // Dock Sub-badge (display label)
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = dock.color;
    ctx.fillText('DOCK', x, y + dock.radius + 14);

    ctx.restore();
  }

  function drawObstacle(ctx, obs) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    const rot = performance.now() * 0.001;
    ctx.rotate(rot);

    // Hazard Barrier Glow
    ctx.beginPath();
    ctx.arc(0, 0, obs.radius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();

    // Core Asteroid
    ctx.beginPath();
    ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();

    ctx.fillStyle = '#fda4af';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 0, 0);

    ctx.restore();
  }

  function drawGem(ctx, gem) {
    if (gem.collected) return;
    ctx.save();
    gem.pulse += 0.04;
    const offset = Math.sin(gem.pulse) * 3;

    ctx.translate(gem.x, gem.y + offset);

    // Star Glow
    ctx.beginPath();
    ctx.arc(0, 0, gem.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
    ctx.fill();

    // Draw 5-pointed star
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * gem.radius, -Math.sin((18 + i * 72) * Math.PI / 180) * gem.radius);
      ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (gem.radius * 0.5), -Math.sin((54 + i * 72) * (Math.PI / 180)) * (gem.radius * 0.5));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function drawTrajectoryArc(ctx, startX, startY, pullX, pullY, w, h) {
    ctx.save();
    const dx = startX - pullX;
    const dy = startY - pullY;
    // Power multiplied by factor of 4.5x (matching physics speedScale = 0.99)
    const speedScale = 0.99;
    let simVx = dx * speedScale;
    let simVy = dy * speedScale;
    let simX = startX;
    let simY = startY;
    const dt = 0.016;
    const gravity = 520;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(simX, simY);

    for (let step = 0; step < 40; step++) {
      simVy += gravity * dt;
      simX += simVx * dt * 60;
      simY += simVy * dt * 60;
      ctx.lineTo(simX, simY);
      if (simY > h || simX < 0 || simX > w) break;
    }
    ctx.stroke();

    // Aim Target Dot
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(simX, simY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    ctx.restore();
  }

  function drawSlingshot(ctx, baseX, baseY, pullX, pullY, isStretched) {
    ctx.save();

    const armLeft = { x: baseX - 28, y: baseY - 12 };
    const armRight = { x: baseX + 28, y: baseY - 12 };

    // Rubber Bands (behind)
    if (isStretched) {
      ctx.beginPath();
      ctx.moveTo(armLeft.x, armLeft.y);
      ctx.lineTo(pullX, pullY);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(armRight.x, armRight.y);
      ctx.lineTo(pullX, pullY);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }

    // Slingshot Metal Fork Base
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(baseX, baseY + 36);
    ctx.lineTo(baseX, baseY);
    ctx.lineTo(armLeft.x, armLeft.y);
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(armRight.x, armRight.y);
    ctx.stroke();

    // Glowing emitter ring on fork tips
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(armLeft.x, armLeft.y, 4, 0, Math.PI * 2);
    ctx.arc(armRight.x, armRight.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawProjectile(ctx, pod) {
    ctx.save();

    // Draw stardust trail
    if (pod.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(pod.trail[0].x, pod.trail[0].y);
      for (let i = 1; i < pod.trail.length; i++) {
        ctx.lineTo(pod.trail[i].x, pod.trail[i].y);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    // Outer Glow
    ctx.beginPath();
    ctx.arc(pod.x, pod.y, pod.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fill();

    // Pod Orb Body
    ctx.beginPath();
    ctx.arc(pod.x, pod.y, pod.radius, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(pod.x - 6, pod.y - 6, 2, pod.x, pod.y, pod.radius);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.3, '#38bdf8');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Active Fraction Label on Pod
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pod.data.fractionText, pod.x, pod.y);

    ctx.restore();
  }

  // --- END GAME & STAR RATING ---
  function finishGame(isSuccess) {
    isGameActive = false;
    clearInterval(timerInterval);
    sound.stopBGM();

    // Calculate Stars (0 to 3 based on score and accuracy)
    const accuracy = totalAttempts > 0 ? Math.round((correctHits / totalAttempts) * 100) : 0;
    let stars = 0;
    if (score >= 300) stars = 1;
    if (score >= 650 && accuracy >= 60) stars = 2;
    if (score >= 950 && accuracy >= 80 && isSuccess) stars = 3;

    // Populate End Screen
    elements.statFinalScore.textContent = score;
    elements.statAccuracy.textContent = `${accuracy}%`;
    elements.statSector.textContent = `Sector ${currentLevelIdx + 1}`;
    elements.statBestStreak.textContent = `${bestStreak}x`;

    elements.endStatusBadge.textContent = isSuccess ? 'MISSION COMPLETE' : 'MISSION ABORTED';
    elements.endStatusBadge.style.color = isSuccess ? '#10b981' : '#f43f5e';
    elements.endTitle.textContent = isSuccess ? 'Orbital Master!' : 'Trajectory Recalibration';
    elements.endSubtitle.textContent = isSuccess 
      ? 'Outstanding piloting! You expertly estimated and rounded every fraction!'
      : 'Good effort! Review the fraction rounding benchmarks and launch again!';

    // Render Stars
    const starSlots = [elements.star1, elements.star2, elements.star3];
    starSlots.forEach((slot, idx) => {
      slot.classList.remove('earned');
      if (idx < stars) {
        setTimeout(() => {
          slot.classList.add('earned');
        }, (idx + 1) * 220);
      }
    });

    elements.starSummaryText.textContent = `${stars} Star${stars === 1 ? '' : 's'} Rating (${isSuccess ? 'Passed' : 'Try Again'})`;

    switchScreen(elements.screenEnd);
  }

  // Submit button calls platform game.end()
  elements.btnSubmitScore.addEventListener('click', () => {
    sound.playGemPickup();
    const accuracy = totalAttempts > 0 ? Math.round((correctHits / totalAttempts) * 100) : 0;
    let stars = 0;
    if (score >= 300) stars = 1;
    if (score >= 650 && accuracy >= 60) stars = 2;
    if (score >= 950 && accuracy >= 80) stars = 3;

    const maxPoints = (typeof game !== 'undefined' && game.config && game.config.maxPoints) || 100;
    const scaledScore = Math.min(maxPoints, Math.round((score / 1400) * maxPoints));

    elements.btnSubmitScore.disabled = true;
    elements.btnSubmitScore.innerHTML = '<span class="btn-icon">✅</span> Submitted!';

    if (typeof game !== 'undefined' && typeof game.end === 'function') {
      game.end({
        score: scaledScore || score,
        stars: stars,
        success: stars >= 1,
        maxScore: maxPoints,
        meta: {
          rawScore: score,
          accuracy: `${accuracy}%`,
          sectorReached: currentLevelIdx + 1,
          bestStreak: bestStreak
        }
      });
    }
  });

  // Try Again button resets game
  elements.btnTryAgain.addEventListener('click', () => {
    startNewGame();
  });

  // --- START & INSTRUCTIONS NAVIGATION ---
  elements.btnPlay.addEventListener('click', () => {
    startNewGame();
  });

  elements.btnInstructions.addEventListener('click', () => {
    sound.initOnFirstInteraction();
    switchScreen(elements.screenInstructions);
    initPracticeSim();
  });

  elements.btnStartFromInstructions.addEventListener('click', () => {
    startNewGame();
  });

  elements.btnBackToStart.addEventListener('click', () => {
    switchScreen(elements.screenStart);
  });

  elements.btnRestartNav.addEventListener('click', () => {
    if (confirm('Restart mission back to base?')) {
      startNewGame();
    }
  });

  // Sound toggle button
  elements.btnSoundToggle.addEventListener('click', () => {
    const isAudioOn = sound.toggleMute();
    elements.soundIcon.textContent = isAudioOn ? '🔊' : '🔇';
  });

  // Fullscreen toggle button
  elements.btnFullscreenToggle.addEventListener('click', () => {
    const wrapper = root.getElementById('game-container');
    if (!document.fullscreenElement) {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen().catch(() => {});
      } else if (wrapper.webkitRequestFullscreen) {
        wrapper.webkitRequestFullscreen();
      }
      elements.fullscreenIcon.textContent = '✕';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      elements.fullscreenIcon.textContent = '⛶';
    }
  });

  // --- INTERACTIVE PRACTICE SIMULATOR IN INSTRUCTIONS ---
  let practiceSimInitialized = false;
  function initPracticeSim() {
    if (practiceSimInitialized || !elements.canvasPracticeSim) return;
    practiceSimInitialized = true;

    const simCanvas = elements.canvasPracticeSim;
    const simCtx = simCanvas.getContext('2d');
    let simSlingshot = { x: 70, y: 70 };
    let simOrb = { x: 70, y: 70, vx: 0, vy: 0, active: false };
    let simTarget = { x: 380, y: 50, radius: 26, label: "½" };
    let simIsAiming = false;

    function renderSim() {
      simCtx.clearRect(0, 0, simCanvas.width, simCanvas.height);

      // Draw Slingshot Band
      if (simIsAiming) {
        simCtx.beginPath();
        simCtx.moveTo(simSlingshot.x - 14, simSlingshot.y);
        simCtx.lineTo(simOrb.x, simOrb.y);
        simCtx.moveTo(simSlingshot.x + 14, simSlingshot.y);
        simCtx.lineTo(simOrb.x, simOrb.y);
        simCtx.strokeStyle = '#f43f5e';
        simCtx.lineWidth = 2.5;
        simCtx.stroke();
      }

      // Draw Slingshot Fork
      simCtx.strokeStyle = '#64748b';
      simCtx.lineWidth = 4;
      simCtx.beginPath();
      simCtx.moveTo(simSlingshot.x, simSlingshot.y + 24);
      simCtx.lineTo(simSlingshot.x, simSlingshot.y);
      simCtx.lineTo(simSlingshot.x - 14, simSlingshot.y - 10);
      simCtx.moveTo(simSlingshot.x, simSlingshot.y);
      simCtx.lineTo(simSlingshot.x + 14, simSlingshot.y - 10);
      simCtx.stroke();

      // Draw Target Dock
      simCtx.beginPath();
      simCtx.arc(simTarget.x, simTarget.y, simTarget.radius, 0, Math.PI * 2);
      simCtx.fillStyle = '#0f172a';
      simCtx.fill();
      simCtx.strokeStyle = '#38bdf8';
      simCtx.lineWidth = 2.5;
      simCtx.stroke();
      simCtx.fillStyle = '#38bdf8';
      simCtx.font = 'bold 15px sans-serif';
      simCtx.textAlign = 'center';
      simCtx.textBaseline = 'middle';
      simCtx.fillText(simTarget.label, simTarget.x, simTarget.y);

      // Trajectory Line
      if (simIsAiming) {
        simCtx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        simCtx.lineWidth = 2;
        simCtx.setLineDash([4, 4]);
        simCtx.beginPath();
        simCtx.moveTo(simOrb.x, simOrb.y);
        simCtx.quadraticCurveTo(220, 10, simTarget.x, simTarget.y);
        simCtx.stroke();
        simCtx.setLineDash([]);
      }

      // Draw Orb
      simCtx.beginPath();
      simCtx.arc(simOrb.x, simOrb.y, 16, 0, Math.PI * 2);
      simCtx.fillStyle = '#f59e0b';
      simCtx.fill();
      simCtx.strokeStyle = '#fff';
      simCtx.lineWidth = 1.5;
      simCtx.stroke();
      simCtx.fillStyle = '#fff';
      simCtx.font = 'bold 10px sans-serif';
      simCtx.textAlign = 'center';
      simCtx.textBaseline = 'middle';
      simCtx.fillText('⁴⁄₉', simOrb.x, simOrb.y);

      if (simOrb.active) {
        simOrb.vy += 22 * 0.03;
        simOrb.x += simOrb.vx;
        simOrb.y += simOrb.vy;

        const d = Math.hypot(simOrb.x - simTarget.x, simOrb.y - simTarget.y);
        if (d < simTarget.radius + 12) {
          simOrb.active = false;
          elements.simFeedbackBadge.textContent = '✨ Captured! ⁴⁄₉ rounds to ½!';
          elements.simFeedbackBadge.style.color = '#10b981';
          sound.playCorrectDock();
          setTimeout(() => {
            simOrb.x = simSlingshot.x;
            simOrb.y = simSlingshot.y;
            elements.simFeedbackBadge.textContent = 'Drag back on the orange orb and release!';
            elements.simFeedbackBadge.style.color = '#38bdf8';
          }, 1500);
        } else if (simOrb.x > simCanvas.width || simOrb.y > simCanvas.height) {
          simOrb.active = false;
          simOrb.x = simSlingshot.x;
          simOrb.y = simSlingshot.y;
        }
      }

      requestAnimationFrame(renderSim);
    }

    renderSim();

    simCanvas.addEventListener('pointerdown', (e) => {
      const rect = simCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (Math.hypot(x - simOrb.x, y - simOrb.y) < 30) {
        simIsAiming = true;
        simCanvas.setPointerCapture(e.pointerId);
      }
    });

    simCanvas.addEventListener('pointermove', (e) => {
      if (!simIsAiming) return;
      const rect = simCanvas.getBoundingClientRect();
      simOrb.x = Math.max(20, Math.min(simSlingshot.x + 10, e.clientX - rect.left));
      simOrb.y = Math.max(30, Math.min(105, e.clientY - rect.top));
    });

    simCanvas.addEventListener('pointerup', (e) => {
      if (!simIsAiming) return;
      simIsAiming = false;
      try { simCanvas.releasePointerCapture(e.pointerId); } catch (err) {}

      const dx = simSlingshot.x - simOrb.x;
      const dy = simSlingshot.y - simOrb.y;
      if (Math.hypot(dx, dy) > 10) {
        // Multiplied by ~4.5x factor (from 0.28 to 1.25)
        simOrb.vx = dx * 1.25;
        simOrb.vy = dy * 1.25;
        simOrb.active = true;
        sound.playLaunch();
      } else {
        simOrb.x = simSlingshot.x;
        simOrb.y = simSlingshot.y;
      }
    });
  }

  // --- HERO PREVIEW ANIMATION ON START SCREEN ---
  function initHeroPreview() {
    const heroCanvas = elements.canvasHeroPreview;
    if (!heroCanvas) return;
    const ctx = heroCanvas.getContext('2d');
    let t = 0;

    function renderHero() {
      t += 0.025;
      ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

      // Pulsing cosmic dock
      const dockX = 240;
      const dockY = 65;
      const r = 34 + Math.sin(t) * 3;

      ctx.beginPath();
      ctx.arc(dockX, dockY, r + 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(dockX, dockY, r, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('3', dockX, dockY - 2);

      // Slingshot base
      const slingX = 55;
      const slingY = 90;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(slingX, slingY + 28);
      ctx.lineTo(slingX, slingY);
      ctx.lineTo(slingX - 16, slingY - 12);
      ctx.moveTo(slingX, slingY);
      ctx.lineTo(slingX + 16, slingY - 12);
      ctx.stroke();

      // Slingshot pullback motion
      const pull = Math.sin(t * 1.5) * 14 + 14;
      const orbX = slingX - pull * 0.7;
      const orbY = slingY + pull * 0.5;

      // Bands
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(slingX - 16, slingY - 12);
      ctx.lineTo(orbX, orbY);
      ctx.moveTo(slingX + 16, slingY - 12);
      ctx.lineTo(orbX, orbY);
      ctx.stroke();

      // Arc
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(orbX, orbY);
      ctx.quadraticCurveTo(140, 20, dockX, dockY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fraction Pod
      ctx.beginPath();
      ctx.arc(orbX, orbY, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('2 ⅞', orbX, orbY);

      if (elements.screenStart.classList.contains('active')) {
        requestAnimationFrame(renderHero);
      }
    }

    renderHero();
  }

  // Initialize Hero Preview once loaded
  initHeroPreview();

})();
