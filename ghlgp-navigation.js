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


/* Two modal-to-map routes: reuse native sidebar click logic, never navigate away. */
document.addEventListener('DOMContentLoaded',()=>{
 const sidebar=document.querySelector('.sidebar');
 if(!sidebar)return;
 let lastInfo=false, replaying=false;
 sidebar.addEventListener('click',event=>{
  const button=event.target.closest('button,a,[role="button"]');
  if(!button)return;
  const label=(button.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
  if(label==='apa itu geopark?'||label==='kronologi'){
   lastInfo=true;
   return;
  }
  if(label!=='peta interaktif'){lastInfo=false;return}
  if(replaying){replaying=false;lastInfo=false;return}
  const visibleModals=['aboutModal','chronologyModal'].map(id=>document.getElementById(id)).filter(modal=>{
   if(!modal)return false;
   const s=getComputedStyle(modal);
   return s.display!=='none'&&s.visibility!=='hidden';
  });
  if(!lastInfo&&!visibleModals.length)return;
  // Cancel this one click while the information modal closes; retry the SAME
  // button afterwards so its own original handler runs just like other sidebar links.
  event.preventDefault();
  event.stopImmediatePropagation();
  for(const modal of visibleModals){
   const close=modal.querySelector('[data-close],.geo-modal-close,.modal-close,[aria-label="Tutup"],[aria-label="Close"]');
   if(close)close.click();
   if(getComputedStyle(modal).display!=='none'){
    modal.classList.remove('open','active','show');
    modal.style.display='none';
    modal.setAttribute('aria-hidden','true');
   }
  }
  document.body.classList.remove('modal-open','overflow-hidden');
  if(document.body.style.overflow==='hidden')document.body.style.removeProperty('overflow');
  if(document.documentElement.style.overflow==='hidden')document.documentElement.style.removeProperty('overflow');
  replaying=true;
  requestAnimationFrame(()=>{
   button.click();
   setTimeout(()=>{
    window.dispatchEvent(new Event('resize'));
    for(const key of ['map','leafletMap','mapInstance','geoMap']){
     try{window[key]?.invalidateSize?.()}catch(e){}
    }
   },250);
  });
 },true);
});
