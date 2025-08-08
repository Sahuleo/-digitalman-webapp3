/* DM_V5_FEATURES */
// v5.1: UI features + strict PIN + lockout (30s) + explicit marker + console banner
console.log('DigitalMan app.js v5.1 — DM_V5_FEATURES');

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
  const arr = (state.data.employees || state.data || []);
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
function setError(msg){ const err=dom('#loginError'); if(!err) return; err.textContent=msg||''; err.style.display=msg?'block':'none'; }

function tryLogin(){
  if (state.lockedUntil && now() < state.lockedUntil){
    const wait = msToSec(state.lockedUntil - now());
    setError(`چند لحظه صبر کنید (${wait} ثانیه باقی مانده)`);
    return;
  }
  const u=(dom('#userSelect')?.value||'').trim();
  const p=(dom('#pinInput')?.value||'').trim();
  setError('');
  const arr=(state.data.employees||state.data||[]);
  const user=arr.find(e=> (e.username||e.name||'')===u);
  if(!user){ setError('کاربر پیدا نشد.'); return; }
  if(!p){ setError('PIN را وارد کنید.'); return; }
  if(String(user.pin)!==String(p)){
    state.tries+=1;
    if(state.tries>=3){ state.lockedUntil=now()+30_000; state.tries=0; setError('۳ تلاش ناموفق. ۳۰ ثانیه دیگر تلاش کنید.'); }
    else setError('PIN نادرست است.');
    return;
  }
  state.user=user; state.tries=0; state.lockedUntil=0;
  const pinEl = dom('#pinInput'); if (pinEl) pinEl.value='';
  render();
}
function logout(){ state.user=null; render(); }

function saveLocal(key,val){ localStorage.setItem(key, JSON.stringify(val)); }
function loadLocal(key,def){ try{ return JSON.parse(localStorage.getItem(key) || 'null') ?? def; }catch{ return def; } }

