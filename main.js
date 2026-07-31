'use strict';

/* ===== VIDEO HERO — loop with reverse where supported ===== */
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
  let reversed = false;

  heroVideo.addEventListener('ended', () => {
    reversed = !reversed;
    // playbackRate = -1 works in Safari; other browsers fall back to simple loop
    try {
      heroVideo.playbackRate = reversed ? -1 : 1;
      heroVideo.play();
    } catch {
      heroVideo.currentTime = 0;
      heroVideo.play();
    }
  });
}

/* ===== PRELOADER ===== */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) setTimeout(() => preloader.classList.add('is-hidden'), 400);
});

/* ===== BURGER / MOBILE NAV ===== */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger?.addEventListener('click', () => {
  const isOpen = burger.classList.toggle('is-open');
  nav?.classList.toggle('is-open', isOpen);
  burger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

nav?.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    burger?.classList.remove('is-open');
    nav.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ===== TOAST ===== */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('is-visible');
  setTimeout(() => toast.classList.remove('is-visible'), 4000);
}

/* ===== FADE-IN ON SCROLL ===== */
const fadeEls = document.querySelectorAll('.service-card, .route-chip');
fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
});

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = Array.from(entry.target.parentElement?.children || []).indexOf(entry.target);
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, idx * 60);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

fadeEls.forEach(el => fadeObserver.observe(el));

/* ===== FLOATING NAV SCROLL ===== */
document.querySelector('.float-nav__btn--outline')?.addEventListener('click', (e) => {
  const target = document.getElementById('calc') || document.getElementById('faq');
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  }
  // If no local target (route pages) — let href navigate normally
});

document.querySelector('.float-nav__btn--gold')?.addEventListener('click', (e) => {
  const target = document.getElementById('contacts');
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  }
});

/* ===== DATE MASK — дд.мм.рррр ===== */
const dateInput = document.getElementById('calcDate');
dateInput?.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 8);
  if (v.length >= 5) v = v.slice(0,2) + '.' + v.slice(2,4) + '.' + v.slice(4);
  else if (v.length >= 3) v = v.slice(0,2) + '.' + v.slice(2);
  e.target.value = v;
  calcUpdate();
});

/* ===== CALCULATOR — LIVE ===== */
// Расстояния: from → to в км
const DISTANCES = {
  'Київ':    { 'Варшава':780, 'Краків':740, 'Вроцлав':990, 'Гданськ':1150, 'Бухарест':1050, 'Кишинів':470, 'Софія':1480, 'Берлін':1580 },
  'Львів':   { 'Варшава':540, 'Краків':440, 'Вроцлав':780, 'Гданськ':960,  'Бухарест':1050, 'Кишинів':670, 'Софія':1500, 'Берлін':1370 },
  'Одеса':   { 'Варшава':1200,'Краків':1150,'Вроцлав':1400,'Гданськ':1560, 'Бухарест':430,  'Кишинів':180, 'Софія':1050, 'Берлін':1780 },
  'Харків':  { 'Варшава':1400,'Краків':1350,'Вроцлав':1600,'Гданськ':1760, 'Бухарест':1200, 'Кишинів':730, 'Софія':1650, 'Берлін':1980 },
  'Дніпро':  { 'Варшава':1300,'Краків':1250,'Вроцлав':1500,'Гданськ':1660, 'Бухарест':980,  'Кишинів':610, 'Софія':1550, 'Берлін':1880 },
};

// Час в пути (часы)
const HOURS = {
  'Київ':    { 'Варшава':14, 'Краків':13, 'Вроцлав':16, 'Гданськ':18, 'Бухарест':16, 'Кишинів':8,  'Софія':22, 'Берлін':24 },
  'Львів':   { 'Варшава':8,  'Краків':7,  'Вроцлав':13, 'Гданськ':15, 'Бухарест':17, 'Кишинів':11, 'Софія':23, 'Берлін':20 },
  'Одеса':   { 'Варшава':18, 'Краків':17, 'Вроцлав':21, 'Гданськ':23, 'Бухарест':7,  'Кишинів':3,  'Софія':16, 'Берлін':26 },
  'Харків':  { 'Варшава':20, 'Краків':19, 'Вроцлав':23, 'Гданськ':25, 'Бухарест':18, 'Кишинів':11, 'Софія':24, 'Берлін':28 },
  'Дніпро':  { 'Варшава':19, 'Краків':18, 'Вроцлав':22, 'Гданськ':24, 'Бухарест':15, 'Кишинів':9,  'Софія':23, 'Берлін':27 },
};

