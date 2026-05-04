'use strict';

// ── HELPERS ──────────────────────────────────────────

function $(id) { return document.getElementById(id); }

function icon(path, size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${path}</svg>`;
}

const I = {
  alert:   '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  check:   '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14 9 11"/>',
  embed:   '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  chevron: '<polyline points="6 9 12 15 18 9"/>',
  dl:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  plus:    '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  mail:    '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  phone:   '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.73a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18v-.08z"/>',
  video:   '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
  book:    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
};

function embedZone({ title, desc, tags = [], size = '' }) {
  const tagHtml = tags.map(t => `<span class="badge b-blue">${t}</span>`).join('');
  return `
    <div class="embed-zone ${size}">
      <div class="embed-icon">${icon(I.embed, 52)}</div>
      <div class="embed-title">${title}</div>
      <div class="embed-desc">${desc}</div>
      ${tagHtml ? `<div class="embed-tags">${tagHtml}</div>` : ''}
    </div>`;
}

function alertBanner(type, title, body) {
  const map = { amber: 'a-amber', red: 'a-red', green: 'a-green', blue: 'a-blue' };
  const icoMap = { amber: I.alert, red: I.alert, green: I.check, blue: I.info };
  const colorMap = { amber: 'var(--amber)', red: 'var(--red)', green: 'var(--green)', blue: 'var(--accent)' };
  return `
    <div class="alert ${map[type]}">
      <div style="flex-shrink:0;margin-top:1px;color:${colorMap[type]}">${icon(icoMap[type], 16)}</div>
      <div><div class="alert-title">${title}</div><div class="alert-body">${body}</div></div>
    </div>`;
}

function statCard(label, value, meta, color = 'blue') {
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
  behavior:     pageBehavior,
  afterschool:  pageAfterSchool,
  staff:        pageStaff,
  analytics:    pageAnalytics,
  integrations: pageIntegrations,
  guide:        pageGuide,
  support:      pageSupport,
};

function navigate(key) {
  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.toggle('active', el.dataset.page === key);
  });
  const wrap = $('pageWrap');
  if (!wrap) return;
  wrap.style.animation = 'none';
  void wrap.offsetHeight;
  wrap.style.animation = 'pgIn 0.28s ease';
  wrap.innerHTML = '';
  (PAGES[key] || pageDashboard)(wrap);
  wire(wrap);
  wrap.parentElement.scrollTop = 0;
  if (window.innerWidth < 900) closeSidebar();
}

function wire(root) {
  root.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const d = new Date();
  const el = $('topDate');
  if (el) el.textContent = d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });

  document.querySelectorAll('.nav-link').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); });
  });

  const ham = $('hamburger');
  const overlay = $('overlay');
  if (ham) ham.addEventListener('click', () => {
    $('sidebar').classList.toggle('open');
    overlay.classList.toggle('show');
  });
  if (overlay) overlay.addEventListener('click', closeSidebar);

  navigate('dashboard');
});

function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('overlay').classList.remove('show');
}

// =====================================================
//  DASHBOARD
// =====================================================
function pageDashboard(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Campus Dashboard</div>
        <div class="pg-sub">Lakewood Ridge High School &nbsp;·&nbsp; Academic Year 2024–25</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(I.dl, 14)} Export</button>
        <button class="btn btn-primary btn-sm">${icon(I.plus, 14)} Add Note</button>
      </div>
    </div>

    ${alertBanner('amber', 'Attendance Alert', 'Several students are below the 90% attendance threshold this week. Review the Attendance page for a full list.')}
    ${alertBanner('blue', 'Campus Review Meeting — May 20', 'Prepare your behavior and attendance summaries before the upcoming campus leadership team meeting.')}

    <div class="section-label" style="margin-top:8px">Key Metrics — At a Glance</div>
    <div class="stat-row">
      ${statCard('Total Enrollment',      '—', 'Add your live count here',   'blue')}
      ${statCard('Avg. Attendance Rate',  '—%','Current week',               'green')}
      ${statCard('Campus GPA',            '—', 'All students / all courses', 'teal')}
      ${statCard('Students Needing Support','—','Below set thresholds',      'amber')}
      ${statCard('Recognition Awards',    '—', 'This semester',              'purple')}
      ${statCard('After-School Enrolled', '—', 'Across all programs',        'teal')}
    </div>

    <div class="g2" style="margin-bottom:18px">
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Weekly Attendance</div>
            <div class="card-sub">Your connected attendance data will appear here</div>
          </div>
          <span class="badge b-green">Live</span>
        </div>
        ${embedZone({ title:'Attendance Chart', desc:'Your attendance data will display here once connected by your Nexaflow setup team.', size:'short' })}
      </div>

      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Grade Distribution</div>
            <div class="card-sub">Current semester grade breakdown</div>
          </div>
          <span class="badge b-blue">Sem. 2</span>
        </div>
        ${embedZone({ title:'Grade Chart', desc:'Your grade distribution chart will display here once your data source is connected.', size:'short' })}
      </div>
    </div>

    <div class="g2">
      <div class="card">
        <div class="card-head">
          <div class="card-title">Recent Activity Log</div>
          <span class="badge b-blue">Auto-updated</span>
        </div>
        ${embedZone({ title:'Activity Feed', desc:'Recent campus activity — referrals, recognitions, enrollments, and sign-ins — will appear here automatically.', size:'short' })}
      </div>

      <div class="card">
        <div class="card-head"><div class="card-title">Quick Navigation</div></div>
        <div class="card-body">
          ${[
            ['students',    'b-blue',   'Student Roster',          'Search and manage all enrolled students'],
            ['attendance',  'b-green',  'Attendance',              'Daily and weekly attendance tracking'],
            ['grades',      'b-teal',   'Grades & GPA',            'Course-level grade summaries'],
            ['behavior',    'b-purple', 'Behavior & Conduct',      'Referrals, recognitions, and conduct logs'],
            ['afterschool', 'b-amber',  'After-School Programs',   'Program rosters and daily sign-in'],
            ['analytics',   'b-blue',   'Analytics & Reports',     'Full reports and data summaries'],
          ].map(([page, badge, label, desc]) => `
            <a href="#" data-page="${page}" style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border)">
              <span style="width:8px;height:8px;border-radius:50%;background:currentColor" class="${badge}"></span>
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
//  STUDENT ROSTER
// =====================================================
function pageStudents(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Student Roster</div>
        <div class="pg-sub">Search, filter, and manage all enrolled students</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(I.dl, 14)} Export List</button>
        <button class="btn btn-primary btn-sm">${icon(I.plus, 14)} Add Student</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:18px">
      <div class="card-body">
        <div class="search-row">
          <div class="search-field">
            ${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 15)}
            <input type="text" placeholder="Search by student name or ID…" />
          </div>
          <select class="sel"><option>All Grades</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select>
          <select class="sel"><option>All Status</option><option>Active</option><option>At Risk</option><option>Watch List</option></select>
          <select class="sel"><option>All Counselors</option></select>
          <button class="btn btn-ghost btn-sm">Reset Filters</button>
        </div>
      </div>
    </div>

    <div class="stat-row">
      ${statCard('Total Students',       '—', 'Currently enrolled',        'blue')}
      ${statCard('Active',               '—', 'In good standing',          'green')}
      ${statCard('On Watch List',        '—', 'Needs monitoring',          'amber')}
      ${statCard('Special Services',     '—', 'IEP / 504 / ELL',          'purple')}
    </div>

    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Student Records</div>
          <div class="card-sub">All enrolled students — updated by your connected data source</div>
        </div>
        <span class="badge b-teal">Live Data</span>
      </div>
      ${embedZone({
        title: 'Student Directory Table',
        desc: 'Your student roster will display here — including name, grade level, GPA, attendance percentage, assigned counselor, and support service flags.',
        tags: ['Name', 'Grade', 'GPA', 'Attendance %', 'Counselor', 'Special Services', 'Status'],
        size: 'tall',
      })}
    </div>
  `;
}

// =====================================================
//  GRADES & GPA
// =====================================================
function pageGrades(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Grades & GPA</div>
        <div class="pg-sub">Course averages, grade distribution, and academic performance trends</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(I.dl, 14)} Export</button>
      </div>
    </div>

    <div class="stat-row">
      ${statCard('Campus GPA',            '—', 'All courses, current semester', 'blue')}
      ${statCard('Students with A or B',  '—%','Meeting or exceeding standard', 'green')}
      ${statCard('Students Below 70',     '—', 'Failing one or more courses',   'red')}
      ${statCard('GPA Trend',             '—', 'Compared to last semester',     'teal')}
    </div>

    <div class="g2" style="margin-bottom:18px">
      <div class="card">
        <div class="card-head">
          <div class="card-title">Course Grade Summary</div>
          <span class="badge b-blue">By Department</span>
        </div>
        ${embedZone({ title:'Grade Summary Table', desc:'A course-by-course grade summary will appear here, showing average grades, grade counts, and trends by teacher and department.', size:'short' })}
      </div>
      <div class="card">
        <div class="card-head">
          <div class="card-title">GPA Distribution</div>
          <span class="badge b-green">Campus-Wide</span>
        </div>
        ${embedZone({ title:'GPA Distribution Chart', desc:'A visual breakdown of GPA ranges across all students will display here — from honor roll to students needing academic support.', size:'short' })}
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div class="card-title">Honor Roll & Academic Watch List</div>
        <span class="badge b-teal">Live</span>
      </div>
      ${embedZone({ title:'Student Academic Standing List', desc:'Students on the honor roll and those needing academic intervention will be listed here, filterable by grade level and GPA range.', tags:['Student Name','GPA','Grade','Courses','Teacher'], size:'short' })}
    </div>
  `;
}

