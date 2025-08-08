// Simple RTL Dashboard - DigitalMan
const state = {
  user: null,
  data: null,
};

const dom = sel => document.querySelector(sel);
const listEl = (text) => {
  const div = document.createElement('div');
  div.className = 'item';
  div.textContent = text;
  return div;
};

async function loadData() {
  const res = await fetch('assets/data.json?_=' + Date.now());
  state.data = await res.json();
}

function fillUserSelect() {
  const sel = dom('#userSelect');
  sel.innerHTML = '';
  state.data.employees.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.full_name;
    opt.textContent = `${e.full_name} — ${e.role}`;
    sel.appendChild(opt);
  });
}

function login() {
  const name = dom('#userSelect').value;
  const user = state.data.employees.find(e => e.full_name === name);
  state.user = user;
  localStorage.setItem('dm_user', user.full_name);
  render();
}

function logout() {
  state.user = null;
  localStorage.removeItem('dm_user');
  render();
}

function render() {
  const logged = !!state.user;
  dom('#login').style.display = logged ? 'none' : '';
  dom('#dashboard').style.display = logged ? '' : 'none';
  dom('#tabs').style.display = logged ? 'flex' : 'none';
  dom('#btnLogout').style.display = logged ? '' : 'none';
  dom('#admin').style.display = 'none';
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelector('.tab[data-tab="dashboard"]')?.classList.add('active');

  if (!logged) return;

  // Welcome & meta
  dom('#welcome').textContent = 'سلام، ' + state.user.full_name + ' 👋';
  const meta = dom('#meta');
  meta.innerHTML = '';
  const chips = [
    ['سمت', state.user.role],
    ['شیفت', state.user.shift ?? '—']
  ];
  chips.forEach(([k,v]) => {
    const c = document.createElement('div');
    c.className = 'chip';
    c.textContent = `${k}: ${v}`;
    meta.appendChild(c);
  });

  // Routines
  const myRoutines = state.data.routines
    .filter(r => r.full_name === state.user.full_name)
    .map(r => r.routine);
  const routinesBox = dom('#routinesList');
  routinesBox.innerHTML = '';
  (myRoutines.length ? myRoutines : ['موردی ثبت نشده']).forEach(t => routinesBox.appendChild(listEl(t)));

  // Shifts
  const myShifts = state.data.shifts.filter(s => s.full_name === state.user.full_name);
  const shiftBox = dom('#shiftBox'); shiftBox.innerHTML = '';
  if (myShifts.length) {
    myShifts.forEach(s => shiftBox.appendChild(listEl(`${s.shift_type} — ${s.start} تا ${s.end} (${s.days})`)));
  } else {
    shiftBox.appendChild(listEl('—'));
  }

  // Weekly
  const weekly = state.data.weekly_tasks.filter(w => w.full_name === state.user.full_name);
  const weeklyBox = dom('#weeklyList'); weeklyBox.innerHTML='';
  if (weekly.length){
    weekly.forEach(w => weeklyBox.appendChild(listEl(`${w.day}: ${w.task}`)));
  } else weeklyBox.appendChild(listEl('—'));

  // OKR
  const okr = state.data.okr.find(o => o.full_name === state.user.full_name);
  const okrBox = dom('#okrBox'); okrBox.innerHTML='';
  if (okr){
    okrBox.appendChild(listEl('🎯 هدف: ' + okr.goal));
    okrBox.appendChild(listEl('📊 نتایج کلیدی: ' + okr.key_results));
  } else {
    okrBox.appendChild(listEl('—'));
  }

  // Note
  const key = 'dm_note_' + state.user.full_name;
  const prev = localStorage.getItem(key) || '';
  dom('#myNote').value = prev;
  dom('#saveStamp').textContent = prev ? 'ذخیره‌شده' : '';
}

function attachEvents(){
  dom('#btnLogin').addEventListener('click', login);
  dom('#btnLogout').addEventListener('click', logout);
  dom('#saveNote').addEventListener('click', () => {
    const key = 'dm_note_' + state.user.full_name;
    localStorage.setItem(key, dom('#myNote').value);
    dom('#saveStamp').textContent = 'ذخیره شد ✔';
    setTimeout(()=> dom('#saveStamp').textContent = 'ذخیره‌شده', 1200);
  });
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const id = tab.dataset.tab;
      dom('#dashboard').style.display = id==='dashboard' ? '' : 'none';
      dom('#admin').style.display = id==='admin' ? '' : 'none';
    });
  });
}

async function boot(){
  await loadData();
  fillUserSelect();
  attachEvents();

  // Admin tab visibility
  const adminTab = document.getElementById('adminTab');
  const savedUser = localStorage.getItem('dm_user');
  if (savedUser){
    state.user = state.data.employees.find(e => e.full_name === savedUser);
  }
  // Only "سید سها سعادتی" sees Admin tab (change later to role=مدیر)
  const isAdmin = state.user?.role?.includes('مدیر') || false;
  adminTab.style.display = isAdmin ? '' : 'none';

  // Admin summary
  const summary = document.getElementById('adminSummary');
  summary.innerHTML='';
  state.data.employees.forEach(e => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `<strong>${e.full_name}</strong> — ${e.role}<br><span class="muted">${e.shift ?? ''}</span>`;
    summary.appendChild(div);
  });

  render();
}
boot();
