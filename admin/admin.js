/* ================================================
   admin.js — 관리자 패널 로직
   기본 비밀번호: daelim2024
   ================================================ */

const DEFAULT_PW = 'daelim2024';

function getStoredPw() { return localStorage.getItem('dg_admin_pw') || DEFAULT_PW; }
function save(key, val) { localStorage.setItem('dg_' + key, JSON.stringify(val)); }
function load(key, fallback) {
  try { const v = localStorage.getItem('dg_' + key); return v ? JSON.parse(v) : fallback; } catch(e) { return fallback; }
}

/* ── 기본 데이터 ── */
const DEFAULT_PORTFOLIO = [
  { id:1, title:'경기도 양평', size:'40평', type:'베토벤 40', style:'모던 스타일', img:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80&auto=format&fit=crop' },
  { id:2, title:'강원도 춘천', size:'50평', type:'베토벤 50', style:'프리미엄', img:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80&auto=format&fit=crop' },
  { id:3, title:'충청북도 충주', size:'40평', type:'베토벤 40', style:'유럽풍', img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80&auto=format&fit=crop' },
  { id:4, title:'전라북도 전주', size:'30평', type:'베토벤 30', style:'모던', img:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80&auto=format&fit=crop' },
  { id:5, title:'경상남도 거제', size:'50평', type:'베토벤 50', style:'럭셔리', img:'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80&auto=format&fit=crop' },
  { id:6, title:'제주도', size:'40평', type:'베토벤 40', style:'자연형', img:'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=600&q=80&auto=format&fit=crop' },
];
const DEFAULT_SOCIAL = [
  { id:1, tag:'주거환경 개선', title:'독거노인 주거환경 개선 사업', desc:'취약계층 어르신들의 낡은 주거환경을 개선하여 안전하고 따뜻한 삶을 지원합니다.', img:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80&auto=format&fit=crop', date:'2024.03' },
  { id:2, tag:'사랑의 집짓기', title:'저소득층 주거 개보수 지원', desc:'저소득층 가정의 도배·장판 교체 및 노후 시설 개선을 통해 더 나은 삶의 환경을 만들어 드립니다.', img:'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80&auto=format&fit=crop', date:'2024.06' },
  { id:3, tag:'지역사회 봉사', title:'지역아동센터 환경개선 활동', desc:'아이들이 안전하게 성장할 수 있도록 지역아동센터의 시설을 개선하고 봉사활동을 진행합니다.', img:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80&auto=format&fit=crop', date:'2024.09' },
];
const DEFAULT_INFO = { phone:'1668-3603', hours:'평일 09:00 - 18:00', address:'전국 어디서나 상담 가능', kakao:'#', copyright:'© 2024 (주)대림글로벌 DAELIM GLOBAL. All rights reserved.', footerHours:'평일 09:00 - 18:00' };

/* ── 로그인 ── */
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const pw = document.getElementById('loginPw').value;
  if (pw === getStoredPw()) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'flex';
    initAdmin();
  } else {
    document.getElementById('loginError').textContent = '비밀번호가 올바르지 않습니다.';
    document.getElementById('loginPw').value = '';
    document.getElementById('loginPw').focus();
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  document.getElementById('adminApp').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginPw').value = '';
});

/* ── 탭 전환 ── */
document.querySelectorAll('.sb-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('tab-' + tab).classList.add('active');
    const titles = { dashboard:'대시보드', portfolio:'시공사례 관리', social:'사회공헌 관리', videos:'동영상 관리', content:'텍스트 편집', settings:'기본 설정' };
    document.getElementById('tabTitle').textContent = titles[tab] || tab;
  });
});

/* ── 저장 알림 ── */
function showSaved(msg = '저장되었습니다 ✓') {
  const el = document.getElementById('saveStatus');
  el.textContent = msg;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.textContent = '', 2500);
}

/* ── 관리자 초기화 ── */
function initAdmin() {
  updateDashboard();
  renderPortfolioList();
  renderSocialList();
  renderVideoList();
  loadSettings();
  loadContentEditor();
}

