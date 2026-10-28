/* Dashboard GHLGp navigation: avoid overriding original modal/trail click handlers. */
document.addEventListener('DOMContentLoaded',()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function scrollToId(id){
    const el=document.getElementById(id);
    if(!el)return false;
    const main=document.getElementById('utama');
    if(main?.classList.contains('jejak-frame-active')&&typeof window.closeJejakFrame==='function')window.closeJejakFrame();
    el.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
    return true;
  }
  // These two supplementary buttons do not have original handlers.
  document.querySelectorAll('.sidebar [data-ghl-go]').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.preventDefault();
      if(scrollToId(btn.dataset.ghlGo)){
        document.querySelectorAll('.sidebar .navbtn').forEach(x=>x.classList.toggle('active',x===btn));
      }
    });
  });
  // Do not intercept about, chronology, geotrail or trail category buttons:
  // the dashboard's own handlers contain their modal and trail data.
  document.querySelectorAll('[data-ghl-original]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const original=document.getElementById(btn.dataset.ghlOriginal);
      if(original)original.click();
    });
  });
  document.querySelectorAll('a[data-ghl-go]').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      scrollToId(a.dataset.ghlGo);
    });
  });
  document.querySelectorAll('a[data-ghl-show]').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      if(typeof window.openGeoTrailCategory==='function')window.openGeoTrailCategory(a.dataset.ghlShow);
    });
  });
  // Card links go to detailed trail pages; never hijack those links.
});


/* Utama returns to the existing dashboard content, not home.html. */
document.addEventListener('DOMContentLoaded',()=>{
 const sidebar=document.querySelector('.sidebar');
 if(!sidebar)return;
 sidebar.addEventListener('click',event=>{
  const btn=event.target.closest('button,a,[role="button"]');
  if(!btn)return;
  const name=(btn.textContent||btn.getAttribute('aria-label')||'').trim().toLowerCase();
  if(name!=='utama'&&btn.dataset.ghlGo!=='utama')return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(typeof window.closeJejakFrame==='function')window.closeJejakFrame();
  const target=document.getElementById('utama');
  if(target){
   target.classList.remove('jejak-frame-active');
   target.style.removeProperty('display');
   target.scrollIntoView({behavior:'smooth',block:'start'});
  }
  document.querySelectorAll('.sidebar .navbtn').forEach(el=>el.classList.toggle('active',el===btn));
  window.dispatchEvent(new Event('resize'));
 },true);
});
