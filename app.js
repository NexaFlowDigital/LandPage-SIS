/* =====================================================
   LANDPAGE SIS — APP.JS
   Router + all page renderers
   Data zones = placeholder embed areas for Looker
   Studio / Google App Script
   ===================================================== */

'use strict';

// ── HELPERS ──────────────────────────────────────────

function $(id) { return document.getElementById(id); }

function icon(path, size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${path}</svg>`;
}

const ICONS = {
  alert:   '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  check:   '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14 9 11"/>',
  embed:   '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  link:    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  clock:   '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  chevron: '<polyline points="6 9 12 15 18 9"/>',
  dl:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  plus:    '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  mail:    '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  phone:   '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.73a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18v-.08z"/>',
};

// Generic embed zone builder
function embedZone({ title, desc, snippet, tags = [], size = '', extraBtns = '' }) {
  const tagHtml = tags.map(t => `<span class="badge b-teal">${t}</span>`).join('');
  return `
    <div class="embed-zone ${size}">
      <div class="embed-icon">${icon(ICONS.embed, 52)}</div>
      <div class="embed-title">${title}</div>
      <div class="embed-desc">${desc}</div>
      ${snippet ? `<div class="embed-snippet">${snippet}</div>` : ''}
      ${tagHtml ? `<div class="embed-tags">${tagHtml}</div>` : ''}
      ${extraBtns}
    </div>`;
}

// Alert banner builder
function alertBanner(type, title, body) {
  const map = { amber: ['a-amber', ICONS.alert], red: ['a-red', ICONS.alert], green: ['a-green', ICONS.check], blue: ['a-blue', ICONS.info] };
  const [cls, ico] = map[type] || map.blue;
  return `
    <div class="alert ${cls}">
      <div style="flex-shrink:0;margin-top:1px;color:var(--${type==='amber'?'amber':type==='red'?'red':type==='green'?'green':'blue'})">${icon(ico, 16)}</div>
      <div><div class="alert-title">${title}</div><div class="alert-body">${body}</div></div>
    </div>`;
}

// Stat card builder
function statCard(label, value, meta, color = 'teal') {
  return `
    <div class="stat-card sc-${color}">
      <div class="stat-label">${label}</div>
      <div class="stat-val">${value}</div>
      <div class="stat-meta">${meta}</div>
    </div>`;
}

// ── ROUTER ────────────────────────────────────────────

const PAGES = {
  dashboard:    pageDashboard,
  students:     pageStudents,
  grades:       pageGrades,
  attendance:   pageAttendance,
  pbis:         pagePBIS,
  afterschool:  pageAfterSchool,
  staff:        pageStaff,
  analytics:    pageAnalytics,
  integrations: pageIntegrations,
  guide:        pageGuide,
  support:      pageSupport,
};

function navigate(pageKey) {
  // Update nav
  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageKey);
  });

  // Render page
  const wrap = $('pageWrap');
  if (!wrap) return;
  wrap.style.animation = 'none';
  void wrap.offsetHeight;
  wrap.style.animation = 'pgIn 0.28s ease';
  wrap.innerHTML = '';
  (PAGES[pageKey] || pageDashboard)(wrap);

  // Wire any new data-page links inside the rendered page
  wireNavLinks(wrap);

  // Close sidebar on mobile
  if (window.innerWidth < 900) closeSidebar();

  // scroll to top
  wrap.parentElement.scrollTop = 0;
}

function wireNavLinks(root) {
  root.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); });
  });
}

// ── BOOTSTRAP ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Date
  const d = new Date();
  const topDate = $('topDate');
  if (topDate) topDate.textContent = d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });

  // Sidebar nav
  document.querySelectorAll('.nav-link').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); });
  });

  // Hamburger
  const ham = $('hamburger');
  const sidebar = $('sidebar');
  const overlay = $('overlay');
  if (ham) ham.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Initial page
  navigate('dashboard');
});

function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('overlay').classList.remove('show');
}

// =====================================================
//  PAGE: DASHBOARD
// =====================================================
function pageDashboard(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Campus Dashboard</div>
        <div class="pg-sub">Lakewood Ridge High School &nbsp;·&nbsp; Campus ID: LRH-001</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(ICONS.dl, 14)} Export</button>
        <button class="btn btn-primary btn-sm">${icon(ICONS.plus, 14)} Add Note</button>
      </div>
    </div>

    <!-- ALERTS -->
    ${alertBanner('amber', 'Attendance Alert', 'Several students are below the 90% attendance threshold this week. Review the Attendance page for details.')}
    ${alertBanner('blue',  'PBIS Quarterly Review — May 20', 'Prepare your Tier 1 & Tier 2 data summaries before the campus-wide PBIS team meeting.')}

    <!-- KPI STRIP -->
    <div class="section-label" style="margin-top:6px">Key Metrics — At a Glance</div>
    <div class="stat-row">
      ${statCard('Total Enrollment',       '—',  'Add your live count here',    'teal')}
      ${statCard('Avg. Attendance Rate',   '—%', 'Current week',                'green')}
      ${statCard('Campus GPA',             '—',  'All students / all courses',  'blue')}
      ${statCard('At-Risk Students',       '—',  'Below thresholds',            'amber')}
      ${statCard('PBIS Points Awarded',    '—',  'This semester',               'purple')}
      ${statCard('After-School Enrolled',  '—',  'Active programs',             'teal')}
    </div>

    <!-- TWO COLUMNS -->
    <div class="g2" style="margin-bottom:18px">

      <!-- Attendance chart zone -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Weekly Attendance</div>
            <div class="card-sub">Embed your Looker Studio attendance chart below</div>
          </div>
          <span class="badge b-teal">Live</span>
        </div>
        ${embedZone({ title:'Attendance Chart', desc:'Paste your Looker Studio or App Script chart embed code here.', snippet:'&lt;iframe src="YOUR_LOOKER_EMBED_URL" /&gt;', size:'short' })}
      </div>

      <!-- Grade distribution zone -->
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Grade Distribution</div>
            <div class="card-sub">Embed your grade breakdown widget here</div>
          </div>
          <span class="badge b-blue">Sem. 2</span>
        </div>
        ${embedZone({ title:'Grade Chart', desc:'Connect your grading data source and embed a distribution chart here.', snippet:'&lt;iframe src="YOUR_GRADES_EMBED_URL" /&gt;', size:'short' })}
      </div>

    </div>

    <!-- Two more columns -->
    <div class="g2">

      <!-- Recent activity -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">Recent Activity Log</div>
          <span class="badge b-blue">Auto-updates</span>
        </div>
        ${embedZone({ title:'Activity Feed', desc:'Connect your Google App Script log here to display timestamped campus activity.', snippet:'&lt;script src="YOUR_GAS_URL"&gt;&lt;/script&gt;', size:'short' })}
      </div>

      <!-- Quick links -->
      <div class="card">
        <div class="card-head"><div class="card-title">Quick Navigation</div></div>
        <div class="card-body">
          ${[
            ['students',    'b-teal',   'Student Roster',        'Search and filter all enrolled students'],
            ['attendance',  'b-green',  'Attendance',            'Daily and weekly attendance tracking'],
            ['grades',      'b-blue',   'Grades & GPA',          'Course-level grade summaries'],
            ['pbis',        'b-purple', 'PBIS & Discipline',     'Behavior referrals and recognitions'],
            ['afterschool', 'b-amber',  'After-School Programs', 'Program rosters and sign-in'],
            ['analytics',   'b-teal',   'Analytics & Reports',   'Export and drill-down reports'],
          ].map(([page, badge, label, desc]) => `
            <a href="#" data-page="${page}" style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);text-decoration:none">
              <span class="badge ${badge}" style="min-width:8px;width:8px;height:8px;border-radius:50%;padding:0"></span>
              <div style="flex:1">
                <div style="font-weight:600;font-size:0.845rem;color:var(--text-hi)">${label}</div>
                <div style="font-size:0.75rem;color:var(--text-lo);margin-top:2px">${desc}</div>
              </div>
              ${icon('<polyline points="9 18 15 12 9 6"/>', 14)}
            </a>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// =====================================================
