'use strict';
// ============================================================
//  LANDPAGE SIS v3  —  app.js
//  Light theme · Big-picture first · Live Google Sheets data
// ============================================================

const SHEET_ID = '1nseJo0bqR2GgZtTMlEPYWpdT1x4zJT2DZiGTBaeVl2A';
const GAS_URL  = 'https://script.google.com/macros/s/AKfycbxVGRXyKIgrtL1M-CNO1BuHGSSl4sCCumC5fa_we2xKPhRrIOH8wLeS6UuAIyAL3Zp0/exec';

const TABS = {
  students:  'All Students - Raw Data',
  contacts:  'Contact Log',
  saturday:  'Accountability Hour',
  checkin:   'Accountability Log',
  behavior:  'Behavior Logs',
  absences:  'Absences',
  tardies:   'Tardies',
  staar:     'STAAR',
};

// ── tiny helpers ─────────────────────────────────────────────
const $  = id => document.getElementById(id);
const ic = (p,s=16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${p}</svg>`;

const P = {
  plus:    '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  ref:     '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  chev:    '<polyline points="6 9 12 15 18 9"/>',
  x:       '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  check:   '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14 9 11"/>',
  warn:    '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  mail:    '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  phone:   '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.73 19.79 19.79 0 0 1 1.62 5.06 2 2 0 0 1 3.77 3h3a2 2 0 0 1 2 1.72 13.13 13.13 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45 13.13 13.13 0 0 0 2.81.7A2 2 0 0 1 22 18v-.08z"/>',
  book:    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  video:   '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  chat:    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
};

function fmtDate(v) {
  if (!v) return '—';
  try { return new Date(v).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }
  catch { return String(v); }
}
function fmtDateTime(v) {
  if (!v) return '—';
  try { return new Date(v).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}); }
  catch { return String(v); }
}
function safe(v) { return v ?? '—'; }

// ── CSS injected at runtime ───────────────────────────────────
document.head.insertAdjacentHTML('beforeend',`<style>
@keyframes spin{to{transform:rotate(360deg)}}
.loader{display:flex;align-items:center;gap:10px;padding:36px 22px;color:var(--tx4);font-size:.85rem}
.loader svg{animation:spin 1s linear infinite;flex-shrink:0}
.empty{padding:32px;text-align:center;color:var(--tx4);font-size:.85rem}
.err-box{padding:14px 16px;color:var(--red);font-size:.82rem;background:var(--red-lo);border-radius:8px;margin:12px;display:flex;align-items:flex-start;gap:8px;line-height:1.5}
/* modal */
.m-back{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:900;backdrop-filter:blur(3px)}
.m-box{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:901;background:#fff;border:1.5px solid var(--border);border-radius:var(--rl);width:min(520px,94vw);box-shadow:var(--sh2);display:flex;flex-direction:column;max-height:90vh;animation:pgIn .2s ease}
.m-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:#FAFBFF}
.m-title{font-family:var(--head);font-weight:700;font-size:.98rem;color:var(--tx1)}
.m-body{padding:20px;overflow-y:auto;flex:1}
.m-foot{display:flex;align-items:center;justify-content:flex-end;gap:9px;padding:14px 20px;border-top:1px solid var(--border);background:#FAFBFF}
.fg{margin-bottom:16px}
.fg label{display:block;font-size:.74rem;font-weight:700;color:var(--tx2);margin-bottom:5px;letter-spacing:.02em}
.fi{width:100%;background:var(--bg-input);border:1.5px solid var(--border);border-radius:var(--rs);padding:9px 12px;font-size:.845rem;font-family:var(--ui);color:var(--tx1);outline:none;transition:border-color .15s,box-shadow .15s}
.fi:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1)}
textarea.fi{resize:vertical;min-height:72px}
/* toast */
.toast{position:fixed;bottom:22px;right:22px;z-index:1000;display:flex;align-items:center;gap:9px;padding:12px 18px;border-radius:var(--r);font-size:.845rem;font-weight:600;box-shadow:var(--sh2);animation:pgIn .22s ease}
.tg{background:var(--green);color:#fff} .tr{background:var(--red);color:#fff} .tb{background:var(--blue);color:#fff}
/* tab switcher */
.tabs{display:flex;gap:2px;background:var(--bg-input);border:1.5px solid var(--border);border-radius:var(--rs);padding:3px;margin-bottom:16px;width:fit-content}
.tab-btn{padding:6px 14px;border-radius:6px;font-size:.78rem;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--tx3);transition:all .15s}
.tab-btn.active{background:#fff;color:var(--blue);box-shadow:var(--sh0)}
/* big number highlight */
.big-num{font-family:var(--head);font-size:3rem;font-weight:800;letter-spacing:-.05em;line-height:1;color:var(--tx1)}
.big-lbl{font-size:.72rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--tx3);margin-top:5px}
</style>`);

// ── GOOGLE SHEETS FETCH ──────────────────────────────────────
async function fetchSheet(tab) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tab)}`;
  const r   = await fetch(url);
  const txt = await r.text();
  const match = txt.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
  if (!match) throw new Error('Could not parse sheet response. Check sheet permissions.');
  const json = JSON.parse(match[1]);
  if (!json.table) throw new Error('No table data returned.');
  const cols = json.table.cols.map(c => c.label || c.id);
  const rows = (json.table.rows || []).map(row =>
    Object.fromEntries(cols.map((c,i) => [c, row.c?.[i]?.v ?? null]))
  );
  return { cols, rows };
}

// ── POST (write) ─────────────────────────────────────────────
async function postRow(sheet, row) {
  if (!GAS_URL || GAS_URL.includes('YOUR_APPS_SCRIPT_WEB_APP_URL_HERE')) {
    throw new Error('Missing Apps Script Web App URL.');
  }

  const r = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ sheet, row })
  });

  const text = await r.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error('Apps Script did not return JSON. Check deployment permissions.');
  }

  if (!data || data.status !== 'ok') {
    throw new Error(data?.message || 'Apps Script could not save the row.');
  }

  return data;
}

// ── MODAL ────────────────────────────────────────────────────
function modal(title, body, onSave) {
  $('sis-modal')?.remove();
  const el = Object.assign(document.createElement('div'), {id:'sis-modal'});
  el.innerHTML = `<div class="m-back"></div><div class="m-box"><div class="m-hd"><div class="m-title">${title}</div><button class="btn btn-ghost btn-sm" id="mClose">${ic(P.x,15)}</button></div><div class="m-body">${body}</div><div class="m-foot"><button class="btn btn-ghost" id="mCancel">Cancel</button><button class="btn btn-primary" id="mSave">${ic(P.plus,14)} Save Entry</button></div></div>`;
  document.body.appendChild(el);
  const close = () => el.remove();
  el.querySelector('.m-back').onclick = close;
  $('mClose').onclick  = close;
  $('mCancel').onclick = close;
  $('mSave').onclick   = () => { $('mSave').disabled=true; $('mSave').innerHTML='Saving…'; onSave(el.querySelector('.m-body')); };
}
function closeModal() { $('sis-modal')?.remove(); }

function toast(msg, type='g') {
  $('sis-toast')?.remove();
  const t = Object.assign(document.createElement('div'), {id:'sis-toast', className:`toast t${type}`});
  t.innerHTML = `${ic(type==='g'?P.check:P.warn,15)} ${msg}`;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 3500);
}

// ── LOADING / ERROR ──────────────────────────────────────────
const loading = (msg='Loading data…') =>
  `<div class="loader">${ic(P.ref,18)} ${msg}</div>`;

const errBox = msg =>
  `<div class="err-box">${ic(P.warn,16)} <div><strong>Could not load data.</strong><br>${msg}</div></div>`;

