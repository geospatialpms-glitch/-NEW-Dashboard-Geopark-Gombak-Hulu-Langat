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


/* Recover the two information-modal -> native map routes only.
   No synthetic clicks, no page reload and no forced panel styling. */
document.addEventListener('DOMContentLoaded',()=>{
 const sidebar=document.querySelector('.sidebar');
 if(!sidebar)return;
 let fromInfo=false;
 const normalize=value=>(value||'').replace(/\\s+/g,' ').trim().toLowerCase();
 function closeInfo(){
  let closed=false;
  for(const id of ['aboutModal','chronologyModal']){
   const modal=document.getElementById(id);
   if(!modal)continue;
   const style=getComputedStyle(modal);
   if(style.display==='none'||style.visibility==='hidden')continue;
   const close=modal.querySelector('[data-close],.geo-modal-close,.modal-close,[aria-label="Tutup"],[aria-label="Close"]');
   if(close)close.click();
   if(getComputedStyle(modal).display!=='none'){
    modal.classList.remove('show','open','active');
    modal.style.display='none';
    modal.setAttribute('aria-hidden','true');
   }
   closed=true;
  }
  if(closed){
   document.body.classList.remove('modal-open','overflow-hidden');
   if(document.body.style.overflow==='hidden')document.body.style.removeProperty('overflow');
   if(document.documentElement.style.overflow==='hidden')document.documentElement.style.removeProperty('overflow');
  }
 }
 function handle(event){
  const btn=event.target.closest('button,a,[role="button"]');
  if(!btn||!sidebar.contains(btn))return;
  const label=normalize(btn.textContent||btn.getAttribute('aria-label'));
  if(label.includes('apa itu geopark')||label.includes('kronologi')){fromInfo=true;return}
  if(!label.includes('peta interaktif')){fromInfo=false;return}
  if(!fromInfo)return;
  closeInfo();
  fromInfo=false;
  // Let the dashboard's own click handler perform the view transition.
  // Only refresh map sizing after that handler runs.
  setTimeout(()=>{
   window.dispatchEvent(new Event('resize'));
   for(const key of ['map','leafletMap','mapInstance','geoMap']){
    try{window[key]?.invalidateSize?.()}catch(e){}
   }
  },300);
 }
 // Pointerdown runs before the native click, so the modal closes in time.
 sidebar.addEventListener('pointerdown',handle,true);
 // Keyboard activation has no pointerdown.
 sidebar.addEventListener('click',handle,true);
});
