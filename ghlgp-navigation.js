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


/* Recover the original Peta Interaktif route from modal pages. */
document.addEventListener('DOMContentLoaded',()=>{
 const sidebar=document.querySelector('.sidebar');
 if(!sidebar)return;
 sidebar.addEventListener('click',event=>{
  const btn=event.target.closest('button,a,[role="button"]');
  if(!btn||!(/peta\s*interaktif/i.test(btn.textContent||'')||btn.dataset.ghlGo==='peta-interaktif'))return;
  // Informational overlays often lock the whole document and intercept navigation.
  const activeModals=[...document.querySelectorAll('#aboutModal,#chronologyModal,.geo-modal,[role="dialog"]')].filter(el=>{
   const css=getComputedStyle(el);
   return css.display!=='none'&&css.visibility!=='hidden';
  });
  activeModals.forEach(modal=>{
   const close=modal.querySelector('[data-close],.geo-modal-close,.modal-close,[aria-label="Tutup"],[aria-label="Close"]');
   if(close)close.click();
   if(getComputedStyle(modal).display!=='none'){
    modal.classList.remove('open','active','show');
    modal.style.display='none';
    modal.setAttribute('aria-hidden','true');
   }
  });
  document.body.classList.remove('modal-open','overflow-hidden');
  if(document.body.style.overflow==='hidden')document.body.style.removeProperty('overflow');
  if(document.documentElement.style.overflow==='hidden')document.documentElement.style.removeProperty('overflow');
  if(typeof window.closeJejakFrame==='function')window.closeJejakFrame();
  const main=document.getElementById('utama');
  if(main){
   main.classList.remove('jejak-frame-active');
   main.hidden=false;
   main.removeAttribute('aria-hidden');
   main.style.removeProperty('display');
   main.style.removeProperty('visibility');
   main.style.removeProperty('opacity');
  }
  // A blank page means the dashboard view is hidden, not that Leaflet needs scrolling.
  // Restore the existing dashboard view first; don't move the map outside its layout.
  setTimeout(()=>{
   const map=document.querySelector('.leaflet-container');
   const panel=map?.closest('section')||main;
   if(!panel)return;
   let el=panel;
   while(el&&el!==document.body){
    if(el.matches('#utama,main,section,.page,.view,.panel')){
     el.hidden=false;
     el.removeAttribute('aria-hidden');
     if(getComputedStyle(el).display==='none')el.style.display='block';
     if(getComputedStyle(el).visibility==='hidden')el.style.visibility='visible';
    }
    el=el.parentElement;
   }
   // Target the top of the dashboard, keeping its statistics, chart and map together.
   (main||panel).scrollIntoView({behavior:'auto',block:'start'});
   window.dispatchEvent(new Event('resize'));
   try{
    for(const name of ['map','leafletMap','mapInstance','geoMap']){
     const instance=window[name];
     if(instance&&typeof instance.invalidateSize==='function')instance.invalidateSize();
    }
   }catch(error){console.warn('Map refresh:',error)}
  },150);
 },true);
});