/* ── 대시보드 ── */
function updateDashboard() {
  const p = load('portfolio', DEFAULT_PORTFOLIO);
  const s = load('social', DEFAULT_SOCIAL);
  const v = load('videos', []).filter(v => v.youtubeId);
  const info = load('info', DEFAULT_INFO);
  document.getElementById('dc-portfolio-count').textContent = p.length;
  document.getElementById('dc-social-count').textContent = s.length;
  document.getElementById('dc-video-count').textContent = v.length;
  document.getElementById('dc-phone').textContent = info.phone;
}

/* ==========================================
   시공사례 (Portfolio)
   ========================================== */
function renderPortfolioList() {
  const items = load('portfolio', DEFAULT_PORTFOLIO);
  const list = document.getElementById('portfolioList');
  if (!items.length) { list.innerHTML = '<p style="color:#aaa;padding:20px;text-align:center">등록된 시공사례가 없습니다.</p>'; return; }
  list.innerHTML = items.map((p, i) => `
    <div class="item-row" draggable="true" data-id="${p.id}" data-type="portfolio">
      <span class="drag-handle" title="드래그로 순서 변경">⠿</span>
      <div class="item-thumb"><img src="${p.img}" alt="${p.title}" onerror="this.style.display='none'"></div>
      <div class="item-info">
        <strong>${p.title}</strong>
        <span>${p.size} · ${p.type || ''} · ${p.style || ''}</span>
      </div>
      <span class="item-tag gold">${p.type || '미분류'}</span>
      <div class="item-actions">
        <button class="btn-edit" onclick="editPortfolio(${p.id})" title="편집">✏️</button>
        <button class="btn-del" onclick="deletePortfolio(${p.id})" title="삭제">🗑</button>
      </div>
    </div>`).join('');
  initDragSort('portfolioList', 'portfolio', DEFAULT_PORTFOLIO, renderPortfolioList);
}

document.getElementById('addPortfolioBtn').addEventListener('click', () => {
  document.getElementById('portfolioFormTitle').textContent = '시공사례 추가';
  clearForm(['pf-title','pf-size','pf-type','pf-style','pf-img-url','pf-img-final','pf-edit-id']);
  setPreview('pf-preview', '');
  document.getElementById('portfolioForm').style.display = 'block';
  document.getElementById('portfolioForm').scrollIntoView({ behavior:'smooth' });
});

function editPortfolio(id) {
  const items = load('portfolio', DEFAULT_PORTFOLIO);
  const p = items.find(x => x.id === id);
  if (!p) return;
  document.getElementById('portfolioFormTitle').textContent = '시공사례 편집';
  set('pf-title', p.title);
  set('pf-size', p.size);
  set('pf-type', p.type);
  set('pf-style', p.style);
  set('pf-img-url', p.img);
  set('pf-img-final', p.img);
  set('pf-edit-id', p.id);
  setPreview('pf-preview', p.img);
  document.getElementById('portfolioForm').style.display = 'block';
  document.getElementById('portfolioForm').scrollIntoView({ behavior:'smooth' });
}

document.getElementById('savePortfolioBtn').addEventListener('click', () => {
  const title = val('pf-title');
  const size  = val('pf-size');
  if (!title || !size) { alert('지역명과 평형은 필수입니다.'); return; }
  let items = load('portfolio', DEFAULT_PORTFOLIO);
  const editId = val('pf-edit-id');
  const item = {
    id: editId ? parseInt(editId) : Date.now(),
    title, size,
    type:  val('pf-type'),
    style: val('pf-style'),
    img:   val('pf-img-final') || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
  };
  if (editId) items = items.map(x => x.id === item.id ? item : x);
  else items.push(item);
  save('portfolio', items);
  showSaved('시공사례 저장 완료 ✓');
  closeForm('portfolio');
  renderPortfolioList();
  updateDashboard();
});

