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
  const dateValid = /^\d{2}\.\d{2}\.\d{4}$/.test(date);
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

/* ===== ORDER BUTTON — dummy ===== */
document.getElementById('ticketOrderBtn')?.addEventListener('click', () => {
  // TODO: implement order flow
});

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
