/* ============================================================
   admin.js — Admin dashboard logic
   Replace SCRIPT_URL and ADMIN_PASSWORD as needed
   ============================================================ */

const SCRIPT_URL    = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
const ADMIN_PASSWORD = 'uma2026';  // Change this password!

// ---- Sample demo data (shown when no Script URL is configured) ----
const DEMO_DATA = [
  { row: 1, timestamp: '2026-09-07 14:22', name: 'Maria Santos', email: 'maria@email.com', phone: '+351 912 345 678', date: '2026-09-10', time: '20:00', guests: '4', notes: 'Anniversary dinner, please arrange flowers if possible', status: 'Pending', comment: '' },
  { row: 2, timestamp: '2026-09-07 16:05', name: 'João Ferreira', email: 'joao@email.com', phone: '+351 934 567 890', date: '2026-09-11', time: '19:30', guests: '2', notes: '', status: 'Approved', comment: 'Confirmed! Table by the window reserved.' },
  { row: 3, timestamp: '2026-09-08 09:14', name: 'Priya Sharma', email: 'priya@email.com', phone: '+351 967 890 123', date: '2026-09-08', time: '13:00', guests: '6', notes: 'One vegetarian guest', status: 'Pending', comment: '' },
  { row: 4, timestamp: '2026-09-08 10:30', name: 'Carlos Lima', email: '', phone: '+351 921 000 111', date: '2026-09-09', time: '21:00', guests: '8+', notes: 'Corporate dinner', status: 'Rejected', comment: 'Unfortunately fully booked that evening. Please call us to reschedule.' },
  { row: 5, timestamp: '2026-09-08 11:55', name: 'Ana Costa', email: 'ana@email.com', phone: '+351 916 222 333', date: '2026-09-14', time: '19:00', guests: '3', notes: '', status: 'Pending', comment: '' },
];

let allReservations = [];
let currentFilter   = 'all';
let currentDate     = '';
const isDemoMode    = SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// ---- AUTH ----
const loginScreen = document.getElementById('loginScreen');
const adminApp    = document.getElementById('adminApp');
const loginBtn    = document.getElementById('loginBtn');
const logoutBtn   = document.getElementById('logoutBtn');
const pwInput     = document.getElementById('pwInput');
const loginError  = document.getElementById('loginError');

function checkSession() {
  return sessionStorage.getItem('uc_admin') === 'true';
}

function login() {
  if (pwInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem('uc_admin', 'true');
    loginScreen.style.display = 'none';
    adminApp.style.display = 'block';
    loginError.style.display = 'none';
    init();
  } else {
    loginError.style.display = 'block';
    pwInput.value = '';
    pwInput.focus();
  }
}

loginBtn.addEventListener('click', login);
pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('uc_admin');
  location.reload();
});

if (checkSession()) {
  loginScreen.style.display = 'none';
  adminApp.style.display = 'block';
  init();
}

// ---- INIT ----
function init() {
  document.getElementById('adminDate').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (!isDemoMode) {
    document.getElementById('demoBanner').style.display = 'none';
  }

  setupFilters();
  loadReservations();

  document.getElementById('refreshBtn').addEventListener('click', loadReservations);
}

// ---- FILTERS ----
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTable();
    });
  });

  document.getElementById('filterDate').addEventListener('change', e => {
    currentDate = e.target.value;
    renderTable();
  });
}

// ---- LOAD ----
async function loadReservations() {
  const tbody = document.getElementById('resTableBody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading-state">Loading reservations...</td></tr>';

  if (isDemoMode) {
    allReservations = [...DEMO_DATA];
    updateStats();
    renderTable();
    return;
  }

  try {
    const res = await fetch(`${SCRIPT_URL}?action=list`);
    const data = await res.json();
    allReservations = data.reservations || [];
    updateStats();
    renderTable();
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><div class="es-icon">⚠️</div><p>Could not load reservations. Check your Apps Script URL.</p></td></tr>';
  }
}

// ---- STATS ----
function updateStats() {
  document.getElementById('statTotal').textContent    = allReservations.length;
  document.getElementById('statPending').textContent  = allReservations.filter(r => r.status === 'Pending').length;
  document.getElementById('statApproved').textContent = allReservations.filter(r => r.status === 'Approved').length;
  document.getElementById('statRejected').textContent = allReservations.filter(r => r.status === 'Rejected').length;
}

// ---- RENDER ----
function renderTable() {
  const tbody = document.getElementById('resTableBody');

  let filtered = allReservations.filter(r => {
    const statusMatch = currentFilter === 'all' || r.status === currentFilter;
    const dateMatch   = !currentDate || r.date === currentDate;
    return statusMatch && dateMatch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <div class="es-icon">📋</div>
          <p>No reservations found for this filter.</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((r, i) => `
    <tr id="row-${r.row}">
      <td style="color:rgba(255,255,255,0.25);font-size:0.78rem;">${i + 1}</td>
      <td>
        <div class="res-name">${esc(r.name)}</div>
        <div class="res-phone">${esc(r.phone)}${r.email ? ' · ' + esc(r.email) : ''}</div>
        ${r.notes ? `<div class="res-notes">"${esc(r.notes)}"</div>` : ''}
      </td>
      <td>
        <div>${formatDate(r.date)}</div>
        <div style="color:rgba(255,255,255,0.4);font-size:0.82rem;">${esc(r.time)}</div>
        <div style="color:rgba(255,255,255,0.25);font-size:0.72rem;margin-top:4px;">${esc(r.timestamp || '')}</div>
      </td>
      <td style="font-weight:700;color:var(--gold);">${esc(r.guests)}</td>
      <td><span class="badge badge-${r.status.toLowerCase()}">${esc(r.status)}</span></td>
      <td class="action-cell">
        ${r.status === 'Pending' ? `
          <textarea class="action-comment" id="comment-${r.row}" rows="2" placeholder="Optional message to guest..."></textarea>
          <div class="action-btns">
            <button class="approve-btn" onclick="updateRes(${r.row}, 'Approved')">✓ Approve</button>
            <button class="reject-btn"  onclick="updateRes(${r.row}, 'Rejected')">✗ Reject</button>
          </div>
        ` : `
          <span class="badge badge-${r.status.toLowerCase()}">${esc(r.status)}</span>
          ${r.comment ? `<div class="admin-comment-display">"${esc(r.comment)}"</div>` : ''}
        `}
      </td>
    </tr>
  `).join('');
}

// ---- UPDATE ----
async function updateRes(rowNum, newStatus) {
  const commentEl = document.getElementById(`comment-${rowNum}`);
  const comment   = commentEl ? commentEl.value.trim() : '';

  const approveBtn = document.querySelector(`#row-${rowNum} .approve-btn`);
  const rejectBtn  = document.querySelector(`#row-${rowNum} .reject-btn`);
  if (approveBtn) approveBtn.disabled = true;
  if (rejectBtn)  rejectBtn.disabled = true;

  // Update local state
  const res = allReservations.find(r => r.row === rowNum);
  if (res) { res.status = newStatus; res.comment = comment; }

  if (isDemoMode) {
    await new Promise(r => setTimeout(r, 600));
    updateStats();
    renderTable();
    return;
  }

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', row: rowNum, status: newStatus, comment }),
    });
    updateStats();
    renderTable();
  } catch (err) {
    alert('Could not update. Please check your connection.');
    if (approveBtn) approveBtn.disabled = false;
    if (rejectBtn)  rejectBtn.disabled = false;
  }
}

// ---- UTILS ----
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}