//  PAGE: STUDENT ROSTER
// =====================================================
function pageStudents(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Student Roster</div>
        <div class="pg-sub">Search, filter, and manage all enrolled students</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(ICONS.dl, 14)} Export CSV</button>
        <button class="btn btn-primary btn-sm">${icon(ICONS.plus, 14)} Add Student</button>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="card" style="margin-bottom:18px">
      <div class="card-body">
        <div class="search-row">
          <div class="search-field">
            ${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 15)}
            <input type="text" placeholder="Search by name or student ID…" />
          </div>
          <select class="sel"><option>All Grades</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select>
          <select class="sel"><option>All Status</option><option>Active</option><option>At Risk</option><option>Watch</option></select>
          <select class="sel"><option>All Counselors</option></select>
          <button class="btn btn-ghost btn-sm">Reset</button>
        </div>
      </div>
    </div>

    <!-- STUDENT DATA ZONE -->
    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Student Records</div>
          <div class="card-sub">Connected to your student information system</div>
        </div>
        <span class="badge b-teal">Live Data</span>
      </div>
      ${embedZone({
        title: 'Student Roster Table',
        desc: 'Embed your Google App Script student search table here. This zone will display name, grade, GPA, attendance %, counselor, and IEP/ELL flags pulled from your data source.',
        snippet: '&lt;iframe src="YOUR_GAS_STUDENT_TABLE_URL" width="100%" height="500" /&gt;',
        tags: ['Name', 'Grade', 'GPA', 'Attendance %', 'Counselor', 'IEP', 'ELL', 'Status'],
        size: 'tall',
      })}
    </div>
  `;
}

// =====================================================
//  PAGE: GRADES & GPA
// =====================================================
function pageGrades(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Grades & GPA</div>
        <div class="pg-sub">Course averages, grade distribution, and GPA trends</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(ICONS.dl, 14)} Export</button>
      </div>
    </div>

    <!-- KPI row -->
    <div class="stat-row">
      ${statCard('Campus GPA',       '—', 'All courses, current sem.',  'blue')}
      ${statCard('Students w/ A/B',  '—%','Honor roll threshold',       'green')}
      ${statCard('Students Below 70','—', 'Failing one or more courses','red')}
      ${statCard('GPA Trend',        '—', 'vs. last semester',          'teal')}
    </div>

    <!-- Grade summary embed -->
    <div class="g2" style="margin-bottom:18px">
      <div class="card">
        <div class="card-head">
          <div class="card-title">Course Grade Summary</div>
          <span class="badge b-blue">By Department</span>
        </div>
        ${embedZone({ title:'Grade Summary Table', desc:'Embed your Looker Studio or App Script course-level grade summary. Columns: course name, teacher, avg grade, A/B/C/D/F counts, trend.', snippet:'&lt;iframe src="YOUR_GRADES_SUMMARY_URL" /&gt;', size:'short' })}
      </div>

      <div class="card">
        <div class="card-head">
          <div class="card-title">GPA Distribution Chart</div>
          <span class="badge b-green">Visual</span>
        </div>
        ${embedZone({ title:'GPA Distribution', desc:'Drop in your Looker Studio histogram or donut chart showing GPA ranges across the campus.', snippet:'&lt;iframe src="YOUR_GPA_CHART_URL" /&gt;', size:'short' })}
      </div>
    </div>

    <!-- Honor roll zone -->
    <div class="card">
      <div class="card-head">
        <div class="card-title">Honor Roll & At-Risk Academic List</div>
        <span class="badge b-teal">Live</span>
      </div>
      ${embedZone({ title:'Student GPA List', desc:'Embed your filtered student GPA list here. Toggle between honor roll (GPA ≥ 3.7) and academic watch (GPA < 2.0) views.', snippet:'&lt;iframe src="YOUR_GPA_LIST_URL" /&gt;', tags:['Student Name','GPA','Grade','Course Count','Teacher'], size:'short' })}
    </div>
  `;
}

