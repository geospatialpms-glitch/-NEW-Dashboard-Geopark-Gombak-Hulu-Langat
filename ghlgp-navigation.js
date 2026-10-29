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


/* Repair only the two informational-modal to interactive-map paths.
   A fresh dashboard document restores native map/chart/list initialization,
   avoiding hidden panels and map overlays left behind by modal state. */
document.addEventListener('DOMContentLoaded',()=>{
 const sidebar=document.querySelector('.sidebar');
 if(!sidebar)return;
 let informationalView=false;
 sidebar.addEventListener('click',event=>{
   const button=event.target.closest('button,a,[role="button"]');
   if(!button)return;
   const label=(button.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase();
   if(label==='apa itu geopark?'||label==='kronologi'){
     informationalView=true;
     return;
   }
   if(label!=='peta interaktif')return;
   const modalIsVisible=['aboutModal','chronologyModal'].some(id=>{
     const element=document.getElementById(id);
     if(!element)return false;
     const style=getComputedStyle(element);
     return style.display!=='none'&&style.visibility!=='hidden';
   });
   if(!informationalView&&!modalIsVisible)return;
   informationalView=false;
   event.preventDefault();
   event.stopImmediatePropagation();
   // A hard navigation is deliberately scoped to these two failing transitions only.
   // It rebuilds the original dashboard rather than forcing modal/panel display styles.
   const destination=new URL('dashboard.html#utama',document.baseURI);
   window.location.assign(destination.href);
 },true);
});
