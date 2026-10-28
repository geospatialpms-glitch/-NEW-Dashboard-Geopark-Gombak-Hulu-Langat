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


/* Restore the complete original homepage when returning via the Utama sidebar button.
   Do not change the native gallery slideshow or other sidebar handlers. */
document.addEventListener('DOMContentLoaded',()=>{
 const sidebar=document.querySelector('.sidebar');
 if(!sidebar)return;
 sidebar.addEventListener('click',event=>{
  const button=event.target.closest('button,a,[role="button"]');
  if(!button)return;
  const label=(button.textContent||'').trim().toLowerCase();
  if(label!=='utama' && button.dataset.ghlGo!=='utama')return;
  const main=document.getElementById('utama');
  // The native dashboard owns page navigation; use its existing controls first.
  if(typeof window.closeJejakFrame==='function')window.closeJejakFrame();
  // Clear only transient gallery photo overlays, leaving original homepage elements intact.
  document.querySelectorAll('.ghl-gallery-photos-only').forEach(node=>node.remove());
  if(main){
   main.classList.remove('jejak-frame-active');
   main.style.removeProperty('display');
   main.style.removeProperty('visibility');
   main.style.removeProperty('opacity');
  }
  requestAnimationFrame(()=>{
   window.scrollTo({top:0,behavior:'instant'});
   window.dispatchEvent(new Event('resize'));
  });
 },false);
});