// =====================================================
//  ATTENDANCE
// =====================================================
function pageAttendance(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Attendance</div>
        <div class="pg-sub">Daily, weekly, and semester attendance tracking by campus and student</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(I.dl, 14)} Export Report</button>
      </div>
    </div>

    ${alertBanner('amber', 'Chronic Absenteeism Watch', 'Students with less than 90% attendance may require outreach from your campus counseling team. Use the list below to identify those students.')}

    <div class="stat-row">
      ${statCard('Today\'s Attendance',   '—%','As of this morning',         'green')}
      ${statCard('Weekly Average',        '—%','Mon – Fri this week',        'teal')}
      ${statCard('Chronically Absent',    '—', 'Below 90% this semester',    'amber')}
      ${statCard('Unexcused Absences',    '—', 'This week',                  'red')}
      ${statCard('Tardies',               '—', 'This week',                  'blue')}
    </div>

    <div class="g2" style="margin-bottom:18px">
      <div class="card">
        <div class="card-head">
          <div class="card-title">Daily Attendance</div>
          <span class="badge b-teal">This Week</span>
        </div>
        ${embedZone({ title:'Daily Attendance Chart', desc:'A daily breakdown of present, absent, and tardy counts for the current week will display here.', size:'short' })}
      </div>
      <div class="card">
        <div class="card-head">
          <div class="card-title">Attendance Trend</div>
          <span class="badge b-blue">Full Year</span>
        </div>
        ${embedZone({ title:'Monthly Trend Chart', desc:'A month-by-month attendance trend for the full academic year will display here.', size:'short' })}
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Student Attendance Records</div>
          <div class="card-sub">Individual attendance data for all enrolled students</div>
        </div>
        <span class="badge b-green">Live</span>
      </div>
      <div class="card-body" style="padding-bottom:0">
        <div class="search-row">
          <div class="search-field">
            ${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 15)}
            <input type="text" placeholder="Search student name…" />
          </div>
          <select class="sel"><option>All Grades</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select>
          <select class="sel"><option>All Status</option><option>On Track (≥95%)</option><option>Monitor (90–94%)</option><option>At Risk (&lt;90%)</option></select>
        </div>
      </div>
      ${embedZone({ title:'Attendance Table', desc:'Student-by-student attendance records will appear here — showing days present, days absent, tardies, and overall percentage.', tags:['Name','Grade','Present','Absent','Tardy','% Attendance','Status'] })}
    </div>
  `;
}

// =====================================================
//  BEHAVIOR & CONDUCT  (formerly PBIS)
// =====================================================
function pageBehavior(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Behavior & Conduct</div>
        <div class="pg-sub">Student recognitions, conduct referrals, and behavioral trend tracking</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(I.dl, 14)} Export Log</button>
        <button class="btn btn-primary btn-sm">${icon(I.plus, 14)} New Entry</button>
      </div>
    </div>

    <div class="stat-row">
      ${statCard('Recognitions Awarded',  '—', 'Positive behavior this semester', 'green')}
      ${statCard('Referrals Filed',       '—', 'This semester',                   'amber')}
      ${statCard('Pending Resolution',    '—', 'Open referrals',                  'red')}
      ${statCard('In-School Support',     '—', 'ISS / interventions assigned',    'blue')}
      ${statCard('Parent Contacts',       '—', 'Logged this semester',            'teal')}
      ${statCard('Repeat Referrals',      '—', 'Same student, 3+ incidents',      'purple')}
    </div>

    <div class="g2" style="margin-bottom:18px">
      <div class="card">
        <div class="card-head">
          <div class="card-title">Referral Categories</div>
          <span class="badge b-amber">This Semester</span>
        </div>
        ${embedZone({ title:'Referral Breakdown Chart', desc:'A breakdown of referral types — disruption, tardiness, dress code, device use, etc. — will appear here as a chart.', size:'short' })}
      </div>
      <div class="card">
        <div class="card-head">
          <div class="card-title">Recognition Trend</div>
          <span class="badge b-green">Monthly</span>
        </div>
        ${embedZone({ title:'Recognition Trend Chart', desc:'Monthly positive recognition totals will display here as a trend line — great for sharing in campus leadership meetings.', size:'short' })}
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Conduct & Recognition Log</div>
          <div class="card-sub">All referral and recognition entries for this campus</div>
        </div>
        <span class="badge b-teal">Live</span>
      </div>
      <div class="card-body" style="padding-bottom:0">
        <div class="search-row">
          <div class="search-field">
            ${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 15)}
            <input type="text" placeholder="Search student or staff name…" />
          </div>
          <select class="sel"><option>All Entry Types</option><option>Referral</option><option>Recognition</option></select>
          <select class="sel"><option>All Status</option><option>Pending</option><option>Resolved</option><option>Logged</option></select>
        </div>
      </div>
      ${embedZone({ title:'Conduct Log Table', desc:'All conduct referrals and positive recognitions will be listed here — filterable by type, date, status, and staff member.', tags:['Student','Entry Type','Category','Reported By','Date','Status','Action Taken'] })}
    </div>
  `;
}