// =====================================================
//  PAGE: ATTENDANCE
// =====================================================
function pageAttendance(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Attendance</div>
        <div class="pg-sub">Daily, weekly, and monthly attendance tracking by campus, grade, and student</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(ICONS.dl, 14)} Export Report</button>
      </div>
    </div>

    ${alertBanner('amber', 'Chronic Absenteeism Watch', 'Students with less than 90% attendance require counselor outreach per district policy. Use the attendance list below to identify them.')}

    <!-- KPI row -->
    <div class="stat-row">
      ${statCard('Today\'s Attendance', '—%', 'As of this morning',         'green')}
      ${statCard('Weekly Avg',          '—%', 'Mon–Fri this week',          'teal')}
      ${statCard('Chronic Absent.',     '—',  'Below 90% this semester',    'amber')}
      ${statCard('Unexcused Absences',  '—',  'This week',                  'red')}
      ${statCard('Tardies',             '—',  'This week',                  'blue')}
    </div>

    <!-- Charts -->
    <div class="g2" style="margin-bottom:18px">
      <div class="card">
        <div class="card-head">
          <div class="card-title">Daily Attendance Chart</div>
          <span class="badge b-teal">This Week</span>
        </div>
        ${embedZone({ title:'Daily Attendance', desc:'Embed your Looker Studio daily attendance bar or line chart. Shows present vs. absent vs. tardy by day.', snippet:'&lt;iframe src="YOUR_DAILY_ATTEND_URL" /&gt;', size:'short' })}
      </div>

      <div class="card">
        <div class="card-head">
          <div class="card-title">Monthly Trend</div>
          <span class="badge b-blue">Aug – Jun</span>
        </div>
        ${embedZone({ title:'Monthly Trend Chart', desc:'Embed your monthly attendance trend line chart (full academic year) from Looker Studio or App Script.', snippet:'&lt;iframe src="YOUR_MONTHLY_TREND_URL" /&gt;', size:'short' })}
      </div>
    </div>

    <!-- Student attendance list -->
    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Student Attendance Records</div>
          <div class="card-sub">Individual-level attendance data</div>
        </div>
        <span class="badge b-green">Live</span>
      </div>
      <div class="card-body" style="padding-bottom:0">
        <div class="search-row">
          <div class="search-field">
            ${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 15)}
            <input type="text" placeholder="Search student…" />
          </div>
          <select class="sel"><option>All Grades</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select>
          <select class="sel"><option>All Status</option><option>On Track (≥95%)</option><option>Monitor (90–94%)</option><option>At Risk (&lt;90%)</option></select>
        </div>
      </div>
      ${embedZone({ title:'Attendance Table', desc:'Embed your student attendance data table here. Columns: Student Name, Grade, Present Days, Absent Days, Tardy, % Attendance, Status.', snippet:'&lt;iframe src="YOUR_ATTEND_TABLE_URL" width="100%" height="480" /&gt;', tags:['Name','Grade','Present','Absent','Tardy','%','Status'] })}
    </div>
  `;
}

// =====================================================
//  PAGE: PBIS & DISCIPLINE
// =====================================================
function pagePBIS(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">PBIS & Discipline</div>
        <div class="pg-sub">Positive behavior recognitions and discipline referral tracking</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(ICONS.dl, 14)} Export Log</button>
        <button class="btn btn-primary btn-sm">${icon(ICONS.plus, 14)} New Entry</button>
      </div>
    </div>

    <!-- KPI row -->
    <div class="stat-row">
      ${statCard('PBIS Points Awarded', '—', 'This semester',            'green')}
      ${statCard('Recognitions',        '—', 'Positive behavior logs',   'teal')}
      ${statCard('Referrals Filed',     '—', 'This semester',            'amber')}
      ${statCard('Pending Resolution',  '—', 'Open referrals',           'red')}
      ${statCard('ISS Days',            '—', 'In-school suspension',     'blue')}
      ${statCard('Parent Contacts',     '—', 'Logged this semester',     'purple')}
    </div>

    <div class="g2" style="margin-bottom:18px">
      <!-- Referral categories chart -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">Referral Categories</div>
          <span class="badge b-amber">This Semester</span>
        </div>
        ${embedZone({ title:'Referral Breakdown Chart', desc:'Embed a Looker Studio chart showing referrals by category — disruption, tardy, cell phone, dress code, etc.', snippet:'&lt;iframe src="YOUR_REFERRAL_CHART_URL" /&gt;', size:'short' })}
      </div>

      <!-- PBIS trend -->
      <div class="card">
        <div class="card-head">
          <div class="card-title">PBIS Points Trend</div>
          <span class="badge b-green">Monthly</span>
        </div>
        ${embedZone({ title:'PBIS Points Chart', desc:'Embed your monthly PBIS recognition points trend line from Looker Studio or Google Sheets.', snippet:'&lt;iframe src="YOUR_PBIS_TREND_URL" /&gt;', size:'short' })}
      </div>
    </div>

    <!-- Discipline log -->
    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Discipline & Recognition Log</div>
          <div class="card-sub">All referrals and positive behavior entries</div>
        </div>
        <span class="badge b-teal">Live</span>
      </div>
      <div class="card-body" style="padding-bottom:0">
        <div class="search-row">
          <div class="search-field">
            ${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 15)}
            <input type="text" placeholder="Search student or staff…" />
          </div>
          <select class="sel"><option>All Types</option><option>Referral</option><option>Recognition</option></select>
          <select class="sel"><option>All Status</option><option>Pending</option><option>Resolved</option><option>Logged</option></select>
        </div>
      </div>
      ${embedZone({ title:'PBIS Log Table', desc:'Embed your App Script or Looker Studio behavior log table. Columns: Student, Type, Category, Reported By, Date, Status, Action Taken.', snippet:'&lt;iframe src="YOUR_PBIS_LOG_URL" width="100%" height="480" /&gt;', tags:['Student','Type','Category','Date','Status','Action'] })}
    </div>
  `;
}

