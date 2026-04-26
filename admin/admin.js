/* ================================================
   admin.js — 관리자 패널 로직
   기본 비밀번호: daelim2024
   ================================================ */

/* Google 시트 저장 버튼 */
const saveGasBtn = document.getElementById('saveGasBtn');
if (saveGasBtn) {
  saveGasBtn.addEventListener('click', async () => {
    const inputEl = document.getElementById('s-gas-url');
    const gasUrl  = ((inputEl && inputEl.value) || '').trim();
    const msgEl   = document.getElementById('gas-save-msg');

    if (!gasUrl) {
      if (msgEl) { msgEl.style.color = '#e05252'; msgEl.textContent = 'URL을 먼저 입력해주세요.'; }
      return;
    }

    localStorage.setItem('dg_gas_url', gasUrl);
    loadEmailSettings();   /* 뱃지 즉시 갱신 */
    if (msgEl) {
      msgEl.style.color = '#3D6B4F';
      msgEl.textContent = '✅ 저장 완료! 이제 모든 기기의 상담 신청이 Google 시트에 기록됩니다.';
    }
    renderInquiryList();
  });
}

window.copyGasCode = function() {
  const code = document.getElementById('gasCode');
  if (!code) return;
  navigator.clipboard.writeText(code.textContent).then(() => {
    showSaved('Apps Script 코드가 복사되었습니다 ✓');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = code.textContent;
    document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    showSaved('코드가 복사되었습니다 ✓');
  });
};

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
    if (tab === 'inquiries') renderInquiryList();
    const titles = { dashboard:'대시보드', inquiries:'상담 신청 내역', portfolio:'시공사례 관리', social:'사회공헌 관리', videos:'동영상 관리', content:'텍스트 편집', settings:'기본 설정' };
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
  /* renderInquiryList는 탭 클릭 시 호출 — 동시 호출 충돌 방지 */
  loadSettings();
  loadEmailSettings();
  loadContentEditor();
  updateInquiryBadge();
}

/* ── 대시보드 ── */
function updateDashboard() {
  const p    = load('portfolio', DEFAULT_PORTFOLIO);
  const s    = load('social', DEFAULT_SOCIAL);
  const v    = load('videos', []).filter(v => v.youtubeId);
  const info = load('info', DEFAULT_INFO);
  const inq  = JSON.parse(localStorage.getItem('dg_submissions') || '[]');
  const newCount = inq.filter(i => i.status === '미확인').length;

  document.getElementById('dc-portfolio-count').textContent = p.length;
  document.getElementById('dc-social-count').textContent = s.length;
  document.getElementById('dc-video-count').textContent = v.length;
  document.getElementById('dc-phone').textContent = info.phone;
  document.getElementById('dc-inquiry-count').textContent = inq.length;
  const newEl = document.getElementById('dc-new-count');
  if (newEl) newEl.textContent = newCount > 0 ? `(미확인 ${newCount}건)` : '';
}

function updateInquiryBadge(n) {
  if (n === undefined) {
    const inq = JSON.parse(localStorage.getItem('dg_submissions') || '[]');
    n = inq.filter(i => i.status === '미확인').length;
  }
  const badge = document.getElementById('sbBadge');
  if (!badge) return;
  if (n > 0) { badge.textContent = n; badge.style.display = 'inline-block'; }
  else badge.style.display = 'none';
}

/* ==========================================
   상담 신청 내역 (Inquiries)
   ========================================== */
function getInquiries() {
  return JSON.parse(localStorage.getItem('dg_submissions') || '[]');
}
function saveInquiries(list) {
  localStorage.setItem('dg_submissions', JSON.stringify(list));
}

/* JSONP helper — CORS-free read from Google Apps Script */
function fetchFromGAS(url) {
  return new Promise((resolve, reject) => {
    const cbName = 'dg_cb_' + Date.now();
    const script = document.createElement('script');
    window[cbName] = (data) => {
      resolve(Array.isArray(data) ? data : []);
      delete window[cbName]; script.remove();
    };
    script.onerror = () => { reject(new Error('script load failed')); delete window[cbName]; script.remove(); };
    script.src = url + '?action=read&callback=' + cbName + '&t=' + Date.now();
    document.head.appendChild(script);
    setTimeout(() => {
      if (window[cbName]) { reject(new Error('timeout')); delete window[cbName]; script.remove(); }
    }, 20000);
  });
}

