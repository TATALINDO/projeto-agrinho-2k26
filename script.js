/**
 * EcoAgro 2050 - Script.js
 * Concurso Agrinho 2026 - Código de Produção Especializado
 * HTML, CSS e JS Puros com o melhor da engenharia front-end
 */

// Global State
const APP_STATE = {
  theme: 'light', // 'light' or 'dark'
  soundEnabled: true,
  quiz: {
    currentIndex: 0,
    score: 0,
    answered: false,
    selectedOption: null
  },
  game: {
    isRunning: false,
    score: 0,
    lives: 3,
    level: 1,
    canvas: null,
    ctx: null,
    animationId: null,
    player: { x: 180, y: 350, width: 70, height: 40, speed: 8 },
    items: [],
    keys: { Left: false, Right: false },
    lastSpawnTime: 0,
    spawnInterval: 1200, // ms
    speedMultiplier: 1.0
  }
};

// Web Audio API Synthesizer - Real custom sound effects
class EcoAudioSynthesizer {
  constructor() {
    this.audioCtx = null;
  }

  // Lazy Initialization (Required by modern browsers)
  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playCollect() {
    if (!APP_STATE.soundEnabled) return;
    this.init();
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Arpeggio rising
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  playHarm() {
    if (!APP_STATE.soundEnabled) return;
    this.init();
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.23);
  }

  playLevelUp() {
    if (!APP_STATE.soundEnabled) return;
    this.init();
    const ctx = this.audioCtx;
    
    // Multi-note arpeggio chord
    const notes = [261.63, 311.13, 392.00, 523.25, 622.25]; // C minor sweet chord
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.2);
    });
  }

  playGameOver() {
    if (!APP_STATE.soundEnabled) return;
    this.init();
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.62);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  }
}

const AudioFX = new EcoAudioSynthesizer();

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  setupMobileNavigation();
  setupAppearanceCustomizer();
  setupScrollAnimations();
  setupBackgroundLeafParticles();
  setupSustainabilitySimulator();
  setupQuizEngine();
  setupArcadeGame();
});

// --- Theme Toggler & Persistence ---
function setupTheme() {
  const btn = document.getElementById('theme-toggle');
  const savedState = localStorage.getItem('ecoagro-theme') || 'light';
  
  applyTheme(savedState);

  btn.addEventListener('click', () => {
    const nextState = APP_STATE.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextState);
    localStorage.setItem('ecoagro-theme', nextState);
  });
}

function applyTheme(theme) {
  APP_STATE.theme = theme;
  const root = document.documentElement;
  const skyTop = document.getElementById('sky-grad-top');
  const skyBottom = document.getElementById('sky-grad-bottom');

  if (theme === 'dark') {
    root.classList.add('dark');
    // Adjust visual banner gradient skies directly inside SVG defs
    if (skyTop && skyBottom) {
      skyTop.setAttribute('stop-color', '#102e1c');
      skyBottom.setAttribute('stop-color', '#07150e');
    }
  } else {
    root.classList.remove('dark');
    if (skyTop && skyBottom) {
      skyTop.setAttribute('stop-color', '#E8F8F5');
      skyBottom.setAttribute('stop-color', '#A2D9CE');
    }
  }
}