function deletePortfolio(id) {
  if (!confirm('이 시공사례를 삭제할까요?')) return;
  let items = load('portfolio', DEFAULT_PORTFOLIO);
  save('portfolio', items.filter(x => x.id !== id));
  renderPortfolioList();
  updateDashboard();
  showSaved('삭제되었습니다.');
}

/* ==========================================
   사회공헌 (Social)
   ========================================== */
function renderSocialList() {
  const items = load('social', DEFAULT_SOCIAL);
  const list = document.getElementById('socialList');
  if (!items.length) { list.innerHTML = '<p style="color:#aaa;padding:20px;text-align:center">등록된 활동이 없습니다.</p>'; return; }
  list.innerHTML = items.map((a, i) => `
    <div class="item-row" draggable="true" data-id="${a.id}" data-type="social">
      ${i === 0 ? '<span class="item-tag" style="flex-shrink:0">대표</span>' : '<span class="drag-handle" title="순서 변경">⠿</span>'}
      <div class="item-thumb"><img src="${a.img}" alt="${a.title}" onerror="this.style.display='none'"></div>
      <div class="item-info">
        <strong>${a.title}</strong>
        <span>${a.tag} · ${a.date || ''}</span>
      </div>
      <span class="item-tag">${a.tag}</span>
      <div class="item-actions">
        <button class="btn-edit" onclick="editSocial(${a.id})" title="편집">✏️</button>
        <button class="btn-del" onclick="deleteSocial(${a.id})" title="삭제">🗑</button>
      </div>
    </div>`).join('');
  initDragSort('socialList', 'social', DEFAULT_SOCIAL, renderSocialList);
}

document.getElementById('addSocialBtn').addEventListener('click', () => {
  document.getElementById('socialFormTitle').textContent = '사회공헌 활동 추가';
  clearForm(['sf-tag','sf-date','sf-title','sf-desc','sf-img-url','sf-img-final','sf-edit-id']);
  setPreview('sf-preview', '');
  document.getElementById('socialForm').style.display = 'block';
  document.getElementById('socialForm').scrollIntoView({ behavior:'smooth' });
});

function editSocial(id) {
  const items = load('social', DEFAULT_SOCIAL);
  const a = items.find(x => x.id === id);
  if (!a) return;
  document.getElementById('socialFormTitle').textContent = '사회공헌 활동 편집';
  set('sf-tag', a.tag);
  set('sf-date', a.date);
  set('sf-title', a.title);
  set('sf-desc', a.desc);
  set('sf-img-url', a.img);
  set('sf-img-final', a.img);
  set('sf-edit-id', a.id);
  setPreview('sf-preview', a.img);
  document.getElementById('socialForm').style.display = 'block';
  document.getElementById('socialForm').scrollIntoView({ behavior:'smooth' });
}

document.getElementById('saveSocialBtn').addEventListener('click', () => {
  const tag   = val('sf-tag');
  const title = val('sf-title');
  if (!tag || !title) { alert('태그와 제목은 필수입니다.'); return; }
  let items = load('social', DEFAULT_SOCIAL);
  const editId = val('sf-edit-id');
  const item = {
    id: editId ? parseInt(editId) : Date.now(),
    tag, title,
    desc: val('sf-desc'),
    img:  val('sf-img-final') || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
    date: val('sf-date'),
  };
  if (editId) items = items.map(x => x.id === item.id ? item : x);
  else items.push(item);
  save('social', items);
  showSaved('사회공헌 활동 저장 완료 ✓');
  closeForm('social');
  renderSocialList();
  updateDashboard();
});

function deleteSocial(id) {
  if (!confirm('이 활동을 삭제할까요?')) return;
  let items = load('social', DEFAULT_SOCIAL);
  save('social', items.filter(x => x.id !== id));
  renderSocialList();
  updateDashboard();
  showSaved('삭제되었습니다.');
}

/* ==========================================
   동영상 (Video)
   ========================================== */