// ── ALERT BANNER ─────────────────────────────────────────────
function banner(type, title, body) {
  const map = { blue:'a-blue', green:'a-green', amber:'a-amber', red:'a-red' };
  const ico = { blue:P.info, green:P.check, amber:P.warn, red:P.warn };
  const col = { blue:'var(--blue)', green:'var(--green)', amber:'var(--amber)', red:'var(--red)' };
  return `<div class="alert ${map[type]||'a-blue'}"><div style="flex-shrink:0;color:${col[type]};margin-top:1px">${ic(ico[type]||P.info,16)}</div><div><div class="alert-title">${title}</div><div class="alert-body">${body}</div></div></div>`;
}

// ── KPI CARD ─────────────────────────────────────────────────
function kpi(label, val, meta, color='blue', iconPath='') {
  return `<div class="kpi kpi-${color}">
    ${iconPath?`<div class="kpi-icon">${ic(iconPath,18)}</div>`:''}
    <div class="kpi-lbl">${label}</div>
    <div class="kpi-val">${val}</div>
    ${meta?`<div class="kpi-meta">${meta}</div>`:''}
  </div>`;
}

// ── TABLE ─────────────────────────────────────────────────────
function table(rows, cols) {
  // cols: [{key, label, fmt}]
  if (!rows.length) return `<div class="empty">No records found.</div>`;
  return `<div class="tbl-wrap"><table class="tbl">
    <thead><tr>${cols.map(c=>`<th>${c.label}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r=>`<tr>${cols.map((c,i)=>`<td ${i===0?'style="font-weight:700;color:var(--tx1)"':''}>${c.fmt?c.fmt(r[c.key]):safe(r[c.key])}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

// ── PROGRESS ROW ──────────────────────────────────────────────
function progRow(label, count, total, color) {
  const pct = total ? Math.round(count/total*100) : 0;
  return `<div style="margin-bottom:14px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
      <span style="font-size:.83rem;font-weight:500;color:var(--tx1)">${label}</span>
      <span style="font-size:.82rem;font-weight:700;color:var(--tx2)">${count} <span style="color:var(--tx4);font-weight:400">(${pct}%)</span></span>
    </div>
    <div class="prog"><div class="prog-fill" style="width:${pct}%;background:${color}"></div></div>
  </div>`;
}

// ── ROUTER ───────────────────────────────────────────────────
const PAGES = { dashboard, students, absences, tardies, staar, behavior, contactlog, sch, accountlog, analytics, integrations, guide, support };

function navigate(key) {
  document.querySelectorAll('.s-link').forEach(el => el.classList.toggle('active', el.dataset.page===key));
  const wrap = $('pageWrap');
  if (!wrap) return;
  wrap.style.animation='none'; void wrap.offsetHeight; wrap.style.animation='pgIn .25s ease';
  wrap.innerHTML=''; (PAGES[key]||dashboard)(wrap);
  wire(wrap); wrap.parentElement.scrollTop=0;
  if (window.innerWidth<900) { $('sidebar').classList.remove('open'); $('overlay').classList.remove('show'); }
}
function wire(root) { root.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();navigate(el.dataset.page);})); }

document.addEventListener('DOMContentLoaded', () => {
  const el=$('topDate');
  if (el) el.textContent = new Date().toLocaleDateString('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric'});
  document.querySelectorAll('.s-link').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();navigate(el.dataset.page);}));
  const ham=$('hamburger'), ov=$('overlay'), sb=$('sidebar');
  ham?.addEventListener('click',()=>{sb.classList.toggle('open');ov.classList.toggle('show');});
  ov?.addEventListener('click',()=>{sb.classList.remove('open');ov.classList.remove('show');});
  navigate('dashboard');
});

