'use strict';

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
const fadeEls = document.querySelectorAll('.service-card, .route-chip, .faq__item');
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
  e.preventDefault();
  document.getElementById('calc')?.scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('.float-nav__btn--gold')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' });
});

/* ===== CALCULATOR ===== */
const calcForm = document.getElementById('calcForm');
const calcResult = document.getElementById('calcResult');

calcForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const fromEl = document.getElementById('calcFrom');
  const toEl = document.getElementById('calcTo');
  const dateEl = document.getElementById('calcDate');
  const passEl = document.getElementById('calcPassengers');

  let valid = true;
  [fromEl, toEl, dateEl, passEl].forEach(el => {
    const field = el.closest('.field');
    if (!el.value.trim()) {
      field?.classList.add('has-error');
      valid = false;
    } else {
      field?.classList.remove('has-error');
    }
  });
  if (!valid) return;

  const selected = toEl.options[toEl.selectedIndex];
  const km = parseInt(selected.dataset.km || '0');
  const hours = parseInt(selected.dataset.h || '0');
  const passengers = parseInt(passEl.value) || 1;

  // ~1 EUR per km, split by passengers for shared, flat for individual
  const pricePerPax = Math.round(km * 1.0);
  const priceTotal = Math.round(km * 1.2); // individual

  document.getElementById('calcDist').textContent = km ? `~${km} км` : '—';
  document.getElementById('calcTime').textContent = hours ? `~${hours} год` : '—';
  document.getElementById('calcPrice').textContent =
    km ? `від ${pricePerPax} € / ос · від ${priceTotal} € авто` : '—';

  calcResult.hidden = false;
  calcResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

calcForm?.querySelectorAll('select, input').forEach(el => {
  el.addEventListener('change', () => el.closest('.field')?.classList.remove('has-error'));
  el.addEventListener('input', () => el.closest('.field')?.classList.remove('has-error'));
});