function renderVideoList() {
  const items = load('videos', []);
  const list = document.getElementById('videoList');
  if (!items.length) { list.innerHTML = '<p style="color:#aaa;padding:20px;text-align:center">등록된 영상이 없습니다.</p>'; return; }
  list.innerHTML = items.map(v => `
    <div class="item-row">
      <div class="item-thumb">
        ${v.youtubeId ? `<img src="https://img.youtube.com/vi/${v.youtubeId}/default.jpg" alt="${v.title}">` : '<span style="color:#aaa;font-size:12px;margin:auto">미등록</span>'}
      </div>
      <div class="item-info">
        <strong>${v.title}</strong>
        <span>${v.youtubeId ? 'ID: ' + v.youtubeId : '유튜브 ID 미입력'}</span>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="editVideo(${v.id})" title="편집">✏️</button>
        <button class="btn-del" onclick="deleteVideo(${v.id})" title="삭제">🗑</button>
      </div>
    </div>`).join('');
}

document.getElementById('addVideoBtn').addEventListener('click', () => {
  document.getElementById('videoFormTitle').textContent = '동영상 추가';
  clearForm(['vf-title','vf-youtube-id','vf-edit-id']);
  document.getElementById('vf-preview-area').style.display = 'none';
  document.getElementById('videoForm').style.display = 'block';
  document.getElementById('videoForm').scrollIntoView({ behavior:'smooth' });
});

function editVideo(id) {
  const items = load('videos', []);
  const v = items.find(x => x.id === id);
  if (!v) return;
  document.getElementById('videoFormTitle').textContent = '동영상 편집';
  set('vf-title', v.title);
  set('vf-youtube-id', v.youtubeId);
  set('vf-edit-id', v.id);
  document.getElementById('videoForm').style.display = 'block';
  document.getElementById('videoForm').scrollIntoView({ behavior:'smooth' });
}

function previewVideo() {
  const id = val('vf-youtube-id').trim();
  if (!id) return;
  const area  = document.getElementById('vf-preview-area');
  const thumb = document.getElementById('vf-thumb');
  thumb.innerHTML = `<img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="미리보기">`;
  area.style.display = 'block';
}

document.getElementById('saveVideoBtn').addEventListener('click', () => {
  const title = val('vf-title');
  const yid   = val('vf-youtube-id').trim();
  if (!title) { alert('영상 제목은 필수입니다.'); return; }
  let items = load('videos', []);
  const editId = val('vf-edit-id');
  const item = { id: editId ? parseInt(editId) : Date.now(), title, youtubeId: yid };
  if (editId) items = items.map(x => x.id === item.id ? item : x);
  else items.push(item);
  save('videos', items);
  showSaved('동영상 저장 완료 ✓');
  closeForm('video');
  renderVideoList();
  updateDashboard();
});

function deleteVideo(id) {
  if (!confirm('이 영상을 삭제할까요?')) return;
  save('videos', load('videos', []).filter(x => x.id !== id));
  renderVideoList();
  updateDashboard();
  showSaved('삭제되었습니다.');
}

/* ==========================================
   텍스트 편집 (Content)
   ========================================== */
