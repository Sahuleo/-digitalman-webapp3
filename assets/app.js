// DigitalMan Auth MVP (PIN-based; client-side for demo)
const dom = s => document.querySelector(s);
const listEl = t => { const d = document.createElement('div'); d.className='item'; d.textContent=t; return d; };

const state = { data:null, user:null };

async function loadData(){
  const res = await fetch('assets/data.json?_=' + Date.now());
  state.data = await res.json();
}
function fillUsers(){
  const sel = dom('#userSelect'); sel.innerHTML='';
  state.data.employees.forEach(e=>{
    const o = document.createElement('option');
    o.value = e.username; o.textContent = `${e.full_name} — ${e.role}`;
    sel.appendChild(o);
  });
}
function tryLogin(){
  const u = dom('#userSelect').value.trim();
  const p = dom('#pinInput').value.trim();
  const user = state.data.employees.find(e => e.username === u);
  const err = dom('#loginError');
  if (!user){ err.textContent='کاربر پیدا نشد'; err.style.display='block'; return; }
  if (user.pin !== p){ err.textContent='PIN نادرست است'; err.style.display='block'; return; }
  err.style.display='none';
  state.user = user;
  localStorage.setItem('dm_user', user.username);
  render();
}
function logout(){
  state.user = null;
  localStorage.removeItem('dm_user');
  render();
}
function render(){
  const logged = !!state.user;
  dom('#login').style.display = logged ? 'none' : '';
  dom('#dashboard').style.display = logged ? '' : 'none';
  dom('#tabs').style.display = logged ? 'flex' : 'none';
  dom('#btnLogout').style.display = logged ? '' : 'none';
  dom('#admin').style.display = 'none';
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelector('.tab[data-tab="dashboard"]')?.classList.add('active');
  if (!logged) return;

  dom('#welcome').textContent = 'سلام، ' + state.user.full_name + ' 👋';
  const meta = dom('#meta'); meta.innerHTML='';
  [['سمت', state.user.role], ['شیفت', state.user.shift || '—']].forEach(([k,v])=>{
    const c = document.createElement('div'); c.className='chip'; c.textContent = `${k}: ${v}`; meta.appendChild(c);
  });

  const routines = state.data.routines.filter(r=> r.full_name===state.user.full_name);
  const rBox = dom('#routinesList'); rBox.innerHTML=''; (routines.length?routines:[{routine:'—'}]).forEach(r=> rBox.appendChild(listEl(r.routine)));

  const shifts = state.data.shifts.filter(s=> s.full_name===state.user.full_name);
  const sBox = dom('#shiftBox'); sBox.innerHTML=''; (shifts.length?shifts:[{shift_type:'—',start:'',end:'',days:''}]).forEach(s=> sBox.appendChild(listEl(`${s.shift_type} — ${s.start} تا ${s.end} ${s.days? '('+s.days+')':''}`)));

  const weekly = state.data.weekly_tasks.filter(w=> w.full_name===state.user.full_name);
  const wBox = dom('#weeklyList'); wBox.innerHTML=''; (weekly.length?weekly:[{day:'',task:'—'}]).forEach(w=> wBox.appendChild(listEl(`${w.day? w.day+': ':''}${w.task}`)));

  const okr = state.data.okr.find(o=> o.full_name===state.user.full_name);
  const oBox = dom('#okrBox'); oBox.innerHTML='';
  if (okr){ oBox.appendChild(listEl('🎯 هدف: '+okr.goal)); oBox.appendChild(listEl('📊 نتایج کلیدی: '+okr.key_results)); } else { oBox.appendChild(listEl('—')); }

  const key='dm_note_'+state.user.username;
  const prev=localStorage.getItem(key)||''; dom('#myNote').value=prev; dom('#saveStamp').textContent= prev? 'ذخیره‌شده':'';

  // Admin tab
  const isAdmin = (state.user.role||'').includes('مدیر');
  const adminTab = dom('#adminTab'); adminTab.style.display = isAdmin? '':'none';
  if (isAdmin){
    const sum = dom('#adminSummary'); sum.innerHTML='';
    state.data.employees.forEach(e=>{
      const d=document.createElement('div'); d.className='item';
      d.innerHTML = `<strong>${e.full_name}</strong> — ${e.role}<br><span class="muted">${e.shift||''}</span>`;
      sum.appendChild(d);
    });
  }
}
function attach(){
  dom('#btnLogin').addEventListener('click', tryLogin);
  dom('#btnLogout').addEventListener('click', logout);
  dom('#saveNote').addEventListener('click', ()=>{
    const key='dm_note_'+state.user.username;
    localStorage.setItem(key, dom('#myNote').value);
    dom('#saveStamp').textContent='ذخیره شد ✔';
    setTimeout(()=> dom('#saveStamp').textContent='ذخیره‌شده', 1200);
  });
  document.querySelectorAll('.tab').forEach(t=> t.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    const id=t.dataset.tab;
    dom('#dashboard').style.display = id==='dashboard' ? '' : 'none';
    dom('#admin').style.display = id==='admin' ? '' : 'none';
  }));
}
async function boot(){
  await loadData();
  // restore session
  const saved = localStorage.getItem('dm_user');
  if (saved){
    const u = state.data.employees.find(x=> x.username===saved);
    if (u) state.user=u;
  }
  // fill select
  const sel = dom('#userSelect'); sel.innerHTML='';
  state.data.employees.forEach(e=>{
    const o = document.createElement('option');
    o.value=e.username; o.textContent = `${e.full_name} — ${e.role}`;
    sel.appendChild(o);
  });
  attach(); render();
}
boot();
