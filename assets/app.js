
// DigitalMan - Login v4
// - Strict PIN validation against assets/data.json
// - No auto-login
// - Lockout after 3 failed attempts for 30s
// - Works with: #userSelect, #pinInput, #btnLogin, #loginError, #dashboard, #login, #tabs, #btnLogout, etc.

const dom = s => document.querySelector(s);
const listEl = t => { const d=document.createElement('div'); d.className='item'; d.textContent=t; return d; };

const state = { data:null, user:null, tries:0, lockedUntil:0 };

async function loadData(){
  const res = await fetch('assets/data.json?_=' + Date.now(), {cache:'no-store'});
  state.data = await res.json();
  return state.data;
}
function fillUsers(){
  const sel = dom('#userSelect'); if(!sel) return;
  sel.innerHTML='';
  const arr = (state.data.employees || state.data || []); // tolerate {employees:[...]} or plain array
  arr.forEach(e=>{
    const u = e.username || e.name || e.user || '';
    const role = e.role || '';
    const name = e.full_name || e.name || u;
    const o=document.createElement('option');
    o.value = u; o.textContent = `${name}${role? ' — '+role:''}`;
    sel.appendChild(o);
  });
}
function now(){ return Date.now(); }
function msToSec(ms){ return Math.max(0, Math.ceil(ms/1000)); }

function setError(msg){
  const err = dom('#loginError');
  if (!err) return;
  err.textContent = msg || '';
  err.style.display = msg ? 'block' : 'none';
}

function tryLogin(){
  // lockout check
  if (state.lockedUntil && now() < state.lockedUntil){
    const wait = msToSec(state.lockedUntil - now());
    setError(`چند لحظه صبر کنید (${wait} ثانیه باقی مانده)`);
    return;
  }

  const sel = dom('#userSelect');
  const pinEl = dom('#pinInput');
  const u = (sel && sel.value || '').trim();
  const p = (pinEl && pinEl.value || '').trim();

  setError('');

  const arr = (state.data.employees || state.data || []);
  const user = arr.find(e => (e.username || e.name || '') === u);
  if (!user){ setError('کاربر پیدا نشد.'); return; }
  if (!p){ setError('PIN را وارد کنید.'); return; }

  const correct = String(user.pin) === String(p);
  if (!correct){
    state.tries += 1;
    if (state.tries >= 3){
      state.lockedUntil = now() + 30_000; // 30s
      state.tries = 0;
      setError('۳ تلاش ناموفق. ۳۰ ثانیه دیگر دوباره تلاش کنید.');
    } else {
      setError('PIN نادرست است.');
    }
    return;
  }

  // success
  state.user = user;
  state.tries = 0;
  state.lockedUntil = 0;
  if (pinEl) pinEl.value = '';
  render();
}

function logout(){
  state.user = null;
  render();
}

function render(){
  const logged = !!state.user;
  const login = dom('#login'), dash = dom('#dashboard'), tabs = dom('#tabs'), out=dom('#btnLogout');
  if (login) login.style.display = logged ? 'none' : '';
  if (dash)  dash.style.display  = logged ? '' : 'none';
  if (tabs)  tabs.style.display  = logged ? 'flex' : 'none';
  if (out)   out.style.display   = logged ? '' : 'none';

  if (!logged) return;

  // Populate dashboard minimal (safe to no-op if elements don't exist)
  const meta = dom('#meta');
  const welcome = dom('#welcome');
  if (welcome) welcome.textContent = 'سلام، ' + (state.user.full_name || state.user.name || state.user.username) + ' 👋';
  if (meta){
    meta.innerHTML='';
    const chip = (k,v)=>{ const c=document.createElement('div'); c.className='chip'; c.textContent=`${k}: ${v}`; meta.appendChild(c); };
    chip('سمت', state.user.role || '—');
    chip('شیفت', state.user.shift || '—');
  }

  // Admin tab visibility
  const isAdmin = ((state.user.role||'') + (state.user.full_name||'') ).includes('مدیر');
  const adminTab = dom('#adminTab'); if (adminTab) adminTab.style.display = isAdmin? '' : 'none';

  // Render lists if exist
  const arr = (state.data.employees || state.data || []);
  const routines = (state.data.routines||[]).filter(r=> r.full_name === (state.user.full_name||state.user.name));
  const shifts = (state.data.shifts||[]).filter(s=> s.full_name === (state.user.full_name||state.user.name));
  const weekly = (state.data.weekly_tasks||[]).filter(w=> w.full_name === (state.user.full_name||state.user.name));
  const okr = (state.data.okr||[]).find(o=> o.full_name === (state.user.full_name||state.user.name));

  const rBox = dom('#routinesList'); if (rBox){ rBox.innerHTML=''; (routines.length?routines:[{routine:'—'}]).forEach(r=> rBox.appendChild(listEl(r.routine))); }
  const sBox = dom('#shiftBox'); if (sBox){ sBox.innerHTML=''; (shifts.length?shifts:[{shift_type:'—',start:'',end:'',days:''}]).forEach(s=> sBox.appendChild(listEl(`${s.shift_type} — ${s.start} تا ${s.end} ${s.days? '('+s.days+')':''}`))); }
  const wBox = dom('#weeklyList'); if (wBox){ wBox.innerHTML=''; (weekly.length?weekly:[{day:'',task:'—'}]).forEach(w=> wBox.appendChild(listEl(`${w.day? w.day+': ':''}${w.task}`))); }
  const oBox = dom('#okrBox'); if (oBox){ oBox.innerHTML=''; if (okr){ oBox.appendChild(listEl('🎯 هدف: '+okr.goal)); oBox.appendChild(listEl('📊 نتایج کلیدی: '+okr.key_results)); } else { oBox.appendChild(listEl('—')); } }
}

function attach(){
  const btnIn = dom('#btnLogin'), btnOut = dom('#btnLogout');
  if (btnIn)  btnIn.addEventListener('click', tryLogin);
  if (btnOut) btnOut.addEventListener('click', logout);

  // Enter to submit
  const pinEl = dom('#pinInput');
  if (pinEl) pinEl.addEventListener('keyup', (e)=>{ if (e.key === 'Enter') tryLogin(); });
}

async function boot(){
  await loadData();
  fillUsers();
  attach();
  render();
}

boot();