// ==============================================================
//  DASHBOARD  —  "Big Picture at a Glance"
// ==============================================================
function dashboard(c) {
  c.innerHTML = `
    <div class="ph">
      <div>
        <div class="ph-title">Good morning! Here's your campus overview.</div>
        <div class="ph-sub">Lakewood Ridge High School &nbsp;·&nbsp; Data refreshes each time you visit a page</div>
      </div>
      <div class="ph-acts">
        <button class="btn btn-ghost btn-sm" onclick="navigate('dashboard')">${ic(P.ref,14)} Refresh</button>
      </div>
    </div>

    <!-- Big KPI strip -->
    <div class="kpi-grid" id="d-kpis">
      ${kpi('Students','…','Enrolled','blue','<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>')}
      ${kpi('Behavior Entries','…','Logged this year','purple','<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>')}
      ${kpi('Contacts Logged','…','Parent & student','teal','<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.73 19.79 19.79 0 0 1 1.62 5.06 2 2 0 0 1 3.77 3h3a2 2 0 0 1 2 1.72 13.13 13.13 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45 13.13 13.13 0 0 0 2.81.7A2 2 0 0 1 22 18v-.08z"/>')}
      ${kpi('Accountability Hour','…','Assigned this year','amber','<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>')}
      ${kpi('STAAR Passed','…','Biology','green','<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>')}
      ${kpi('Check-Ins','…','Accountability log','blue','<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')}
    </div>

    <div class="g2" style="margin-bottom:18px">
      <!-- Behavior snapshot -->
      <div class="card">
        <div class="card-hd">
          <div><div class="card-title">Behavior Snapshot</div><div class="card-sub">Positive vs. negative entries this year</div></div>
          <a href="#" data-page="behavior" class="btn btn-ghost btn-sm">View All</a>
        </div>
        <div class="card-bd" id="d-beh-snap">${loading()}</div>
      </div>

      <!-- Quick add shortcuts -->
      <div class="card">
        <div class="card-hd"><div class="card-title">Quick Add</div><span class="badge b-blue">Log a new entry</span></div>
        <div class="card-bd">
          <p style="font-size:.81rem;color:var(--tx3);margin-bottom:14px">Tap any option below to open the log form for that section.</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
            ${[
              ['contactlog','b-teal','var(--teal)','Log a Contact','Contact Log'],
              ['behavior','b-purple','var(--purple)','Log Behavior','Behavior & Conduct'],
              ['saturdaysch','b-amber','var(--amber)','Accountability Hour','Assign a Student'],
              ['accountlog','b-blue','var(--blue)','Check-In / Out','Accountability Log'],
            ].map(([pg,badge,col,lbl,sub])=>`
              <button onclick="navigate('${pg}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:12px 13px;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--rs);cursor:pointer;transition:all .15s;text-align:left" onmouseover="this.style.borderColor='${col}';this.style.background='#fff'" onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--bg)'">
                <span class="badge ${badge}" style="margin-bottom:2px">${lbl}</span>
                <span style="font-size:.73rem;color:var(--tx3)">${sub}</span>
              </button>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Recent behavior table -->
    <div class="card" style="margin-bottom:18px">
      <div class="card-hd">
        <div><div class="card-title">Recent Behavior Entries</div><div class="card-sub">Latest 8 entries from the behavior log</div></div>
        <a href="#" data-page="behavior" class="btn btn-ghost btn-sm">View full log →</a>
      </div>
      <div id="d-beh-table">${loading()}</div>
    </div>

    <!-- Nav cards -->
    <div class="sec-label">All Sections</div>
    <div class="g-auto">
      ${[
        ['students',   'blue',  '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',  'Student Roster',    'All enrolled students with absence and tardy totals'],
        ['absences',   'amber', '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', 'Absences', 'Absence records and makeup time tracking'],
        ['tardies',    'red',   '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',                'Tardies',           'Tardy counts and consequence levels'],
        ['staar',      'green', '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>','STAAR Data','Assessment scores and mastery breakdown'],
        ['behavior',   'purple','<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',                            'Behavior & Conduct','Log and review all conduct entries'],
        ['contactlog', 'teal',  '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.73 19.79 19.79 0 0 1 1.62 5.06 2 2 0 0 1 3.77 3h3a2 2 0 0 1 2 1.72 13.13 13.13 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45 13.13 13.13 0 0 0 2.81.7A2 2 0 0 1 22 18v-.08z"/>','Contact Log','Parent and student contact records'],
        ['saturdaysch','amber', '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M8 18h.01M12 18h.01"/>','Accountability Hour','Assignments and attendance confirmations'],
        ['accountlog', 'blue',  '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>','Accountability Log','Check-in and check-out time records'],
        ['analytics',  'green', '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>','Analytics & Reports','Campus-wide summaries from all data'],
      ].map(([pg,col,ico,lbl,desc])=>`
        <a href="#" data-page="${pg}" style="display:flex;align-items:flex-start;gap:13px;padding:16px;background:#fff;border:1.5px solid var(--border);border-radius:var(--r);box-shadow:var(--sh0);transition:all .15s;text-decoration:none" onmouseover="this.style.borderColor='var(--border-md)';this.style.boxShadow='var(--sh1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border)';this.style.boxShadow='var(--sh0)';this.style.transform='none'">
          <div style="width:38px;height:38px;border-radius:9px;background:var(--${col}-lo);color:var(--${col});display:flex;align-items:center;justify-content:center;flex-shrink:0">${ic(ico,18)}</div>
          <div><div style="font-weight:700;font-size:.88rem;color:var(--tx1);margin-bottom:3px">${lbl}</div><div style="font-size:.76rem;color:var(--tx3);line-height:1.45">${desc}</div></div>
        </a>`).join('')}
    </div>
  `;

  Promise.all([
    fetchSheet(TABS.students),
    fetchSheet(TABS.behavior),
    fetchSheet(TABS.contacts),
    fetchSheet(TABS.saturday),
    fetchSheet(TABS.staar),
    fetchSheet(TABS.checkin),
  ]).then(([stu,beh,con,sat,staar,chk]) => {
    const passed = staar.rows.filter(r=>String(r['Biology Status']||'')==='Passed').length;
    const kpis = $('d-kpis');
    if (kpis) kpis.innerHTML =
      kpi('Students', stu.rows.length, 'Currently enrolled', 'blue', '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>') +
      kpi('Behavior Entries', beh.rows.length, 'Total logged', 'purple', '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>') +
      kpi('Contacts Logged', con.rows.length, 'Parent & student', 'teal', '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.73 19.79 19.79 0 0 1 1.62 5.06 2 2 0 0 1 3.77 3h3a2 2 0 0 1 2 1.72 13.13 13.13 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45 13.13 13.13 0 0 0 2.81.7A2 2 0 0 1 22 18v-.08z"/>') +
      kpi('Saturday School', sat.rows.length, 'Assigned this year', 'amber', '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>') +
      kpi('STAAR Passed', `${passed}/${staar.rows.length}`, 'Biology assessment', 'green', '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>') +
      kpi('Check-Ins', chk.rows.length, 'Accountability log', 'blue', '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>');

    const pos = beh.rows.filter(r=>String(r[beh.cols[2]]||'').toLowerCase().includes('pos'));
    const neg = beh.rows.filter(r=>String(r[beh.cols[2]]||'').toLowerCase().includes('neg'));
    const snap = $('d-beh-snap');
    if (snap) snap.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
        <div style="text-align:center;padding:16px;background:var(--green-lo);border-radius:var(--rs)">
          <div class="big-num" style="color:var(--green)">${pos.length}</div>
          <div class="big-lbl" style="color:var(--green)">Positive</div>
        </div>
        <div style="text-align:center;padding:16px;background:var(--red-lo);border-radius:var(--rs)">
          <div class="big-num" style="color:var(--red)">${neg.length}</div>
          <div class="big-lbl" style="color:var(--red)">Negative</div>
        </div>
      </div>
      ${progRow('Positive Recognitions', pos.length, beh.rows.length, 'var(--green)')}
      ${progRow('Negative Referrals',    neg.length, beh.rows.length, 'var(--red)')}
    `;

    const recent = beh.rows.slice(-8).reverse();
    const btEl = $('d-beh-table');
    if (btEl) btEl.innerHTML = table(recent, [
      { key: beh.cols[0], label: 'Student ID' },
      { key: beh.cols[1], label: 'Date', fmt: fmtDate },
      { key: beh.cols[2], label: 'Type', fmt: v => { const t=String(v||''); const cls=t.toLowerCase().includes('pos')?'b-green':'b-red'; return `<span class="badge ${cls}">${t||'—'}</span>`; }},
      { key: beh.cols[3], label: 'Notes' },
    ]);
  }).catch(e => {
    const k=$('d-kpis'); if(k) k.innerHTML=errBox('Could not load data. Make sure the Google Sheet is set to "Anyone with the link can view." ' + e.message);
  });
}

