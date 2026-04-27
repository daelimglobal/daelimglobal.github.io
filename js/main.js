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
const form     = document.getElementById('contactForm');
const formDone = document.getElementById('formDone');
const formBtn  = form ? form.querySelector('button[type="submit"]') : null;

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (formBtn) { formBtn.disabled = true; formBtn.textContent = '전송 중...'; }

    const fd = new FormData(form);
    const data = {
      id:       Date.now(),
      status:   '미확인',
      신청시각:  new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      성함:     fd.get('name')     || '',
      연락처:   fd.get('phone')    || '',
      부지지역:  fd.get('location') || '',
      희망평형:  fd.get('size')     || '',
      예상예산:  fd.get('budget')   || '',
      문의내용:  fd.get('message')  || '',
    };

    /* 1. localStorage 저장 (관리자 패널에서 확인 가능) */
    try {
      const list = JSON.parse(localStorage.getItem('dg_submissions') || '[]');
      list.unshift(data);
      if (list.length > 200) list.pop();
      localStorage.setItem('dg_submissions', JSON.stringify(list));
    } catch(err) {}

    /* 2. 이메일 알림 전송 (Web3Forms) — 8초 타임아웃 */
    const w3Key = (window.DG_CONFIG && window.DG_CONFIG.w3key)
                  || (localStorage.getItem('dg_w3forms_key') || '').trim();
    if (w3Key) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 8000);
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            access_key: w3Key,
            subject:    `[대림글로벌] 건축상담 신청 — ${data.성함} (${data.연락처})`,
            from_name:  '대림글로벌 홈페이지',
            '신청자':   data.성함,
            '연락처':   data.연락처,
            '부지지역':  data.부지지역,
            '희망평형':  data.희망평형,
            '예상예산':  data.예상예산,
            '문의내용':  data.문의내용,
            '신청시각':  data.신청시각,
          })
        });
        clearTimeout(tid);
      } catch(err) { console.warn('이메일 전송 오류:', err); }
    }

    /* 3. Google 시트 저장 — JSONP GET (doGet action=write와 일치) */
    const gasUrl = ((window.DG_CONFIG && window.DG_CONFIG.gasUrl) ||
                    localStorage.getItem('dg_gas_url') || '').trim();
    if (gasUrl) {
      try {
        const cbName = 'dg_w_' + Date.now();
        const sc = document.createElement('script');
        const p = new URLSearchParams({
          action:   'write',
          callback:  cbName,
          신청시각: data.신청시각,
          성함:    data.성함,
          연락처:  data.연락처,
          부지지역: data.부지지역,
          희망평형: data.희망평형,
          예상예산: data.예상예산,
          문의내용: (data.문의내용 || '').slice(0, 500),
        });
        window[cbName] = () => { delete window[cbName]; sc.remove(); };
        sc.onerror = () => { delete window[cbName]; sc.remove(); };
        sc.src = gasUrl + '?' + p.toString();
        document.head.appendChild(sc);
        setTimeout(() => { if (window[cbName]) { delete window[cbName]; sc.remove(); } }, 15000);
      } catch(err) { console.warn('Google 시트 저장 오류:', err); }
    }

    /* 4. 완료 처리 — 폼 숨기고 완료 메시지 표시 */
    form.style.display = 'none';
    if (formDone) formDone.style.display = 'block';
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
