#!/usr/bin/env node
/**
 * 대림글로벌 홈페이지 — 배포 전 자동 검증 스크립트
 * 실행: node check.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT  = __dirname;
const PASS  = '  ✅';
const FAIL  = '  ❌';
const WARN  = '  ⚠️ ';

let errors   = 0;
let warnings = 0;

function pass(msg)  { console.log(`${PASS} ${msg}`); }
function fail(msg)  { console.log(`${FAIL} ${msg}`); errors++; }
function warn(msg)  { console.log(`${WARN} ${msg}`); warnings++; }
function header(t)  { console.log(`\n【 ${t} 】`); }

/* ── 파일 읽기 헬퍼 ── */
function read(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
  catch(e) { fail(`파일을 읽을 수 없음: ${rel}`); return ''; }
}

/* ── 1. 필수 파일 존재 확인 ── */
header('필수 파일 존재 확인');
const REQUIRED_FILES = [
  'index.html',
  'css/style.css',
  'js/main.js',
  'js/content.js',
  'admin/index.html',
  'admin/admin.js',
  'admin/style.css',
];
REQUIRED_FILES.forEach(f => {
  if (fs.existsSync(path.join(ROOT, f))) pass(f);
  else fail(`없음: ${f}`);
});

/* ── 2. JS 문법 검사 ── */
header('JS 문법 검사');
const JS_FILES = ['js/main.js', 'js/content.js', 'admin/admin.js'];
const { execSync } = require('child_process');
JS_FILES.forEach(f => {
  try {
    execSync(`node --check "${path.join(ROOT, f)}"`, { stdio: 'pipe' });
    pass(`${f} — 문법 OK`);
  } catch(e) {
    fail(`${f} — 문법 오류:\n     ${e.stderr.toString().trim().split('\n')[0]}`);
  }
});

/* ── 3. HTML 내 필수 ID 존재 확인 (홈페이지) ── */
header('홈페이지 index.html — 필수 ID 확인');
const indexHtml = read('index.html');

// content.js 에서 getElementById 로 참조하는 IDs
const HOMEPAGE_IDS = [
  // 헤더/히어로
  'siteHeader', 'mobileToggle', 'mobileMenu', 'heroTitle', 'heroSub', 'heroPhone', 'heroBgImg',
  // 통계 바
  'stat1Num', 'stat1Label', 'stat2Num', 'stat2Label', 'stat3Num', 'stat3Label', 'stat4Num', 'stat4Label',
  // About
  'aboutImg', 'aboutTitle', 'aboutLead', 'aboutDesc',
  // 헨델
  'beethovenGallery', 'beethovenYT',
  // 사회공헌
  'socialActivities', 'socialFeaturedImg', 'socialFeaturedTitle', 'socialFeaturedDesc',
  'socialFeaturedTag', 'socialFeaturedGallery', 'socialFeaturedYT',
  'socialLead', 'socialStat1Num', 'socialStat1Label', 'socialStat2Num', 'socialStat2Label',
  'socialStat3Num', 'socialStat3Label', 'missionTitle', 'missionDesc',
  // 포트폴리오
  'portfolioGrid',
  // 동영상
  'videoGrid',
  // CTA / 연락처
  'ctaTitle', 'ctaDesc', 'ctaPhone',
  'contactForm', 'formDone', 'contactPhone', 'contactHours', 'contactAddr',
  // 푸터
  'footerTagline', 'footerPhone', 'footerPhone2', 'footerHours', 'footerKakao', 'footerCopyright',
  // 네비게이션
  'nav-about', 'nav-beethoven', 'nav-services', 'nav-process', 'nav-portfolio', 'nav-social', 'nav-cta',
  'mnav-about', 'mnav-beethoven', 'mnav-services', 'mnav-process', 'mnav-portfolio', 'mnav-social', 'mnav-cta',
];
HOMEPAGE_IDS.forEach(id => {
  const pattern = new RegExp(`id=["']${id}["']`);
  if (pattern.test(indexHtml)) pass(`#${id}`);
  else fail(`#${id} — index.html에 없음`);
});

/* ── 4. 관리자 패널 필수 ID 확인 ── */
header('관리자 admin/index.html — 필수 ID 확인');
const adminHtml = read('admin/index.html');

