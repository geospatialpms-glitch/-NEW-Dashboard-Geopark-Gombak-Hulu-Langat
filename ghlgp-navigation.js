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


/* Fix only About Geopark / Chronology -> Peta Interaktif.
   Original HTML uses #aboutGeoparkModal and #chronologyModal; the destination is #taburan.
   Close them through their native close buttons before the existing data-ghl-go handler. */
document.addEventListener('DOMContentLoaded',()=>{
 const sidebar=document.querySelector('.sidebar');
 if(!sidebar)return;
 const routes=[
  ['aboutGeoparkModal','aboutGeoparkClose'],
  ['chronologyModal','chronologyClose']
 ];
 sidebar.addEventListener('click',event=>{
  const button=event.target.closest('[data-ghl-go="taburan"]');
  if(!button||!sidebar.contains(button))return;
  let closed=false;
  for(const [modalId,closeId] of routes){
   const modal=document.getElementById(modalId);
   if(!modal||!modal.classList.contains('open'))continue;
   const close=document.getElementById(closeId);
   if(close)close.click();
   else{
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
   }
   closed=true;
  }
  if(!closed)return;
  // The normal sidebar click still scrolls to #taburan; do not cancel or replay it.
  const destination=document.getElementById('taburan');
  requestAnimationFrame(()=>{
   if(destination)destination.scrollIntoView({behavior:'smooth',block:'start'});
   document.querySelectorAll('.sidebar .navbtn').forEach(nav=>nav.classList.toggle('active',nav===button));
   window.dispatchEvent(new Event('resize'));
  });
 },true);
});