let _inqLoading = false;

/* ── 상담 신청 렌더 (Google 시트 우선, 없으면 localStorage) ── */
async function renderInquiryList() {
  if (_inqLoading) return;
  _inqLoading = true;

  const container = document.getElementById('inquiryList');
  if (!container) { _inqLoading = false; return; }

  const gasUrl = (localStorage.getItem('dg_gas_url') || (window.DG_CONFIG && window.DG_CONFIG.gasUrl) || '').trim();

  /* Google 시트 연동 안내 박스 */
  const gasBox = document.getElementById('gasSetupBox');
  if (gasBox) gasBox.style.display = gasUrl ? 'none' : 'flex';

  /* 이메일 알림 안내 박스 */
  const emailKey = ((window.DG_CONFIG && window.DG_CONFIG.w3key) || localStorage.getItem('dg_w3forms_key') || '').trim();
  const setupBox = document.getElementById('emailSetupBox');
  if (setupBox) setupBox.style.display = emailKey ? 'none' : 'flex';

  /* 로딩 표시 */
  container.innerHTML = '<div class="inq-empty">⏳ 신청 내역을 불러오는 중...</div>';

  let all = [];
  if (gasUrl) {
    /* Google 시트에서 가져오기 (JSONP — CORS 우회) */
    try {
      const remote = await fetchFromGAS(gasUrl);
      all = remote.map((item, idx) => ({
        id:      item.id || (Date.now() - idx),
        status:  String(item['상태'] || '미확인'),
        신청시각: String(item['신청시각'] || ''),
        성함:    String(item['성함']    || ''),
        연락처:  String(item['연락처']  || ''),
        부지지역: String(item['부지지역'] || ''),
        희망평형: String(item['희망평형'] || ''),
        예상예산: String(item['예상예산'] || ''),
        문의내용: String(item['문의내용'] || ''),
      }));
    } catch (err) {
      console.warn('Google 시트 조회 실패:', err);
      container.innerHTML = `<div class="inq-empty" style="color:#e05252">
        ⚠️ Google 시트에서 데이터를 불러오지 못했습니다.<br>
        <button class="btn-sm btn-outline" style="margin-top:10px" onclick="_inqLoading=false;renderInquiryList()">🔄 다시 시도</button>
      </div>`;
      _inqLoading = false;
      return;
    }
  } else {
    /* Google 시트 미연동 → localStorage */
    all = getInquiries();
  }

  /* 상태 오버레이 (관리자가 변경한 상태를 localStorage에 저장해 덮어씀) */
  const statusMap = JSON.parse(localStorage.getItem('dg_inq_status') || '{}');
  all = all.map(item => {
    const key = item.신청시각 + item.성함;
    return { ...item, status: statusMap[key] || item.status };
  });

  const fv = document.getElementById('inqFilter');
  const filter = fv ? fv.value : 'all';
  const list = filter === 'all' ? all : all.filter(i => i.status === filter);

  const newCount = all.filter(i => i.status === '미확인').length;
  const totalEl  = document.getElementById('inqTotal');
  const newEl    = document.getElementById('inqNew');
  if (totalEl) totalEl.textContent = all.length;
  if (newEl)   newEl.textContent   = newCount;

  if (!list.length) {
    container.innerHTML = `<div class="inq-empty">${all.length === 0 ? '📭 아직 상담 신청이 없습니다.' : '해당 조건의 신청이 없습니다.'}</div>`;
    updateInquiryBadge(newCount);
    _inqLoading = false;
    return;
  }

  try {
    container.innerHTML = list.map(item => {
      const statusClass = item.status === '미확인' ? 'status-new' : item.status === '처리완료' ? 'status-done' : 'status-read';
      const safeKey = encodeURIComponent(item.신청시각 + '|' + item.성함);
      return `
      <div class="inq-card ${item.status === '미확인' ? 'inq-card-new' : ''}">
        <div class="inq-card-header">
          <span class="inq-status ${statusClass}">${item.status}</span>
          <div class="inq-name-phone">
            <strong>${item.성함 || '(이름 없음)'}</strong>
            <a href="tel:${item.연락처.replace(/[^0-9]/g,'')}" class="inq-phone">📞 ${item.연락처 || '-'}</a>
          </div>
          <div class="inq-meta">
            <span>${item.신청시각}</span>
            ${item.희망평형 ? `<span class="inq-tag">${item.희망평형}</span>` : ''}
            ${item.예상예산 ? `<span class="inq-tag">${item.예상예산}</span>` : ''}
          </div>
          <div class="inq-card-actions">
            <button class="btn-sm btn-outline" onclick="this.closest('.inq-card').querySelector('.inq-detail').style.display = this.closest('.inq-card').querySelector('.inq-detail').style.display==='none'?'block':'none'">상세보기</button>
            <select class="inq-status-sel" onchange="saveInqStatus('${safeKey}', this.value, this.closest('.inq-card'))">
              <option ${item.status==='미확인'?'selected':''}>미확인</option>
              <option ${item.status==='확인완료'?'selected':''}>확인완료</option>
              <option ${item.status==='처리완료'?'selected':''}>처리완료</option>
            </select>
          </div>
        </div>
        <div class="inq-detail" style="display:none">
          <div class="inq-detail-grid">
            <div><label>부지 지역</label><span>${item.부지지역 || '-'}</span></div>
            <div><label>희망 평형</label><span>${item.희망평형 || '-'}</span></div>
            <div><label>예상 예산</label><span>${item.예상예산 || '-'}</span></div>
            <div><label>신청 시각</label><span>${item.신청시각 || '-'}</span></div>
          </div>
          ${item.문의내용 ? `<div class="inq-message"><label>문의 내용</label><p>${item.문의내용}</p></div>` : ''}
        </div>
      </div>`;
    }).join('');
  } catch(renderErr) {
    console.error('렌더 오류:', renderErr);
    container.innerHTML = `<div class="inq-empty" style="color:#e05252">
      ⚠️ 데이터 표시 중 오류가 발생했습니다.<br>
      <button class="btn-sm btn-outline" style="margin-top:10px" onclick="_inqLoading=false;renderInquiryList()">🔄 다시 시도</button>
    </div>`;
  }
  updateInquiryBadge(newCount);
  _inqLoading = false;
}

