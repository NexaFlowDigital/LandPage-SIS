'use strict';

// ============================================================
//  LANDPAGE SIS — app.js
//  Live data from Google Sheets public JSON API
//  Write operations via Google Apps Script Web App (GAS_URL)
// ============================================================

const SHEET_ID  = '1nseJo0bqR2GgZtTMlEPYWpdT1x4zJT2DZiGTBaeVl2A';
const GAS_URL   = 'https://script.google.com/macros/s/AKfycbypsBuKjz58aEbJvzQwGfHVFVIka4wfguF9YoOAXiYxpXYJEQQH_zS2fRR-QEQYhtPr/exec';

const TABS = {
  students:       'All Students - Raw Data',
  contactLog:     'Contact Log',
  saturdaySchool: 'Saturday School',
  accountLog:     'Accountability Log',
  behaviorLogs:   'Behavior Logs',
  absences:       'Absences',
  tardies:        'Tardies',
  staar:          'STAAR',
};

function $(id) { return document.getElementById(id); }
function icon(path, size=16) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${path}</svg>`; }

const I = {
  alert:   '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  check:   '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14 9 11"/>',
  chevron: '<polyline points="6 9 12 15 18 9"/>',
  dl:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  plus:    '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  mail:    '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  phone:   '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.73a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6.29 6.29z"/>',
  video:   '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  book:    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  chat:    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  x:       '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
};

function fmtDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  return isNaN(d) ? val : d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}
function fmtTime(val) {
  if (!val) return '—';
  const d = new Date(val);
  return isNaN(d) ? val : d.toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}

function alertBanner(type, title, body) {
  const cls = {amber:'a-amber',red:'a-red',green:'a-green',blue:'a-blue'}[type]||'a-blue';
  const ico = {amber:I.alert,red:I.alert,green:I.check,blue:I.info}[type]||I.info;
  const col = {amber:'var(--amber)',red:'var(--red)',green:'var(--green)',blue:'var(--accent)'}[type]||'var(--accent)';
  return `<div class="alert ${cls}"><div style="flex-shrink:0;margin-top:1px;color:${col}">${icon(ico,16)}</div><div><div class="alert-title">${title}</div><div class="alert-body">${body}</div></div></div>`;
}

function statCard(label,value,meta,color='blue') {
  return `<div class="stat-card sc-${color}"><div class="stat-label">${label}</div><div class="stat-val">${value}</div><div class="stat-meta">${meta}</div></div>`;
}

const spinCSS = document.createElement('style');
spinCSS.textContent = `
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.modal-backdrop{position:fixed;inset:0;background:rgba(15,31,61,.45);z-index:999}
.modal-box{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius-lg);width:min(520px,94vw);box-shadow:var(--shadow-lg);display:flex;flex-direction:column;max-height:90vh}
.modal-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)}
.modal-title{font-family:var(--font-head);font-weight:700;font-size:1rem;color:var(--text-hi)}
.modal-body{padding:20px;overflow-y:auto;flex:1}
.modal-foot{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:14px 20px;border-top:1px solid var(--border)}
.form-group{margin-bottom:14px}
.form-group label{display:block;font-size:0.78rem;font-weight:600;color:var(--text-md);margin-bottom:5px;letter-spacing:.02em}
.form-input{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);padding:9px 12px;font-size:0.845rem;font-family:var(--font-ui);color:var(--text-hi);outline:none;transition:border-color .15s}
.form-input:focus{border-color:var(--accent)}
textarea.form-input{resize:vertical;min-height:70px}
.toast{position:fixed;bottom:24px;right:24px;z-index:2000;display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:var(--radius);font-size:0.845rem;font-weight:600;box-shadow:var(--shadow-lg);animation:pgIn .25s ease}
.toast-green{background:var(--green);color:#fff}
.toast-red{background:var(--red);color:#fff}
`;
document.head.appendChild(spinCSS);

function loadingHTML(msg='Loading…') {
  return `<div style="display:flex;align-items:center;gap:10px;padding:36px 20px;color:var(--text-lo);font-size:.875rem"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>${msg}</div>`;
}
function errorHTML(msg) {
  return `<div style="padding:18px;color:var(--red);font-size:.845rem;background:var(--red-lo);border-radius:8px;margin:10px">${icon(I.alert,15)} ${msg}</div>`;
}

// ── GOOGLE SHEETS FETCH ──────────────────────────────────────
async function fetchSheet(tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1]);
  const cols = json.table.cols.map(c => c.label || c.id);
  const rows = (json.table.rows || []).map(r =>
    Object.fromEntries(cols.map((c,i) => [c, r.c[i]?.v ?? null]))
  );
  return { cols, rows };
}

// ── MODAL ────────────────────────────────────────────────────
function showModal(title, bodyHTML, onSubmit) {
  const old = $('sis-modal'); if(old) old.remove();
  const el = document.createElement('div');
  el.id = 'sis-modal';
  el.innerHTML = `<div class="modal-backdrop"></div><div class="modal-box"><div class="modal-head"><div class="modal-title">${title}</div><button class="icon-btn modal-close" id="modalClose">${icon(I.x,16)}</button></div><div class="modal-body">${bodyHTML}</div><div class="modal-foot"><button class="btn btn-ghost" id="modalCancel">Cancel</button><button class="btn btn-primary" id="modalSubmit">${icon(I.plus,14)} Save Entry</button></div></div>`;
  document.body.appendChild(el);
  el.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  $('modalClose').addEventListener('click', closeModal);
  $('modalCancel').addEventListener('click', closeModal);
  $('modalSubmit').addEventListener('click', () => {
    $('modalSubmit').disabled=true; $('modalSubmit').textContent='Saving…';
    onSubmit(el.querySelector('.modal-body'));
  });
}
function closeModal() { const e=$('sis-modal'); if(e) e.remove(); }
function showToast(msg, type='green') {
  const old=$('sis-toast'); if(old) old.remove();
  const t=document.createElement('div');
  t.id='sis-toast'; t.className=`toast toast-${type}`;
  t.innerHTML=`${icon(type==='green'?I.check:I.alert,15)} ${msg}`;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),3500);
}

// ── POST TO GAS ──────────────────────────────────────────────
async function postToGAS(payload) {
  if (GAS_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
    await new Promise(r=>setTimeout(r,700));
    return {status:'ok',demo:true};
  }
  const res = await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  return res.json();
}

// ── TABLE RENDERER ───────────────────────────────────────────
function renderTable(rows, colMap) {
  if (!rows.length) return `<div style="padding:28px;text-align:center;color:var(--text-lo);font-size:.845rem">No records found.</div>`;
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${colMap.map(c=>`<th>${c.label}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${colMap.map((c,i)=>`<td class="${i===0?'td-main':''}">${c.fmt?c.fmt(r[c.key]):(r[c.key]??'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

// ── ROUTER ───────────────────────────────────────────────────
const PAGES={dashboard:pageDashboard,students:pageStudents,absences:pageAbsences,tardies:pageTardies,behavior:pageBehavior,contactlog:pageContactLog,saturdaysch:pageSaturdaySchool,accountlog:pageAccountLog,staar:pageSTAAR,analytics:pageAnalytics,integrations:pageIntegrations,guide:pageGuide,support:pageSupport};

function navigate(key) {
  document.querySelectorAll('.nav-link').forEach(el=>el.classList.toggle('active',el.dataset.page===key));
  const wrap=$('pageWrap'); if(!wrap) return;
  wrap.style.animation='none'; void wrap.offsetHeight; wrap.style.animation='pgIn .28s ease';
  wrap.innerHTML=''; (PAGES[key]||pageDashboard)(wrap); wire(wrap);
  wrap.parentElement.scrollTop=0;
  if(window.innerWidth<900) closeSidebar();
}
function wire(root){root.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();navigate(el.dataset.page);}));}

document.addEventListener('DOMContentLoaded',()=>{
  const d=new Date(), el=$('topDate');
  if(el) el.textContent=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  document.querySelectorAll('.nav-link').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();navigate(el.dataset.page);}));
  const ham=$('hamburger'),overlay=$('overlay');
  if(ham) ham.addEventListener('click',()=>{$('sidebar').classList.toggle('open');overlay.classList.toggle('show');});
  if(overlay) overlay.addEventListener('click',closeSidebar);
  navigate('dashboard');
});
function closeSidebar(){$('sidebar').classList.remove('open');$('overlay').classList.remove('show');}

// ============================================================
// DASHBOARD
// ============================================================
function pageDashboard(c){
  c.innerHTML=`
    <div class="pg-head">
      <div><div class="pg-title">Campus Dashboard</div><div class="pg-sub">Lakewood Ridge High School · Academic Year 2024–25</div></div>
      <div class="pg-actions"><button class="btn btn-ghost btn-sm" id="dashRefresh">${icon(I.refresh,14)} Refresh</button></div>
    </div>
    <div id="dashStats" class="stat-row">${[1,2,3,4,5,6].map(()=>statCard('…','…','Loading','blue')).join('')}</div>
    <div class="g2" style="margin-bottom:18px">
      <div class="card">
        <div class="card-head"><div class="card-title">Quick Navigation</div></div>
        <div class="card-body">${[
          ['students','b-blue','Student Roster','All enrolled students with absence and tardy counts'],
          ['absences','b-amber','Absences','Student absence records and makeup time'],
          ['tardies','b-red','Tardies','Tardy log with consequence levels'],
          ['behavior','b-purple','Behavior & Conduct','Positive and negative behavior entries'],
          ['contactlog','b-teal','Contact Log','Parent and student contact records'],
          ['saturdaysch','b-green','Saturday School','Assignments and attendance tracking'],
          ['accountlog','b-blue','Accountability Log','Check-in and check-out records'],
          ['staar','b-green','STAAR Data','State assessment scores and mastery'],
        ].map(([pg,badge,lbl,desc])=>`<a href="#" data-page="${pg}" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)"><span style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:currentColor" class="${badge}"></span><div style="flex:1"><div style="font-weight:600;font-size:.845rem;color:var(--text-hi)">${lbl}</div><div style="font-size:.75rem;color:var(--text-lo);margin-top:1px">${desc}</div></div>${icon('<polyline points="9 18 15 12 9 6"/>',14)}</a>`).join('')}</div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">Quick Add</div><span class="badge b-blue">Log an entry</span></div>
        <div class="card-body">
          <p style="font-size:.82rem;color:var(--text-md);margin-bottom:14px">Jump straight to any log form.</p>
          ${[['contactlog','b-teal','Log a Contact'],['behavior','b-purple','Log Behavior Entry'],['saturdaysch','b-amber','Assign Saturday School'],['accountlog','b-blue','Log Check-In/Out']].map(([pg,badge,lbl])=>`<button class="btn btn-ghost btn-sm" style="width:100%;margin-bottom:8px;justify-content:flex-start" onclick="navigate('${pg}')"><span style="width:7px;height:7px;border-radius:50%;background:currentColor;flex-shrink:0" class="${badge}"></span>${lbl}</button>`).join('')}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">Recent Behavior Entries</div><a href="#" data-page="behavior" class="btn btn-ghost btn-sm">View All</a></div>
      <div id="dashBeh">${loadingHTML('Loading recent behavior entries…')}</div>
    </div>`;

  Promise.all([fetchSheet(TABS.students),fetchSheet(TABS.behaviorLogs),fetchSheet(TABS.saturdaySchool),fetchSheet(TABS.staar),fetchSheet(TABS.contactLog),fetchSheet(TABS.accountLog)])
  .then(([stu,beh,sat,staar,con,acc])=>{
    $('dashStats').innerHTML=
      statCard('Total Students',stu.rows.length,'Enrolled','blue')+
      statCard('Behavior Entries',beh.rows.length,'Total logged','purple')+
      statCard('Saturday School',sat.rows.length,'Assignments','teal')+
      statCard('Contacts Logged',con.rows.length,'Parent/student contacts','amber')+
      statCard('STAAR Records',staar.rows.length,'Assessment records','green')+
      statCard('Check-Ins Logged',acc.rows.length,'Accountability log','blue');
    const recent=beh.rows.slice(-8).reverse();
    $('dashBeh').innerHTML=recent.length?renderTable(recent,[
      {key:beh.cols[0],label:'Student ID'},
      {key:beh.cols[1],label:'Date',fmt:fmtDate},
      {key:beh.cols[2],label:'Type',fmt:v=>{const t=String(v||'');return`<span class="badge ${t.toLowerCase().includes('pos')?'b-green':'b-red'}">${t||'—'}</span>`;}},
      {key:beh.cols[3],label:'Notes'},
    ]):`<div style="padding:20px;color:var(--text-lo);font-size:.845rem">No behavior entries yet.</div>`;
  }).catch(e=>{ $('dashStats').innerHTML=errorHTML('Could not load data. Make sure the Google Sheet is set to "Anyone with the link can view." Error: '+e.message); });

  $('dashRefresh')?.addEventListener('click',()=>navigate('dashboard'));
}

// ============================================================
// STUDENTS
// ============================================================
function pageStudents(c){
  c.innerHTML=`
    <div class="pg-head"><div><div class="pg-title">Student Roster</div><div class="pg-sub">Live from your Google Sheet · All Students - Raw Data</div></div><div class="pg-actions"><button class="btn btn-ghost btn-sm" id="stuR">${icon(I.refresh,14)} Refresh</button></div></div>
    <div class="card" style="margin-bottom:18px"><div class="card-body"><div class="search-row"><div class="search-field">${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input type="text" id="stuQ" placeholder="Search name or ID…"/></div><select class="sel" id="stuG"><option value="">All Grades</option><option>9</option><option>10</option><option>11</option><option>12</option></select><button class="btn btn-ghost btn-sm" id="stuRst">Reset</button></div></div></div>
    <div id="stuStats" class="stat-row">${statCard('…','…','Loading','blue')}</div>
    <div class="card"><div class="card-head"><div class="card-title">Student Directory</div><span class="badge b-teal">Live · Google Sheets</span></div><div id="stuT">${loadingHTML()}</div></div>`;
  let all=[],cols=[];
  fetchSheet(TABS.students).then(d=>{all=d.rows;cols=d.cols;render(all);
    const avgA=(all.map(r=>parseFloat(r.ABSENCES||0)).reduce((a,b)=>a+b,0)/Math.max(all.length,1)).toFixed(1);
    const avgT=(all.map(r=>parseFloat(r.TARDIES||0)).reduce((a,b)=>a+b,0)/Math.max(all.length,1)).toFixed(1);
    $('stuStats').innerHTML=statCard('Total Students',all.length,'Enrolled','blue')+statCard('Avg Absences',avgA,'Per student','amber')+statCard('Avg Tardies',avgT,'Per student','red')+statCard('Grade Levels','4','9th–12th','teal');
  }).catch(()=>$('stuT').innerHTML=errorHTML('Could not load student data.'));
  function render(rows){$('stuT').innerHTML=renderTable(rows,[{key:'STUDENT_ID',label:'Student ID'},{key:'STUDENT_NAME',label:'Name'},{key:'GRADE',label:'Grade',fmt:v=>v!=null?`Gr. ${v}`:'—'},{key:'STUDENT_EMAIL',label:'Email'},{key:'INSTRUCTOR',label:'Instructor'},{key:'ABSENCES',label:'Absences',fmt:v=>v??'0'},{key:'TARDIES',label:'Tardies',fmt:v=>v??'0'}]);}
  function filter(){const q=($('stuQ')?.value||'').toLowerCase(),g=$('stuG')?.value||'';render(all.filter(r=>(!q||String(r.STUDENT_NAME||'').toLowerCase().includes(q)||String(r.STUDENT_ID||'').toLowerCase().includes(q))&&(!g||String(r.GRADE||'')===g)));}
  $('stuQ')?.addEventListener('input',filter);
  $('stuG')?.addEventListener('change',filter);
  $('stuRst')?.addEventListener('click',()=>{if($('stuQ'))$('stuQ').value='';if($('stuG'))$('stuG').value='';render(all);});
  $('stuR')?.addEventListener('click',()=>navigate('students'));
}

// ============================================================
// ABSENCES
// ============================================================
function pageAbsences(c){
  c.innerHTML=`<div class="pg-head"><div><div class="pg-title">Absences</div><div class="pg-sub">Absence records and makeup time tracking</div></div><div class="pg-actions"><button class="btn btn-ghost btn-sm" id="absR">${icon(I.refresh,14)} Refresh</button></div></div>
    ${alertBanner('amber','Absence Hours Policy','Students may owe makeup time based on absences over the threshold. "Hours Needed" shows time owed.')}
    <div id="absStats" class="stat-row">${statCard('…','…','Loading','amber')}</div>
    <div class="card"><div class="card-body" style="padding-bottom:0"><div class="search-row"><div class="search-field">${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input type="text" id="absQ" placeholder="Search student ID…"/></div></div></div>
    <div class="card-head" style="background:var(--bg-card)"><div class="card-title">Absence Records</div><span class="badge b-teal">Live · Google Sheets</span></div><div id="absT">${loadingHTML()}</div></div>`;
  let all=[],cols=[];
  fetchSheet(TABS.absences).then(d=>{all=d.rows;cols=d.cols;render(all);
    $('absStats').innerHTML=statCard('Total Records',all.length,'In absence log','amber')+statCard('With Absences',all.filter(r=>(r['ABSENCES']||0)>0).length,'Students w/ 1+','red');
  }).catch(()=>$('absT').innerHTML=errorHTML('Could not load absence data.'));
  function render(rows){$('absT').innerHTML=renderTable(rows,[{key:'STUDENT ID',label:'Student ID'},{key:'STUDENT NAME',label:'Name'},{key:'GRADE',label:'Grade',fmt:v=>v!=null?`Gr. ${v}`:'—'},{key:'ABSENCES',label:'Total Absences'},{key:'COURSE NAME',label:'Course'},{key:'INSTRUCTOR',label:'Instructor'},{key:'HOURS NEEDED',label:'Hours Needed'},{key:'TIME SERVED',label:'Time Served'}]);}
  $('absQ')?.addEventListener('input',function(){const q=this.value.toLowerCase();render(all.filter(r=>Object.values(r).some(v=>String(v||'').toLowerCase().includes(q))));});
  $('absR')?.addEventListener('click',()=>navigate('absences'));
}

// ============================================================
// TARDIES
// ============================================================
function pageTardies(c){
  c.innerHTML=`<div class="pg-head"><div><div class="pg-title">Tardies</div><div class="pg-sub">Tardy records and consequence progression</div></div><div class="pg-actions"><button class="btn btn-ghost btn-sm" id="tarR">${icon(I.refresh,14)} Refresh</button></div></div>
    <div id="tarStats" class="stat-row">${statCard('…','…','Loading','red')}</div>
    <div class="card" style="margin-bottom:18px"><div class="card-head"><div class="card-title">Consequence Chart</div></div><div class="card-body"><div style="display:grid;grid-template-columns:90px 1fr;gap:8px;font-size:.82rem">${[['1st Tardy','Verbal Warning'],['2nd Tardy','Written Warning & Call Home'],['3rd Tardy','All prior + 3 Before/After School Detentions'],['4th Tardy','All prior + Parent Meeting'],['5th+ Tardy','All prior + Office Referral']].map(([t,d])=>`<div style="font-weight:700;color:var(--text-hi)">${t}</div><div style="color:var(--text-md)">${d}</div>`).join('')}</div></div></div>
    <div class="card"><div class="card-head"><div class="card-title">Tardy Records</div><span class="badge b-teal">Live · Google Sheets</span></div><div id="tarT">${loadingHTML()}</div></div>`;
  fetchSheet(TABS.tardies).then(({cols,rows})=>{
    const valid=rows.filter(r=>Object.values(r).some(v=>v));
    $('tarStats').innerHTML=statCard('Total Records',valid.length,'In tardy log','red');
    $('tarT').innerHTML=renderTable(valid,[{key:cols[1]||'Student ID',label:'Student ID'},{key:cols[2]||'Name',label:'Name'},{key:'Tardy',label:'Tardy #'},{key:'Consequence',label:'Consequence'},{key:'Tardies',label:'Total'}]);
  }).catch(()=>$('tarT').innerHTML=errorHTML('Could not load tardy data.'));
  $('tarR')?.addEventListener('click',()=>navigate('tardies'));
}

// ============================================================
// BEHAVIOR LOGS  (read + add)
// ============================================================
function pageBehavior(c){
  c.innerHTML=`<div class="pg-head"><div><div class="pg-title">Behavior & Conduct</div><div class="pg-sub">Positive recognitions and conduct referrals</div></div><div class="pg-actions"><button class="btn btn-ghost btn-sm" id="behR">${icon(I.refresh,14)} Refresh</button><button class="btn btn-primary btn-sm" id="behA">${icon(I.plus,14)} Log Entry</button></div></div>
    <div id="behStats" class="stat-row">${statCard('…','…','Loading','purple')}</div>
    <div class="card"><div class="card-body" style="padding-bottom:0"><div class="search-row"><div class="search-field">${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input type="text" id="behQ" placeholder="Search student ID…"/></div><select class="sel" id="behTp"><option value="">All Types</option><option>Positive</option><option>Negative</option></select></div></div>
    <div class="card-head" style="background:var(--bg-card)"><div class="card-title">Behavior Log</div><span class="badge b-teal">Live · Google Sheets</span></div><div id="behT">${loadingHTML()}</div></div>`;
  let all=[],cols=[];
  function load(){fetchSheet(TABS.behaviorLogs).then(d=>{all=d.rows;cols=d.cols;const pos=all.filter(r=>String(r[cols[2]]||'').toLowerCase().includes('pos'));const neg=all.filter(r=>String(r[cols[2]]||'').toLowerCase().includes('neg'));$('behStats').innerHTML=statCard('Total',all.length,'All entries','purple')+statCard('Positive',pos.length,'Recognitions','green')+statCard('Negative',neg.length,'Referrals','red');render(all);}).catch(()=>$('behT').innerHTML=errorHTML('Could not load behavior data.'));}
  function render(rows){if(!cols.length)return;$('behT').innerHTML=renderTable(rows,[{key:cols[0],label:'Student ID'},{key:cols[1],label:'Date',fmt:fmtDate},{key:cols[2],label:'Type',fmt:v=>{const t=String(v||'');return`<span class="badge ${t.toLowerCase().includes('pos')?'b-green':'b-red'}">${t||'—'}</span>`;}},{key:cols[3],label:'Notes'},{key:cols[4],label:'Count'}]);}
  function filter(){const q=($('behQ')?.value||'').toLowerCase(),tp=$('behTp')?.value||'';render(all.filter(r=>(!q||String(r[cols[0]]||'').toLowerCase().includes(q))&&(!tp||String(r[cols[2]]||'')===tp)));}
  $('behQ')?.addEventListener('input',filter);$('behTp')?.addEventListener('change',filter);$('behR')?.addEventListener('click',load);
  $('behA')?.addEventListener('click',()=>showModal('Log Behavior Entry',`
    <div class="form-group"><label>Student ID</label><input class="form-input" id="f_sid" placeholder="e.g. 90000001"/></div>
    <div class="form-group"><label>Date</label><input class="form-input" id="f_date" type="date" value="${new Date().toISOString().split('T')[0]}"/></div>
    <div class="form-group"><label>Entry Type</label><select class="form-input" id="f_type"><option>Positive</option><option>Negative</option></select></div>
    <div class="form-group"><label>Notes</label><textarea class="form-input" id="f_notes" rows="3" placeholder="Describe the behavior or recognition…"></textarea></div>
  `,async(body)=>{try{await postToGAS({sheet:'Behavior Logs',row:[$('f_sid').value,$('f_date').value,$('f_type').value,$('f_notes').value,1]});closeModal();showToast('Behavior entry logged!');load();}catch(e){showToast('Could not save. See Connected Data Sources page for setup.','red');$('modalSubmit').disabled=false;$('modalSubmit').innerHTML=icon(I.plus,14)+' Save Entry';}}));
  load();
}

// ============================================================
// CONTACT LOG  (read + add)
// ============================================================
function pageContactLog(c){
  c.innerHTML=`<div class="pg-head"><div><div class="pg-title">Contact Log</div><div class="pg-sub">Parent, guardian, and student contact records</div></div><div class="pg-actions"><button class="btn btn-ghost btn-sm" id="conR">${icon(I.refresh,14)} Refresh</button><button class="btn btn-primary btn-sm" id="conA">${icon(I.plus,14)} Log Contact</button></div></div>
    <div id="conStats" class="stat-row">${statCard('…','…','Loading','teal')}</div>
    <div class="card"><div class="card-body" style="padding-bottom:0"><div class="search-row"><div class="search-field">${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input type="text" id="conQ" placeholder="Search student ID…"/></div></div></div>
    <div class="card-head" style="background:var(--bg-card)"><div class="card-title">Contact Records</div><span class="badge b-teal">Live · Google Sheets</span></div><div id="conT">${loadingHTML()}</div></div>`;
  let all=[];
  function load(){fetchSheet(TABS.contactLog).then(d=>{all=d.rows;$('conStats').innerHTML=statCard('Total Contacts',all.length,'All logged contacts','teal');render(all);}).catch(()=>$('conT').innerHTML=errorHTML('Could not load contact log.'));}
  function render(rows){$('conT').innerHTML=renderTable(rows,[{key:'Student ID',label:'Student ID'},{key:'Date of Contact',label:'Date',fmt:fmtDate},{key:'Contact',label:'Contact Type'},{key:'Description',label:'Description'}]);}
  $('conQ')?.addEventListener('input',function(){render(all.filter(r=>String(r['Student ID']||'').toLowerCase().includes(this.value.toLowerCase())));});
  $('conR')?.addEventListener('click',load);
  $('conA')?.addEventListener('click',()=>showModal('Log a Contact',`
    <div class="form-group"><label>Student ID</label><input class="form-input" id="f_sid" placeholder="e.g. 90000001"/></div>
    <div class="form-group"><label>Date of Contact</label><input class="form-input" id="f_date" type="date" value="${new Date().toISOString().split('T')[0]}"/></div>
    <div class="form-group"><label>Contact Type</label><select class="form-input" id="f_contact"><option>Parent / Guardian</option><option>Student</option><option>Phone Call</option><option>Email</option><option>In-Person Meeting</option></select></div>
    <div class="form-group"><label>Description / Notes</label><textarea class="form-input" id="f_desc" rows="3" placeholder="Summarize the contact…"></textarea></div>
  `,async(body)=>{try{await postToGAS({sheet:'Contact Log',row:[$('f_sid').value,$('f_date').value,$('f_contact').value,$('f_desc').value]});closeModal();showToast('Contact logged!');load();}catch(e){showToast('Could not save. See Connected Data Sources page for setup.','red');$('modalSubmit').disabled=false;$('modalSubmit').innerHTML=icon(I.plus,14)+' Save Entry';}}));
  load();
}

// ============================================================
// SATURDAY SCHOOL  (read + add)
// ============================================================
function pageSaturdaySchool(c){
  c.innerHTML=`<div class="pg-head"><div><div class="pg-title">Saturday School</div><div class="pg-sub">Assignments, reasons, and attendance confirmation</div></div><div class="pg-actions"><button class="btn btn-ghost btn-sm" id="satR">${icon(I.refresh,14)} Refresh</button><button class="btn btn-primary btn-sm" id="satA">${icon(I.plus,14)} Assign Student</button></div></div>
    <div id="satStats" class="stat-row">${statCard('…','…','Loading','teal')}</div>
    <div class="card"><div class="card-body" style="padding-bottom:0"><div class="search-row"><div class="search-field">${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input type="text" id="satQ" placeholder="Search student ID…"/></div><select class="sel" id="satRsn"><option value="">All Reasons</option><option>Behavior</option><option>Communication Device</option><option>Attendance</option><option>Other</option></select></div></div>
    <div class="card-head" style="background:var(--bg-card)"><div class="card-title">Saturday School Records</div><span class="badge b-teal">Live · Google Sheets</span></div><div id="satT">${loadingHTML()}</div></div>`;
  let all=[];
  function load(){fetchSheet(TABS.saturdaySchool).then(d=>{all=d.rows;const att=all.filter(r=>String(r['Attended']||'').toLowerCase()==='yes').length;$('satStats').innerHTML=statCard('Total',all.length,'Assignments','teal')+statCard('Attended',att,'Confirmed','green')+statCard('Pending',all.length-att,'Not confirmed','amber');render(all);}).catch(()=>$('satT').innerHTML=errorHTML('Could not load Saturday School data.'));}
  function render(rows){$('satT').innerHTML=renderTable(rows,[{key:'Student ID',label:'Student ID'},{key:'Student Name',label:'Name'},{key:'Grade',label:'Grade'},{key:'Date',label:'Date',fmt:fmtDate},{key:'Reason',label:'Reason'},{key:'Notes',label:'Notes'},{key:'Minutes',label:'Mins'},{key:'Attended',label:'Attended',fmt:v=>{const s=String(v||'—');return`<span class="badge ${s==='Yes'?'b-green':s==='No'?'b-red':'b-amber'}">${s}</span>`;}},{key:'Created By',label:'Assigned By'}]);}
  function filter(){const q=($('satQ')?.value||'').toLowerCase(),rsn=$('satRsn')?.value||'';render(all.filter(r=>(!q||String(r['Student ID']||'').toLowerCase().includes(q))&&(!rsn||String(r['Reason']||'')===rsn)));}
  $('satQ')?.addEventListener('input',filter);$('satRsn')?.addEventListener('change',filter);$('satR')?.addEventListener('click',load);
  $('satA')?.addEventListener('click',()=>showModal('Assign Saturday School',`
    <div class="form-group"><label>Student ID</label><input class="form-input" id="f_sid" placeholder="e.g. 90000001"/></div>
    <div class="form-group"><label>Date of Saturday School</label><input class="form-input" id="f_date" type="date"/></div>
    <div class="form-group"><label>Reason</label><select class="form-input" id="f_reason"><option>Behavior</option><option>Communication Device</option><option>Attendance</option><option>Other</option></select></div>
    <div class="form-group"><label>Other Reason (if applicable)</label><input class="form-input" id="f_other" placeholder="Describe if Other selected"/></div>
    <div class="form-group"><label>Notes</label><textarea class="form-input" id="f_notes" rows="2" placeholder="Additional notes…"></textarea></div>
    <div class="form-group"><label>Minutes Assigned</label><input class="form-input" id="f_mins" type="number" placeholder="e.g. 60"/></div>
    <div class="form-group"><label>Assigned By (your name or email)</label><input class="form-input" id="f_by" placeholder="your.name@school.edu"/></div>
  `,async(body)=>{try{await postToGAS({sheet:'Saturday School',row:[$('f_sid').value,$('f_date').value,$('f_reason').value,$('f_other').value,$('f_notes').value,$('f_mins').value,$('f_by').value]});closeModal();showToast('Saturday School entry saved!');load();}catch(e){showToast('Could not save. See Connected Data Sources page for setup.','red');$('modalSubmit').disabled=false;$('modalSubmit').innerHTML=icon(I.plus,14)+' Save Entry';}}));
  load();
}

// ============================================================
// ACCOUNTABILITY LOG  (read + add)
// ============================================================
function pageAccountLog(c){
  c.innerHTML=`<div class="pg-head"><div><div class="pg-title">Accountability Log</div><div class="pg-sub">Student check-in and check-out time tracking</div></div><div class="pg-actions"><button class="btn btn-ghost btn-sm" id="accR">${icon(I.refresh,14)} Refresh</button><button class="btn btn-primary btn-sm" id="accA">${icon(I.plus,14)} Log Check-In</button></div></div>
    <div id="accStats" class="stat-row">${statCard('…','…','Loading','blue')}</div>
    <div class="card"><div class="card-body" style="padding-bottom:0"><div class="search-row"><div class="search-field">${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input type="text" id="accQ" placeholder="Search student ID…"/></div><select class="sel" id="accSt"><option value="">All Status</option><option>Checked Out</option><option>Checked In</option></select></div></div>
    <div class="card-head" style="background:var(--bg-card)"><div class="card-title">Check-In / Check-Out Log</div><span class="badge b-teal">Live · Google Sheets</span></div><div id="accT">${loadingHTML()}</div></div>`;
  let all=[];
  function load(){fetchSheet(TABS.accountLog).then(d=>{all=d.rows;const out=all.filter(r=>String(r['Status']||'').includes('Out')).length;$('accStats').innerHTML=statCard('Total Entries',all.length,'All records','blue')+statCard('Checked Out',out,'Completed','green')+statCard('Still In',all.length-out,'Active','amber');render(all);}).catch(()=>$('accT').innerHTML=errorHTML('Could not load accountability log.'));}
  function render(rows){$('accT').innerHTML=renderTable(rows,[{key:'Student ID',label:'Student ID'},{key:'Check-In Time',label:'Check-In',fmt:fmtTime},{key:'Check-Out Time',label:'Check-Out',fmt:fmtTime},{key:'Status',label:'Status',fmt:v=>{const s=String(v||'—');return`<span class="badge ${s.includes('Out')?'b-green':'b-amber'}">${s}</span>`;}},{key:'Total Time',label:'Total Hrs',fmt:v=>v!=null?`${parseFloat(v).toFixed(2)} hrs`:'—'}]);}
  function filter(){const q=($('accQ')?.value||'').toLowerCase(),st=$('accSt')?.value||'';render(all.filter(r=>(!q||String(r['Student ID']||'').toLowerCase().includes(q))&&(!st||String(r['Status']||'').includes(st))));}
  $('accQ')?.addEventListener('input',filter);$('accSt')?.addEventListener('change',filter);$('accR')?.addEventListener('click',load);
  $('accA')?.addEventListener('click',()=>{const now=new Date().toISOString().slice(0,16);showModal('Log Check-In / Check-Out',`
    <div class="form-group"><label>Student ID</label><input class="form-input" id="f_sid" placeholder="e.g. 90000001"/></div>
    <div class="form-group"><label>Check-In Time</label><input class="form-input" id="f_in" type="datetime-local" value="${now}"/></div>
    <div class="form-group"><label>Check-Out Time (leave blank if still checked in)</label><input class="form-input" id="f_out" type="datetime-local"/></div>
    <div class="form-group"><label>Status</label><select class="form-input" id="f_status"><option>Checked In</option><option>Checked Out</option></select></div>
  `,async(body)=>{const inT=$('f_in').value,outT=$('f_out').value,hrs=(inT&&outT)?((new Date(outT)-new Date(inT))/3600000).toFixed(2):'';try{await postToGAS({sheet:'Accountability Log',row:[$('f_sid').value,inT,outT,$('f_status').value,hrs]});closeModal();showToast('Check-in logged!');load();}catch(e){showToast('Could not save. See Connected Data Sources page for setup.','red');$('modalSubmit').disabled=false;$('modalSubmit').innerHTML=icon(I.plus,14)+' Save Entry';}});});
  load();
}

// ============================================================
// STAAR
// ============================================================
function pageSTAAR(c){
  c.innerHTML=`<div class="pg-head"><div><div class="pg-title">STAAR Assessment Data</div><div class="pg-sub">State assessment scores, mastery levels, and pass/fail status</div></div><div class="pg-actions"><button class="btn btn-ghost btn-sm" id="stR">${icon(I.refresh,14)} Refresh</button></div></div>
    <div id="stStats" class="stat-row">${statCard('…','…','Loading','green')}</div>
    <div class="card"><div class="card-body" style="padding-bottom:0"><div class="search-row"><div class="search-field">${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',15)}<input type="text" id="stQ" placeholder="Search student ID…"/></div><select class="sel" id="stM"><option value="">All Mastery Levels</option><option>Masters Grade Level</option><option>Meets Grade Level</option><option>Approaches Grade Level</option><option>Did Not Meet</option></select><select class="sel" id="stSt"><option value="">All Status</option><option>Passed</option><option>Failed</option></select></div></div>
    <div class="card-head" style="background:var(--bg-card)"><div class="card-title">STAAR Records</div><span class="badge b-teal">Live · Google Sheets</span></div><div id="stT">${loadingHTML()}</div></div>`;
  let all=[];
  function load(){fetchSheet(TABS.staar).then(d=>{all=d.rows;const passed=all.filter(r=>String(r['Biology Status']||'')==='Passed').length;$('stStats').innerHTML=statCard('Total Records',all.length,'STAAR records','green')+statCard('Passed',passed,'Biology STAAR','teal')+statCard('Did Not Pass',all.length-passed,'Needs support','amber')+statCard('Masters Level',all.filter(r=>String(r['Biology Mastery']||'').includes('Masters')).length,'Highest mastery','blue');render(all);}).catch(()=>$('stT').innerHTML=errorHTML('Could not load STAAR data.'));}
  function render(rows){$('stT').innerHTML=renderTable(rows,[{key:'STUDENT ID',label:'Student ID'},{key:'Gr',label:'Grade'},{key:'Gender',label:'Gender'},{key:'Economic Disadvantage',label:'Econ. Disadv.'},{key:'SpecEd',label:'Spec. Ed'},{key:'Biology Score',label:'Score'},{key:'Biology Date/Exemption',label:'Test Date'},{key:'Biology Mastery',label:'Mastery',fmt:v=>{const m=String(v||'—'),cls=m.includes('Masters')?'b-green':m.includes('Meets')?'b-blue':m.includes('Approaches')?'b-amber':'b-red';return`<span class="badge ${cls}">${m}</span>`;}},{key:'Biology Status',label:'Status',fmt:v=>{const s=String(v||'—');return`<span class="badge ${s==='Passed'?'b-green':'b-red'}">${s}</span>`;}}]);}
  function filter(){const q=($('stQ')?.value||'').toLowerCase(),ma=$('stM')?.value||'',st=$('stSt')?.value||'';render(all.filter(r=>(!q||String(r['STUDENT ID']||'').toLowerCase().includes(q))&&(!ma||String(r['Biology Mastery']||'')===ma)&&(!st||String(r['Biology Status']||'')===st)));}
  $('stQ')?.addEventListener('input',filter);$('stM')?.addEventListener('change',filter);$('stSt')?.addEventListener('change',filter);$('stR')?.addEventListener('click',load);
  load();
}

// ============================================================
// ANALYTICS
// ============================================================
function pageAnalytics(c){
  c.innerHTML=`<div class="pg-head"><div><div class="pg-title">Analytics & Reports</div><div class="pg-sub">Campus-wide summaries from all connected sheets</div></div><div class="pg-actions"><button class="btn btn-ghost btn-sm" id="anaR">${icon(I.refresh,14)} Refresh</button></div></div>
    <div id="anaStats" class="stat-row">${[1,2,3,4,5,6].map(()=>statCard('…','…','Loading','blue')).join('')}</div>
    <div class="g2" style="margin-bottom:18px">
      <div class="card"><div class="card-head"><div class="card-title">STAAR Mastery Breakdown</div></div><div id="staarB">${loadingHTML()}</div></div>
      <div class="card"><div class="card-head"><div class="card-title">Behavior Summary</div></div><div id="behB">${loadingHTML()}</div></div>
    </div>
    <div class="card"><div class="card-head"><div class="card-title">Saturday School — Reasons</div></div><div id="satB">${loadingHTML()}</div></div>`;

  Promise.all([fetchSheet(TABS.students),fetchSheet(TABS.behaviorLogs),fetchSheet(TABS.saturdaySchool),fetchSheet(TABS.staar),fetchSheet(TABS.contactLog),fetchSheet(TABS.accountLog)])
  .then(([stu,beh,sat,staar,con,acc])=>{
    const pos=beh.rows.filter(r=>String(r[beh.cols[2]]||'').toLowerCase().includes('pos'));
    const neg=beh.rows.filter(r=>String(r[beh.cols[2]]||'').toLowerCase().includes('neg'));
    const passed=staar.rows.filter(r=>String(r['Biology Status']||'')==='Passed');
    $('anaStats').innerHTML=statCard('Students',stu.rows.length,'Enrolled','blue')+statCard('Behavior Entries',beh.rows.length,'Total','purple')+statCard('Recognitions',pos.length,'Positive','green')+statCard('Saturday School',sat.rows.length,'Assignments','teal')+statCard('Contacts',con.rows.length,'Logged','amber')+statCard('STAAR Passed',`${passed.length}/${staar.rows.length}`,'Biology','green');
    const mastery={};staar.rows.forEach(r=>{const m=String(r['Biology Mastery']||'Unknown');mastery[m]=(mastery[m]||0)+1;});
    const mColors={'Masters Grade Level':'b-green','Meets Grade Level':'b-blue','Approaches Grade Level':'b-amber'};
    $('staarB').innerHTML=`<div class="card-body">`+Object.entries(mastery).map(([m,cnt])=>{const pct=staar.rows.length?Math.round(cnt/staar.rows.length*100):0,cls=mColors[m]||'b-red',col=cls.includes('green')?'var(--green)':cls.includes('blue')?'var(--accent)':cls.includes('amber')?'var(--amber)':'var(--red)';return`<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span class="badge ${cls}">${m}</span><span style="font-size:.82rem;font-weight:600;color:var(--text-hi)">${cnt} (${pct}%)</span></div><div class="prog"><div class="prog-fill" style="width:${pct}%;background:${col}"></div></div></div>`;}).join('')+`</div>`;
    $('behB').innerHTML=`<div class="card-body">`+[['Positive Recognitions',pos.length,'b-green','var(--green)'],['Negative Referrals',neg.length,'b-red','var(--red)']].map(([lbl,cnt,cls,col])=>{const pct=beh.rows.length?Math.round(cnt/beh.rows.length*100):0;return`<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span class="badge ${cls}">${lbl}</span><span style="font-size:.82rem;font-weight:600;color:var(--text-hi)">${cnt} (${pct}%)</span></div><div class="prog"><div class="prog-fill" style="width:${pct}%;background:${col}"></div></div></div>`;}).join('')+`</div>`;
    const reasons={};sat.rows.forEach(r=>{const re=String(r['Reason']||'Other');reasons[re]=(reasons[re]||0)+1;});
    $('satB').innerHTML=`<div class="card-body">`+Object.entries(reasons).sort((a,b)=>b[1]-a[1]).map(([r,cnt])=>{const pct=sat.rows.length?Math.round(cnt/sat.rows.length*100):0;return`<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.82rem;font-weight:500;color:var(--text-hi)">${r}</span><span style="font-size:.82rem;color:var(--text-lo)">${cnt} (${pct}%)</span></div><div class="prog"><div class="prog-fill" style="width:${pct}%;background:var(--teal)"></div></div></div>`;}).join('')+`</div>`;
  }).catch(e=>$('anaStats').innerHTML=errorHTML('Could not load analytics: '+e.message));
  $('anaR')?.addEventListener('click',()=>navigate('analytics'));
}

// ============================================================
// CONNECTED DATA SOURCES
// ============================================================
function pageIntegrations(c){
  c.innerHTML=`<div class="pg-head"><div><div class="pg-title">Connected Data Sources</div><div class="pg-sub">Your Google Sheet powers everything you see in this portal</div></div></div>
    ${alertBanner('green','Your Google Sheet is live','This portal reads directly from your Google Sheet. All data shown across every page is pulled live — no manual uploads needed.')}
    <div class="section-label" style="margin-top:8px">Connected Spreadsheet</div>
    <div class="card" style="margin-bottom:20px"><div class="card-body">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div style="width:48px;height:48px;background:#e6f4ea;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0">📊</div>
        <div style="flex:1"><div style="font-weight:700;font-size:.95rem;color:var(--text-hi)">Student Data Workbook</div><div style="font-size:.78rem;color:var(--text-lo);margin-top:3px">Sheet ID: ${SHEET_ID}</div></div>
        <span class="badge b-green">● Live Connection</span>
      </div>
      <div class="divider"></div>
      <div style="font-size:.78rem;font-weight:600;color:var(--text-lo);letter-spacing:.07em;text-transform:uppercase;margin-bottom:10px">Connected Tabs (Read)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">${Object.values(TABS).map(v=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)"><span class="badge b-teal">●</span><span style="color:var(--text-hi);font-size:.82rem;font-weight:500">${v}</span></div>`).join('')}</div>
      <div class="divider"></div>
      <div style="font-size:.78rem;font-weight:600;color:var(--text-lo);letter-spacing:.07em;text-transform:uppercase;margin-bottom:10px">Write-Enabled Tabs (Add records)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">${['Contact Log','Behavior Logs','Saturday School','Accountability Log'].map(v=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)"><span class="badge ${GAS_URL==='YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'?'b-amber':'b-green'}">●</span><span style="color:var(--text-hi);font-size:.82rem;font-weight:500">${v}</span></div>`).join('')}</div>
      ${GAS_URL==='YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'?`<div style="margin-top:12px;padding:12px;background:#FFFBEB;border-radius:8px;font-size:.82rem;color:var(--amber)"><strong>Write access is in demo mode.</strong> New entries simulate saving but do not write to the sheet yet. Follow the steps below to enable full write access.</div>`:''}
    </div></div>
    <div class="section-label">Enable Write Access — One-Time Setup</div>
    <div class="card">${[['Open Google Apps Script','Go to script.google.com. Click "New Project" and give it a name like "LandPage SIS Writer."'],['Paste the provided script','Copy the Apps Script code that Nexaflow provides and paste it into the editor. Click Save.'],['Deploy as a Web App','Click Deploy → New Deployment → Web App. Set "Who has access" to Anyone. Click Deploy and copy the URL shown.'],['Add the URL to your portal','Open app.js and paste your URL in the GAS_URL field at the very top of the file. Save and redeploy. All log forms will now write directly to your Google Sheet.']].map(([h,b],i)=>`<div class="guide-step"><div class="guide-num">${i+1}</div><div><div class="guide-head">${h}</div><div class="guide-body">${b}</div></div></div>`).join('')}</div>`;
}

// ============================================================
// QUICK GUIDE
// ============================================================
function pageGuide(c){
  const faqs=[['Where does the data come from?','All data is pulled live from your Google Sheet every time you visit a page. Changes made in the spreadsheet appear here automatically.'],['Why does some data show dashes or look blank?','The spreadsheet uses lookup formulas in many cells. If a formula hasn\'t resolved to a value yet, it may appear blank here. Update the source data in the sheet and it will reflect here.'],['How do I add a new record?','Pages that support adding records — Behavior, Contact Log, Saturday School, and Accountability Log — have a button in the top right corner of each page.'],['Will my added records appear right away?','Yes. After you save, the page automatically reloads the data from your sheet. Your new record should appear at the bottom of the table.'],['Why doesn\'t saving work?','The write connection requires a one-time setup by your Nexaflow administrator. Until then, saving is in demo mode. See the Connected Data Sources page for steps.'],['How do I filter or search?','Each page has a search bar and filter dropdowns above the table. Type to search or select a filter — results update instantly.'],['Can I see a student\'s full profile?','Currently the portal shows all data for each student in the table view. Individual student profile pages are available as an upgrade — contact Nexaflow to add this.'],['Who can add or edit records?','Anyone with the portal link can view and add records right now. Login-protected access with role-based permissions is available as an upgrade.']];
  c.innerHTML=`<div class="pg-head"><div><div class="pg-title">Quick Guide & FAQ</div><div class="pg-sub">How to navigate and use your LandPage SIS portal</div></div></div>
    <div class="section-label">How Each Section Works</div>
    <div class="card" style="margin-bottom:22px">${[['Dashboard','Overview page with total counts from all data and quick-add shortcuts.'],['Student Roster','Full list of all enrolled students. Search by name or ID, filter by grade.'],['Absences','Absence records and makeup time data from the Absences sheet.'],['Tardies','Tardy records with consequence level tracking.'],['Behavior & Conduct','Log and view positive recognitions and conduct referrals.'],['Contact Log','Log and view parent, guardian, and student contacts.'],['Saturday School','Assign and track Saturday school attendance and reasons.'],['Accountability Log','Log student check-in and check-out times. Auto-calculates total hours.'],['STAAR Data','View state assessment scores filtered by mastery level and status.'],['Analytics','Auto-generated campus summary from all connected sheets — no setup needed.']].map(([h,b],i)=>`<div class="guide-step"><div class="guide-num">${i+1}</div><div><div class="guide-head">${h}</div><div class="guide-body">${b}</div></div></div>`).join('')}</div>
    <div class="section-label">Frequently Asked Questions</div>
    <div class="card" id="faqCard">${faqs.map(([q,a])=>`<div class="faq-item"><div class="faq-q"><span>${q}</span>${icon(I.chevron,16)}</div><div class="faq-a">${a}</div></div>`).join('')}</div>`;
  document.querySelectorAll('.faq-item').forEach(item=>item.querySelector('.faq-q').addEventListener('click',()=>{const o=item.classList.contains('open');document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));if(!o)item.classList.add('open');}));
}

// ============================================================
// SUPPORT
// ============================================================
function pageSupport(c){
  c.innerHTML=`<div class="pg-head"><div><div class="pg-title">Technical Support</div><div class="pg-sub">Resources and direct support from the Nexaflow Digital team</div></div></div>
    ${alertBanner('blue','Nexaflow Digital Support','For data connections, design changes, new pages, or anything not working as expected — reach out using any of the options below.')}
    <div class="g-auto" style="margin-top:20px">${[{icon:I.video,color:'var(--accent)',bg:'var(--accent-lo)',title:'Video Walkthroughs',desc:'Short tutorials covering each section — how to add records, filter data, and read reports.'},{icon:I.mail,color:'var(--teal)',bg:'var(--teal-lo)',title:'Email Support',desc:'Contact support@nexaflowdigital.com. We respond within one business day for active accounts.'},{icon:I.book,color:'var(--green)',bg:'var(--green-lo)',title:'Documentation',desc:'Written guides for every section, for school administrators with no technical knowledge needed.'},{icon:I.phone,color:'var(--amber)',bg:'var(--amber-lo)',title:'Schedule a Call',desc:'Book a 30-minute session with the Nexaflow team for training or setup help.'},{icon:I.chat,color:'var(--purple)',bg:'var(--purple-lo)',title:'Request a Feature',desc:'Need a new page or report? Submit a request and we\'ll follow up to discuss options.'},{icon:I.info,color:'var(--red)',bg:'var(--red-lo)',title:'Report an Issue',desc:'Something not loading correctly? Report it with the page name and what you expected to see.'}].map(s=>`<div class="support-card"><div class="support-icon" style="background:${s.bg};color:${s.color}">${icon(s.icon,20)}</div><h3>${s.title}</h3><p>${s.desc}</p></div>`).join('')}</div>
    <div class="divider"></div>
    <div class="section-label">Portal Information</div>
    <div class="card"><div class="card-body"><div style="display:grid;grid-template-columns:1fr 1fr;gap:0">${[['Portal Version','v2.0.0'],['Built By','Nexaflow Digital'],['Data Source','Google Sheets (Live)'],['Campus','Lakewood Ridge High'],['Write Access',GAS_URL==='YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'?'Demo Mode':'Connected'],['Support Email','support@nexaflowdigital.com']].map(([k,v])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)"><span style="font-size:.82rem;color:var(--text-lo)">${k}</span><span style="font-size:.82rem;font-weight:600;color:var(--text-md)">${v}</span></div>`).join('')}</div></div></div>`;
}