// =====================================================
//  PAGE: AFTER-SCHOOL PROGRAMS
// =====================================================
function pageAfterSchool(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">After-School Programs</div>
        <div class="pg-sub">Program rosters, attendance sign-in, and enrollment overview</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(ICONS.dl, 14)} Export</button>
        <button class="btn btn-primary btn-sm">${icon(ICONS.plus, 14)} Add Program</button>
      </div>
    </div>

    <!-- KPI row -->
    <div class="stat-row">
      ${statCard('Active Programs',     '—', 'Running this semester',     'teal')}
      ${statCard('Total Enrolled',      '—', 'Across all programs',       'blue')}
      ${statCard('Sign-Ins Today',      '—', 'As of 5:00 PM',            'green')}
      ${statCard('Avg. Participation',  '—%','Daily show rate',           'amber')}
    </div>

    <!-- Program cards zone -->
    <div class="card" style="margin-bottom:18px">
      <div class="card-head">
        <div class="card-title">Program Directory</div>
        <span class="badge b-teal">Active Programs</span>
      </div>
      ${embedZone({ title:'Program List', desc:'Embed your App Script or Looker Studio program directory here. Each card will show: program name, advisor, days/times, room, and enrollment count.', snippet:'&lt;iframe src="YOUR_PROGRAMS_URL" width="100%" height="360" /&gt;', tags:['Program Name','Advisor','Days','Time','Room','Enrolled'], size:'short' })}
    </div>

    <!-- Sign-in log -->
    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">After-School Sign-In Log</div>
          <div class="card-sub">Daily student check-in records</div>
        </div>
        <span class="badge b-green">Live</span>
      </div>
      <div class="card-body" style="padding-bottom:0">
        <div class="search-row">
          <div class="search-field">
            ${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 15)}
            <input type="text" placeholder="Search student or program…" />
          </div>
          <select class="sel"><option>All Programs</option></select>
        </div>
      </div>
      ${embedZone({ title:'Sign-In Table', desc:'Embed your Google App Script after-school sign-in form results and attendance table here. Columns: Student, Program, Date, Sign-In Time, Sign-Out Time, Staff.', snippet:'&lt;iframe src="YOUR_SIGNIN_LOG_URL" width="100%" height="480" /&gt;', tags:['Student','Program','Date','Sign-In','Sign-Out','Staff'] })}
    </div>
  `;
}

// =====================================================
//  PAGE: STAFF DIRECTORY
// =====================================================
function pageStaff(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Staff Directory</div>
        <div class="pg-sub">All campus staff, roles, departments, and contact information</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(ICONS.dl, 14)} Export</button>
        <button class="btn btn-primary btn-sm">${icon(ICONS.plus, 14)} Add Staff</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card" style="margin-bottom:18px">
      <div class="card-body">
        <div class="search-row">
          <div class="search-field">
            ${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 15)}
            <input type="text" placeholder="Search by name or role…" />
          </div>
          <select class="sel"><option>All Departments</option><option>Administration</option><option>Counseling</option><option>English</option><option>Mathematics</option><option>Science</option><option>Special Ed.</option></select>
          <button class="btn btn-ghost btn-sm">Reset</button>
        </div>
      </div>
    </div>

    <!-- Staff table zone -->
    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Staff Records</div>
          <div class="card-sub">Connected to your HR / staff directory</div>
        </div>
        <span class="badge b-teal">Live Data</span>
      </div>
      ${embedZone({ title:'Staff Directory Table', desc:'Embed your Google App Script or Sheets-backed staff directory here. Columns: Name, Role, Department, Email, Extension, Certification. Click a row to view the staff profile.', snippet:'&lt;iframe src="YOUR_STAFF_TABLE_URL" width="100%" height="520" /&gt;', tags:['Name','Role','Department','Email','Extension','Cert.'], size:'tall' })}
    </div>
  `;
}