const ADMIN_IDS = [
  // 로그인
  'loginForm', 'loginPw', 'loginError',
  // 탭
  'tab-dashboard', 'tab-inquiries', 'tab-images', 'tab-handel',
  'tab-portfolio', 'tab-social', 'tab-videos', 'tab-content', 'tab-settings',
  // 대시보드
  'dc-portfolio-count', 'dc-social-count', 'dc-video-count', 'dc-phone', 'dc-inquiry-count',
  // 시공사례 폼
  'portfolioForm', 'portfolioFormTitle', 'addPortfolioBtn', 'savePortfolioBtn',
  'pf-title', 'pf-size', 'pf-type', 'pf-style', 'pf-youtube-url', 'pf-edit-id',
  'pf-drop-1', 'pf-drop-2', 'pf-drop-3', 'pf-drop-4',
  'pf-file-1', 'pf-file-2', 'pf-file-3', 'pf-file-4',
  'pf-preview-1', 'pf-preview-2', 'pf-preview-3', 'pf-preview-4',
  'pf-status-1', 'pf-status-2', 'pf-status-3', 'pf-status-4',
  'pf-img-final', 'pf-img2-final', 'pf-img3-final', 'pf-img4-final',
  // 헨델
  'tab-handel', 'saveBeethovenBtn', 'bh-youtube-url',
  'handel-drop-0', 'handel-drop-1', 'handel-drop-2',
  'handel-drop-3', 'handel-drop-4', 'handel-drop-5',
  // 사회공헌
  'socialForm', 'addSocialBtn', 'saveSocialBtn',
  // 텍스트 편집
  'saveContentBtn', 'ct-heroTitle', 'ct-heroSub', 'ct-aboutTitle',
  'ct-stat1Num', 'ct-stat1Label', 'ct-stat2Num', 'ct-stat2Label',
  'ct-stat3Num', 'ct-stat3Label', 'ct-stat4Num', 'ct-stat4Label',
  // 설정
  's-gh-token', 's-gh-branch', 's-gh-repo', 'saveGhBtn',
];
ADMIN_IDS.forEach(id => {
  const pattern = new RegExp(`id=["']${id}["']`);
  if (pattern.test(adminHtml)) pass(`#${id}`);
  else fail(`#${id} — admin/index.html에 없음`);
});

/* ── 5. admin.js가 참조하는 주요 ID가 adminHtml에 있는지 교차 확인 ── */
header('admin.js ↔ admin/index.html 교차 참조 확인');
const adminJs = read('admin/admin.js');

// getElementById('xxx') 패턴으로 추출
const refPattern = /getElementById\(['"]([^'"]+)['"]\)/g;
const refsInJs   = new Set();
let m;
while ((m = refPattern.exec(adminJs)) !== null) refsInJs.add(m[1]);

let crossOk = 0, crossMiss = 0;
refsInJs.forEach(id => {
  const inHtml = new RegExp(`id=["']${id}["']`).test(adminHtml);
  const inIndex = new RegExp(`id=["']${id}["']`).test(indexHtml);
  if (!inHtml && !inIndex) {
    // 동적으로 생성되는 IDs는 경고로 처리
    const dynamicPatterns = [/^inq-/, /^dc-/, /^ct-/, /^bh-preview-/, /^pf-preview-/, /^pf-status-/, /^handel-status-/, /^vf-/];
    if (dynamicPatterns.some(p => p.test(id))) {
      warn(`#${id} — JS 참조, HTML에 없음 (동적 생성으로 추정)`);
    } else {
      fail(`#${id} — admin.js에서 참조하지만 HTML에 없음`);
    }
    crossMiss++;
  } else {
    crossOk++;
  }
});
pass(`교차 참조 확인 완료 (발견: ${refsInJs.size}개, 매칭: ${crossOk}개)`);

/* ── 6. CSS 클래스 핵심 확인 ── */
header('CSS 핵심 클래스 확인');
const mainCss  = read('css/style.css');
const adminCss = read('admin/style.css');

const MAIN_CSS_CLASSES = [
  'stats-bar', 'stat', 'stat-sep',
  'social-featured-card', 'social-yt-btn', 'activity-card',
  'beethoven-gallery', 'portfolio-grid', 'video-grid',
  'float-call', 'btn-gold', 'btn-primary',
];
MAIN_CSS_CLASSES.forEach(cls => {
  if (mainCss.includes(`.${cls}`) || mainCss.includes(`.${cls} `)) pass(`.${cls}`);
  else fail(`.${cls} — css/style.css에 없음`);
});

const ADMIN_CSS_CLASSES = ['pf-drop-zone', 'handel-drop-zone', 'img-preview', 'edit-form', 'item-row'];
ADMIN_CSS_CLASSES.forEach(cls => {
  if (adminCss.includes(`.${cls}`)) pass(`.${cls} (admin)`);
  else fail(`.${cls} — admin/style.css에 없음`);
});

/* ── 결과 요약 ── */
console.log('\n' + '='.repeat(52));
if (errors === 0 && warnings === 0) {
  console.log('🎉 모든 검사 통과! 배포 준비 완료.');
} else if (errors === 0) {
  console.log(`✅ 오류 없음 (경고 ${warnings}건) — 배포 가능.`);
} else {
  console.log(`❌ 오류 ${errors}건, 경고 ${warnings}건 — 수정 후 배포하세요.`);
}
console.log('='.repeat(52));

process.exit(errors > 0 ? 1 : 0);