function calcUpdate() {
  const fromEl = document.getElementById('calcFrom');
  const toEl   = document.getElementById('calcTo');
  const dateEl = document.getElementById('calcDate');
  const passEl = document.getElementById('calcPassengers');
  const result = document.getElementById('ticketResult');
  if (!result) return;

  const fromCity = fromEl?.value;
  const toCity   = toEl?.value;
  const date     = dateEl?.value || '';
  const pax      = parseInt(passEl?.value);

  // Показываем только когда все 4 поля заполнены корректно
  const now = new Date();
  const dateValid = (() => {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) return false;
    const [d, m, y] = date.split('.').map(Number);
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return false;
    if (dt < new Date(now.getFullYear(), now.getMonth(), now.getDate())) return false;
    return true;
  })();
  const allFilled = fromCity && toCity && dateValid && pax >= 1;

  if (!allFilled) {
    result.classList.remove('is-visible');
    setTimeout(() => { if (!result.classList.contains('is-visible')) result.hidden = true; }, 350);
    return;
  }

  const km    = DISTANCES[fromCity]?.[toCity];
  const hours = HOURS[fromCity]?.[toCity];

  if (!km) {
    result.classList.remove('is-visible');
    setTimeout(() => { if (!result.classList.contains('is-visible')) result.hidden = true; }, 350);
    return;
  }

  const price = Math.round(km * 1.1);
  document.getElementById('resDist').textContent  = `~${km} км`;
  document.getElementById('resTime').textContent  = `~${hours} год`;
  document.getElementById('resPrice').textContent = `${price} €`;

  if (result.hidden) {
    result.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => result.classList.add('is-visible')));
  }
}

['calcFrom', 'calcTo', 'calcPassengers'].forEach(id => {
  const el = document.getElementById(id);
  el?.addEventListener('change', () => {
    if (el.tagName === 'SELECT') el.classList.toggle('has-value', el.value !== '');
    calcUpdate();
  });
  el?.addEventListener('input', calcUpdate);
});

/* ===== ORDER BUTTON — phone-to-button flow ===== */
(function() {
  const phoneInput = document.getElementById('ticketPhone');
  const orderBtn   = document.getElementById('ticketOrderBtn');
  const phoneWrap  = document.getElementById('ticketOrderPhone');
  if (!phoneInput || !orderBtn) return;

  const PREFIX = '+380';

  // Phone mask
  phoneInput.addEventListener('input', () => {
    let val = phoneInput.value;
    if (!val.startsWith(PREFIX)) val = PREFIX + val.replace(/\D/g,'');
    const digits = val.slice(4).replace(/\D/g,'').slice(0, 9);
    phoneInput.value = PREFIX + digits;

    // Show button when number complete (9 digits after +380)
    if (digits.length === 9) {
      phoneWrap.style.display = 'none';
      orderBtn.hidden = false;
      orderBtn.textContent = 'Замовити поїздку за номером ' + phoneInput.value;
    } else {
      phoneWrap.style.display = '';
      orderBtn.hidden = true;
    }
  });

  phoneInput.addEventListener('keydown', (e) => {
    if ((e.key === 'Backspace' || e.key === 'Delete') && phoneInput.selectionStart <= 4) {
      e.preventDefault();
    }
  });

  phoneInput.addEventListener('focus', () => {
    if (!phoneInput.value.startsWith(PREFIX)) phoneInput.value = PREFIX;
    setTimeout(() => phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length), 0);
  });

  orderBtn.addEventListener('click', () => {
    // TODO: implement order flow
  });
})();

/* ===== LIGHT THEME TOGGLE ===== */
function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  // Flash-feedback при тряске
  document.body.style.transition = 'background 0.4s ease';
}

// Restore saved theme
if (localStorage.getItem('theme') === 'light') {
  document.documentElement.classList.add('light');
}

// Shake-to-toggle theme (DeviceMotionEvent)
let lastShake = 0;
let lastX = 0, lastY = 0, lastZ = 0;

function handleMotion(e) {
  const acc = e.accelerationIncludingGravity;
  if (!acc) return;
  const dx = Math.abs((acc.x || 0) - lastX);
  const dy = Math.abs((acc.y || 0) - lastY);
  const dz = Math.abs((acc.z || 0) - lastZ);
  lastX = acc.x || 0; lastY = acc.y || 0; lastZ = acc.z || 0;

  const shake = dx + dy + dz;
  const now = Date.now();
  if (shake > 80 && now - lastShake > 1200) {
    lastShake = now;
    toggleTheme();
    navigator.vibrate?.(80);
  }
}

if (typeof DeviceMotionEvent !== 'undefined') {
  // iOS 13+ requires permission
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // Request on first user gesture
    document.addEventListener('click', async function reqPerm() {
      try {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm === 'granted') window.addEventListener('devicemotion', handleMotion);
      } catch {}
      document.removeEventListener('click', reqPerm);
    }, { once: true });
  } else {
    window.addEventListener('devicemotion', handleMotion, { passive: true });
  }
}