// --- Appearance & Accessibility Customizer Panel ---
function setupAppearanceCustomizer() {
  const customizeToggle = document.getElementById('customize-toggle');
  const customizeDrawer = document.getElementById('customize-drawer');
  const closeCustomizeBtn = document.getElementById('close-customize-btn');
  
  if (!customizeDrawer) return;

  // Toggle Drawer Open/Close with slide transitions
  const openDrawer = () => {
    customizeDrawer.classList.remove('hidden');
    // Allow thread loop layout rendering before toggle animation
    setTimeout(() => {
      customizeDrawer.classList.remove('translate-x-full');
      customizeDrawer.classList.add('translate-x-0');
    }, 15);
  };

  const closeDrawer = () => {
    customizeDrawer.classList.remove('translate-x-0');
    customizeDrawer.classList.add('translate-x-full');
    setTimeout(() => {
      customizeDrawer.classList.add('hidden');
    }, 500); // matches transition speed
  };

  if (customizeToggle) {
    customizeToggle.addEventListener('click', openDrawer);
  }
  if (closeCustomizeBtn) {
    closeCustomizeBtn.addEventListener('click', closeDrawer);
  }

  // Close when clicking outside of the drawer
  document.addEventListener('mousedown', (e) => {
    if (customizeDrawer && !customizeDrawer.classList.contains('hidden')) {
      if (!customizeDrawer.contains(e.target) && customizeToggle && !customizeToggle.contains(e.target)) {
        closeDrawer();
      }
    }
  });

  // --- Preset 1: Accent Colors ---
  const colorButtons = document.querySelectorAll('.color-preset-btn');
  const savedColor = localStorage.getItem('ecoagro-color-preset') || 'green';

  const applyColorPreset = (preset) => {
    const root = document.documentElement;
    // Clear existing presets classes
    root.classList.remove('theme-preset-green', 'theme-preset-amber', 'theme-preset-blue', 'theme-preset-violet');
    
    if (preset !== 'green') {
      root.classList.add(`theme-preset-${preset}`);
    }

    // Toggle checkmark display in panel controls
    colorButtons.forEach(btn => {
      const checkmark = btn.querySelector('span');
      if (btn.getAttribute('data-preset') === preset) {
        btn.classList.add('active');
        if (checkmark) checkmark.classList.remove('hidden');
      } else {
        btn.classList.remove('active');
        if (checkmark) checkmark.classList.add('hidden');
      }
    });

    localStorage.setItem('ecoagro-color-preset', preset);
  };

  colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      applyColorPreset(preset);
      AudioFX.playCollect(); // Optional sound feedback
    });
  });

  // Apply saved accent theme at launch
  applyColorPreset(savedColor);

  // --- Preset 2: Typography Style ---
  const fontPresetButtons = document.querySelectorAll('.font-preset-btn');
  const savedFontPreset = localStorage.getItem('ecoagro-font-preset') || 'modern';

  const applyFontPreset = (preset) => {
    const root = document.documentElement;
    root.classList.remove('font-preset-modern', 'font-preset-elegant', 'font-preset-tech');
    root.classList.add(`font-preset-${preset}`);

    fontPresetButtons.forEach(btn => {
      if (btn.getAttribute('data-preset') === preset) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    localStorage.setItem('ecoagro-font-preset', preset);
  };

  fontPresetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      applyFontPreset(preset);
      AudioFX.playCollect();
    });
  });

  applyFontPreset(savedFontPreset);

  // --- Preset 3: Text Scale / Accessibility size ---
  const scalePresetButtons = document.querySelectorAll('.scale-preset-btn');
  const savedScalePreset = localStorage.getItem('ecoagro-scale-preset') || 'normal';

  const applyScalePreset = (preset) => {
    const root = document.documentElement;
    root.classList.remove('text-scale-normal', 'text-scale-medium', 'text-scale-large');
    root.classList.add(`text-scale-${preset}`);

    scalePresetButtons.forEach(btn => {
      if (btn.getAttribute('data-preset') === preset) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    localStorage.setItem('ecoagro-scale-preset', preset);
  };

  scalePresetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      applyScalePreset(preset);
      AudioFX.playCollect();
    });
  });

  applyScalePreset(savedScalePreset);
}

// --- Menu de Navegação ---
function setupMobileNavigation() {
  const burgerBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-navigation');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  burgerBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('hidden');
  });

  // Auto-close mobile drawer when any link is selected
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
    });
  });
}

// --- Background Leaf Particle Generator ---
function setupBackgroundLeafParticles() {
  const container = document.getElementById('leaf-particles-container');
  if (!container) return;

  const particleIcons = [
    '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-2 6h4v4h-4z"/></svg>', // Custom bio node leaf
    '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 8C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2A7 7 0 0 1 9.8 6.1C15.5 5 17 8 17 8z"/></svg>' // Real leaf
  ];

  function createParticle() {
    if (document.hidden) return; // Save resources if tab in background
    const particle = document.createElement('div');
    particle.className = 'leaf-particle';
    particle.innerHTML = particleIcons[Math.floor(Math.random() * particleIcons.length)];

    // Random geometries
    particle.style.left = `${Math.random() * 100}%`;
    const duration = 8 + Math.random() * 6; // 8 - 14 seconds
    particle.style.animationDuration = `${duration}s`;
    particle.style.scale = `${0.6 + Math.random() * 0.7}`;
    
    // Adaptive theme color hues
    const opacityVal = 0.15 + (Math.random() * 0.25);
    particle.style.opacity = `${opacityVal}`;
    
    const activeColor = localStorage.getItem('ecoagro-color-preset') || 'green';
    let color1 = '#2ECC71';
    let color2 = '#196F3D';
    if (activeColor === 'amber') {
      color1 = '#f59e0b';
      color2 = '#d97706';
    } else if (activeColor === 'blue') {
      color1 = '#0ea5e9';
      color2 = '#0284c7';
    } else if (activeColor === 'violet') {
      color1 = '#8b5cf6';
      color2 = '#7c3aed';
    }
    particle.style.color = Math.random() > 0.5 ? color1 : color2;

    container.appendChild(particle);

    // Garbage collector to stay extremely clean
    setTimeout(() => {
      particle.remove();
    }, duration * 1000);
  }

  // Create initial wave
  for (let i = 0; i < 6; i++) {
    createParticle();
  }

  // Spawn interval loop
  setInterval(createParticle, 3000);
}