function loadContentEditor() {
  const ct = load('customText', {});
  const defaults = {
    heroTitle: '합리적 가격으로<br><em>고품격 주택</em>을<br>건축합니다',
    heroSub: 'We build high-quality homes at affordable prices',
    aboutTitle: '대한민국을 대표하는<br><em>전원주택 건축 명가</em>',
    aboutLead: '(주)대림글로벌은 합리적 가격으로 고품격 주택을 건축하는 대한민국 대표 전원주택 시행사입니다.',
    aboutDesc: '15년의 풍부한 경험과 전문 건축팀을 바탕으로 고객 한 분 한 분의 꿈을 현실로 만들어 드립니다. 투명한 공사비와 합리적인 가격으로 누구나 부담 없이 고품격 주택을 가질 수 있도록, 전국 어디서나 최선을 다하고 있습니다.',
    socialLead: '집 한 채가 가족의 행복을 바꿉니다.\n대림글로벌은 건축의 가치를 사회와 함께 나눕니다.',
    socialStat1Num: '50+', socialStat1Label: '가구 주거환경 개선',
    socialStat2Num: '200+', socialStat2Label: '봉사 참여 인원',
    socialStat3Num: '10+', socialStat3Label: '협력 지역사회 기관',
    missionTitle: '대림글로벌의 사회공헌 약속',
    missionDesc: '저희는 단순히 집을 짓는 회사가 아닙니다. 취약계층의 주거환경을 개선하고, 지역사회와 함께 성장하는 기업이 되고자 합니다. 매년 이익의 일부를 사회공헌 활동에 환원하며, 더 많은 가정에 따뜻한 보금자리를 선물하겠습니다.',
    ctaTitle: '지금 바로 무료 건축상담을 받아보세요',
    ctaDesc: '전문 건축 상담사가 부지분석부터 설계, 비용까지 친절하게 안내해 드립니다',
    footerTagline: '건축명가 (주)대림글로벌\n합리적 가격으로 고품격 주택을 건축합니다',
  };
  Object.keys(defaults).forEach(k => {
    const el = document.getElementById('ct-' + k);
    if (el) el.value = ct[k] || defaults[k];
  });
}

document.getElementById('saveContentBtn').addEventListener('click', () => {
  const keys = [
    'heroTitle','heroSub','aboutTitle','aboutLead','aboutDesc',
    'socialLead','socialStat1Num','socialStat1Label','socialStat2Num','socialStat2Label','socialStat3Num','socialStat3Label',
    'missionTitle','missionDesc','ctaTitle','ctaDesc','footerTagline',
  ];
  const ct = {};
  keys.forEach(k => {
    const el = document.getElementById('ct-' + k);
    if (el) ct[k] = el.value;
  });
  save('customText', ct);
  showSaved('텍스트 저장 완료 ✓');
});

/* ==========================================
   기본 설정 (Settings)
   ========================================== */
function loadSettings() {
  const info = load('info', DEFAULT_INFO);
  set('s-phone', info.phone);
  set('s-hours', info.hours);
  set('s-address', info.address);
  set('s-kakao', info.kakao || '');
  set('s-copyright', info.copyright);
}

document.getElementById('saveInfoBtn').addEventListener('click', () => {
  const info = {
    phone:       val('s-phone') || DEFAULT_INFO.phone,
    hours:       val('s-hours') || DEFAULT_INFO.hours,
    address:     val('s-address'),
    kakao:       val('s-kakao') || '#',
    copyright:   val('s-copyright') || DEFAULT_INFO.copyright,
    footerHours: val('s-hours') || DEFAULT_INFO.hours,
  };
  save('info', info);
  showSaved('연락처 정보 저장 완료 ✓');
  updateDashboard();
});

document.getElementById('changePwBtn').addEventListener('click', () => {
  const oldPw  = document.getElementById('s-old-pw').value;
  const newPw  = document.getElementById('s-new-pw').value;
  const newPw2 = document.getElementById('s-new-pw2').value;
  const msg    = document.getElementById('pw-msg');
  if (oldPw !== getStoredPw()) { msg.className = 'pw-msg err'; msg.textContent = '현재 비밀번호가 올바르지 않습니다.'; return; }
  if (newPw.length < 4) { msg.className = 'pw-msg err'; msg.textContent = '비밀번호는 4자 이상이어야 합니다.'; return; }
  if (newPw !== newPw2) { msg.className = 'pw-msg err'; msg.textContent = '새 비밀번호가 일치하지 않습니다.'; return; }
  localStorage.setItem('dg_admin_pw', newPw);
  msg.className = 'pw-msg ok'; msg.textContent = '비밀번호가 변경되었습니다.';
  ['s-old-pw','s-new-pw','s-new-pw2'].forEach(id => document.getElementById(id).value = '');
});

