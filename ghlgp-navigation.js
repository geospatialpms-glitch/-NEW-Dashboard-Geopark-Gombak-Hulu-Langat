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


/* Peta Interaktif after inline About/Kronologi: restore the native dashboard view.
   The main page CSS hides every non-info child while .inline-page-mode is set. */
document.addEventListener('DOMContentLoaded',()=>{
 const sidebar=document.querySelector('.sidebar');
 if(!sidebar)return;
 sidebar.addEventListener('click',event=>{
  const btn=event.target.closest('[data-ghl-go="taburan"]');
  if(!btn||!sidebar.contains(btn))return;
  const main=document.getElementById('utama');
  if(!main||!main.classList.contains('inline-page-mode'))return;
  // Mirror the inline-page script's home activation, without changing its other routes.
  main.classList.remove('inline-page-mode','chronology-mode','jejak-frame-active');
  for(const id of ['aboutGeoparkModal','chronologyModal']){
   const panel=document.getElementById(id);
   if(panel){panel.classList.remove('open');panel.setAttribute('aria-hidden','true')}
  }
  const frame=document.getElementById('jejakFrame');
  if(frame)frame.hidden=true;
  // Allow normal data-ghl-go="taburan" listener to scroll to the restored dashboard.
  requestAnimationFrame(()=>{
   document.getElementById('taburan')?.scrollIntoView({behavior:'smooth',block:'start'});
   document.querySelectorAll('.sidebar .navbtn').forEach(el=>el.classList.toggle('active',el===btn));
   window.dispatchEvent(new Event('resize'));
   try{if(typeof map!=='undefined'&&map.invalidateSize)map.invalidateSize(true)}catch(e){}
  });
 },true);
});
