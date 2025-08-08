
(async function(){
  const el = s=>document.querySelector(s);
  el('#ver').textContent = 'Diagnostics v2 • هدف: app.js?v=5';

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

  // Check app.js?v=5 explicitly
  try{
    const r = await fetch('assets/app.js?v=5', {cache:'no-store'});
    if(!r.ok){ el('#check').innerHTML = '<span class=bad>app.js?v=5 پیدا نشد ('+r.status+')</span>'; return; }
    const txt = await r.text();
    const flags = [
      ['contains v5 features', txt.includes('peopleSearch') && txt.includes('dm-v5')],
      ['has lockout logic', txt.includes('۳ تلاش ناموفق') || txt.includes('30_000')],
      ['strict PIN', txt.includes('PIN نادرست') && txt.includes('String(user.pin)')],
    ];
    const lines = flags.map(([k,v])=> v ? `✅ ${k}` : `❌ ${k}`).join('<br>');
    el('#check').innerHTML = `<div>${lines}</div>`;
  }catch(e){
    el('#check').innerHTML = '<span class=bad>خطا در بارگذاری app.js?v=5</span>';
  }
})();
