// =========================================================
// Profile site interactions (vanilla JS)
// =========================================================

// 예시 이메일 — 실제 주소로 바꾸면 페이지 전체(mailto 링크, 복사 버튼)에 적용됩니다.
const EMAIL = 'research@studio-kinetic.io';
const EMAIL_SUBJECT = '[Portfolio] 문의드립니다';

const header = document.getElementById('site-header');
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

// ---------------------------------------------------------
// 1. 메뉴 클릭 → 해당 섹션으로 부드럽게 이동
// ---------------------------------------------------------
function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const offset = header.offsetHeight - (mobileNav.hidden ? 0 : mobileNav.offsetHeight);
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: id === 'home' ? 0 : top, behavior: 'smooth' });
  history.replaceState(null, '', '#' + id);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    closeMobileNav();
    scrollToSection(id);
  });
});

// 현재 보고 있는 섹션에 맞춰 메뉴 활성 상태 표시
const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
const sections = ['home', 'about', 'work', 'research', 'contact']
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function updateActiveNav() {
  const probe = window.scrollY + header.offsetHeight + window.innerHeight * 0.3;
  let current = sections[0].id;
  sections.forEach((section) => {
    if (section.offsetTop <= probe) current = section.id;
  });
  // 페이지 맨 아래에 도달하면 마지막 섹션(Contact)을 활성화
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    current = sections[sections.length - 1].id;
  }
  navLinks.forEach((link) => {
    const active = link.getAttribute('href') === '#' + current;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('resize', updateActiveNav);
updateActiveNav();

// ---------------------------------------------------------
// 4. 모바일 메뉴 (햄버거)
// ---------------------------------------------------------
function openMobileNav() {
  mobileNav.hidden = false;
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', '메뉴 닫기');
  menuToggle.querySelector('.material-symbols-outlined').textContent = 'close';
}
function closeMobileNav() {
  if (mobileNav.hidden) return;
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '메뉴 열기');
  menuToggle.querySelector('.material-symbols-outlined').textContent = 'menu';
}
menuToggle.addEventListener('click', () => {
  mobileNav.hidden ? openMobileNav() : closeMobileNav();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileNav();
});
window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
  if (e.matches) closeMobileNav();
});

// ---------------------------------------------------------
// 2. 프로젝트 카드 클릭 → 관련 링크로 이동 (새 탭)
// ---------------------------------------------------------
document.querySelectorAll('.work-item[data-href]').forEach((card) => {
  const open = () => window.open(card.dataset.href, '_blank', 'noopener');
  card.addEventListener('click', (e) => {
    // 카드 안의 실제 링크를 누른 경우엔 그 링크의 기본 동작을 따름
    if (e.target.closest('a')) return;
    open();
  });
  card.addEventListener('keydown', (e) => {
    if (e.target !== card) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
});

// 작업물 카테고리 필터
const filterButtons = document.querySelectorAll('.filter-btn');
const workItems = document.querySelectorAll('.work-item');
filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterButtons.forEach((b) => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    workItems.forEach((item) => {
      const categories = (item.dataset.category || '').split(' ');
      item.hidden = !(filter === 'all' || categories.includes(filter));
    });
  });
});

