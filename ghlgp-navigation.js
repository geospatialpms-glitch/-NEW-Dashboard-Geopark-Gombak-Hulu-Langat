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


/* Fix only About/Kronologi -> Peta Interaktif.
   Close the two overlays BEFORE native sidebar click handlers run.
   Never cancel the click, simulate Utama, move the map or change section display. */
document.addEventListener('DOMContentLoaded',()=>{
 const sidebar=document.querySelector('.sidebar');
 if(!sidebar)return;
 sidebar.addEventListener('click',event=>{
  const target=event.target.closest('button,a,[role="button"]');
  if(!target||!/peta\\s*interaktif/i.test(target.textContent||''))return;
  const modals=['aboutModal','chronologyModal']
   .map(id=>document.getElementById(id)).filter(Boolean);
  let closed=false;
  for(const modal of modals){
   const css=getComputedStyle(modal);
   if(css.display==='none'||css.visibility==='hidden')continue;
   const close=modal.querySelector('[data-close],.geo-modal-close,.modal-close,[aria-label="Tutup"],[aria-label="Close"]');
   if(close)close.click();
   if(getComputedStyle(modal).display!=='none'){
    modal.classList.remove('open','active','show');
    modal.style.display='none';
    modal.setAttribute('aria-hidden','true');
   }
   closed=true;
  }
  if(!closed)return;
  document.body.classList.remove('modal-open','overflow-hidden');
  if(document.body.style.overflow==='hidden')document.body.style.removeProperty('overflow');
  if(document.documentElement.style.overflow==='hidden')document.documentElement.style.removeProperty('overflow');
  // After the original map button handler has run, refresh the map geometry.
  setTimeout(()=>{
   window.dispatchEvent(new Event('resize'));
   for(const key of ['map','leafletMap','mapInstance','geoMap']){
    try{window[key]?.invalidateSize?.()}catch(e){}
   }
  },250);
 },true);
});