// --- IntersectionObserver for Section Fade-Ins & Numeric Count-Ups ---
function setupScrollAnimations() {
  const sections = document.querySelectorAll('.fade-in-section');
  
  const observerOptions = {
    root: null,
    threshold: 0.02 // Lower threshold to ensure triggering even on small viewports
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        
        // If this is the statistics section, trigger numbers animation
        if (entry.target.id === 'estatisticas') {
          triggerCountingStats();
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // Fallback 1: On-scroll direct viewport check to ensure elements show up
  const checkVisibilityManual = () => {
    sections.forEach(section => {
      if (section.classList.contains('is-visible')) return;
      const rect = section.getBoundingClientRect();
      // If any part of the section is within viewport
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        section.classList.add('is-visible');
        if (section.id === 'estatisticas') {
          triggerCountingStats();
        }
      }
    });
  };

  window.addEventListener('scroll', checkVisibilityManual);
  window.addEventListener('resize', checkVisibilityManual);
  
  // Fallback 2: General fail-safe timer (after 1s, force-reveal sections)
  // This ensures that even under restricted iframe viewing dimensions, sections are guaranteed to appear!
  setTimeout(() => {
    sections.forEach(section => {
      if (!section.classList.contains('is-visible')) {
        section.classList.add('is-visible');
        if (section.id === 'estatisticas') {
          triggerCountingStats();
        }
      }
    });
  }, 1000);

  // Initial check
  checkVisibilityManual();
}

function triggerCountingStats() {
  const countElements = document.querySelectorAll('.stat-count-target');
  
  countElements.forEach(elem => {
    if (elem.classList.contains('counted')) return; // Avoid repeating animation
    
    const target = parseInt(elem.getAttribute('data-target'), 10);
    const duration = 1500; // ms
    const increment = target / (duration / 16); // 60 FPS
    let current = 0;

    const countInterval = setInterval(() => {
      current += increment;
      if (current >= target) {
        elem.innerText = target;
        elem.classList.add('counted');
        clearInterval(countInterval);
      } else {
        elem.innerText = Math.floor(current);
      }
    }, 16);
  });
}

// --- Sustainable Agriculture Simulator Logic ---
function setupSustainabilitySimulator() {
  const waterInput = document.getElementById('water-usage-input');
  const energyInput = document.getElementById('energy-renew-input');
  const greenInput = document.getElementById('green-areas-input');

  const waterText = document.getElementById('water-val');
  const energyText = document.getElementById('energy-val');
  const greenText = document.getElementById('green-val');

  const gaugeFill = document.getElementById('simulator-gauge-fill');
  const percentageDisplay = document.getElementById('sustainability-percentage');
  const statusBadge = document.getElementById('simulator-status-badge');
  const msgDisplay = document.getElementById('sustainability-message');

  function evaluateSustainability() {
    const waterVal = parseInt(waterInput.value, 10);
    const energyVal = parseInt(energyInput.value, 10);
    const greenVal = parseInt(greenInput.value, 10);

    // Update inline labels
    waterText.innerText = `${waterVal}%`;
    energyText.innerText = `${energyVal}%`;
    greenText.innerText = `${greenVal}%`;

    // Mathematical formula representing resource balances
    // Green areas preservation acts as carbon offset multiplier (higher weight)
    const average = Math.round((waterVal + energyVal + greenVal) / 3);

    // Update Percentage
    percentageDisplay.innerText = `${average}%`;

    // Update gauge stroke-dashoffset (Circumference ~ 251.2)
    const circumference = 251.2;
    const offset = circumference - (circumference * average) / 100;
    gaugeFill.style.strokeDashoffset = offset;

    // Categorization (Vermelho, Amarelo, Verde) with responsive color mapping
    if (average < 50) {
      // Baixa sustentabilidade
      gaugeFill.style.stroke = '#EF4444'; // Red
      statusBadge.innerText = 'Preservação Insuficiente';
      statusBadge.className = 'inline-block mt-3 px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
      msgDisplay.innerText = 'Alerta Vermelho! Desequilíbrio biológico grave. Seus consumos estão acelerados e a reserva legal ciliar está defasada. Aumente o plantio florestal e reforce o reúso hídrico.';
    } else if (average >= 50 && average < 80) {
      // Média sustentabilidade
      gaugeFill.style.stroke = '#F1C40F'; // Yellow
      statusBadge.innerText = 'Equilíbrio Moderado';
      statusBadge.className = 'inline-block mt-3 px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20';
      msgDisplay.innerText = 'Estrutura técnica moderada. Seu agro está sustentável nas frentes vitais, mas ainda depende parcialmente de fontes pesadas. Eleve a captação solar para destravar proteção excelente!';
    } else {
      // Excelente sustentabilidade
      gaugeFill.style.stroke = '#2ECC71'; // Green
      statusBadge.innerText = 'Santuário de Alta Produtividade';
      statusBadge.className = 'inline-block mt-3 px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      msgDisplay.innerText = 'Parabéns! Excelente sustentabilidade! Sua lavoura colhe em abundância sem esgotar o lençol freático, neutralizando CO₂. Este modelo cumpre e supera as metas do Agrinho 2026!';
    }
  }

  // Bind values listeners
  waterInput.addEventListener('input', evaluateSustainability);
  energyInput.addEventListener('input', evaluateSustainability);
  greenInput.addEventListener('input', evaluateSustainability);

  // Initial evaluator
  evaluateSustainability();
}

// --- Interactive 5-Question Quiz Module ---
const QUIZ_QUESTIONS = [
  {
    title: "Qual tecnologia sustentável permite poupar até 30% em adubos químicos mapeando o solo com satélite?",
    options: [
      "A) Pulverização aérea clássica e indiscriminada.",
      "B) Agricultura de precisão com maquinários guiados por sinal RTK de alta fidelidade.",
      "C) Remoção de palhada pré-cultivo através de queimadas controladas periódicas.",
      "D) Aspersão convencional ininterrupta alimentada por geradores pesados de diesel."
    ],
    correctIdx: 1,
    explanation: "A agricultura de precisão distribui os insumos apenas na dosagem matemática exata que a planta precisa naquele metro quadrado, economizando vastos recursos financeiros e ambientais."
  },
  {
    title: "De que maneira a captação solar fotovoltaica impacta a pegada ecológica rural?",
    options: [
      "A) Concentra vento termal propício ao crescimento acelerado de soja.",
      "B) Substitui inteiramente a fotossíntese natural em estufas encobertas.",
      "C) Alimenta sistemas IoT de irrigação inteligente e bombas de poços de maneira limpa.",
      "D) Isola as pragas e microrganismos através de barreiras químicas estáticas."
    ],
    correctIdx: 2,
    explanation: "Fontes solares locais eliminam a queima de óleo diesel na eletrificação de cercas elétricas, pivôs e tratores bioelétricos, fornecendo autossuficiência livre de poluição."
  },
  {
    title: "Por que as matas ciliares ciliares e bacias florestadas são estritamente mantidas sob lei?",
    options: [
      "A) Evitam desmoronamentos de beiradas de rios e filtram resíduos mantendo a vitalidade do peixe.",
      "B) Consomem as neblinas excessivas facilitando a visão de aviões cargueiros.",
      "C) Facilitam o pastoreio direto e intensivo do gado perto das nascentes nativas.",
      "D) Produzem madeiras nobres de reflorestamento rápido para corte comercial clandestino."
    ],
    correctIdx: 0,
    explanation: "Florestas ciliares seguram o solo contra chuvas violentas, reduzem assoreamento drástico das águas do rio e formam grandes corredores de migração livre para a nossa fauna nativa."
  },
  {
    title: "Drones multiespectrais aéreos apoiam a preservação ambiental do campo como?",
    options: [
      "A) Transportando grades físicas pesadas para arar o topo de montanhas rochosas.",
      "B) Capturando imagens de luz especial para prever estresse hídrico e patólogos na folha previamente.",
      "C) Espantando aves silvestres por meio de emissores sônicos térmicos agressivos.",
      "D) Despejando cargas massivas de inseticidas de alta concentração e longo prazo."
    ],
    correctIdx: 1,
    explanation: "Garantindo visão térmica e multiespectral a milhares de pés, agricultores conseguem aplicar microrganismos de cura somente nos focos isolados sob anomalias biológicas, evitando poluição geral."
  },
  {
    title: "Qual o foco e o objetivo central do Concurso Agrinho 2026 sobre 'Agro Forte, Futuro Sustentável'?",
    options: [
      "A) Eliminar a colheita em larga escala para dar espaço apenas a pequenas reservas intocadas.",
      "B) Fortalecer a exportação desenfreada independentemente da saúde dos rios e reservas ciliares.",
      "C) Demonstrar que a tecnologia aplicada apoia a alta produção industrial em perfeita simbiose ecológica.",
      "D) Promover fertilizantes sintéticos de alto impacto na regeneração imediata química de areias."
    ],
    correctIdx: 2,
    explanation: "Unir engenhosidade produtiva com proteção da natureza. Esse equilíbrio garante que possamos continuar produzindo alimento farto de altíssima qualidade de modo indefinido."
  }
];

function setupQuizEngine() {
  const qTitle = document.getElementById('quiz-question-title');
  const optionsBox = document.getElementById('quiz-options-container');
  const explanationBox = document.getElementById('quiz-explanation-box');
  const explanationText = document.getElementById('quiz-explanation-content');
  const actionBtn = document.getElementById('quiz-action-btn');
  const progressPercent = document.getElementById('quiz-progress-bar');
  const indicatorText = document.getElementById('quiz-question-number-indicator');
  const scoreBadge = document.getElementById('quiz-score-indicator');

  const quizActiveView = document.getElementById('quiz-active-view');
  const quizResultView = document.getElementById('quiz-result-view');
  const quizFinalScore = document.getElementById('quiz-final-score-text');
  const quizMotivationalMsg = document.getElementById('quiz-motivational-msg');
  const quizResetBtn = document.getElementById('quiz-reset-btn');

  function renderQuestion() {
    const q = QUIZ_QUESTIONS[APP_STATE.quiz.currentIndex];
    
    // Set indicators
    indicatorText.innerText = `Questão ${APP_STATE.quiz.currentIndex + 1} de ${QUIZ_QUESTIONS.length}`;
    progressPercent.style.width = `${((APP_STATE.quiz.currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`;
    scoreBadge.innerText = `Pontos: ${APP_STATE.quiz.score}`;

    qTitle.innerText = q.title;
    optionsBox.innerHTML = '';
    explanationBox.classList.add('hidden');
    
    // Disable confirm till user options
    actionBtn.disabled = true;
    actionBtn.className = 'px-6 py-3 bg-emerald-300 dark:bg-emerald-800 text-white dark:text-emerald-200 cursor-not-allowed font-bold rounded-xl transition duration-300';
    actionBtn.innerText = 'Confirmar Resposta';

    APP_STATE.quiz.answered = false;
    APP_STATE.quiz.selectedOption = null;

    // Render options
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn w-full text-left p-5 rounded-2xl flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-transparent';
      btn.setAttribute('data-index', idx);
      
      const char = ['A', 'B', 'C', 'D'][idx];
      btn.innerHTML = `
        <span>${opt}</span>
        <span class="w-6 h-6 rounded-full border border-emerald-500/30 flex items-center justify-center text-xs group-hover:bg-emerald-500/10 transition-colors">${char}</span>
      `;

      btn.addEventListener('click', () => {
        if (APP_STATE.quiz.answered) return;
        
        // Remove previous selection highlight
        document.querySelectorAll('.quiz-option-btn').forEach(b => {
          b.classList.remove('selected');
        });

        btn.classList.add('selected');
        APP_STATE.quiz.selectedOption = idx;

        // Activate Confirm
        actionBtn.disabled = false;
        actionBtn.className = 'px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-bold rounded-xl transition cursor-pointer';
      });

      optionsBox.appendChild(btn);
    });
  }

  actionBtn.addEventListener('click', () => {
    const q = QUIZ_QUESTIONS[APP_STATE.quiz.currentIndex];

    if (!APP_STATE.quiz.answered) {
      // Validate Answer
      APP_STATE.quiz.answered = true;
      const buttons = document.querySelectorAll('.quiz-option-btn');
      
      buttons.forEach((btn, idx) => {
        btn.classList.remove('selected');
        if (idx === q.correctIdx) {
          btn.classList.add('correct');
        } else if (idx === APP_STATE.quiz.selectedOption) {
          btn.classList.add('wrong');
        }
      });

      if (APP_STATE.quiz.selectedOption === q.correctIdx) {
        APP_STATE.quiz.score += 20;
        AudioFX.playCollect();
      } else {
        AudioFX.playHarm();
      }

      scoreBadge.innerText = `Pontos: ${APP_STATE.quiz.score}`;

      // Open explanation panel
      explanationText.innerText = q.explanation;
      explanationBox.classList.remove('hidden');

      // Change button style for advancing
      actionBtn.innerText = 'Próxima Questão';
    } else {
      // Advance or show final panel
      if (APP_STATE.quiz.currentIndex < QUIZ_QUESTIONS.length - 1) {
        APP_STATE.quiz.currentIndex++;
        renderQuestion();
      } else {
        showQuizResults();
      }
    }
  });

  function showQuizResults() {
    quizActiveView.classList.add('hidden');
    quizResultView.classList.remove('hidden');

    const totalQuestions = QUIZ_QUESTIONS.length;
    const correctCount = APP_STATE.quiz.score / 20;

    quizFinalScore.innerText = `Você acertou ${correctCount} de ${totalQuestions} questões! (Total: ${APP_STATE.quiz.score} pontos)`;

    if (correctCount <= 2) {
      quizMotivationalMsg.innerText = "Semente plantada! Continue navegando pelo portal EcoAgro 2050 para absorver ótimos ensinamentos científicos e melhorar o seu balanço ecológico.";
    } else if (correctCount <= 4) {
      quizMotivationalMsg.innerText = "Excelente progresso! Você demonstra amplos conhecimentos tecnológicos de vanguarda e respeito pelos recursos de nossa biodiversidade. Continue cultivando bons hábitos!";
    } else {
      quizMotivationalMsg.innerText = "Mestre Defensor da Terra! Você é uma referência absoluta em sustentabilidade e tecnologia agrária. Seu preparo é merecedor de nota máxima no Concurso Agrinho 2026!";
      AudioFX.playLevelUp();
    }
  }

  // Restart Quiz
  quizResetBtn.addEventListener('click', () => {
    APP_STATE.quiz.currentIndex = 0;
    APP_STATE.quiz.score = 0;
    quizResultView.classList.add('hidden');
    quizActiveView.classList.remove('hidden');
    renderQuestion();
  });

  // Load first Question on start
  renderQuestion();
}

