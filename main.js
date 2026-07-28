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

/* ===== BOOKING FORM ===== */
const form = document.getElementById('bookingForm');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  form.querySelectorAll('[required]').forEach(input => {
    const field = input.closest('.field');
    if (!input.value.trim()) {
      field?.classList.add('has-error');
      valid = false;
    } else {
      field?.classList.remove('has-error');
    }
  });

  if (!valid) return;

  const data = Object.fromEntries(new FormData(form));
  const tgMessage = encodeURIComponent(
    `Нова заявка LC Transfer\n` +
    `Ім'я: ${data.name}\n` +
    `Телефон: ${data.phone}\n` +
    `Звідки: ${data.from}\n` +
    `Куди: ${data.to}\n` +
    `Дата: ${data.date}\n` +
    `Пасажирів: ${data.passengers}\n` +
    `Коментар: ${data.comment || '—'}`
  );

  window.open(`https://t.me/lctransfer?text=${tgMessage}`, '_blank', 'noopener,noreferrer');
  showToast('Відкриваємо Telegram...');
  form.reset();
});

form?.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', () => {
    input.closest('.field')?.classList.remove('has-error');
  });
});

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
