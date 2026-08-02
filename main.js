'use strict';

/* ===== TELEGRAM BOT CONFIG ===== */
// Token and Chat ID are stored in Vercel Environment Variables (never in client code)
// Vercel Dashboard → Project → Settings → Environment Variables:
//   TG_TOKEN   = your bot token from @BotFather
//   TG_CHAT_ID = your group chat id (negative number, e.g. -1001234567890)

async function sendToTelegram(text) {
  // Завжди відправляємо на Vercel API — працює з будь-якого домену
  const apiUrl = 'https://lacar.vercel.app/api/send';

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!data.ok) {
      console.error('Telegram error:', data.error || data);
    }
    return data.ok;
  } catch (e) {
    console.error('Fetch error:', e);
    return false;
  }
}

/* ===== SECTION TITLE SCOREBOARD ===== */
(function() {
  // Глобальний лічильник фрейму — всі заголовки синхронізовані
  let globalFrame = 0;
  setInterval(() => { globalFrame++; }, 150);

  document.querySelectorAll('.section__title').forEach(el => {
    const text = el.textContent.trim().toUpperCase();
    
    el.innerHTML = text.split('').map(ch => {
      if (ch === ' ') return '<span class="char char--space">&nbsp;</span>';
      return `<span class="char">${ch}</span>`;
    }).join('');

    const chars = el.querySelectorAll('.char:not(.char--space)');
    const total = chars.length;
    if (!total) return;

    // Кожен заголовок має власний офсет щоб анімації не збігались
    const offset = Math.floor(Math.random() * total);

    function tick() {
      const frame = (globalFrame + offset) % total;
      chars.forEach((ch, i) => {
        const dist = (frame - i + total * 10) % total;
        if (dist === 0) {
          ch.className = 'char lit';
        } else if (dist === 1) {
          ch.className = 'char dim1';
        } else if (dist === 2) {
          ch.className = 'char dim2';
        } else if (dist === 3) {
          ch.className = 'char dim3';
        } else {
          ch.className = 'char';
        }
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
})();

/* ===== NEXT TRIP COUNTDOWN ===== */
(function() {
  const infoEl = document.querySelector('.next-trip__info');
  if (!infoEl) return;

  const path = window.location.pathname;
  const match = path.match(/routes\/([^.]+)\.html/);
  if (!match) return;
  const key = match[1];

  function getCountdown(isoStr) {
    if (!isoStr) return null;
    const diff = new Date(isoStr) - new Date();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `через ${h} год ${m} хв`;
  }

  // Визначаємо базовий URL для trips.json
  const base = window.location.origin + window.location.pathname.replace(/routes\/.*/, '');

  fetch(base + 'trips.json?_=' + Date.now())
    .then(r => r.json())
    .then(data => {
      const cd = getCountdown(data[key]);
      if (cd) {
        infoEl.textContent = cd;
        // Оновлюємо кожні 30 сек
        setInterval(() => {
          const newCd = getCountdown(data[key]);
          if (newCd) infoEl.textContent = newCd;
        }, 30000);
      }
    })
    .catch(() => {}); // якщо файл недоступний — нічого не показуємо
})();
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
  'Київ':     { 'Варшава':780, 'Краків':740, 'Вроцлав':990, 'Гданськ':1150, 'Бухарест':1050, 'Кишинів':470, 'Софія':1480, 'Берлін':1580 },
  'Львів':    { 'Варшава':540, 'Краків':440, 'Вроцлав':780, 'Гданськ':960,  'Бухарест':1050, 'Кишинів':670, 'Софія':1500, 'Берлін':1370 },
  'Одеса':    { 'Варшава':1200,'Краків':1150,'Вроцлав':1400,'Гданськ':1560, 'Бухарест':430,  'Кишинів':180, 'Софія':1050, 'Берлін':1780 },
  'Харків':   { 'Варшава':1400,'Краків':1350,'Вроцлав':1600,'Гданськ':1760, 'Бухарест':1200, 'Кишинів':730, 'Софія':1650, 'Берлін':1980 },
  'Дніпро':   { 'Варшава':1300,'Краків':1250,'Вроцлав':1500,'Гданськ':1660, 'Бухарест':980,  'Кишинів':610, 'Софія':1550, 'Берлін':1880 },
  'Миколаїв': { 'Кишинів':310 },
};

// Час в пути (часы)
const HOURS = {
  'Київ':     { 'Варшава':14, 'Краків':13, 'Вроцлав':16, 'Гданськ':18, 'Бухарест':16, 'Кишинів':8,  'Софія':22, 'Берлін':24 },
  'Львів':    { 'Варшава':8,  'Краків':7,  'Вроцлав':13, 'Гданськ':15, 'Бухарест':17, 'Кишинів':11, 'Софія':23, 'Берлін':20 },
  'Одеса':    { 'Варшава':18, 'Краків':17, 'Вроцлав':21, 'Гданськ':23, 'Бухарест':7,  'Кишинів':3,  'Софія':16, 'Берлін':26 },
  'Харків':   { 'Варшава':20, 'Краків':19, 'Вроцлав':23, 'Гданськ':25, 'Бухарест':18, 'Кишинів':11, 'Софія':24, 'Берлін':28 },
  'Дніпро':   { 'Варшава':19, 'Краків':18, 'Вроцлав':22, 'Гданськ':24, 'Бухарест':15, 'Кишинів':9,  'Софія':23, 'Берлін':27 },
  'Миколаїв': { 'Кишинів':5 },
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

  // Highlight date field red if fully typed but invalid
  if (dateEl) {
    const fullyTyped = date.length === 10;
    dateEl.style.borderBottomColor = fullyTyped && !dateValid ? '#e05252' : '';
    dateEl.style.color = fullyTyped && !dateValid ? '#e05252' : '';
  }
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

  const price = km; // 1€ за км
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
  const resetBtn   = document.getElementById('ticketResetBtn');
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
      if (resetBtn) resetBtn.hidden = false;
      orderBtn.textContent = 'Замовити поїздку за номером ' + phoneInput.value;
    } else {
      phoneWrap.style.display = '';
      orderBtn.hidden = true;
      if (resetBtn) resetBtn.hidden = true;
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

  phoneInput.addEventListener('blur', () => {
    if (phoneInput.value === PREFIX || phoneInput.value === '') {
      phoneInput.value = '';
      phoneInput.placeholder = 'Введіть телефон для бронювання';
    }
  });

  orderBtn.addEventListener('click', async () => {
    const from  = document.getElementById('calcFrom')?.value  || '—';
    const to    = document.getElementById('calcTo')?.value    || '—';
    const date  = document.getElementById('calcDate')?.value  || '—';
    const pax   = document.getElementById('calcPassengers')?.value || '—';
    const price = document.getElementById('resPrice')?.textContent || '—';
    const phone = phoneInput.value;

    const msg = `🚗 <b>Нове замовлення поїздки</b>\n\n`
      + `📍 Маршрут: <b>${from} → ${to}</b>\n`
      + `📅 Дата: <b>${date}</b>\n`
      + `👥 Пасажири: <b>${pax}</b>\n`
      + `💶 Ціна: <b>${price}</b>\n`
      + `📞 Телефон: <b>${phone}</b>`;

    orderBtn.disabled = true;
    orderBtn.textContent = 'Надсилаємо...';
    const ok = await sendToTelegram(msg);
    if (ok) {
      showToast('Замовлення надіслано! Ми зв\'яжемося з Вами.');
      orderBtn.textContent = 'Надіслано';
    } else {
      showToast('Помилка. Спробуйте ще раз або напишіть напряму.');
      orderBtn.textContent = 'Замовити поїздку за номером ' + phone;
      orderBtn.disabled = false;
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset all calc fields
      ['calcFrom','calcTo','calcDate','calcPassengers'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; el.classList.remove('has-value'); }
      });
      const result = document.getElementById('ticketResult');
      if (result) { result.classList.remove('is-visible'); result.hidden = true; }
      phoneInput.value = '';
      phoneInput.placeholder = 'Введіть телефон для бронювання';
      phoneWrap.style.display = '';
      orderBtn.hidden = true;
      resetBtn.hidden = true;
    });
  }
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

/* ===== CARS 3D CAROUSEL ===== */
(function() {
  const carousel = document.getElementById('cars3d');
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll('.car-slide'));
  const total = slides.length;
  let active = 0;

  function update() {
    slides.forEach((slide, i) => {
      let diff = i - active;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      if (diff === 0)       slide.dataset.position = '0';
      else if (diff === 1)  slide.dataset.position = '1';
      else if (diff === -1) slide.dataset.position = '-1';
      else                  slide.dataset.position = 'hide';
    });
  }

  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => { active = i; update(); });
  });

  let touchStartX = 0, touchStartTime = 0;
  carousel.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartTime = Date.now();
  }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40 && Date.now() - touchStartTime < 500) {
      active = (active + (dx > 0 ? 1 : -1) + total) % total;
      update();
    }
  });

  let mouseStartX = 0, isDragging = false;
  carousel.addEventListener('mousedown', e => { mouseStartX = e.clientX; isDragging = true; });
  carousel.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const dx = mouseStartX - e.clientX;
    if (Math.abs(dx) > 40) { active = (active + (dx > 0 ? 1 : -1) + total) % total; update(); }
  });
  carousel.addEventListener('mouseleave', () => { isDragging = false; });

  update();
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

  // Swing + gold exposure pulse (блеск золотого металла)
  let goldT = 0;
  function swingTick() {
    if (!isDragging) {
      swingT += 0.012;
      goldT  += 0.022;
      const theta = Math.sin(swingT) * 18;
      const phi   = 90 + Math.sin(swingT * 0.5) * 8;
      mv.cameraOrbit = `${theta}deg ${phi}deg 105%`;

      // Пульс exposure — живой блеск золота
      mv.exposure = 2.8 + Math.sin(goldT) * 1.0;

      // Золотые частицы
      if (Math.random() < 0.10) {
        const rect = mv.getBoundingClientRect();
        const cx = rect.left + rect.width  * 0.5 + (Math.random() - 0.5) * rect.width  * 0.6;
        const cy = rect.top  + rect.height * 0.5 + (Math.random() - 0.5) * rect.height * 0.6;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.0 + 0.2;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: Math.random() * 1.0 + 0.5,
          r: 0.4 + Math.random() * 0.8,
          color: Math.random() > 0.5 ? '#e8c56c' : '#f5d67b'
        });
      }
    }
    requestAnimationFrame(swingTick);
  }

  // После загрузки — красим материал в золото через model-viewer material API
  mv.addEventListener('load', () => {
    const model = mv.model;
    if (model) {
      model.materials.forEach(mat => {
        // Устанавливаем золотой metallic/roughness PBR материал
        mat.pbrMetallicRoughness.setBaseColorFactor([1.0, 0.78, 0.22, 1.0]); // золотой RGB
        mat.pbrMetallicRoughness.setMetallicFactor(1.0);   // полный металл
        mat.pbrMetallicRoughness.setRoughnessFactor(0.15); // почти зеркальный
      });
    }
    swingTick();
  });

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
    setTimeout(() => { phone.setSelectionRange(phone.value.length, phone.value.length); }, 0);
  });

  phone.addEventListener('blur', () => {
    if (phone.value === PREFIX || phone.value === '') {
      phone.value = '';
      phone.placeholder = 'Введіть номер телефону';
    }
  });
})();