/* ── 데이터 내보내기/가져오기 ── */
document.getElementById('exportBtn').addEventListener('click', () => {
  const data = {
    portfolio:   load('portfolio', DEFAULT_PORTFOLIO),
    social:      load('social', DEFAULT_SOCIAL),
    videos:      load('videos', []),
    info:        load('info', DEFAULT_INFO),
    customText:  load('customText', {}),
    exportedAt:  new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'daelimglobal-content-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
});

document.getElementById('importFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  const msg = document.getElementById('import-msg');
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.portfolio) save('portfolio', data.portfolio);
      if (data.social)    save('social', data.social);
      if (data.videos)    save('videos', data.videos);
      if (data.info)      save('info', data.info);
      if (data.customText) save('customText', data.customText);
      msg.className = 'import-msg ok';
      msg.textContent = '데이터를 성공적으로 가져왔습니다. 페이지를 새로고침 해주세요.';
      initAdmin();
    } catch(err) {
      msg.className = 'import-msg err';
      msg.textContent = 'JSON 파일 형식이 올바르지 않습니다.';
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

/* ==========================================
   이미지 업로드 유틸
   ========================================== */
window.applyImgUrl = function(prefix) {
  const url = val(prefix + '-img-url');
  if (!url) return;
  set(prefix + '-img-final', url);
  setPreview(prefix + '-preview', url);
};

function setPreview(previewId, url) {
  const el = document.getElementById(previewId);
  if (!el) return;
  if (url) el.innerHTML = `<img src="${url}" alt="미리보기" onerror="this.parentElement.innerHTML='<span>이미지 로드 실패</span>'">`;
  else el.innerHTML = '<span>이미지 없음</span>';
}

function setupFileUpload(prefix) {
  const fileInput = document.getElementById(prefix + '-file');
  const dropZone  = document.getElementById(prefix + '-drop');
  if (!fileInput) return;

  const handleFile = file => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('파일 크기가 2MB를 초과합니다. URL 방식을 사용하거나 이미지를 압축해주세요.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      set(prefix + '-img-final', e.target.result);
      setPreview(prefix + '-preview', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

  if (dropZone) {
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      handleFile(e.dataTransfer.files[0]);
    });
  }
}
setupFileUpload('pf');
setupFileUpload('sf');

/* ==========================================
   드래그&드롭 순서 변경
   ========================================== */
function initDragSort(listId, storageKey, defaultData, renderFn) {
  const list = document.getElementById(listId);
  let dragSrc = null;
  list.querySelectorAll('.item-row[draggable]').forEach(row => {
    row.addEventListener('dragstart', e => { dragSrc = row; row.classList.add('dragging'); });
    row.addEventListener('dragend',   () => { dragSrc = null; list.querySelectorAll('.item-row').forEach(r => r.classList.remove('dragging','drag-over')); });
    row.addEventListener('dragover',  e => { e.preventDefault(); if (row !== dragSrc) row.classList.add('drag-over'); });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop',      e => {
      e.preventDefault();
      row.classList.remove('drag-over');
      if (!dragSrc || dragSrc === row) return;
      const items = load(storageKey, defaultData);
      const srcId = parseInt(dragSrc.dataset.id);
      const dstId = parseInt(row.dataset.id);
      const srcIdx = items.findIndex(x => x.id === srcId);
      const dstIdx = items.findIndex(x => x.id === dstId);
      if (srcIdx < 0 || dstIdx < 0) return;
      const [moved] = items.splice(srcIdx, 1);
      items.splice(dstIdx, 0, moved);
      save(storageKey, items);
      showSaved('순서가 변경되었습니다.');
      renderFn();
    });
  });
}

/* ==========================================
   폼 유틸
   ========================================== */
window.closeForm = function(type) {
  const map = { portfolio:'portfolioForm', social:'socialForm', video:'videoForm' };
  const el = document.getElementById(map[type]);
  if (el) el.style.display = 'none';
};

function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function set(id, v) { const el = document.getElementById(id); if (el) el.value = v || ''; }
function clearForm(ids) { ids.forEach(id => set(id, '')); }