// =====================================================
//  AFTER-SCHOOL PROGRAMS
// =====================================================
function pageAfterSchool(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">After-School Programs</div>
        <div class="pg-sub">Program rosters, daily attendance sign-in, and enrollment overview</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(I.dl, 14)} Export</button>
        <button class="btn btn-primary btn-sm">${icon(I.plus, 14)} Add Program</button>
      </div>
    </div>

    <div class="stat-row">
      ${statCard('Active Programs',       '—', 'Running this semester',   'teal')}
      ${statCard('Total Enrolled',        '—', 'Across all programs',     'blue')}
      ${statCard('Sign-Ins Today',        '—', 'As of close of day',      'green')}
      ${statCard('Avg. Daily Attendance', '—%','Participation rate',      'amber')}
    </div>

    <div class="card" style="margin-bottom:18px">
      <div class="card-head">
        <div class="card-title">Program Directory</div>
        <span class="badge b-teal">All Active Programs</span>
      </div>
      ${embedZone({ title:'Program Cards', desc:'All active after-school programs will be listed here — showing program name, staff advisor, meeting days, time, location, and current enrollment.', tags:['Program Name','Advisor','Days','Time','Room','Enrolled'], size:'short' })}
    </div>

    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Daily Sign-In Log</div>
          <div class="card-sub">Student check-in and check-out records by program</div>
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
      ${embedZone({ title:'Sign-In Table', desc:'Daily sign-in and sign-out records for all after-school programs will appear here — filterable by program, date, and student.', tags:['Student','Program','Date','Sign-In','Sign-Out','Supervising Staff'] })}
    </div>
  `;
}

// =====================================================
//  STAFF DIRECTORY
// =====================================================
function pageStaff(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Staff Directory</div>
        <div class="pg-sub">All campus staff, roles, departments, and contact information</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(I.dl, 14)} Export</button>
        <button class="btn btn-primary btn-sm">${icon(I.plus, 14)} Add Staff</button>
      </div>
    </div>

    <div class="stat-row">
      ${statCard('Total Staff',      '—', 'All roles and departments',     'blue')}
      ${statCard('Teachers',         '—', 'Classroom instructors',         'green')}
      ${statCard('Support Staff',    '—', 'Counselors, aides, specialists','teal')}
      ${statCard('Administration',   '—', 'Admin and leadership team',     'purple')}
    </div>

    <div class="card" style="margin-bottom:18px">
      <div class="card-body">
        <div class="search-row">
          <div class="search-field">
            ${icon('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 15)}
            <input type="text" placeholder="Search by name or role…" />
          </div>
          <select class="sel"><option>All Departments</option><option>Administration</option><option>Counseling</option><option>English / ELA</option><option>Mathematics</option><option>Science</option><option>Social Studies</option><option>Special Education</option><option>Physical Education</option></select>
          <button class="btn btn-ghost btn-sm">Reset Filters</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Staff Records</div>
          <div class="card-sub">All staff members connected to your campus directory</div>
        </div>
        <span class="badge b-teal">Live Data</span>
      </div>
      ${embedZone({ title:'Staff Directory Table', desc:'Your full staff directory will display here — including name, role, department, email address, and phone extension.', tags:['Name','Role','Department','Email','Extension'], size:'tall' })}
    </div>
  `;
}

