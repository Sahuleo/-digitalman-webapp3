
(async function(){
  const el = s=>document.querySelector(s);
  el('#ver').textContent = 'نسخه کلاینت: app.js?v=3 • diagnostics.js?v=1';

  // SW & cache
  if ('serviceWorker' in navigator){
    try{
      const regs = await navigator.serviceWorker.getRegistrations();
      el('#sw').innerHTML = regs.length ? 'ServiceWorker: <span class=ok>فعال</span>' : 'ServiceWorker: <span class=warn>غیرفعال</span>';
    }catch(e){ el('#sw').textContent = 'ServiceWorker: نامشخص'; }
  } else {
    el('#sw').innerHTML = 'ServiceWorker: <span class=warn>پشتیبانی نمی‌شود</span>';
  }
  if ('caches' in window){
    try {
      const keys = await caches.keys();
      el('#cache').innerHTML = 'Cache keys: ' + keys.map(k=>`<code>${k}</code>`).join(' , ');
    } catch(e){ el('#cache').textContent = 'Cache: نامشخص'; }
  }

  // data.json
  try{
    const r = await fetch('assets/data.json?_=' + Date.now());
    const data = await r.json();
    const users = (data.employees||[]).map(u=>`${u.full_name} (${u.username})`);
    el('#djson').innerHTML = users.length
      ? `تعداد کاربران: <b>${users.length}</b>`
      : '<span class=bad>هیچ کاربری پیدا نشد.</span>';
    el('#users').innerHTML = users.map(x=>`<li>${x}</li>`).join('');

    // fill select
    const who = el('#who'); who.innerHTML='';
    (data.employees||[]).forEach(u=>{
      const o = document.createElement('option');
      o.value = u.username; o.textContent = `${u.full_name} — ${u.role}`;
      who.appendChild(o);
    });

    // test pin
    el('#test').addEventListener('click', ()=>{
      const u = el('#who').value;
      const p = el('#pin').value.trim();
      const usr = (data.employees||[]).find(x=> x.username===u);
      if(!usr){ el('#result').innerHTML='<span class=bad>کاربر پیدا نشد</span>'; return; }
      if(String(usr.pin)!==String(p)){ el('#result').innerHTML='<span class=bad>PIN نادرست است</span>'; return; }
      el('#result').innerHTML='<span class=ok>✅ PIN صحیح است</span>';
    });

  }catch(e){
    el('#djson').innerHTML = '<span class=bad>خطا در بارگذاری data.json</span>';
  }

  // app.js?v=3
  try{
    const r2 = await fetch('assets/app.js?v=3', {cache:'no-store'});
    const txt = await r2.text();
    el('#appjs').innerHTML = txt.includes('tryLogin') && txt.includes('PIN نادرست')
      ? '<span class=ok>app.js نسخه v3 بارگذاری شد (اعتبارسنجی PIN حاضر است)</span>'
      : '<span class=bad>app.js نسخه v3 پیدا نشد یا قدیمی است</span>';
  }catch(e){
    el('#appjs').innerHTML = '<span class=bad>خطا در لود app.js?v=3</span>';
  }
})();