/* ===== CONTACT FORM — send to Telegram ===== */
(function() {
  const sendBtn = document.getElementById('contactSendBtn');
  if (!sendBtn) return;

  sendBtn.addEventListener('click', async () => {
    const phone = document.getElementById('contactPhone')?.value || '';
    const name  = document.getElementById('contactName')?.value  || '';
    const msg   = document.getElementById('contactMsg')?.value   || '';

    if (!phone || phone === '+380') {
      showToast('Введіть номер телефону');
      return;
    }

    const text = `📬 <b>Нове повідомлення з сайту</b>\n\n`
      + `👤 Ім'я: <b>${name || 'Не вказано'}</b>\n`
      + `📞 Телефон: <b>${phone}</b>\n`
      + (msg ? `💬 Повідомлення: ${msg}` : '');

    sendBtn.disabled = true;
    sendBtn.textContent = 'Надсилаємо...';
    const ok = await sendToTelegram(text);

    if (ok) {
      showToast('Повідомлення надіслано!');
      sendBtn.textContent = 'Надіслано';
      document.getElementById('contactPhone').value = '+380';
      document.getElementById('contactName').value  = '';
      document.getElementById('contactMsg').value   = '';
    } else {
      showToast('Помилка відправки. Напишіть нам напряму.');
      sendBtn.textContent = 'Відправити';
      sendBtn.disabled = false;
    }
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
  `;
  document.head.appendChild(st);

  let cardIdx = 0;
  const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
  const nextCard = () => shuffled[cardIdx++ % shuffled.length];

  const rnd    = (a, b) => a + Math.random() * (b - a);
  const rndInt = (a, b) => Math.round(rnd(a, b));

  function addStamp(section, side, posStr, topPct, zIdx) {
    const size = rndInt(200, 280);

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

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const sectionH   = section.offsetHeight;
    const topPx      = sectionTop + (topPct / 100) * sectionH;

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
      pointer-events: none;
      opacity: 1;
    `;

    document.body.appendChild(el);

    let tY   = Math.random() * Math.PI * 2;
    let tZ   = Math.random() * Math.PI * 2;
    let tX   = Math.random() * Math.PI * 2;
    let tF   = Math.random() * Math.PI * 2; // float фаза
    const spdY = 0.007 + Math.random() * 0.005;
    const spdZ = 0.005 + Math.random() * 0.004;
    const spdX = 0.006 + Math.random() * 0.004;
    const spdF = 0.004 + Math.random() * 0.003; // float медленнее всего
    const ampY = 4 + Math.random() * 4;  // ±4-8deg
    const ampZ = 4 + Math.random() * 4;  // ±4-8deg
    const ampX = 4 + Math.random() * 4;  // ±4-8deg
    const ampF = 10 + Math.random() * 10; // 10-20px вверх-вниз

    el.addEventListener('load', () => {
      (function tick() {
        tY += spdY;
        tZ += spdZ;
        tX += spdX;
        tF += spdF;
        const theta  = Math.sin(tY) * ampY;
        const phi    = Math.sin(tX) * ampX;
        const rz     = Math.sin(tZ) * ampZ;
        const floatY = Math.sin(tF) * ampF;
        el.style.transform = `translateY(calc(-50% + ${floatY.toFixed(2)}px)) rotateZ(${rz.toFixed(2)}deg)`;
        el.cameraOrbit = `${theta.toFixed(2)}deg ${phi.toFixed(2)}deg 120%`;
        requestAnimationFrame(tick);
      })();
    });
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

  // Skip stamps on mobile (viewport < 769px)
  if (window.innerWidth < 769) return;

  // Skip stamps on route pages — they have their own stamp system
  if (document.body.classList.contains('route-page')) return;

  const targets = [
    { sel: '.hero',   count: 3,  colsOnly: [0, 1] },
    { sel: '#perks',  count: 4,  colsOnly: [0, 1] },
    { sel: '#routes', count: 8,  colsOnly: [0, 1] },
    { sel: '#faq',    count: 8,  colsOnly: [0, 1] },
    { sel: '#cars',   count: 6,  colsOnly: [0, 1] },
    { sel: '#calc',   count: 6,  colsOnly: [0, 1] },
  ];

  targets.forEach(({ sel, count, colsOnly }) => {
    const section = document.querySelector(sel);
    if (!section) return;

    const sectionH = section.offsetHeight || 600;
    const placed = {};
    const availCols = colsOnly
      ? COL_DEFS.filter((_, i) => colsOnly.includes(i))
      : COL_DEFS;

    for (let i = 0; i < count; i++) {
      const col     = availCols[i % availCols.length];
      const topBase = count === 1 ? 50 : 15 + (i / (count - 1)) * 70;

      for (const side of ['left', 'right']) {
        const key = col.posStr + side;
        if (!placed[key]) placed[key] = [];

        for (let attempt = 0; attempt < 15; attempt++) {
          const topPct = topBase + rnd(-9, 9);
          const size   = rndInt(200, 280);
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

/* ===== GEO HIGHLIGHT — підсвічування маршрутів за містом ===== */
(function() {
  // Маппінг: назва міста (en/uk варіанти) → які route-chip підсвічувати
  // Ключ — підрядок який шукаємо в назві href чипа
  const CITY_MAP = {
    // Україна — відправні міста
    'kyiv':       ['kyiv-warsaw','kyiv-berlin','kyiv-bucharest','kyiv-chisinau','kyiv-gdansk','kyiv-krakow','kyiv-sofia','kyiv-wroclaw'],
    'kiev':       ['kyiv-warsaw','kyiv-berlin','kyiv-bucharest','kyiv-chisinau','kyiv-gdansk','kyiv-krakow','kyiv-sofia','kyiv-wroclaw'],
    'київ':       ['kyiv-warsaw','kyiv-berlin','kyiv-bucharest','kyiv-chisinau','kyiv-gdansk','kyiv-krakow','kyiv-sofia','kyiv-wroclaw'],
    'lviv':       ['lviv-warsaw'],
    'львів':      ['lviv-warsaw'],
    'odesa':      ['odesa-warsaw','odesa-chisinau'],
    'odessa':     ['odesa-warsaw','odesa-chisinau'],
    'одеса':      ['odesa-warsaw','odesa-chisinau'],
    'kharkiv':    ['kharkiv-chisinau'],
    'харків':     ['kharkiv-chisinau'],
    'dnipro':     ['dnipro-chisinau'],
    'дніпро':     ['dnipro-chisinau'],
    'mykolaiv':   ['mykolaiv-chisinau'],
    'миколаїв':   ['mykolaiv-chisinau'],
    // Країни призначення — підсвічуємо маршрути туди
    'poland':     ['kyiv-warsaw','kyiv-gdansk','kyiv-krakow','kyiv-wroclaw','lviv-warsaw','odesa-warsaw'],
    'warsaw':     ['kyiv-warsaw','lviv-warsaw','odesa-warsaw'],
    'варшава':    ['kyiv-warsaw','lviv-warsaw','odesa-warsaw'],
    'krakow':     ['kyiv-krakow'],
    'kraków':     ['kyiv-krakow'],
    'краків':     ['kyiv-krakow'],
    'wroclaw':    ['kyiv-wroclaw'],
    'вроцлав':    ['kyiv-wroclaw'],
    'gdansk':     ['kyiv-gdansk'],
    'gdańsk':     ['kyiv-gdansk'],
    'гданськ':    ['kyiv-gdansk'],
    'berlin':     ['kyiv-berlin'],
    'берлін':     ['kyiv-berlin'],
    'bucharest':  ['kyiv-bucharest'],
    'бухарест':   ['kyiv-bucharest'],
    'chisinau':   ['kyiv-chisinau','odesa-chisinau','kharkiv-chisinau','dnipro-chisinau','mykolaiv-chisinau'],
    'chișinău':   ['kyiv-chisinau','odesa-chisinau','kharkiv-chisinau','dnipro-chisinau','mykolaiv-chisinau'],
    'кишинів':    ['kyiv-chisinau','odesa-chisinau','kharkiv-chisinau','dnipro-chisinau','mykolaiv-chisinau'],
    'sofia':      ['kyiv-sofia'],
    'софія':      ['kyiv-sofia'],
  };

  function highlightRoutes(city, country) {
    const chips = document.querySelectorAll('.route-chip');
    if (!chips.length) return;

    const cityLow    = (city    || '').toLowerCase().trim();
    const countryLow = (country || '').toLowerCase().trim();

    let toHighlight = new Set();

    [cityLow, countryLow].forEach(token => {
      Object.keys(CITY_MAP).forEach(key => {
        if (token.includes(key) || key.includes(token)) {
          CITY_MAP[key].forEach(r => toHighlight.add(r));
        }
      });
    });

    if (!toHighlight.size) return;

    chips.forEach(chip => {
      const href = chip.getAttribute('href') || '';
      const matched = [...toHighlight].some(r => href.includes(r));
      if (matched) {
        chip.classList.add('route-chip--geo');
      }
    });
  }

  // Запрос геолокації — тихо, без блокування
  fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
    .then(r => r.json())
    .then(d => highlightRoutes(d.city, d.country_name))
    .catch(() => {}); // якщо заблоковано — нічого не робимо
})();