// =====================================================
//  ANALYTICS & REPORTS
// =====================================================
function pageAnalytics(c) {
  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Analytics & Reports</div>
        <div class="pg-sub">Campus-wide dashboards and downloadable reports for leadership review</div>
      </div>
      <div class="pg-actions">
        <button class="btn btn-ghost btn-sm">${icon(I.dl, 14)} Download PDF</button>
      </div>
    </div>

    ${alertBanner('blue', 'Your reports will appear here', 'Once your campus data is connected by the Nexaflow setup team, full interactive reports will display in each panel below.')}

    <div class="card" style="margin-bottom:18px">
      <div class="card-head">
        <div>
          <div class="card-title">Main Campus Analytics Dashboard</div>
          <div class="card-sub">Full interactive report — attendance, grades, behavior, and enrollment in one view</div>
        </div>
      </div>
      ${embedZone({ title:'Main Analytics Report', desc:'Your primary campus analytics dashboard will display here. This is the main report used for principal walkthroughs, district check-ins, and board presentations.', size:'tall' })}
    </div>

    <div class="section-label">Individual Report Panels</div>
    <div class="g3">
      <div class="card">
        <div class="card-head"><div class="card-title">Attendance Report</div></div>
        ${embedZone({ title:'Attendance Panel', desc:'Attendance summary report will display here.', size:'short' })}
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">Conduct Report</div></div>
        ${embedZone({ title:'Conduct Panel', desc:'Behavior and referral summary will display here.', size:'short' })}
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">Academic Report</div></div>
        ${embedZone({ title:'Academic Panel', desc:'GPA and grade summary will display here.', size:'short' })}
      </div>
    </div>
  `;
}

// =====================================================
//  CONNECTED DATA SOURCES  (formerly "Integrations")
// =====================================================
function pageIntegrations(c) {
  const tools = [
    { name:'Interactive Dashboards', tag:'📊', color:'#1A73E8', bg:'#EAF0FE', desc:'Live visual dashboards that pull directly from your school\'s data. Charts and tables update automatically as new data comes in.', status:'Ready to connect', badge:'b-blue' },
    { name:'Spreadsheet Data',       tag:'📋', color:'#059669', bg:'#ECFDF5', desc:'Connect to your existing school spreadsheets. Data entered by staff automatically flows into this portal.', status:'Ready to connect', badge:'b-green' },
    { name:'Automated Reports',      tag:'⚙️', color:'#D97706', bg:'#FFFBEB', desc:'Scheduled reports that run automatically — daily attendance summaries, weekly grade snapshots, and more — sent to this portal and to your email.', status:'Ready to connect', badge:'b-amber' },
    { name:'Online Forms & Sign-Ins', tag:'📝', color:'#7C3AED', bg:'#F5F3FF', desc:'Connect digital forms for after-school sign-in, parent feedback, referral submissions, and more. Responses flow directly into the relevant page.', status:'Ready to connect', badge:'b-purple' },
    { name:'Learning Management System', tag:'🎓', color:'#0D9488', bg:'#F0FDFA', desc:'Future connection to your campus LMS — pull course rosters, assignment completion rates, and teacher data into this portal.', status:'Coming soon', badge:'b-teal' },
    { name:'State & District Reporting', tag:'🏫', color:'#DC2626', bg:'#FEF2F2', desc:'Future connection to state and district reporting systems to view compliance data and submission statuses in one place.', status:'Coming soon', badge:'b-red' },
  ];

  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Connected Data Sources</div>
        <div class="pg-sub">All the tools and data systems that power your LandPage SIS portal</div>
      </div>
    </div>

    ${alertBanner('green', 'How Your Data Gets Here', 'LandPage SIS connects to the tools your campus already uses — spreadsheets, online forms, and reporting dashboards. Your Nexaflow setup team handles all of the technical connections. You just use the portal.')}

    <div class="section-label" style="margin-top:8px">Available & Upcoming Connections</div>
    <div class="g-auto" style="margin-bottom:28px">
      ${tools.map(t => `
        <div class="integ-tile">
          <div class="integ-logo" style="background:${t.bg};font-size:1.2rem">${t.tag}</div>
          <div style="flex:1">
            <div class="integ-name">${t.name}</div>
            <div class="integ-desc">${t.desc}</div>
            <span class="badge ${t.badge}" style="margin-top:10px">${t.status}</span>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="section-label">How This Works — For Administrators</div>
    <div class="card">
      ${[
        ['Your data stays where it is', 'LandPage SIS does not replace your existing systems. It pulls information from the tools your school already uses and displays everything in one clean portal — no data migration required.'],
        ['Setup is handled for you', 'The Nexaflow Digital team configures all data connections during your onboarding. You do not need any technical knowledge to use or maintain this portal.'],
        ['Data updates automatically', 'Once connected, dashboards and tables in this portal refresh automatically as new information is entered by your staff — no manual uploads needed.'],
        ['Role-based access', 'Principals, assistant principals, counselors, and teachers can each be given access to the sections most relevant to their role. Contact Nexaflow to configure access levels.'],
        ['You own your data', 'All data displayed in LandPage SIS originates from systems you control. Nexaflow simply provides the display layer — your campus retains full ownership and control.'],
      ].map(([head, body], i) => `
        <div class="guide-step">
          <div class="guide-num">${i + 1}</div>
          <div><div class="guide-head">${head}</div><div class="guide-body">${body}</div></div>
        </div>
      `).join('')}
    </div>
  `;
}

// =====================================================
//  QUICK GUIDE & FAQ
// =====================================================
function pageGuide(c) {
  const faqs = [
    ['What is LandPage SIS?', 'LandPage SIS is a school information portal built by Nexaflow Digital. It brings together student data, attendance, grades, behavior, and after-school programs into one clean, easy-to-use dashboard for campus administrators.'],
    ['Who should use this portal?', 'This portal is designed for campus principals, assistant principals, school counselors, and administrative staff. Each role can be given access to the sections most relevant to their work.'],
    ['Do I need to enter data manually?', 'No. Once your portal is set up by the Nexaflow team, data flows in automatically from your connected sources. Staff can continue using the tools they already know.'],
    ['What happens if the data looks wrong?', 'If you notice incorrect data, it means something may need to be updated in the original source — for example, in your campus spreadsheet or sign-in form. Changes made there will reflect here. Contact Nexaflow support if the issue persists.'],
    ['Can I control who sees what?', 'Yes. LandPage SIS supports role-based access. Counselors, teachers, and administrators can each be set up with access to specific pages. Contact your Nexaflow representative to adjust access settings.'],
    ['Can I add more pages or sections?', 'Yes. Nexaflow can build additional pages or panels for your campus — such as parent communication logs, budget summaries, or custom reports. Reach out to discuss your needs.'],
    ['How do I get support?', 'Visit the Technical Support page in this portal for contact options, video walkthroughs, and to schedule a call with the Nexaflow team.'],
    ['Is this portal secure?', 'Yes. LandPage SIS uses the same security standards as the tools it connects to. No student data is stored in the portal itself — it is only displayed from your existing, secured systems.'],
  ];

  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Quick Guide & FAQ</div>
        <div class="pg-sub">Everything you need to know to navigate and use your campus portal</div>
      </div>
    </div>

    <div class="section-label">Getting Started — 5 Simple Steps</div>
    <div class="card" style="margin-bottom:22px">
      ${[
        ['Navigate using the left sidebar', 'Click any section in the menu on the left side of the screen — Dashboard, Student Roster, Attendance, Behavior, and more. Each section has its own page with filters, charts, and data tables.'],
        ['Use the search bar at the top', 'The search bar at the top of every page lets you quickly find students, staff, or reports without navigating through menus.'],
        ['Filter and sort your data', 'Most pages include filter dropdowns — by grade level, status, department, or date range — to help you narrow down exactly what you\'re looking for.'],
        ['Download and share reports', 'Any page with a report panel includes a download button. Use this to export data as a PDF or spreadsheet for meetings, district submissions, or parent communications.'],
        ['Contact Nexaflow for changes', 'If you need a new section, updated data connection, or a change to how information is displayed, reach out to the Nexaflow support team through the Technical Support page.'],
      ].map(([head, body], i) => `
        <div class="guide-step">
          <div class="guide-num">${i + 1}</div>
          <div><div class="guide-head">${head}</div><div class="guide-body">${body}</div></div>
        </div>
      `).join('')}
    </div>

    <div class="section-label">Frequently Asked Questions</div>
    <div class="card" id="faqCard">
      ${faqs.map(([ q, a]) => `
        <div class="faq-item">
          <div class="faq-q">
            <span>${q}</span>
            ${icon(I.chevron, 16)}
          </div>
          <div class="faq-a">${a}</div>
        </div>
      `).join('')}
    </div>
  `;

  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });
}

