/* ================================================
   main.js — 인터랙션 & 애니메이션
   ================================================ */

/* ── Sticky Header ── */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Mobile Menu ── */
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu   = document.getElementById('mobileMenu');
mobileToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  mobileToggle.classList.toggle('open', open);
});
document.querySelectorAll('.mobile-menu a').forEach(a =>
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileToggle.classList.remove('open');
  })
);

/* ── Smooth Scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Scroll Reveal ── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll('.reveal, .reveal-left, .reveal-right')];
    const idx = siblings.indexOf(entry.target);
    entry.target.style.transitionDelay = (idx * 0.08) + 's';
    entry.target.classList.add('visible');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

/* Reveal가 동적으로 추가된 요소도 처리 */
const domObs = new MutationObserver(() => {
  document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)')
    .forEach(el => revealObs.observe(el));
});
domObs.observe(document.body, { childList: true, subtree: true });

/* ── Counter Animation ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target || el.textContent, 10);
  const duration = 1600;
  const start = performance.now();
  const update = now => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.cnt').forEach(el => counterObs.observe(el));

/* ── Contact Form ── */
const form    = document.getElementById('contactForm');
const formDone = document.getElementById('formDone');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.style.display = 'none';
    formDone.style.display = 'block';
  });
}

/* ── Active Nav Highlight ── */
const sections = document.querySelectorAll('section[id], div[id="social"]');
const navLinks  = document.querySelectorAll('.nav-link');

const navObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => navObs.observe(s));