/* ===== CARS CAROUSEL ===== */
(function() {
  const carousel = document.getElementById('carsCarousel');
  const dots = document.querySelectorAll('.cars-dot');
  if (!carousel) return;

  const cards = carousel.querySelectorAll('.car-card');
  let current = 0;

  function goTo(idx) {
    current = idx;
    cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.idx)));
  });

  // Update dots on scroll
  carousel.addEventListener('scroll', () => {
    const idx = Math.round(carousel.scrollLeft / carousel.offsetWidth);
    if (idx !== current) {
      current = idx;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }
  }, { passive: true });

  // Touch swipe
  let startX = 0;
  carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(Math.max(0, Math.min(cards.length - 1, current + (dx < 0 ? 1 : -1))));
  }, { passive: true });
})();

/* ===== 3D MODEL — swing animation + particles ===== */
(function() {
  const mv = document.getElementById('heroModel');
  const canvas = document.getElementById('heroParticles');
  if (!mv || !canvas) return;

  let swingT = 0;
  let isDragging = false;
  const ctx = canvas.getContext('2d');
  let particles = [];

  // Resize to viewport
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Swing — more pronounced
  function swingTick() {
    if (!isDragging) {
      swingT += 0.012;
      const theta = Math.sin(swingT) * 18;          // was 6 → now 18deg
      const phi   = 90 + Math.sin(swingT * 0.5) * 8; // was 3 → now 8deg
      mv.cameraOrbit = `${theta}deg ${phi}deg 105%`;

      // Idle particles — less frequent
      if (Math.random() < 0.12) {  // was 0.35
        const rect = mv.getBoundingClientRect();
        const spread = 0.75;
        const cx = rect.left + rect.width  * 0.5 + (Math.random() - 0.5) * rect.width  * spread;
        const cy = rect.top  + rect.height * 0.5 + (Math.random() - 0.5) * rect.height * spread;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.2 + 0.3;
        const minR = 0.4;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: Math.random() * 1.2 + 0.6,
          r: minR + Math.random() * minR * 2,
          color: '#ffffff'
        });
      }
    }
    requestAnimationFrame(swingTick);
  }

  mv.addEventListener('load', swingTick);

  mv.addEventListener('mousedown',  () => { isDragging = true; });
  mv.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
  window.addEventListener('mouseup',  () => { isDragging = false; });
  window.addEventListener('touchend', () => { isDragging = false; });

  // Click/tap burst
  function spawnBurst(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        r: 0.4 + Math.random() * 0.8,
        color: '#ffffff'
      });
    }
  }

  mv.addEventListener('click', (e) => {
    spawnBurst(e.clientX, e.clientY);
  });
  mv.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    spawnBurst(t.clientX, t.clientY);
  }, { passive: true });

  // Draw loop
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.02; // very gentle gravity
      p.vx *= 0.99;
      p.life -= 0.012; // slow fade
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life * 0.25); // was 0.7 — much more subtle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(255,255,255,0.6)';
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ===== PHONE INPUT VALIDATION ===== */
(function() {
  const phone = document.getElementById('contactPhone');
  if (!phone) return;

  const PREFIX = '+380';
  // Ensure value always starts with +380
  phone.addEventListener('input', () => {
    let val = phone.value;
    // Strip non-digits after prefix
    if (!val.startsWith('+380')) {
      val = PREFIX + val.replace(/\D/g,'').replace(/^380?/,'');
    }
    // Only digits after +380, max 9 more digits (UA format: +380XXXXXXXXX)
    const digits = val.slice(4).replace(/\D/g,'').slice(0, 9);
    phone.value = PREFIX + digits;
  });

  phone.addEventListener('keydown', (e) => {
    // Prevent deleting the prefix
    const sel = phone.selectionStart;
    if ((e.key === 'Backspace' || e.key === 'Delete') && sel <= 4) {
      e.preventDefault();
    }
  });

  phone.addEventListener('focus', () => {
    if (!phone.value.startsWith(PREFIX)) phone.value = PREFIX;
    // Move cursor to end
    setTimeout(() => { phone.setSelectionRange(phone.value.length, phone.value.length); }, 0);
  });
})();

