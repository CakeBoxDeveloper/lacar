'use strict';

/* ===== PRELOADER ===== */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => preloader.classList.add('is-hidden'), 400);
  }
});

/* ===== HEADER SCROLL ===== */
const header = document.getElementById('header');

function onScroll() {
  // header is static — nothing to do
}
window.addEventListener('scroll', onScroll, { passive: true });

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

/* ===== ACTIVE NAV LINK ===== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ===== BACK TO TOP ===== */
toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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
form?.addEventListener('submit', async (e) => {
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

  // Collect form data and build Telegram message
  const data = Object.fromEntries(new FormData(form));
  const tgMessage = encodeURIComponent(
    `🚗 Нова заявка LC Transfer\n` +
    `👤 Ім'я: ${data.name}\n` +
    `📞 Телефон: ${data.phone}\n` +
    `📍 Звідки: ${data.from}\n` +
    `🏁 Куди: ${data.to}\n` +
    `📅 Дата: ${data.date}\n` +
    `👥 Пасажирів: ${data.passengers}\n` +
    `💬 Коментар: ${data.comment || '—'}`
  );

  // Open Telegram with pre-filled message (fallback for static site)
  const tgUrl = `https://t.me/lctransfer?text=${tgMessage}`;
  window.open(tgUrl, '_blank', 'noopener,noreferrer');

  showToast('✓ Повідомлення готове! Відкриваємо Telegram...');
  form.reset();
});

// Clear error on input
form?.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', () => {
    input.closest('.field')?.classList.remove('has-error');
  });
});

/* ===== FADE-IN ON SCROLL ===== */
const fadeEls = document.querySelectorAll('.service-card, .route-chip, .stat-card, .faq__item');
fadeEls.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.5s ease, transform 0.5s ease'; });

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, 60 * (Array.from(entry.target.parentElement?.children || []).indexOf(entry.target)));
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => fadeObserver.observe(el));