function render(){
  const logged=!!state.user;
  const login=dom('#login'), home=dom('#home'), tasks=dom('#tasks'), people=dom('#people'), admin=dom('#admin'), tabs=dom('#tabs'), out=dom('#btnLogout');
  if(login) login.style.display= logged? 'none':'';
  if(home)  home.style.display = logged? '':'none';
  if(tasks) tasks.style.display= 'none';
  if(people)people.style.display= 'none';
  if(admin) admin.style.display = 'none';
  if(tabs)  tabs.style.display = logged? 'flex':'none';
  if(out)   out.style.display  = logged? '':'none';

  if(!logged) return;

  // Welcome + meta
  const welcome = dom('#welcome'); if (welcome) welcome.textContent = 'سلام، '+(state.user.full_name||state.user.name||state.user.username)+' 👋';
  const meta=dom('#meta'); if (meta){ meta.innerHTML=''; [['سمت',state.user.role],['شیفت',state.user.shift||'—']].forEach(([k,v])=>{
    const c=document.createElement('div'); c.className='chip'; c.textContent=`${k}: ${v}`; meta.appendChild(c);
  });}

  // Announcements (local)
  const abox = dom('#announceBox');
  if (abox){
    const ann = loadLocal('dm_announce', '');
    if (ann){ abox.style.display='block'; abox.textContent='🔔 '+ann; } else { abox.style.display='none'; }
  }

  // Routines
  const rBox=dom('#routinesList');
  if (rBox){
    const routines=(state.data.routines||[]).filter(r=> r.full_name===(state.user.full_name||state.user.name));
    rBox.innerHTML=''; (routines.length?routines:[{routine:'—'}]).forEach(r=> rBox.appendChild(listEl(r.routine)));
  }

  // Shifts
  const sBox=dom('#shiftBox');
  if (sBox){
    const shifts=(state.data.shifts||[]).filter(s=> s.full_name===(state.user.full_name||state.user.name));
    sBox.innerHTML=''; (shifts.length?shifts:[{shift_type:'—',start:'',end:'',days:''}]).forEach(s=> sBox.appendChild(listEl(`${s.shift_type} — ${s.start} تا ${s.end} ${s.days? '('+s.days+')':''}`)));
  }

  // Weekly checklist
  const wBox=dom('#weeklyList');
  if (wBox){
    const wAll=(state.data.weekly_tasks||[]).filter(w=> w.full_name===(state.user.full_name||state.user.name));
    const keyChk='dm_chk_'+(state.user.username||'u');
    const doneSet=new Set(loadLocal(keyChk,[]));
    wBox.innerHTML='';
    (wAll.length?wAll:[{day:'',task:'—'}]).forEach((w,i)=>{
      const id=(w.day||'')+'_'+(w.task||'')+'_'+i;
      const row=document.createElement('label'); row.className='item check';
      row.innerHTML=`<input type="checkbox" ${doneSet.has(id)?'checked':''} data-id="${id}"><div>${w.day? w.day+': ':''}${w.task}</div>`;
      row.querySelector('input').addEventListener('change', (e)=>{
        if(e.target.checked) doneSet.add(id); else doneSet.delete(id);
        saveLocal(keyChk, Array.from(doneSet));
      });
      wBox.appendChild(row);
    });
  }

  // OKR
  const oBox=dom('#okrBox');
  if (oBox){
    const okr=(state.data.okr||[]).find(o=> o.full_name===(state.user.full_name||state.user.name));
    oBox.innerHTML=''; if(okr){ oBox.appendChild(listEl('🎯 هدف: '+okr.goal)); oBox.appendChild(listEl('📊 نتایج کلیدی: '+okr.key_results)); } else { oBox.appendChild(listEl('—')); }
  }

  // People directory + search
  const pList=dom('#peopleList');
  const pSearch=dom('#peopleSearch');
  if (pList){
    pList.innerHTML='';
    (state.data.employees||[]).forEach(e=>{
      const it=document.createElement('div'); it.className='item';
      it.innerHTML=`<strong>${e.full_name}</strong> — ${e.role}<br><span class="muted">${e.shift||''}</span>`;
      pList.appendChild(it);
    });
  }
  if (pSearch){
    pSearch.addEventListener('input', (e)=>{
      const q=(e.target.value||'').trim();
      const cards = document.querySelectorAll('#peopleList .item');
      cards.forEach(card=>{
        const txt = card.textContent || '';
        card.style.display = txt.includes(q) ? '' : 'none';
      });
    });
  }
  const pClear = dom('#peopleClear'); if (pClear){ pClear.addEventListener('click', ()=>{ if(pSearch){ pSearch.value=''; pSearch.dispatchEvent(new Event('input')); } }); }

  // Admin tab & announcement save
  const isAdmin = ((state.user.role||'') + (state.user.full_name||'') ).includes('مدیر');
  const aTab=dom('#adminTab'); if(aTab) aTab.style.display = isAdmin? '':'';
  if (isAdmin){
    const sum=dom('#adminSummary'); if(sum){ sum.innerHTML='';
      (state.data.employees||[]).forEach(e=>{
        const d=document.createElement('div'); d.className='item';
        d.innerHTML = `<strong>${e.full_name}</strong> — ${e.role}<br><span class="muted">${e.shift||''}</span>`;
        sum.appendChild(d);
      });
    }
    const aInput = dom('#announceInput'); const aSave = dom('#announceSave');
    if (aSave){ aSave.addEventListener('click', ()=>{
      const txt = aInput?.value || '';
      localStorage.setItem('dm_announce', txt);
      render();
    });}
  }
}

function attach(){
  const btnIn = dom('#btnLogin'); if (btnIn) btnIn.addEventListener('click', tryLogin);
  const btnOut = dom('#btnLogout'); if (btnOut) btnOut.addEventListener('click', logout);
  const pinEl = dom('#pinInput'); if (pinEl) pinEl.addEventListener('keyup', e=>{ if(e.key==='Enter') tryLogin(); });

  // Tabs
  document.querySelectorAll('.tab').forEach(t=> t.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    const id=t.dataset.tab;
    ['home','tasks','people','admin'].forEach(sec=>{
      const el=dom('#'+sec); if(el) el.style.display = (sec===id)? '' : 'none';
    });
  }));
}

async function boot(){ await loadData(); fillUsers(); attach(); render(); }
boot();
