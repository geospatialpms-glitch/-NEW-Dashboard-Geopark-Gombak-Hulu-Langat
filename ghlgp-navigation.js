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


/* Fix map navigation after About Geopark and Chronology modal views. */
document.addEventListener('DOMContentLoaded',()=>{
 const sidebar=document.querySelector('.sidebar');
 if(!sidebar)return;
 const isMapButton=el=>{
  const text=(el.textContent||el.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().toLowerCase();
  return text==='peta interaktif'||el.dataset.ghlGo==='peta-interaktif';
 };
 sidebar.addEventListener('click',event=>{
  const button=event.target.closest('button,a,[role="button"]');
  if(!button||!isMapButton(button))return;
  // Close only open informational modals; leave the map and original page intact.
  for(const modal of document.querySelectorAll('#aboutModal,#chronologyModal,.geo-modal')){
   if(modal.matches('.open,.active,[aria-hidden="false"]')||getComputedStyle(modal).display!=='none'){
    const close=modal.querySelector('[data-close],.geo-modal-close,.modal-close,[aria-label="Tutup"],[aria-label="Close"]');
    if(close)close.click();
    else{
     modal.classList.remove('open','active','show');
     modal.setAttribute('aria-hidden','true');
     modal.style.display='none';
    }
   }
  }
  // Follow original navigation if it works; only restore the visible map section.
  requestAnimationFrame(()=>{
   const map=document.querySelector('.leaflet-container');
   if(!map)return;
   const container=map.closest('section')||map;
   if(container.getBoundingClientRect().height>0)container.scrollIntoView({behavior:'smooth',block:'start'});
   window.dispatchEvent(new Event('resize'));
  });
 },true);
});
