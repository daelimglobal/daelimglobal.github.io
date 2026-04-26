/* ================================================
   content.js — content.json을 읽어 홈페이지 렌더
   저장 위치: GitHub repo의 content.json (모든 기기 공유)
   ================================================ */

const DEFAULTS = {
  beethoven: { images: ['','','','',''], youtubeUrl: '' },
  portfolio: [
    { id:1, title:'경기도 양평',  size:'40평', type:'베토벤 40', style:'모던 스타일', img:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80&auto=format&fit=crop' },
    { id:2, title:'강원도 춘천',  size:'50평', type:'베토벤 50', style:'프리미엄',   img:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80&auto=format&fit=crop' },
    { id:3, title:'충청북도 충주',size:'40평', type:'베토벤 40', style:'유럽풍',    img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80&auto=format&fit=crop' },
    { id:4, title:'전라북도 전주',size:'30평', type:'베토벤 30', style:'모던',      img:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80&auto=format&fit=crop' },
    { id:5, title:'경상남도 거제',size:'50평', type:'베토벤 50', style:'럭셔리',    img:'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80&auto=format&fit=crop' },
    { id:6, title:'제주도',       size:'40평', type:'베토벤 40', style:'자연형',    img:'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=600&q=80&auto=format&fit=crop' },
  ],
  social: [
    { id:1, tag:'주거환경 개선', title:'독거노인 주거환경 개선 사업', desc:'취약계층 어르신들의 낡은 주거환경을 개선하여 안전하고 따뜻한 삶을 지원합니다.', img:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80&auto=format&fit=crop', photo2:'', photo3:'', youtubeUrl:'', date:'2024.03' },
    { id:2, tag:'사랑의 집짓기', title:'저소득층 주거 개보수 지원', desc:'저소득층 가정의 도배·장판 교체 및 노후 시설 개선을 통해 더 나은 삶의 환경을 만들어 드립니다.', img:'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80&auto=format&fit=crop', photo2:'', photo3:'', youtubeUrl:'', date:'2024.06' },
    { id:3, tag:'지역사회 봉사', title:'지역아동센터 환경개선 활동', desc:'아이들이 안전하게 성장할 수 있도록 지역아동센터의 시설을 개선하고 봉사활동을 진행합니다.', img:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80&auto=format&fit=crop', photo2:'', photo3:'', youtubeUrl:'', date:'2024.09' },
  ],
  videos: [],
  info: { phone:'1668-3603', hours:'평일 09:00 - 18:00', address:'전국 어디서나 상담 가능', kakao:'#', copyright:'© 2024 (주)대림글로벌 DAELIM GLOBAL. All rights reserved.', footerHours:'평일 09:00 - 18:00' },
  customText: {}
};

/* content.json을 우선 로드, 없으면 localStorage, 없으면 기본값 */
let _content = null;

async function loadContent() {
  /* 1순위: content.json (GitHub에서 서빙 — 모든 기기 동일) */
  try {
    const resp = await fetch('/content.json', { cache: 'no-store' });
    if (resp.ok) {
      _content = await resp.json();
      return;
    }
  } catch(e) {}

  /* 2순위: localStorage (이전 저장 데이터) */
  _content = {};
  ['portfolio','social','videos','info','customText','images','beethoven'].forEach(k => {
    try {
      const v = localStorage.getItem('dg_' + k);
      if (v) _content[k] = JSON.parse(v);
    } catch(e) {}
  });
}

function get(key) {
  return (_content && _content[key] !== undefined) ? _content[key] : DEFAULTS[key];
}

/* ── 렌더 함수들 ── */
function renderPortfolio() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;
  const items = get('portfolio');
  if (!items.length) { grid.innerHTML = '<p style="text-align:center;color:#aaa;padding:40px;grid-column:1/-1">등록된 시공사례가 없습니다.</p>'; return; }
  grid.innerHTML = items.map(p => `
    <div class="port-item reveal">
      <div class="port-img-wrap">
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        <div class="port-overlay">
          <div>
            <span class="port-tag">${p.type || ''}</span>
            <span class="port-title">${p.title}</span>
            <span class="port-info">${p.size} · ${p.style || ''}</span>
          </div>
        </div>
      </div>
    </div>`).join('');
}

function renderSocial() {
  const grid = document.getElementById('socialActivities');
  if (!grid) return;
  const items = get('social');
  if (!items.length) { grid.innerHTML = ''; return; }

  const featured = items[0];
  const fi = document.getElementById('socialFeaturedImg');
  const ft = document.getElementById('socialFeaturedTitle');
  const fd = document.getElementById('socialFeaturedDesc');
  const fg = document.getElementById('socialFeaturedTag');
  if (fi) fi.src = featured.img;
  if (ft) ft.textContent = featured.title;
  if (fd) fd.textContent = featured.desc;
  if (fg) fg.textContent = featured.tag;

  /* 대표 항목 추가 사진 갤러리 */
  const fgallery = document.getElementById('socialFeaturedGallery');
  if (fgallery) {
    const photos = [featured.photo2, featured.photo3].filter(Boolean);
    fgallery.innerHTML = photos.map(src => `<img src="${src}" alt="추가 사진" loading="lazy" style="width:100%;height:140px;object-fit:cover;border-radius:8px;">`).join('');
    fgallery.style.display = photos.length ? 'grid' : 'none';
  }
  /* 대표 항목 YouTube 버튼 */
  const fyt = document.getElementById('socialFeaturedYT');
  if (fyt) {
    if (featured.youtubeUrl) {
      fyt.href = featured.youtubeUrl;
      fyt.style.display = 'inline-flex';
    } else {
      fyt.style.display = 'none';
    }
  }

  const rest = items.slice(1, 4);
  if (!rest.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = rest.map(a => {
    const extraPhotos = [a.photo2, a.photo3].filter(Boolean);
    const ytBtn = a.youtubeUrl ? `<a href="${a.youtubeUrl}" target="_blank" rel="noopener" class="social-yt-btn">▶ 영상 보기</a>` : '';
    const gallery = extraPhotos.length ? `<div class="social-card-gallery">${extraPhotos.map(src => `<img src="${src}" alt="활동 사진" loading="lazy">`).join('')}</div>` : '';
    return `
    <div class="activity-card reveal">
      <div class="activity-card-img">
        <img src="${a.img}" alt="${a.title}" loading="lazy">
      </div>
      <div class="activity-card-body">
        <span class="activity-card-tag">${a.tag}</span>
        <h3>${a.title}</h3>
        <p>${a.desc}</p>
        ${gallery}
        <div class="social-card-footer">
          <span class="activity-card-date">${a.date}</span>
          ${ytBtn}
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderVideos() {
  const grid = document.getElementById('videoGrid');
  if (!grid) return;
  const items = get('videos').filter(v => v.youtubeId && v.youtubeId.trim());
  if (!items.length) {
    grid.innerHTML = '<div class="video-empty">아직 등록된 영상이 없습니다.<br><small>관리자 패널에서 유튜브 영상을 추가하세요.</small></div>';
    return;
  }
  grid.innerHTML = items.map(v => {
    const thumb = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
    return `
      <div class="video-card">
        <div class="video-thumb" onclick="openVideo('${v.youtubeId}')">
          <img src="${thumb}" alt="${v.title}" loading="lazy">
          <div class="video-play-btn">▶</div>
        </div>
        <div class="video-info"><h4>${v.title}</h4><span>유튜브 영상 보기</span></div>
      </div>`;
  }).join('');
}

function openVideo(id) { window.open(`https://www.youtube.com/watch?v=${id}`, '_blank'); }

function renderBeethovenGallery() {
  const bData = get('beethoven') || { images: [], youtubeUrl: '' };
  const photos = (bData.images || []).filter(Boolean);
  const ytUrl  = (bData.youtubeUrl || '').trim();

  const galleryEl = document.getElementById('beethovenGallery');
  if (galleryEl) {
    if (photos.length) {
      galleryEl.innerHTML = photos.map(src => `<img src="${src}" alt="베토벤하우스" loading="lazy">`).join('');
      galleryEl.style.display = 'grid';
    } else {
      galleryEl.style.display = 'none';
    }
  }

  const ytEl = document.getElementById('beethovenYT');
  if (ytEl) {
    if (ytUrl) { ytEl.href = ytUrl; ytEl.style.display = 'inline-flex'; }
    else ytEl.style.display = 'none';
  }
}

function applyImages() {
  const images = get('images') || {};
  if (images.aboutImg) {
    const el = document.getElementById('aboutImg');
    if (el) el.src = images.aboutImg;
  }
}

function applyInfo() {
  const info = get('info');
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el) { el.textContent = val; el.href = 'tel:' + val.replace(/[^0-9]/g,''); } };
  setHref('headerPhone',  info.phone);
  setHref('heroPhone',    info.phone);
  setHref('contactPhone', info.phone);
  setHref('footerPhone',  info.phone);
  setHref('footerPhone2', info.phone);
  setHref('ctaPhone',     info.phone);
  set('contactHours',   info.hours);
  set('contactAddr',    info.address);
  set('footerHours',    info.footerHours || info.hours);
  set('footerCopyright',info.copyright);
  const kakao = document.getElementById('footerKakao');
  if (kakao && info.kakao) kakao.href = info.kakao;
}

function applyCustomText() {
  const ct = get('customText');
  const fields = [
    'heroTitle','heroSub','aboutTitle','aboutLead','aboutDesc',
    'socialLead','missionTitle','missionDesc',
    'socialStat1Num','socialStat1Label','socialStat2Num','socialStat2Label','socialStat3Num','socialStat3Label',
    'ctaTitle','ctaDesc','footerTagline','stat1Label','stat2Label',
  ];
  fields.forEach(id => {
    if (ct[id]) { const el = document.getElementById(id); if (el) el.innerHTML = ct[id]; }
  });

  /* 네비게이션 메뉴명 */
  const navMap = {
    navAbout:     ['nav-about',    'mnav-about'],
    navBeethoven: ['nav-beethoven','mnav-beethoven'],
    navServices:  ['nav-services', 'mnav-services'],
    navProcess:   ['nav-process',  'mnav-process'],
    navPortfolio: ['nav-portfolio','mnav-portfolio'],
    navSocial:    ['nav-social',   'mnav-social'],
    navCta:       ['nav-cta',      'mnav-cta'],
  };
  Object.entries(navMap).forEach(([key, ids]) => {
    if (ct[key]) ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = ct[key];
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  /* 즉시 기본값으로 렌더 (빠른 첫 화면) */
  applyInfo(); applyCustomText(); applyImages(); renderPortfolio(); renderSocial(); renderVideos(); renderBeethovenGallery();
  /* content.json 로드 후 재렌더 (모든 기기 최신 반영) */
  await loadContent();
  applyInfo(); applyCustomText(); applyImages(); renderPortfolio(); renderSocial(); renderVideos(); renderBeethovenGallery();
});