// ---------------------------------------------------------
// 3. 이메일 클릭 → 메일 작성창 열기
// ---------------------------------------------------------
const mailtoHref = `mailto:${EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;
document.querySelectorAll('.js-email').forEach((link) => {
  link.href = mailtoHref;
});
document.querySelectorAll('.email-link').forEach((el) => {
  el.textContent = EMAIL;
});

// 이메일 주소 복사
const copyBtn = document.getElementById('copy-email-btn');
const copyToast = document.getElementById('copy-toast');
const copyBtnText = document.getElementById('btn-text');
let copyTimer;

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
  document.body.removeChild(ta);
  return ok;
}

copyBtn.addEventListener('click', async () => {
  let ok = false;
  try {
    await navigator.clipboard.writeText(EMAIL);
    ok = true;
  } catch (err) {
    ok = fallbackCopy(EMAIL);
  }
  copyToast.textContent = ok ? 'ADDRESS COPIED TO SYSTEM CLIPBOARD ✓' : `COPY FAILED — ${EMAIL}`;
  copyToast.hidden = false;
  copyBtnText.textContent = ok ? 'COPIED!' : 'COPY EMAIL';
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copyToast.hidden = true;
    copyBtnText.textContent = 'COPY EMAIL';
  }, 3000);
});

// ---------------------------------------------------------
// About: 철학 카드 / Research: 초록 서랍 열고 닫기
// ---------------------------------------------------------
document.querySelectorAll('.manifesto-card').forEach((card) => {
  card.addEventListener('click', () => {
    const open = card.getAttribute('aria-expanded') === 'true';
    card.setAttribute('aria-expanded', String(!open));
  });
});

document.querySelectorAll('.drawer-trigger').forEach((trigger) => {
  const panel = document.getElementById(trigger.getAttribute('aria-controls'));
  trigger.addEventListener('click', () => {
    const open = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
  });
});

// ---------------------------------------------------------
// 실시간 서울 시각 (Telemetry Bar)
// ---------------------------------------------------------
const clockEl = document.getElementById('live-telemetry-clock');
const kstFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});
function updateClock() {
  clockEl.textContent = `SEOUL (KST UTC+9) — ${kstFormatter.format(new Date())}`;
}
updateClock();
setInterval(updateClock, 1000);

document.getElementById('year').textContent = new Date().getFullYear();

// 외부 이미지 로드 실패 시 빈 프레임으로 깔끔하게 표시
document.querySelectorAll('img').forEach((img) => {
  const markBroken = () => img.classList.add('is-broken');
  if (img.complete && img.naturalWidth === 0) markBroken();
  else img.addEventListener('error', markBroken);
});

// ---------------------------------------------------------
// Hero 생성형 캔버스 (마우스/터치에 반응하는 파형)
// ---------------------------------------------------------
(function initGenerativeCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0, height = 0;
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  let frame = 0;
  let visible = true;
  let rafId = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function center() {
    targetX = width / 2;
    targetY = height / 2;
  }
  function setTarget(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    targetX = clientX - rect.left;
    targetY = clientY - rect.top;
  }

  resize();
  center();
  mouseX = targetX;
  mouseY = targetY;

  window.addEventListener('resize', () => { resize(); if (reduceMotion) draw(); });
  canvas.addEventListener('mousemove', (e) => setTarget(e.clientX, e.clientY));
  canvas.addEventListener('mouseleave', center);
  canvas.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (t) setTarget(t.clientX, t.clientY);
  }, { passive: true });
  canvas.addEventListener('touchend', center);

  function draw() {
    frame++;
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    ctx.fillStyle = '#f2f4f6';
    ctx.fillRect(0, 0, width, height);

    // Swiss grid matrix
    const cols = width < 640 ? 12 : 24;
    const rows = 14;
    const colW = width / cols;
    const rowH = height / rows;
    ctx.strokeStyle = 'rgba(224, 227, 229, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= cols; i++) { ctx.moveTo(i * colW, 0); ctx.lineTo(i * colW, height); }
    for (let j = 0; j <= rows; j++) { ctx.moveTo(0, j * rowH); ctx.lineTo(width, j * rowH); }
    ctx.stroke();

    // Generative wave lines
    const waveCount = 12;
    for (let w = 0; w < waveCount; w++) {
      ctx.beginPath();
      const phase = w * 0.28 + frame * 0.015;
      const yBase = (height / (waveCount + 1)) * (w + 1);
      for (let x = 0; x <= width + 15; x += 15) {
        const dx = x - mouseX;
        const dy = yBase - mouseY;
        const influence = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 300);
        const y = yBase
          + Math.sin(x * 0.008 + phase) * 26
          + Math.cos(x * 0.004 - phase * 0.5) * 14
          + influence * 45 * Math.sin(frame * 0.05 + w);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      if (w === 5 || w === 6) {
        ctx.strokeStyle = '#0051d5';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(25, 28, 30, 0.45)';
        ctx.lineWidth = 0.8;
      }
      ctx.stroke();
    }

    // Orbiting nodes around cursor
    for (let n = 0; n < 5; n++) {
      const angle = frame * 0.02 + n * (Math.PI * 2 / 5);
      const r = 40 + n * 12;
      const nx = mouseX + Math.cos(angle) * r;
      const ny = mouseY + Math.sin(angle) * r;
      ctx.fillStyle = n === 0 ? '#0051d5' : '#191c1e';
      ctx.fillRect(nx - 2.5, ny - 2.5, 5, 5);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 81, 213, 0.25)';
      ctx.lineWidth = 1;
      ctx.moveTo(mouseX, mouseY);
      ctx.lineTo(nx, ny);
      ctx.stroke();
    }

    // Cursor reticle
    ctx.strokeStyle = '#0051d5';
    ctx.lineWidth = 1;
    ctx.strokeRect(mouseX - 6, mouseY - 6, 12, 12);

    if (!reduceMotion && visible) rafId = requestAnimationFrame(draw);
    else rafId = null;
  }

  // 화면 밖에 있을 땐 애니메이션을 멈춰 배터리 절약
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !rafId && !reduceMotion) rafId = requestAnimationFrame(draw);
  }).observe(canvas);

  draw();
})();