window.saveInqStatus = function(safeKey, status, card) {
  const key = decodeURIComponent(safeKey);
  const map = JSON.parse(localStorage.getItem('dg_inq_status') || '{}');
  map[key] = status;
  localStorage.setItem('dg_inq_status', JSON.stringify(map));
  const badge = card.querySelector('.inq-status');
  if (badge) {
    badge.textContent = status;
    badge.className = 'inq-status ' + (status==='미확인'?'status-new':status==='처리완료'?'status-done':'status-read');
  }
  card.classList.toggle('inq-card-new', status === '미확인');
  showSaved('상태 변경됨');
};

window.toggleInqDetail = function(id) {
  const el = document.getElementById(`inq-detail-${id}`);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.changeInqStatus = function(id, status) {
  const list = getInquiries();
  const idx  = list.findIndex(x => x.id === id);
  if (idx >= 0) { list[idx].status = status; saveInquiries(list); }
  renderInquiryList();
  updateDashboard();
  showSaved('상태가 변경되었습니다.');
};

window.deleteInq = function(id) {
  if (!confirm('이 상담 신청을 삭제할까요?')) return;
  saveInquiries(getInquiries().filter(x => x.id !== id));
  renderInquiryList();
  updateDashboard();
};

const inqFilter = document.getElementById('inqFilter');
if (inqFilter) inqFilter.addEventListener('change', renderInquiryList);

const markAllReadBtn = document.getElementById('markAllReadBtn');
if (markAllReadBtn) {
  markAllReadBtn.addEventListener('click', () => {
    const list = getInquiries().map(i => ({ ...i, status: i.status === '미확인' ? '확인완료' : i.status }));
    saveInquiries(list);
    renderInquiryList();
    updateDashboard();
    showSaved('전체 읽음 표시 완료');
  });
}

const clearInqBtn = document.getElementById('clearInqBtn');
if (clearInqBtn) {
  clearInqBtn.addEventListener('click', () => {
    if (!confirm('상담 신청 내역을 전체 삭제할까요? 복구할 수 없습니다.')) return;
    localStorage.removeItem('dg_submissions');
    renderInquiryList();
    updateDashboard();
    showSaved('전체 삭제되었습니다.');
  });
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
   이메일 알림 설정
   ========================================== */
function loadEmailSettings() {
  const embeddedKey = (window.DG_CONFIG && window.DG_CONFIG.w3key)   || '';
  const embeddedGas = (window.DG_CONFIG && window.DG_CONFIG.gasUrl)  || '';

  const key    = embeddedKey || localStorage.getItem('dg_w3forms_key') || '';
  const email  = localStorage.getItem('dg_notify_email') || '';
  /* ★ 코드에 심긴 gasUrl 우선, 없으면 localStorage */
  const gasUrl = localStorage.getItem('dg_gas_url') || embeddedGas;

  const keyEl = document.getElementById('s-w3key');
  const emEl  = document.getElementById('s-notify-email');
  const gasEl = document.getElementById('s-gas-url');
  if (keyEl) keyEl.value = key;
  if (emEl)  emEl.value  = email;
  if (gasEl) gasEl.value = gasUrl;   /* 코드에 심긴 URL 자동 표시 */

  /* 코드에 심긴 키 안내 */
  const embeddedNote = document.getElementById('embedded-key-note');
  if (embeddedNote) embeddedNote.style.display = embeddedKey ? 'block' : 'none';

  /* 이메일 뱃지 */
  const badge = document.getElementById('email-status-badge');
  if (badge) {
    if (key.trim()) {
      badge.textContent = '✓ 설정됨';
      badge.style.cssText = 'color:#3D6B4F;font-size:12px;font-weight:700;margin-left:6px';
    } else {
      badge.textContent = '미설정';
      badge.style.cssText = 'color:#e05252;font-size:12px;margin-left:6px';
    }
  }
  /* Google 시트 뱃지 — localStorage 또는 코드에 심긴 URL 모두 인정 */
  const gasBadge = document.getElementById('gas-status-badge');
  if (gasBadge) {
    if (gasUrl.trim()) {
      gasBadge.textContent = '✓ 연동됨';
      gasBadge.style.cssText = 'color:#3D6B4F;font-size:12px;font-weight:700;margin-left:6px';
    } else {
      gasBadge.textContent = '미연동';
      gasBadge.style.cssText = 'color:#e05252;font-size:12px;margin-left:6px';
    }
  }
}

document.getElementById('saveEmailBtn').addEventListener('click', () => {
  const key    = (document.getElementById('s-w3key').value || '').trim();
  const email  = (document.getElementById('s-notify-email').value || '').trim();
  const gasUrl = (document.getElementById('s-gas-url').value || '').trim();
  localStorage.setItem('dg_w3forms_key',  key);
  localStorage.setItem('dg_notify_email', email);
  localStorage.setItem('dg_gas_url',      gasUrl);
  loadEmailSettings();
  renderInquiryList();
  showSaved('설정이 저장되었습니다 ✓');
});

document.getElementById('testEmailBtn').addEventListener('click', async () => {
  const key   = (document.getElementById('s-w3key').value || '').trim();
  const email = (document.getElementById('s-notify-email').value || '').trim();
  const resEl = document.getElementById('email-test-result');
  if (!key) { if(resEl) { resEl.style.color='#e05252'; resEl.textContent='액세스 키를 먼저 입력해주세요.'; } return; }
  if(resEl) { resEl.style.color='#888'; resEl.textContent='전송 중...'; }
  try {
    const resp = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject: '[대림글로벌] 이메일 알림 테스트',
        from_name: '대림글로벌 관리자',
        '내용': '이메일 알림 설정이 정상적으로 완료되었습니다.',
        '알림받을 이메일': email || '(미입력)',
      })
    });
    const result = await resp.json();
    if (result.success) {
      if(resEl) { resEl.style.color='#3D6B4F'; resEl.textContent='✓ 테스트 이메일이 발송되었습니다! 이메일함을 확인해주세요.'; }
    } else {
      if(resEl) { resEl.style.color='#e05252'; resEl.textContent='❌ 전송 실패: 액세스 키를 다시 확인해주세요.'; }
    }
  } catch(err) {
    if(resEl) { resEl.style.color='#e05252'; resEl.textContent='❌ 네트워크 오류가 발생했습니다.'; }
  }
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
