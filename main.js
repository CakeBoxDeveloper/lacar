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

/* ===== FAQ SMOOTH ANIMATION ===== */
document.querySelectorAll('.faq__item').forEach(item => {
  const summary = item.querySelector('.faq__q');
  const body = item.querySelector('.faq__a');
  if (!summary || !body) return;

  summary.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = item.hasAttribute('open');

    if (isOpen) {
      // Close
      const height = body.scrollHeight;
      body.style.maxHeight = height + 'px';
      requestAnimationFrame(() => {
        body.style.transition = 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), padding 0.35s ease, opacity 0.3s ease';
        body.style.maxHeight = '0';
        body.style.paddingBottom = '0';
        body.style.opacity = '0';
      });
      body.addEventListener('transitionend', () => {
        item.removeAttribute('open');
        body.style.maxHeight = '';
        body.style.transition = '';
        body.style.opacity = '';
      }, { once: true });
    } else {
      // Open
      item.setAttribute('open', '');
      const height = body.scrollHeight;
      body.style.maxHeight = '0';
      body.style.opacity = '0';
      body.style.paddingBottom = '0';
      requestAnimationFrame(() => {
        body.style.transition = 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), padding 0.38s ease, opacity 0.3s ease';
        body.style.maxHeight = height + 'px';
        body.style.paddingBottom = '14px';
        body.style.opacity = '1';
      });
      body.addEventListener('transitionend', () => {
        body.style.maxHeight = '';
        body.style.transition = '';
      }, { once: true });
    }
  });
});
document.querySelector('.float-nav__btn--outline')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('calc')?.scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('.float-nav__btn--gold')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' });
});

/* ===== CALCULATOR — LIVE ===== */
function calcUpdate() {
  const toEl = document.getElementById('calcTo');
  const passEl = document.getElementById('calcPassengers');
  const result = document.getElementById('ticketResult');
  if (!toEl || !result) return;

  const selected = toEl.options[toEl.selectedIndex];
  const km = parseInt(selected?.dataset?.km || '0');
  const hours = parseInt(selected?.dataset?.h || '0');
  const pax = Math.max(1, parseInt(passEl?.value) || 1);

  if (!km) { result.hidden = true; return; }

  const price = Math.round(km * 1.1);
  document.getElementById('resDist').textContent = `~${km} км`;
  document.getElementById('resTime').textContent = `~${hours} год`;
  document.getElementById('resPrice').textContent = `${price} €`;
  result.hidden = false;
}

['calcFrom','calcTo','calcDate','calcPassengers'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', calcUpdate);
  document.getElementById(id)?.addEventListener('input', calcUpdate);
});