// ==============================================================
//  STUDENT ROSTER
// ==============================================================
function students(c) {
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">Student Roster</div><div class="ph-sub">All enrolled students · Live from Google Sheets</div></div>
    <div class="ph-acts"><button class="btn btn-ghost btn-sm" onclick="navigate('students')">${ic(P.ref,14)} Refresh</button></div></div>
    <div class="card" style="margin-bottom:16px"><div class="card-bd">
      <div class="search-row">
        <div class="sf">${ic('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input type="text" id="sq" placeholder="Search by name or student ID…"/></div>
        <select class="sel" id="sg"><option value="">All Grades</option><option>9</option><option>10</option><option>11</option><option>12</option></select>
        <button class="btn btn-ghost btn-sm" id="sRst">Reset</button>
      </div>
    </div></div>
    <div class="kpi-grid" id="s-kpis">${loading()}</div>
    <div class="card"><div class="card-hd"><div class="card-title">Student Directory</div><span class="badge b-green">Live Data</span></div><div id="s-tbl">${loading()}</div></div>`;

  let all=[], cols=[];
  fetchSheet(TABS.students).then(d=>{
    all=d.rows; cols=d.cols;
    const avgA=(all.reduce((s,r)=>s+parseFloat(r.ABSENCES||0),0)/Math.max(all.length,1)).toFixed(1);
    const avgT=(all.reduce((s,r)=>s+parseFloat(r.TARDIES||0),0)/Math.max(all.length,1)).toFixed(1);
    $('s-kpis').innerHTML=
      kpi('Total Students', all.length, 'Currently enrolled', 'blue') +
      kpi('Avg. Absences', avgA, 'Per student', 'amber') +
      kpi('Avg. Tardies', avgT, 'Per student', 'red') +
      kpi('Grade Levels', '4', '9th – 12th grade', 'teal');
    render(all);
  }).catch(e=>$('s-kpis').innerHTML=errBox(e.message));

  function render(rows) {
    $('s-tbl').innerHTML = table(rows, [
      {key:'STUDENT_ID',    label:'Student ID'},
      {key:'STUDENT_NAME',  label:'Name'},
      {key:'GRADE',         label:'Grade', fmt:v=>v!=null?`Grade ${v}`:'—'},
      {key:'STUDENT_EMAIL', label:'Email'},
      {key:'INSTRUCTOR',    label:'Instructor'},
      {key:'ABSENCES',      label:'Absences', fmt:v=>{const n=parseFloat(v||0);return`<span class="badge ${n>=8?'b-red':n>=4?'b-amber':'b-green'}">${n}</span>`;}},
      {key:'TARDIES',       label:'Tardies',  fmt:v=>{const n=parseFloat(v||0);return`<span class="badge ${n>=5?'b-red':n>=3?'b-amber':'b-green'}">${n}</span>`;}},
    ]);
  }
  function filter() {
    const q=($('sq')?.value||'').toLowerCase(), g=$('sg')?.value||'';
    render(all.filter(r=>(!q||String(r.STUDENT_NAME||'').toLowerCase().includes(q)||String(r.STUDENT_ID||'').toLowerCase().includes(q))&&(!g||String(r.GRADE||'')===g)));
  }
  $('sq')?.addEventListener('input',filter);
  $('sg')?.addEventListener('change',filter);
  $('sRst')?.addEventListener('click',()=>{$('sq').value='';$('sg').value='';render(all);});
}

// ==============================================================
//  ABSENCES
// ==============================================================
function absences(c) {
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">Absences</div><div class="ph-sub">Student absence records and makeup time tracking</div></div>
    <div class="ph-acts"><button class="btn btn-ghost btn-sm" onclick="navigate('absences')">${ic(P.ref,14)} Refresh</button></div></div>
    ${banner('amber','Absence Makeup Policy','Students may owe makeup time based on total absences. The "Hours Needed" column shows remaining time owed.')}
    <div class="kpi-grid" id="ab-kpis">${loading()}</div>
    <div class="card"><div class="card-hd"><div class="card-title">Absence Records</div><span class="badge b-teal">Live · Google Sheets</span></div>
    <div class="card-bd" style="padding-bottom:0"><div class="search-row"><div class="sf">${ic('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input id="abq" type="text" placeholder="Search student ID or name…"/></div></div></div>
    <div id="ab-tbl">${loading()}</div></div>`;

  let all=[], allCols=[];
  fetchSheet(TABS.absences).then(d=>{
    all=d.rows; allCols=d.cols;
    const withAbs=all.filter(r=>(r['ABSENCES']||0)>0);
    const hoursOwed=all.filter(r=>(r['HOURS NEEDED']||0)>0);
    $('ab-kpis').innerHTML=
      kpi('Total Records', all.length, 'In absence log', 'blue') +
      kpi('Students w/ Absences', withAbs.length, '1 or more absences', 'amber') +
      kpi('Owe Makeup Time', hoursOwed.length, 'Hours needed > 0', 'red');
    render(all);
  }).catch(e=>$('ab-kpis').innerHTML=errBox(e.message));

  function render(rows) {
    $('ab-tbl').innerHTML = table(rows,[
      {key:'STUDENT ID',   label:'Student ID'},
      {key:'STUDENT NAME', label:'Name'},
      {key:'GRADE',        label:'Grade', fmt:v=>v!=null?`Gr. ${v}`:'—'},
      {key:'ABSENCES',     label:'Absences', fmt:v=>{const n=parseFloat(v||0);return`<span class="badge ${n>=8?'b-red':n>=4?'b-amber':'b-green'}">${n}</span>`;}},
      {key:'COURSE NAME',  label:'Course'},
      {key:'INSTRUCTOR',   label:'Instructor'},
      {key:'HOURS NEEDED', label:'Hours Needed'},
      {key:'TIME SERVED',  label:'Time Served'},
    ]);
  }
  $('abq')?.addEventListener('input',function(){
    const q=this.value.toLowerCase();
    render(all.filter(r=>Object.values(r).some(v=>String(v||'').toLowerCase().includes(q))));
  });
}

// ==============================================================
//  TARDIES
// ==============================================================
function tardies(c) {
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">Tardies</div><div class="ph-sub">Tardy records and escalating consequence levels</div></div>
    <div class="ph-acts"><button class="btn btn-ghost btn-sm" onclick="navigate('tardies')">${ic(P.ref,14)} Refresh</button></div></div>
    <div class="card" style="margin-bottom:16px"><div class="card-hd"><div class="card-title">Consequence Progression</div></div>
    <div class="card-bd"><div class="cons-table">
      <div class="ct-lbl">1st Tardy</div><div class="ct-val">Verbal Warning</div>
      <div class="ct-lbl">2nd Tardy</div><div class="ct-val">Written Warning + Call Home</div>
      <div class="ct-lbl">3rd Tardy</div><div class="ct-val">All prior + 3 Before/After School Detentions</div>
      <div class="ct-lbl">4th Tardy</div><div class="ct-val">All prior + Parent Meeting</div>
      <div class="ct-lbl">5th+ Tardy</div><div class="ct-val">All prior + Office Referral</div>
    </div></div></div>
    <div class="kpi-grid" id="tr-kpis">${loading()}</div>
    <div class="card"><div class="card-hd"><div class="card-title">Tardy Records</div><span class="badge b-teal">Live · Google Sheets</span></div><div id="tr-tbl">${loading()}</div></div>`;

  fetchSheet(TABS.tardies).then(({cols,rows})=>{
    const valid=rows.filter(r=>Object.values(r).some(v=>v));
    $('tr-kpis').innerHTML=
      kpi('Total Tardy Records', valid.length, 'In tardy log', 'red') +
      kpi('At 3rd+ Tardy', valid.filter(r=>(r['Tardies']||0)>=3).length, 'Detention tier', 'amber') +
      kpi('At 5th+ Tardy', valid.filter(r=>(r['Tardies']||0)>=5).length, 'Referral tier', 'red');
    $('tr-tbl').innerHTML = table(valid,[
      {key:cols[1]||'B', label:'Student ID'},
      {key:cols[2]||'C', label:'Name'},
      {key:'Tardy',      label:'Tardy #'},
      {key:'Tardies',    label:'Total Tardies', fmt:v=>{const n=parseFloat(v||0);const cls=n>=5?'b-red':n>=3?'b-amber':n>=2?'b-blue':'b-green';return`<span class="badge ${cls}">${n}</span>`;}},
      {key:'Consequence',label:'Consequence'},
    ]);
  }).catch(e=>$('tr-kpis').innerHTML=errBox(e.message));
}

// ==============================================================
//  STAAR DATA
// ==============================================================
function staar(c) {
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">STAAR Assessment Data</div><div class="ph-sub">State assessment scores, mastery levels, and status</div></div>
    <div class="ph-acts"><button class="btn btn-ghost btn-sm" onclick="navigate('staar')">${ic(P.ref,14)} Refresh</button></div></div>
    <div class="kpi-grid" id="st-kpis">${loading()}</div>
    <div class="g2" style="margin-bottom:16px">
      <div class="card"><div class="card-hd"><div class="card-title">Mastery Breakdown</div></div><div class="card-bd" id="st-mastery">${loading()}</div></div>
      <div class="card"><div class="card-hd"><div class="card-title">Pass / Fail Overview</div></div><div class="card-bd" id="st-pf">${loading()}</div></div>
    </div>
    <div class="card"><div class="card-hd"><div class="card-title">All STAAR Records</div><span class="badge b-teal">Live · Google Sheets</span></div>
    <div class="card-bd" style="padding-bottom:0"><div class="search-row">
      <div class="sf">${ic('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input id="stq" type="text" placeholder="Search student ID…"/></div>
      <select class="sel" id="stm"><option value="">All Mastery Levels</option><option>Masters Grade Level</option><option>Meets Grade Level</option><option>Approaches Grade Level</option><option>Did Not Meet</option></select>
      <select class="sel" id="stst"><option value="">All Status</option><option>Passed</option><option>Failed</option></select>
    </div></div>
    <div id="st-tbl">${loading()}</div></div>`;

  let all=[];
  fetchSheet(TABS.staar).then(d=>{
    all=d.rows;
    const passed=all.filter(r=>String(r['Biology Status']||'')==='Passed');
    const masters=all.filter(r=>String(r['Biology Mastery']||'').includes('Masters'));
    const meets  =all.filter(r=>String(r['Biology Mastery']||'').includes('Meets'));
    const appro  =all.filter(r=>String(r['Biology Mastery']||'').includes('Approaches'));
    const dnm    =all.filter(r=>String(r['Biology Mastery']||'').includes('Did Not'));

    $('st-kpis').innerHTML=
      kpi('Total Records', all.length, 'STAAR records', 'green') +
      kpi('Passed', passed.length, 'Biology STAAR', 'green') +
      kpi('Did Not Pass', all.length-passed.length, 'Needs support', 'red') +
      kpi('Masters Level', masters.length, 'Highest mastery', 'blue');

    $('st-mastery').innerHTML=`
      ${progRow('Masters Grade Level',    masters.length, all.length, 'var(--green)')}
      ${progRow('Meets Grade Level',      meets.length,   all.length, 'var(--blue)')}
      ${progRow('Approaches Grade Level', appro.length,   all.length, 'var(--amber)')}
      ${progRow('Did Not Meet',           dnm.length,     all.length, 'var(--red)')}`;

    $('st-pf').innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div style="text-align:center;padding:20px;background:var(--green-lo);border-radius:var(--rs)">
          <div class="big-num" style="color:var(--green)">${passed.length}</div>
          <div class="big-lbl" style="color:var(--green)">Passed</div>
        </div>
        <div style="text-align:center;padding:20px;background:var(--red-lo);border-radius:var(--rs)">
          <div class="big-num" style="color:var(--red)">${all.length-passed.length}</div>
          <div class="big-lbl" style="color:var(--red)">Did Not Pass</div>
        </div>
      </div>`;

    render(all);
  }).catch(e=>$('st-kpis').innerHTML=errBox(e.message));

  function render(rows) {
    $('st-tbl').innerHTML=table(rows,[
      {key:'STUDENT ID', label:'Student ID'},
      {key:'Gr',         label:'Grade'},
      {key:'Gender',     label:'Gender'},
      {key:'Biology Score', label:'Score'},
      {key:'Biology Date/Exemption', label:'Test Date'},
      {key:'Biology Mastery', label:'Mastery', fmt:v=>{const m=String(v||'—');const cls=m.includes('Masters')?'b-green':m.includes('Meets')?'b-blue':m.includes('Approaches')?'b-amber':'b-red';return`<span class="badge ${cls}">${m}</span>`;}},
      {key:'Biology Status', label:'Status', fmt:v=>{const s=String(v||'—');return`<span class="badge ${s==='Passed'?'b-green':'b-red'}">${s}</span>`;}},
      {key:'SpecEd', label:'Spec. Ed'},
      {key:'Economic Disadvantage', label:'Econ. Disadv.'},
    ]);
  }
  function filter(){
    const q=($('stq')?.value||'').toLowerCase(), ma=$('stm')?.value||'', st=$('stst')?.value||'';
    render(all.filter(r=>(!q||String(r['STUDENT ID']||'').toLowerCase().includes(q))&&(!ma||String(r['Biology Mastery']||'')===ma)&&(!st||String(r['Biology Status']||'')===st)));
  }
  $('stq')?.addEventListener('input',filter);$('stm')?.addEventListener('change',filter);$('stst')?.addEventListener('change',filter);
}

// ==============================================================
//  BEHAVIOR & CONDUCT  (read + add)
// ==============================================================
function behavior(c) {
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">Behavior &amp; Conduct</div><div class="ph-sub">Positive recognitions and conduct referrals</div></div>
    <div class="ph-acts"><button class="btn btn-ghost btn-sm" onclick="loadBeh()">${ic(P.ref,14)} Refresh</button><button class="btn btn-primary btn-sm" id="beh-add">${ic(P.plus,14)} Log Entry</button></div></div>
    <div class="kpi-grid" id="beh-kpis">${loading()}</div>
    <div class="g2" style="margin-bottom:16px">
      <div class="card"><div class="card-hd"><div class="card-title">Positive Recognitions</div></div><div class="card-bd" style="display:flex;align-items:center;justify-content:center;min-height:120px"><div id="beh-pos-big" style="text-align:center"></div></div></div>
      <div class="card"><div class="card-hd"><div class="card-title">Conduct Referrals</div></div><div class="card-bd" style="display:flex;align-items:center;justify-content:center;min-height:120px"><div id="beh-neg-big" style="text-align:center"></div></div></div>
    </div>
    <div class="card"><div class="card-hd"><div class="card-title">Behavior Log</div><span class="badge b-teal">Live · Google Sheets</span></div>
    <div class="card-bd" style="padding-bottom:0"><div class="search-row">
      <div class="sf">${ic('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input id="bq" type="text" placeholder="Search student ID…"/></div>
      <select class="sel" id="btp"><option value="">All Types</option><option>Positive</option><option>Negative</option></select>
    </div></div>
    <div id="beh-tbl">${loading()}</div></div>`;

  let all=[], cols=[];
  window.loadBeh = function() {
    $('beh-tbl').innerHTML=loading();
    fetchSheet(TABS.behavior).then(d=>{
      all=d.rows; cols=d.cols;
      const pos=all.filter(r=>String(r[cols[2]]||'').toLowerCase().includes('pos'));
      const neg=all.filter(r=>String(r[cols[2]]||'').toLowerCase().includes('neg'));
      $('beh-kpis').innerHTML=
        kpi('Total Entries', all.length, 'All logged', 'purple') +
        kpi('Positive', pos.length, 'Recognitions', 'green') +
        kpi('Negative', neg.length, 'Referrals', 'red');
      $('beh-pos-big').innerHTML=`<div class="big-num" style="color:var(--green)">${pos.length}</div><div class="big-lbl" style="color:var(--green)">Positive Entries</div>`;
      $('beh-neg-big').innerHTML=`<div class="big-num" style="color:var(--red)">${neg.length}</div><div class="big-lbl" style="color:var(--red)">Referrals Filed</div>`;
      render(all);
    }).catch(e=>$('beh-kpis').innerHTML=errBox(e.message));
  };
  function render(rows){
    if(!cols.length) return;
    $('beh-tbl').innerHTML=table(rows,[
      {key:cols[0],label:'Student ID'},
      {key:cols[1],label:'Date',fmt:fmtDate},
      {key:cols[2],label:'Type',fmt:v=>{const t=String(v||'');const cls=t.toLowerCase().includes('pos')?'b-green':'b-red';return`<span class="badge ${cls}">${t||'—'}</span>`;}},
      {key:cols[3],label:'Notes'},
      {key:cols[4],label:'Count'},
    ]);
  }
  function filter(){const q=($('bq')?.value||'').toLowerCase(),tp=$('btp')?.value||'';render(all.filter(r=>(!q||String(r[cols[0]]||'').toLowerCase().includes(q))&&(!tp||String(r[cols[2]]||'')===tp)));}
  $('bq')?.addEventListener('input',filter);$('btp')?.addEventListener('change',filter);
  loadBeh();

  $('beh-add')?.addEventListener('click',()=>modal('Log Behavior Entry',`
    <div class="fg"><label>Student ID</label><input class="fi" id="f1" placeholder="e.g. 90000001"/></div>
    <div class="fg"><label>Date</label><input class="fi" id="f2" type="date" value="${new Date().toISOString().split('T')[0]}"/></div>
    <div class="fg"><label>Entry Type</label><select class="fi" id="f3"><option>Positive</option><option>Negative</option></select></div>
    <div class="fg"><label>Notes / Description</label><textarea class="fi" id="f4" rows="3" placeholder="Describe the behavior or recognition…"></textarea></div>`,
    async()=>{
      try{await postRow('Behavior Logs',[$('f1').value,$('f2').value,$('f3').value,$('f4').value,1]);closeModal();toast('Behavior entry logged!');loadBeh();}
      catch{toast('Could not save — check Connected Data Sources page for setup steps.','r');$('mSave').disabled=false;$('mSave').innerHTML=ic(P.plus,14)+' Save Entry';}
    }));
}

// ==============================================================
//  CONTACT LOG  (read + add)
// ==============================================================
function contactlog(c) {
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">Contact Log</div><div class="ph-sub">Parent, guardian, and student contact records</div></div>
    <div class="ph-acts"><button class="btn btn-ghost btn-sm" onclick="loadCon()">${ic(P.ref,14)} Refresh</button><button class="btn btn-primary btn-sm" id="con-add">${ic(P.plus,14)} Log Contact</button></div></div>
    <div class="kpi-grid" id="con-kpis">${loading()}</div>
    <div class="card"><div class="card-hd"><div class="card-title">Contact Records</div><span class="badge b-teal">Live · Google Sheets</span></div>
    <div class="card-bd" style="padding-bottom:0"><div class="search-row"><div class="sf">${ic('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input id="cq" type="text" placeholder="Search by student ID…"/></div></div></div>
    <div id="con-tbl">${loading()}</div></div>`;

  let all=[];
  window.loadCon=function(){
    fetchSheet(TABS.contacts).then(d=>{
      all=d.rows;
      $('con-kpis').innerHTML=kpi('Total Contacts', all.length, 'All logged contacts', 'teal');
      render(all);
    }).catch(e=>$('con-kpis').innerHTML=errBox(e.message));
  };
  function render(rows){$('con-tbl').innerHTML=table(rows,[
    {key:'Student ID',label:'Student ID'},
    {key:'Date of Contact',label:'Date',fmt:fmtDate},
    {key:'Contact',label:'Contact Type'},
    {key:'Description',label:'Description'},
  ]);}
  $('cq')?.addEventListener('input',function(){render(all.filter(r=>String(r['Student ID']||'').toLowerCase().includes(this.value.toLowerCase())));});
  loadCon();

  $('con-add')?.addEventListener('click',()=>modal('Log a Contact',`
    <div class="fg"><label>Student ID</label><input class="fi" id="f1" placeholder="e.g. 90000001"/></div>
    <div class="fg"><label>Date of Contact</label><input class="fi" id="f2" type="date" value="${new Date().toISOString().split('T')[0]}"/></div>
    <div class="fg"><label>Contact Type</label><select class="fi" id="f3"><option>Parent / Guardian</option><option>Student</option><option>Phone Call</option><option>Email</option><option>In-Person Meeting</option></select></div>
    <div class="fg"><label>Description / Notes</label><textarea class="fi" id="f4" rows="3" placeholder="Summarize the contact…"></textarea></div>`,
    async()=>{
      try{await postRow('Contact Log',[$('f1').value,$('f2').value,$('f3').value,$('f4').value]);closeModal();toast('Contact logged!');loadCon();}
      catch{toast('Could not save — check Connected Data Sources page.','r');$('mSave').disabled=false;$('mSave').innerHTML=ic(P.plus,14)+' Save Entry';}
    }));
}

// ==============================================================
//  SATURDAY SCHOOL  (read + add)
// ==============================================================
function saturdaysch(c) {
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">Saturday School</div><div class="ph-sub">Assignments, reasons, and attendance confirmations</div></div>
    <div class="ph-acts"><button class="btn btn-ghost btn-sm" onclick="loadSat()">${ic(P.ref,14)} Refresh</button><button class="btn btn-primary btn-sm" id="sat-add">${ic(P.plus,14)} Assign Student</button></div></div>
    <div class="kpi-grid" id="sat-kpis">${loading()}</div>
    <div class="card"><div class="card-hd"><div class="card-title">Saturday School Records</div><span class="badge b-teal">Live · Google Sheets</span></div>
    <div class="card-bd" style="padding-bottom:0"><div class="search-row">
      <div class="sf">${ic('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input id="satq" type="text" placeholder="Search student ID…"/></div>
      <select class="sel" id="satr"><option value="">All Reasons</option><option>Behavior</option><option>Communication Device</option><option>Attendance</option><option>Other</option></select>
      <select class="sel" id="sata"><option value="">All Status</option><option value="Yes">Attended</option><option value="No">Did Not Attend</option></select>
    </div></div>
    <div id="sat-tbl">${loading()}</div></div>`;

  let all=[];
  window.loadSat=function(){
    fetchSheet(TABS.saturday).then(d=>{
      all=d.rows;
      const att=all.filter(r=>String(r['Attended']||'').toLowerCase()==='yes');
      $('sat-kpis').innerHTML=
        kpi('Total Assignments', all.length, 'All records', 'teal') +
        kpi('Attended', att.length, 'Confirmed attendance', 'green') +
        kpi('Did Not Attend', all.length-att.length, 'Not confirmed', 'amber');
      render(all);
    }).catch(e=>$('sat-kpis').innerHTML=errBox(e.message));
  };
  function render(rows){$('sat-tbl').innerHTML=table(rows,[
    {key:'Student ID',   label:'Student ID'},
    {key:'Student Name', label:'Name'},
    {key:'Grade',        label:'Grade'},
    {key:'Date',         label:'Date',fmt:fmtDate},
    {key:'Reason',       label:'Reason'},
    {key:'Notes',        label:'Notes'},
    {key:'Minutes',      label:'Minutes'},
    {key:'Attended',     label:'Attended',fmt:v=>{const s=String(v||'—');return`<span class="badge ${s==='Yes'?'b-green':s==='No'?'b-red':'b-gray'}">${s}</span>`;}},
    {key:'Created By',   label:'Assigned By'},
  ]);}
  function filter(){const q=($('satq')?.value||'').toLowerCase(),r=$('satr')?.value||'',a=$('sata')?.value||'';
    render(all.filter(x=>(!q||String(x['Student ID']||'').toLowerCase().includes(q))&&(!r||String(x['Reason']||'')===r)&&(!a||String(x['Attended']||'')===a)));}
  $('satq')?.addEventListener('input',filter);$('satr')?.addEventListener('change',filter);$('sata')?.addEventListener('change',filter);
  loadSat();

  $('sat-add')?.addEventListener('click',()=>modal('Assign Saturday School',`
    <div class="fg"><label>Student ID</label><input class="fi" id="f1" placeholder="e.g. 90000001"/></div>
    <div class="fg"><label>Date of Saturday School</label><input class="fi" id="f2" type="date"/></div>
    <div class="fg"><label>Reason</label><select class="fi" id="f3"><option>Behavior</option><option>Communication Device</option><option>Attendance</option><option>Other</option></select></div>
    <div class="fg"><label>Other Reason (if applicable)</label><input class="fi" id="f4" placeholder="Describe if Other selected"/></div>
    <div class="fg"><label>Notes</label><textarea class="fi" id="f5" rows="2" placeholder="Additional notes…"></textarea></div>
    <div class="fg"><label>Minutes Assigned</label><input class="fi" id="f6" type="number" placeholder="e.g. 60"/></div>
    <div class="fg"><label>Assigned By (your name or email)</label><input class="fi" id="f7" placeholder="your.email@school.edu"/></div>`,
    async()=>{
      try{await postRow('Saturday School',[$('f1').value,$('f2').value,$('f3').value,$('f4').value,$('f5').value,$('f6').value,$('f7').value]);closeModal();toast('Saturday School entry saved!');loadSat();}
      catch{toast('Could not save — check Connected Data Sources page.','r');$('mSave').disabled=false;$('mSave').innerHTML=ic(P.plus,14)+' Save Entry';}
    }));
}

// ==============================================================
//  ACCOUNTABILITY LOG  (read + add)
// ==============================================================
function accountlog(c) {
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">Accountability Log</div><div class="ph-sub">Student check-in and check-out time tracking</div></div>
    <div class="ph-acts"><button class="btn btn-ghost btn-sm" onclick="loadAcc()">${ic(P.ref,14)} Refresh</button><button class="btn btn-primary btn-sm" id="acc-add">${ic(P.plus,14)} Log Check-In</button></div></div>
    <div class="kpi-grid" id="acc-kpis">${loading()}</div>
    <div class="card"><div class="card-hd"><div class="card-title">Check-In / Check-Out Log</div><span class="badge b-teal">Live · Google Sheets</span></div>
    <div class="card-bd" style="padding-bottom:0"><div class="search-row">
      <div class="sf">${ic('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input id="acq" type="text" placeholder="Search student ID…"/></div>
      <select class="sel" id="acst"><option value="">All Status</option><option>Checked Out</option><option>Checked In</option></select>
    </div></div>
    <div id="acc-tbl">${loading()}</div></div>`;

  let all=[];
  window.loadAcc=function(){
    fetchSheet(TABS.checkin).then(d=>{
      all=d.rows;
      const out=all.filter(r=>String(r['Status']||'').includes('Out'));
      $('acc-kpis').innerHTML=
        kpi('Total Entries', all.length, 'All records', 'blue') +
        kpi('Checked Out', out.length, 'Completed sessions', 'green') +
        kpi('Still Checked In', all.length-out.length, 'Active sessions', 'amber');
      render(all);
    }).catch(e=>$('acc-kpis').innerHTML=errBox(e.message));
  };
  function render(rows){$('acc-tbl').innerHTML=table(rows,[
    {key:'Student ID',    label:'Student ID'},
    {key:'Check-In Time', label:'Check-In',  fmt:fmtDateTime},
    {key:'Check-Out Time',label:'Check-Out', fmt:fmtDateTime},
    {key:'Status',        label:'Status', fmt:v=>{const s=String(v||'—');return`<span class="badge ${s.includes('Out')?'b-green':'b-amber'}">${s}</span>`;}},
    {key:'Total Time',    label:'Total Hrs', fmt:v=>v!=null?`${parseFloat(v).toFixed(2)} hrs`:'—'},
  ]);}
  function filter(){const q=($('acq')?.value||'').toLowerCase(),st=$('acst')?.value||'';
    render(all.filter(r=>(!q||String(r['Student ID']||'').toLowerCase().includes(q))&&(!st||String(r['Status']||'').includes(st))));}
  $('acq')?.addEventListener('input',filter);$('acst')?.addEventListener('change',filter);
  loadAcc();

  $('acc-add')?.addEventListener('click',()=>{
    const now=new Date().toISOString().slice(0,16);
    modal('Log Check-In / Check-Out',`
      <div class="fg"><label>Student ID</label><input class="fi" id="f1" placeholder="e.g. 90000001"/></div>
      <div class="fg"><label>Check-In Date &amp; Time</label><input class="fi" id="f2" type="datetime-local" value="${now}"/></div>
      <div class="fg"><label>Check-Out Date &amp; Time</label><input class="fi" id="f3" type="datetime-local"/></div>
      <div class="fg"><label>Status</label><select class="fi" id="f4"><option>Checked In</option><option>Checked Out</option></select></div>`,
      async()=>{
        try{
          const checkIn = $('f2').value;
          const checkOut = $('f3').value;
          let total = '';
          if (checkIn && checkOut) total = ((new Date(checkOut)-new Date(checkIn))/(1000*60*60)).toFixed(2);
          await postRow('Accountability Log',[$('f1').value,checkIn,checkOut,$('f4').value,total]);
          closeModal();toast('Accountability entry saved!');loadAcc();
        }
        catch{toast('Could not save — check Connected Data Sources page.','r');$('mSave').disabled=false;$('mSave').innerHTML=ic(P.plus,14)+' Save Entry';}
      });
  });
}

// ==============================================================
//  ANALYTICS
// ==============================================================
function analytics(c) {
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">Analytics &amp; Reports</div><div class="ph-sub">Campus-wide summaries from all connected data</div></div>
    <div class="ph-acts"><button class="btn btn-ghost btn-sm" onclick="navigate('analytics')">${ic(P.ref,14)} Refresh</button></div></div>
    <div class="kpi-grid" id="ana-kpis">${loading()}</div>
    <div class="g2">
      <div class="card"><div class="card-hd"><div class="card-title">Behavior Balance</div></div><div class="card-bd" id="ana-beh">${loading()}</div></div>
      <div class="card"><div class="card-hd"><div class="card-title">Saturday School Attendance</div></div><div class="card-bd" id="ana-sat">${loading()}</div></div>
    </div>`;

  Promise.all([
    fetchSheet(TABS.students),
    fetchSheet(TABS.behavior),
    fetchSheet(TABS.contacts),
    fetchSheet(TABS.saturday),
    fetchSheet(TABS.checkin),
  ]).then(([stu,beh,con,sat,chk])=>{
    $('ana-kpis').innerHTML=
      kpi('Students', stu.rows.length, 'Current roster', 'blue') +
      kpi('Behavior Logs', beh.rows.length, 'Total entries', 'purple') +
      kpi('Contacts', con.rows.length, 'Logged contacts', 'teal') +
      kpi('Saturday School', sat.rows.length, 'Assignments', 'amber') +
      kpi('Check-Ins', chk.rows.length, 'Accountability', 'green');

    const pos=beh.rows.filter(r=>String(r[beh.cols[2]]||'').toLowerCase().includes('pos')).length;
    const neg=beh.rows.filter(r=>String(r[beh.cols[2]]||'').toLowerCase().includes('neg')).length;
    $('ana-beh').innerHTML=`
      ${progRow('Positive Entries', pos, beh.rows.length, 'var(--green)')}
      ${progRow('Negative Entries', neg, beh.rows.length, 'var(--red)')}
      <div style="margin-top:18px;padding:12px;background:var(--bg);border-radius:var(--rs);font-size:.8rem;color:var(--tx2)">Total behavior entries reviewed: <strong>${beh.rows.length}</strong></div>`;

    const att=sat.rows.filter(r=>String(r['Attended']||'').toLowerCase()==='yes').length;
    $('ana-sat').innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
        <div style="text-align:center;padding:16px;background:var(--green-lo);border-radius:var(--rs)">
          <div class="big-num" style="color:var(--green)">${att}</div>
          <div class="big-lbl" style="color:var(--green)">Attended</div>
        </div>
        <div style="text-align:center;padding:16px;background:var(--red-lo);border-radius:var(--rs)">
          <div class="big-num" style="color:var(--red)">${sat.rows.length-att}</div>
          <div class="big-lbl" style="color:var(--red)">Did Not Attend</div>
        </div>
      </div>
      ${progRow('Attendance Rate', att, sat.rows.length, 'var(--green)')}`;

  }).catch(e=>$('ana-kpis').innerHTML=errBox(e.message));
}

// ==============================================================
//  CONNECTED DATA SOURCES
// ==============================================================
function integrations(c) {
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">Connected Data Sources</div><div class="ph-sub">Your Google Sheet powers everything in this portal</div></div></div>
    ${banner('green','Your Google Sheet is connected','All data shown in this portal is pulled live from your spreadsheet. No manual uploads needed — it refreshes every time you visit a page.')}
    <div class="sec-label" style="margin-top:8px">Your Connected Spreadsheet</div>
    <div class="card" style="margin-bottom:20px"><div class="card-bd">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:16px">
        <div style="width:50px;height:50px;background:#E8F5E9;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">📊</div>
        <div style="flex:1"><div style="font-weight:700;font-size:.95rem;color:var(--tx1)">Student Data Workbook</div><div style="font-size:.76rem;color:var(--tx3);margin-top:3px">ID: ${SHEET_ID}</div></div>
        <span class="badge b-green">● Live</span>
      </div>
      <div class="divider"></div>
      <div style="font-size:.7rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--tx4);margin-bottom:10px">Connected Sheet Tabs</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${Object.values(TABS).map(v=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)"><span class="badge b-green" style="padding:2px 6px">●</span><span style="font-size:.82rem;font-weight:500;color:var(--tx1)">${v}</span></div>`).join('')}
      </div>
    </div></div>
    <div class="sec-label">Enable Saving New Records (One-Time Setup)</div>
    <div class="card">${[
      ['Open Google Apps Script','Go to script.google.com and start a new project. Give it a name like "LandPage SIS."'],
      ['Paste the write script','Copy the script code provided by your Nexaflow administrator and paste it into the editor. Save the file.'],
      ['Deploy as a Web App','Click Deploy → New Deployment → Web App. Set "Execute as: Me" and "Who has access: Anyone." Click Deploy and copy the URL.'],
      ['Connect it to the portal','Share the URL with your Nexaflow admin to add it to the portal. All log forms — Behavior, Contact, Saturday School, and Accountability — will then write directly to your Google Sheet.'],
    ].map(([h,b],i)=>`<div class="guide-step"><div class="g-num">${i+1}</div><div><div class="g-head">${h}</div><div class="g-body">${b}</div></div></div>`).join('')}
    <div style="padding:14px 18px;background:var(--green-lo);border-top:1px solid var(--border)"><div style="font-size:.8rem;font-weight:700;color:var(--green);margin-bottom:2px">Saving Is Connected</div><div style="font-size:.77rem;color:var(--tx2)">New entries will be sent to your Google Apps Script Web App and added to the connected Google Sheet.</div></div>
    </div>`;
}

// ==============================================================
//  GUIDE
// ==============================================================
function guide(c) {
  const faqs=[
    ['Where does the data come from?','All data is pulled live from your Google Sheet each time you visit a page. Any changes made in the spreadsheet automatically appear here on refresh.'],
    ['Why does some data show dashes or blanks?','The spreadsheet uses lookup formulas in many cells. If a formula has not resolved to a real value yet, it may show as blank here. Updating the source data in the spreadsheet will fix it.'],
    ['How do I log a new record?','Pages that support adding records — Behavior, Contact Log, Saturday School, and Accountability Log — each have a button in the top right corner. Tap it to open the entry form.'],
    ['Will saved entries appear right away?','Yes. After saving, the page automatically reloads the data from your sheet. The new record will appear in the table.'],
    ['Why does the Save button not write to my sheet?','The write connection requires a one-time setup step. If saving fails, check the Apps Script deployment settings. See the Connected Data Sources page for setup steps.'],
    ['How do I search or filter records?','Every page has a search bar and filter dropdowns above the table. Type to search or select a filter — the table updates immediately.'],
    ['Can I see a single student\'s full record across all logs?','Not yet — but this is available as an upgrade. Contact Nexaflow Digital to add individual student profile pages.'],
    ['How do I change the school name or colors?','Contact the Nexaflow Digital team. Design changes are handled during onboarding or as a support request.'],
  ];
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">Quick Guide &amp; FAQ</div><div class="ph-sub">How to navigate and get the most out of your portal</div></div></div>
    <div class="sec-label">How Each Section Works</div>
    <div class="card" style="margin-bottom:20px">${[
      ['Dashboard','Your main overview. Loads key totals from all data automatically and gives you quick shortcuts to log new entries.'],
      ['Student Roster','Full list of all enrolled students. Search by name or ID, filter by grade. Absence and tardy counts are color-coded for quick scanning.'],
      ['Absences','Shows each student\'s total absences, makeup time owed, and time already served.'],
      ['Tardies','Tardy records with the consequence level for each student clearly labeled.'],
      ['STAAR Data','Assessment scores filtered by mastery level (Masters, Meets, Approaches, Did Not Meet) and pass/fail status.'],
      ['Behavior & Conduct','Log and review positive recognitions and conduct referrals. The snapshot at the top shows the positive vs. negative split at a glance.'],
      ['Contact Log','Log and review all parent and student contacts. Searchable by student ID.'],
      ['Saturday School','Assign students to Saturday school and track whether they attended. Filter by reason and status.'],
      ['Accountability Log','Log check-in and check-out times. Total hours are calculated automatically.'],
      ['Analytics','Auto-built campus summary from all your connected sheets. No setup required.'],
    ].map(([h,b],i)=>`<div class="guide-step"><div class="g-num">${i+1}</div><div><div class="g-head">${h}</div><div class="g-body">${b}</div></div></div>`).join('')}</div>
    <div class="sec-label">Frequently Asked Questions</div>
    <div class="card" id="faqCard">${faqs.map(([q,a])=>`<div class="faq-item"><div class="faq-q"><span>${q}</span>${ic(P.chev,16)}</div><div class="faq-a">${a}</div></div>`).join('')}</div>`;
  document.querySelectorAll('.faq-item').forEach(item=>item.querySelector('.faq-q').addEventListener('click',()=>{const o=item.classList.contains('open');document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));if(!o)item.classList.add('open');}));
}

// ==============================================================
//  SUPPORT
// ==============================================================
function support(c) {
  c.innerHTML=`
    <div class="ph"><div><div class="ph-title">Technical Support</div><div class="ph-sub">Resources and direct support from Nexaflow Digital</div></div></div>
    ${banner('blue','Nexaflow Digital Support','For data connections, design changes, new pages, or anything not working — reach out using any option below.')}
    <div class="g-auto" style="margin-top:18px">${[
      {ico:P.video, col:'var(--blue)',   bg:'var(--blue-lo)',   t:'Video Walkthroughs',  d:'Short tutorials covering each section of the portal — how to log entries, filter data, and read reports.'},
      {ico:P.mail,  col:'var(--teal)',   bg:'var(--teal-lo)',   t:'Email Support',       d:'Contact support@nexaflowdigital.com. We respond within one business day for all active accounts.'},
      {ico:P.book,  col:'var(--green)',  bg:'var(--green-lo)',  t:'Documentation',       d:'Written guides for every section, designed for school administrators with no technical knowledge needed.'},
      {ico:P.phone, col:'var(--amber)',  bg:'var(--amber-lo)',  t:'Schedule a Call',     d:'Book a 30-minute session with the Nexaflow team for live training or setup assistance.'},
      {ico:P.chat,  col:'var(--purple)', bg:'var(--purple-lo)', t:'Request a Feature',   d:'Need a new page, report, or data view? Submit a request and we will follow up to discuss options.'},
      {ico:P.info,  col:'var(--red)',    bg:'var(--red-lo)',    t:'Report an Issue',     d:'Something not loading correctly? Report it with the page name and what you expected to see.'},
    ].map(s=>`<div class="sup-card"><div class="sup-icon" style="background:${s.bg};color:${s.col}">${ic(s.ico,20)}</div><h3>${s.t}</h3><p>${s.d}</p></div>`).join('')}
    </div>
    <div class="divider"></div>
    <div class="sec-label">Portal Information</div>
    <div class="card"><div class="card-bd"><div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
      ${[['Portal Version','v3.0.0'],['Built By','Nexaflow Digital'],['Data Source','Google Sheets (Live)'],['Campus','Lakewood Ridge High'],['Write Mode', GAS_URL==='YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'?'Demo Mode':'Connected'],['Support','support@nexaflowdigital.com']].map(([k,v])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--border)"><span style="font-size:.8rem;color:var(--tx3)">${k}</span><span style="font-size:.8rem;font-weight:600;color:var(--tx2)">${v}</span></div>`).join('')}
    </div></div></div>`;
}