// --- HTML5 Canvas Arcade Game Module (Desafio do Produtor) ---
function setupArcadeGame() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  APP_STATE.game.canvas = canvas;
  APP_STATE.game.ctx = ctx;

  const startScreen = document.getElementById('game-start-screen');
  const gameOverScreen = document.getElementById('game-over-screen');
  
  const startBtn = document.getElementById('game-start-btn');
  const restartBtn = document.getElementById('game-restart-btn');
  const soundBtn = document.getElementById('game-sound-toggle');

  const scoreDisplay = document.getElementById('game-score-display');
  const levelDisplay = document.getElementById('game-level-display');
  const livesDisplay = document.getElementById('game-lives-display');

  const overScore = document.getElementById('game-over-score');
  const overTitle = document.getElementById('game-over-title');
  const overDesc = document.getElementById('game-over-desc');
  const overIcon = document.getElementById('game-over-icon');

  // Key handlers
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      APP_STATE.game.keys.Left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      APP_STATE.game.keys.Right = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      APP_STATE.game.keys.Left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      APP_STATE.game.keys.Right = false;
    }
  });

  // Touch Virtual Controls
  const touchLeft = document.getElementById('btn-left-touch');
  const touchRight = document.getElementById('btn-right-touch');

  touchLeft.addEventListener('pointerdown', (e) => { e.preventDefault(); APP_STATE.game.keys.Left = true; });
  touchLeft.addEventListener('pointerup', (e) => { e.preventDefault(); APP_STATE.game.keys.Left = false; });
  touchLeft.addEventListener('pointerleave', (e) => { e.preventDefault(); APP_STATE.game.keys.Left = false; });

  touchRight.addEventListener('pointerdown', (e) => { e.preventDefault(); APP_STATE.game.keys.Right = true; });
  touchRight.addEventListener('pointerup', (e) => { e.preventDefault(); APP_STATE.game.keys.Right = false; });
  touchRight.addEventListener('pointerleave', (e) => { e.preventDefault(); APP_STATE.game.keys.Right = false; });

  // Responsive Canvas Sizing
  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    // Place player at the bottom center initially
    APP_STATE.game.player.y = canvas.height - 60;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Sound toggler
  soundBtn.addEventListener('click', () => {
    APP_STATE.soundEnabled = !APP_STATE.soundEnabled;
    const txt = document.getElementById('game-sound-icon');
    if (APP_STATE.soundEnabled) {
      txt.innerText = '🔊';
      soundBtn.innerHTML = `<span>🔊</span> <span class="text-xs font-mono hidden sm:inline">EFEITOS: LIGADO</span>`;
    } else {
      txt.innerText = '🔇';
      soundBtn.innerHTML = `<span>🔇</span> <span class="text-xs font-mono hidden sm:inline">EFEITOS: MUTADO</span>`;
    }
  });

  // Button clicks
  startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    AudioFX.init(); // prime the audio context on click
    initGame();
  });

  restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    initGame();
  });

  function initGame() {
    APP_STATE.game.score = 0;
    APP_STATE.game.lives = 3;
    APP_STATE.game.level = 1;
    APP_STATE.game.items = [];
    APP_STATE.game.speedMultiplier = 1.0;
    APP_STATE.game.player.x = canvas.width / 2 - APP_STATE.game.player.width / 2;
    APP_STATE.game.isRunning = true;
    APP_STATE.game.lastSpawnTime = Date.now();

    updateDashboard();
    
    // Cancel prior frame loops
    if (APP_STATE.game.animationId) {
      cancelAnimationFrame(APP_STATE.game.animationId);
    }
    
    gameLoop();
  }

  function updateDashboard() {
    scoreDisplay.innerText = String(APP_STATE.game.score).padStart(4, '0');
    levelDisplay.innerText = APP_STATE.game.level;
    
    // Hearts representation
    livesDisplay.innerHTML = '❤️ '.repeat(APP_STATE.game.lives) || '💀';
  }

  // Game Loop
  function gameLoop() {
    if (!APP_STATE.game.isRunning) return;

    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Draw tech background grids
    drawBackground();

    // Spawn elements scheduler
    const now = Date.now();
    const currentSpawnInterval = Math.max(500, APP_STATE.game.spawnInterval - (APP_STATE.game.level * 80));
    
    if (now - APP_STATE.game.lastSpawnTime > currentSpawnInterval) {
      spawnItem();
      APP_STATE.game.lastSpawnTime = now;
    }

    // Move Player
    movePlayer();

    // Draw Player
    drawPlayer();

    // Process & Collide Elements
    processItems();

    updateDashboard();

    if (APP_STATE.game.lives <= 0) {
      triggerGameOver();
    } else {
      APP_STATE.game.animationId = requestAnimationFrame(gameLoop);
    }
  }

  function drawBackground() {
    // Beautiful pixel/grid ecosystem background
    ctx.strokeStyle = APP_STATE.theme === 'dark' ? 'rgba(46, 204, 113, 0.04)' : 'rgba(15, 56, 35, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw a digital sun on left top corner
    ctx.fillStyle = 'rgba(241, 196, 15, 0.1)';
    ctx.beginPath();
    ctx.arc(60, 60, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  function movePlayer() {
    const p = APP_STATE.game.player;
    if (APP_STATE.game.keys.Left) {
      p.x = Math.max(0, p.x - p.speed);
    }
    if (APP_STATE.game.keys.Right) {
      p.x = Math.min(canvas.width - p.width, p.x + p.speed);
    }
  }

  function drawPlayer() {
    const p = APP_STATE.game.player;
    
    // Draw wheels / tank tracks (Tech Tractor representation)
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(p.x, p.y + p.height - 10, 15, 12);
    ctx.fillRect(p.x + p.width - 15, p.y + p.height - 10, 15, 12);

    // Main machine body block (Green color)
    ctx.fillStyle = '#1E8449';
    ctx.fillRect(p.x + 8, p.y + 12, p.width - 16, p.height - 15);

    // Glowing energy matrix strip
    ctx.fillStyle = '#2ECC71';
    ctx.fillRect(p.x + 12, p.y + 18, p.width - 24, 4);

    // Cabin dome (Tech bio dome)
    ctx.fillStyle = 'rgba(52, 152, 219, 0.6)';
    ctx.beginPath();
    ctx.arc(p.x + p.width / 2, p.y + 12, 14, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#2980B9';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Harvesting bucket scoop (Front scoop for catching items)
    ctx.fillStyle = '#BDC3C7';
    ctx.fillRect(p.x - 4, p.y + 10, 8, p.height - 15);
    ctx.fillRect(p.x + p.width - 4, p.y + 10, 8, p.height - 15);
    ctx.fillRect(p.x - 4, p.y + p.height - 15, p.width + 8, 5); // scoop bottom bar
  }

  const ITEM_TEMPLATES = [
    { type: 'rain', glyph: '💧', name: 'Gota de chuva', points: 10, color: '#3498DB', isHarmful: false },
    { type: 'solar', glyph: '☀️', name: 'Painel Solar', points: 20, color: '#F1C40F', isHarmful: false },
    { type: 'waste', glyph: '🗑️', name: 'Metalúrgico / Lixo', points: -10, color: '#E74C3C', isHarmful: true },
    { type: 'smoke', glyph: '💨', name: 'Fumaça de Queimada', points: -10, color: '#95A5A6', isHarmful: true }
  ];

  function spawnItem() {
    // Generate type randomly (equal distribution but slightly lower waste spawn)
    const isHarmfulRandomVal = Math.random();
    let template;
    if (isHarmfulRandomVal < 0.6) {
      // 60% chance for ecological items
      template = ITEM_TEMPLATES[Math.floor(Math.random() * 2)];
    } else {
      // 40% chance of harmful
      template = ITEM_TEMPLATES[Math.floor(Math.random() * 2) + 2];
    }

    const item = {
      x: Math.random() * (canvas.width - 35) + 10,
      y: -40,
      size: 26,
      speed: (2.5 + Math.random() * 2) * APP_STATE.game.speedMultiplier,
      template: template
    };

    APP_STATE.game.items.push(item);
  }

  function processItems() {
    const items = APP_STATE.game.items;
    const p = APP_STATE.game.player;

    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.y += it.speed;

      // Draw item
      ctx.fillStyle = it.template.color;
      ctx.font = `${it.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(it.template.glyph, it.x, it.y);

      // Check boundary loss - clean memory if it goes off bottom
      if (it.y > canvas.height + 40) {
        items.splice(i, 1);
        continue;
      }

      // Check Tractor Collisions
      const collidesX = (it.x + 8 > p.x - 4) && (it.x - 8 < p.x + p.width + 4);
      const collidesY = (it.y + 12 > p.y) && (it.y - 12 < p.y + p.height);

      if (collidesX && collidesY) {
        // Handle contact
        if (it.template.isHarmful) {
          APP_STATE.game.lives--;
          APP_STATE.game.score = Math.max(0, APP_STATE.game.score + it.template.points);
          AudioFX.playHarm();
          
          // Draw flashing red splash on contact points
          ctx.fillStyle = 'rgba(231, 76, 60, 0.4)';
          ctx.fillRect(0,0, canvas.width, canvas.height);
        } else {
          APP_STATE.game.score += it.template.points;
          AudioFX.playCollect();

          // Check Level advancement increments
          const nextLevel = Math.floor(APP_STATE.game.score / 100) + 1;
          if (nextLevel > APP_STATE.game.level) {
            APP_STATE.game.level = nextLevel;
            APP_STATE.game.speedMultiplier += 0.15; // Speed up drop speed
            AudioFX.playLevelUp();
          }
        }

        // Wipe item
        items.splice(i, 1);
      }
    }
  }

  function triggerGameOver() {
    APP_STATE.game.isRunning = false;
    if (APP_STATE.game.animationId) {
      cancelAnimationFrame(APP_STATE.game.animationId);
    }

    AudioFX.playGameOver();

    // Show over screen
    gameOverScreen.classList.remove('hidden');
    overScore.innerText = String(APP_STATE.game.score).padStart(4, '0');

    if (APP_STATE.game.score >= 300) {
      overTitle.innerText = "Safra Exemplar!";
      overDesc.innerText = "Vitória ecológica completa! Sem desperdiçar a herança dos solos brasileiros, sua fazenda IoT alcançou um rendimento espetacular que sustenta e orgulha o Concurso Agrinho!";
      overIcon.innerText = "🌳";
    } else if (APP_STATE.game.score >= 150) {
      overTitle.innerText = "Ciclo Equilibrado!";
      overDesc.innerText = "Você colheu uma safra promissora. Reorganize a matriz solar fotovoltaica e busque otimizar ainda mais o uso de aspersão no próximo ciclo de jogo.";
      overIcon.innerText = "🌤️";
    } else {
      overTitle.innerText = "Lavoura sob Sobrecarga!";
      overDesc.innerText = "O solo acumulou excessos de resíduos industriais e fumaça sem cobertura. Realize a rotação de culturas para garantir solos férteis no futuro.";
      overIcon.innerText = "🍂";
    }
  }
}