// =====================================================
//  PAGE: ANALYTICS & REPORTS
// =====================================================
function pageAnalytics(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Analytics & Reports</div>
        <div class="pg-sub">Comprehensive campus-wide dashboards and downloadable reports</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(ICONS.dl, 14)} Download PDF</button>
      </div>
    </div>

    ${alertBanner('blue', 'Connect Your Data Source', 'Replace the placeholder zones below with your Looker Studio report embed URLs or Google App Script web app outputs.')}

    <!-- Main analytics embed -->
    <div class="card" style="margin-bottom:18px">
      <div class="card-head">
        <div>
          <div class="card-title">Campus Analytics Dashboard</div>
          <div class="card-sub">Full-page Looker Studio report embed</div>
        </div>
        <a href="#" class="btn btn-ghost btn-sm">Open in Looker Studio ↗</a>
      </div>
      ${embedZone({ title:'Main Analytics Report', desc:'Paste your Looker Studio full-page dashboard embed code here. This is your primary data canvas for principals and district admins. Recommended size: 100% width × 700px height.', snippet:'&lt;iframe src="https://lookerstudio.google.com/embed/reporting/YOUR_REPORT_ID/page/PAGE_ID" width="100%" height="700" allowfullscreen /&gt;', size:'tall' })}
    </div>

    <!-- Sub-reports row -->
    <div class="section-label">Individual Report Panels</div>
    <div class="g3">
      <div class="card">
        <div class="card-head"><div class="card-title">Attendance Report</div></div>
        ${embedZone({ title:'Attendance Panel', desc:'Embed your attendance summary mini-report here.', snippet:'&lt;iframe src="YOUR_ATTEND_REPORT" /&gt;', size:'short' })}
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">Discipline Report</div></div>
        ${embedZone({ title:'Discipline Panel', desc:'Embed your PBIS / referral summary here.', snippet:'&lt;iframe src="YOUR_PBIS_REPORT" /&gt;', size:'short' })}
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">Academic Report</div></div>
        ${embedZone({ title:'Academic Panel', desc:'Embed your GPA / grade summary mini-report here.', snippet:'&lt;iframe src="YOUR_ACADEMIC_REPORT" /&gt;', size:'short' })}
      </div>
    </div>
  `;
}

// =====================================================
//  PAGE: DATA INTEGRATIONS
// =====================================================
function pageIntegrations(c) {
  const tools = [
    { name:'Looker Studio', tag:'LS', color:'#4285F4', bg:'#e8f0fe', desc:'Embed full-page or panel reports directly into any page. Copy the report\'s share link → Embed → paste the iframe code.', status:'Ready to connect', badge:'b-blue' },
    { name:'Google Sheets', tag:'GS', color:'#34A853', bg:'#e6f4ea', desc:'Power tables and charts using Google Sheets as your backend. Use the Publish → Embed Sheet option.', status:'Ready to connect', badge:'b-green' },
    { name:'Google App Script', tag:'GAS', color:'#F9AB00', bg:'#fef7e0', desc:'Run server-side scripts to create custom web apps, form handlers, and automated reports embedded here.', status:'Ready to connect', badge:'b-amber' },
    { name:'Google Forms', tag:'GF', color:'#673AB7', bg:'#ede7f6', desc:'Embed Google Forms for after-school sign-in, parent feedback, or staff surveys directly into any page.', status:'Ready to connect', badge:'b-purple' },
    { name:'Google Classroom', tag:'GC', color:'#0F9D58', bg:'#e6f4ea', desc:'Link or embed Google Classroom course streams and grade summaries for teachers and admins.', status:'Future integration', badge:'b-teal' },
    { name:'PEIMS / State Data', tag:'TX', color:'#EA4335', bg:'#fce8e6', desc:'Future slot for Texas PEIMS data integration. Connect your district\'s data export pipeline here.', status:'Future integration', badge:'b-red' },
  ];

  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Data Integrations</div>
        <div class="pg-sub">Connect your tools — Looker Studio, Google App Script, Sheets, Forms, and more</div>
      </div>
    </div>

    ${alertBanner('green', 'How to Add Your Data', 'Every page in LandPage SIS has clearly marked embed zones. Copy your Looker Studio iframe or App Script web app URL and paste it into the corresponding zone on each page.')}

    <div class="section-label" style="margin-top:8px">Available & Planned Integrations</div>
    <div class="g-auto" style="margin-bottom:28px">
      ${tools.map(t => `
        <div class="integ-tile">
          <div class="integ-logo" style="background:${t.bg};color:${t.color}">${t.tag}</div>
          <div style="flex:1">
            <div class="integ-name">${t.name}</div>
            <div class="integ-desc">${t.desc}</div>
            <span class="badge ${t.badge}" style="margin-top:10px">${t.status}</span>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="section-label">How to Embed — Step by Step</div>
    <div class="card">
      <div class="guide-step">
        <div class="guide-num">1</div>
        <div>
          <div class="guide-head">Get your embed URL or iframe code</div>
          <div class="guide-body">In Looker Studio: File → Share → Embed report → Copy the &lt;iframe&gt; tag. In Google App Script: Deploy → New deployment → Web app → Copy the URL.</div>
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-num">2</div>
        <div>
          <div class="guide-head">Find the embed zone on the target page</div>
          <div class="guide-body">Every page (Attendance, Grades, PBIS, etc.) has clearly labeled dashed embed zones with the recommended snippet format shown inside.</div>
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-num">3</div>
        <div>
          <div class="guide-head">Replace the placeholder with your iframe</div>
          <div class="guide-body">In <code style="background:var(--bg-raised);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.8em">app.js</code>, find the page function (e.g. <code style="background:var(--bg-raised);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.8em">pageAttendance</code>) and replace the <code style="background:var(--bg-raised);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.8em">embedZone()</code> call with a raw <code style="background:var(--bg-raised);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.8em">&lt;iframe&gt;</code> tag using your URL.</div>
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-num">4</div>
        <div>
          <div class="guide-head">Set permissions on your data source</div>
          <div class="guide-body">Make sure your Looker Studio report is set to "Anyone with the link can view" or scoped to your district domain. App Script deployments should be set to "Anyone" or the appropriate audience.</div>
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-num">5</div>
        <div>
          <div class="guide-head">Commit and deploy to GitHub Pages</div>
          <div class="guide-body">Push the updated <code style="background:var(--bg-raised);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.8em">app.js</code> to your GitHub repo. Enable GitHub Pages under Settings → Pages. Your SIS is live.</div>
        </div>
      </div>
    </div>
  `;
}

// =====================================================
//  PAGE: QUICK GUIDE & FAQ
// =====================================================
function pageGuide(c) {
  const faqs = [
    ['What is LandPage SIS?', 'LandPage SIS is a school information system portal built by Nexaflow Digital. It consolidates student data, attendance, grades, behavior, and after-school programs into one clean admin interface.'],
    ['Who can access this portal?', 'Access is intended for campus principals, assistant principals, counselors, and designated administrative staff. Role-based access can be configured in your deployment settings.'],
    ['How do I embed a Looker Studio report?', 'In Looker Studio, go to File → Share → Embed report. Copy the &lt;iframe&gt; code and paste it into the appropriate embed zone in app.js. See the Data Integrations page for a full walkthrough.'],
    ['How do I connect Google App Script?', 'Deploy your App Script as a Web App (Deploy → New deployment → Web app). Copy the deployment URL and embed it as an &lt;iframe src="YOUR_URL"&gt; in the relevant page function in app.js.'],
    ['Can I add new pages or sections?', 'Yes. Each page is a self-contained function in app.js. Duplicate any existing page function, rename it, add it to the PAGES object and the sidebar nav in index.html.'],
    ['How do I host this on GitHub Pages?', 'Push all files (index.html, styles.css, app.js) to a public GitHub repository. Go to Settings → Pages → Source: main branch / root. Your site will be live at yourusername.github.io/repo-name.'],
    ['Can I change the school name and branding?', 'Yes. Update the sidebar school chip in index.html and modify the CSS variables in styles.css to match your district colors.'],
    ['Is student data stored in this app?', 'No. LandPage SIS is a display shell only. All data lives in your connected sources (Google Sheets, Looker Studio, App Script). This app just presents it.'],
  ];

  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Quick Guide & FAQ</div>
        <div class="pg-sub">Everything you need to get started and use LandPage SIS effectively</div>
      </div>
    </div>

    <div class="section-label">Getting Started — 5 Steps</div>
    <div class="card" style="margin-bottom:22px">
      ${[
        ['Navigate the Sidebar', 'Use the left sidebar to move between sections: Dashboard, Student Roster, Grades, Attendance, PBIS, After-School, Staff, Analytics, and Integrations.'],
        ['Understand the Embed Zones', 'Dashed gray boxes throughout the app are embed zones — placeholders waiting for your Looker Studio or App Script data. They show you exactly what goes where.'],
        ['Connect Your First Data Source', 'Start with the Attendance page. Embed your Looker Studio attendance report iframe in the "Daily Attendance Chart" zone. See the Integrations page for full instructions.'],
        ['Customize Stat Cards', 'The KPI stat cards at the top of each page show "—" by default. Replace the value in the statCard() call inside app.js with your live data or a hardcoded summary.'],
        ['Deploy to GitHub Pages', 'Once your embeds are in place, push to GitHub and enable Pages. Share the URL with your admin team and you\'re live.'],
      ].map(([head, body], i) => `
        <div class="guide-step">
          <div class="guide-num">${i + 1}</div>
          <div><div class="guide-head">${head}</div><div class="guide-body">${body}</div></div>
        </div>
      `).join('')}
    </div>

    <div class="section-label">Frequently Asked Questions</div>
    <div class="card" id="faqCard">
      ${faqs.map(([q, a], i) => `
        <div class="faq-item" data-idx="${i}">
          <div class="faq-q">
            <span>${q}</span>
            ${icon(ICONS.chevron, 16)}
          </div>
          <div class="faq-a">${a}</div>
        </div>
      `).join('')}
    </div>
  `;

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });
}