/* ===== 3D FLOATING STAMPS ===== */
(function() {
  const BASE = 'https://raw.githubusercontent.com/CakeBoxDeveloper/lacar/main/postcards/';
  const CARDS = [
    'Card_Berlin.glb','Card_Bujarest.glb','Card_Gdansk.glb',
    'Card_Krakow.glb','Card_Kyiv.glb','Card_Lviv.glb',
    'Card_Odessa.glb','Card_Sofia.glb','Card_Warsaw.glb'
  ];

  const st = document.createElement('style');
  st.textContent = `
    body { position: relative; }
    .stamp-dummy {
      position: absolute;
      background: rgba(255,255,255,0.08);
      border: 2px solid rgba(255,255,255,0.25);
      border-radius: 6px;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.3);
      font-size: 11px;
      font-family: sans-serif;
    }
    @keyframes stampSway {
      0%   { transform: translateY(-50%) rotateZ(var(--rz0)); }
      50%  { transform: translateY(-50%) rotateZ(var(--rz1)); }
      100% { transform: translateY(-50%) rotateZ(var(--rz0)); }
    }
  `;
  document.head.appendChild(st);

  let cardIdx = 0;
  const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
  const nextCard = () => shuffled[cardIdx++ % shuffled.length];

  const rnd    = (a, b) => a + Math.random() * (b - a);
  const rndInt = (a, b) => Math.round(rnd(a, b));

  function addStamp(section, side, posStr, topPct, zIdx) {
    const size  = rndInt(200, 280);
    const tilt0 = rndInt(-20, 20);
    const tilt1 = rndInt(-20, 20);
    const dur   = rnd(8, 14);
    const delay = rnd(0, 5);

    // Use document.body as parent, position relative to section using absolute offset
    const el = document.createElement('model-viewer');
    el.setAttribute('src', BASE + CARDS[cardIdx % CARDS.length]);
    el.setAttribute('alt', '');
    el.setAttribute('camera-orbit', '0deg 0deg 120%');
    el.setAttribute('field-of-view', '8deg');
    el.setAttribute('orientation', '0deg 0deg -90deg');
    el.setAttribute('disable-zoom', '');
    el.setAttribute('interaction-prompt', 'none');
    el.setAttribute('environment-image', 'neutral');
    el.setAttribute('exposure', '1.3');
    el.setAttribute('shadow-intensity', '0');
    cardIdx++;

    // Position absolutely within body — calculate top from section's offset
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const sectionH   = section.offsetHeight;
    const topPx      = sectionTop + (topPct / 100) * sectionH;

    // posStr is left:/right: value relative to viewport edge
    el.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      ${side}: ${posStr};
      top: ${topPx}px;
      transform: translateY(-50%);
      z-index: ${zIdx};
      --progress-bar-height: 0px;
      --progress-bar-color: transparent;
      --rz0: ${tilt0}deg;
      --rz1: ${tilt1}deg;
      pointer-events: none;
      opacity: 1;
      animation: stampSway ${dur}s ease-in-out infinite ${delay}s;
    `;

    document.body.appendChild(el);
  }

  // 4 columns per side. ALL z:-1 (always behind content).
  // Cols 0,1: near viewport edges (under/mid fade zone)
  // Cols 2,3: closer to content boundary (visible in the gap between fade end and content)
  const COL_DEFS = [
    { posStr: '6px',               zIdx: 0 },
    { posStr: '220px',             zIdx: 0 },
    { posStr: 'calc(50% - 400px)', zIdx: 0 },
    { posStr: 'calc(50% - 320px)', zIdx: 0 },
  ];

  // Collision check — vertical only, within same column+side
  function noCollision(placed, topPct, size, sectionH) {
    const aPx = (topPct / 100) * sectionH;
    for (const p of placed) {
      const bPx = (p.topPct / 100) * sectionH;
      if (Math.abs(aPx - bPx) < (size + p.size) / 2 + 16) return false;
    }
    return true;
  }

  const targets = [
    { sel: '.hero',   count: 3 },
    { sel: '#routes', count: 8 },
    { sel: '#faq',    count: 8 },
    { sel: '#cars',   count: 6 },
    { sel: '#calc',   count: 6 },
  ];

  targets.forEach(({ sel, count }) => {
    const section = document.querySelector(sel);
    if (!section) return;

    const sectionH = section.offsetHeight || 600;
    const placed = {};

    for (let i = 0; i < count; i++) {
      const col     = COL_DEFS[i % COL_DEFS.length];
      const topBase = count === 1 ? 50 : 15 + (i / (count - 1)) * 70;

      for (const side of ['left', 'right']) {
        const key = col.posStr + side;
        if (!placed[key]) placed[key] = [];

        for (let attempt = 0; attempt < 15; attempt++) {
          const topPct = topBase + rnd(-9, 9);
          const size   = rndInt(150, 220);
          if (noCollision(placed[key], topPct, size, sectionH)) {
            placed[key].push({ topPct, size });
            addStamp(section, side, col.posStr, topPct, col.zIdx);
            break;
          }
        }
      }
    }
  });

  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';
})();
