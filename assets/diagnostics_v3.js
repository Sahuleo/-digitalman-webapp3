
(async function(){
  const el = s=>document.querySelector(s);
  try{
    const r = await fetch('assets/app.js?v=5', {cache:'no-store'});
    const txt = await r.text();
    const ok = txt.includes('DM_V5_FEATURES') || txt.includes('peopleSearch') || txt.includes('announceSave');
    el('#check').innerHTML = ok
      ? '<span class=ok>✅ v5 features پیدا شد (marker یا peopleSearch/announceSave)</span>'
      : '<span class=bad>❌ v5 features پیدا نشد. احتمالاً app.js هنوز v4 است.</span>';
  }catch(e){
    el('#check').innerHTML = '<span class=bad>خطا در لود app.js?v=5</span>';
  }
})();