// =====================================================
//  PAGE: TECHNICAL SUPPORT
// =====================================================
function pageSupport(c) {
  const cards = [
    { icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>', color:'var(--accent)', bg:'var(--accent-lo)',  title:'Video Walkthroughs', desc:'Short screen-recorded tutorials covering each section of LandPage SIS — embedding data, customizing pages, and deploying to GitHub.' },
    { icon:ICONS.mail,  color:'var(--blue)',  bg:'var(--blue-lo)',  title:'Email Support',        desc:'Reach the Nexaflow Digital team at support@nexaflowdigital.com. We respond within 1 business day for active clients.' },
    { icon:ICONS.link,  color:'var(--green)', bg:'var(--green-lo)', title:'Documentation',        desc:'Full technical documentation including the embed guide, color token reference, and page customization instructions are available on the Nexaflow docs site.' },
    { icon:ICONS.phone, color:'var(--amber)', bg:'var(--amber-lo)', title:'Live Onboarding Call', desc:'Schedule a 30-minute onboarding call with the Nexaflow team to walk through your specific data sources and get your first embeds connected live.' },
    { icon:'<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>', color:'var(--purple)', bg:'var(--purple-lo)', title:'GitHub Repository',     desc:'Access the source code, submit issues, or fork the repository from the private Nexaflow GitHub org. Repo access is included with your license.' },
    { icon:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>', color:'var(--red)', bg:'var(--red-lo)',  title:'Report a Bug',          desc:'Found something broken? Use the bug report form linked here to submit detailed info. Include the page name, browser, and steps to reproduce.' },
  ];

  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Technical Support</div>
        <div class="pg-sub">Resources, documentation, and direct support from Nexaflow Digital</div>
      </div>
    </div>

    ${alertBanner('blue', 'Nexaflow Digital Support', 'This portal was built by Nexaflow Digital. For customizations, data integrations, or white-label licensing inquiries, contact the team directly.')}

    <div class="g-auto" style="margin-top:20px">
      ${cards.map(s => `
        <div class="support-card">
          <div class="support-icon" style="background:${s.bg};color:${s.color}">
            ${icon(s.icon, 20)}
          </div>
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
        </div>
      `).join('')}
    </div>

    <div class="divider"></div>
    <div class="section-label">System Info</div>
    <div class="card">
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.82rem">
          ${[
            ['App Version', 'v1.0.0'],
            ['Built By', 'Nexaflow Digital'],
            ['Framework', 'Vanilla HTML / CSS / JS'],
            ['Hosting', 'GitHub Pages'],
            ['Data Layer', 'Looker Studio + Google App Script'],
            ['Campus', 'Lakewood Ridge High — LRH-001'],
          ].map(([k,v]) => `
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
              <span style="color:var(--text-lo)">${k}</span>
              <span style="font-family:var(--font-mono);color:var(--text-md)">${v}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
