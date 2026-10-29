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


/* Only repair the two modal-to-map routes; leave all other navigation untouched. */
document.addEventListener('DOMContentLoaded',()=>{
 const sidebar=document.querySelector('.sidebar');
 if(!sidebar)return;
 const visible=el=>el && getComputedStyle(el).display!=='none' && getComputedStyle(el).visibility!=='hidden';
 sidebar.addEventListener('click',event=>{
  const btn=event.target.closest('button,a,[role="button"]');
  if(!btn||!/peta\s*interaktif/i.test(btn.textContent||''))return;
  const opened=['aboutModal','chronologyModal'].map(id=>document.getElementById(id)).filter(visible);
  if(!opened.length)return; // native map navigation remains unchanged in all other cases
  event.preventDefault();
  event.stopImmediatePropagation();
  for(const modal of opened){
   const close=modal.querySelector('[data-close],.geo-modal-close,.modal-close,[aria-label="Tutup"],[aria-label="Close"]');
   if(close)close.click();
   modal.classList.remove('open','active','show');
   modal.style.display='none';
   modal.setAttribute('aria-hidden','true');
  }
  document.body.classList.remove('modal-open','overflow-hidden');
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');
  // Return through the original dashboard view action, then locate the actual map.
  const homeButton=[...sidebar.querySelectorAll('button,a,[role="button"]')].find(el=>(el.textContent||'').trim().toLowerCase()==='utama');
  homeButton?.click();
  requestAnimationFrame(()=>{
   const main=document.getElementById('utama');
   const map=main?.querySelector('.leaflet-container')||document.querySelector('.leaflet-container');
   const section=map?.closest('section')||main;
   if(section) section.scrollIntoView({behavior:'smooth',block:'start'});
   document.querySelectorAll('.sidebar .navbtn').forEach(el=>el.classList.toggle('active',el===btn));
   window.dispatchEvent(new Event('resize'));
  });
 },true);
});