// =====================================================
//  TECHNICAL SUPPORT
// =====================================================
function pageSupport(c) {
  const cards = [
    { icon: I.video, color:'var(--accent)', bg:'var(--accent-lo)', title:'Video Walkthroughs', desc:'Short video tutorials covering each section of the portal — great for onboarding new staff members or reviewing how a specific feature works.' },
    { icon: I.mail,  color:'var(--teal)',   bg:'var(--teal-lo)',   title:'Email Support',     desc:'Send a message to the Nexaflow Digital support team. We respond within one business day for all active accounts.' },
    { icon: I.book,  color:'var(--green)',  bg:'var(--green-lo)',  title:'Documentation',     desc:'Step-by-step written guides covering every section of the portal, written specifically for school administrators — no technical knowledge needed.' },
    { icon: I.phone, color:'var(--amber)',  bg:'var(--amber-lo)',  title:'Live Support Call', desc:'Schedule a 30-minute call with a member of the Nexaflow team. Ideal for questions, data connection issues, or requesting new features.' },
    { icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      color:'var(--purple)', bg:'var(--purple-lo)', title:'Request a Feature', desc:'Have an idea for a new page, report, or data view? Submit a feature request and the Nexaflow team will follow up to discuss options and timeline.' },
    { icon: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      color:'var(--red)', bg:'var(--red-lo)', title:'Report an Issue', desc:'Something not displaying correctly? Use the issue report form to describe what you\'re seeing. Include the page name and what you expected to happen.' },
  ];

  c.innerHTML = `
    <div class="pg-head">
      <div>
        <div class="pg-title">Technical Support</div>
        <div class="pg-sub">Resources and direct support from the Nexaflow Digital team</div>
      </div>
    </div>

    ${alertBanner('blue', 'We\'re here to help', 'The Nexaflow Digital team supports all LandPage SIS portals. For data connections, design changes, new sections, or anything that isn\'t working as expected — reach out using any of the options below.')}

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
    <div class="section-label">Portal Information</div>
    <div class="card">
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
          ${[
            ['Portal Version',    'v1.0.0'],
            ['Built By',          'Nexaflow Digital'],
            ['Campus',            'Lakewood Ridge High'],
            ['Campus ID',         'LRH-001'],
            ['Support Hours',     'Mon–Fri, 8am–5pm CST'],
            ['Support Email',     'support@nexaflowdigital.com'],
          ].map(([k, v]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:0.82rem;color:var(--text-lo)">${k}</span>
              <span style="font-size:0.82rem;font-weight:600;color:var(--text-md)">${v}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
