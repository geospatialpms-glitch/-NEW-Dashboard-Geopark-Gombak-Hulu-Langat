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


/* Recover navigation to the existing interactive map without recreating the map. */
document.addEventListener('DOMContentLoaded',()=>{
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function findMap(){
  const names=['map','peta','mapContainer','map-container','interactiveMap','petaInteraktif','leafletMap'];
  for(const id of names){const found=document.getElementById(id);if(found)return found;}
  return document.querySelector('.leaflet-container, .map-container, [data-map-container], [id*="map"][class*="leaflet"]');
 }
 function openMap(){
  const map=findMap();
  if(!map)return false;
  const sections=[...document.querySelectorAll('section,[id],main')];
  const parent=map.closest('section,[id]')||map;
  // Restore any map pane concealed by a different trail/page.
  const main=document.getElementById('utama');
  if(main?.classList.contains('jejak-frame-active')&&typeof window.closeJejakFrame==='function')window.closeJejakFrame();
  const tab=[...document.querySelectorAll('button,[role="tab"],.navbtn')].find(el=>{
   const text=(el.textContent||'').trim().toLowerCase();
   return text==='peta interaktif' || text==='peta interaktif ghlgp';
  });
  const target=parent.getBoundingClientRect().height>0?parent:map;
  target.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
  if(tab?.classList.contains('navbtn')){
   document.querySelectorAll('.sidebar .navbtn').forEach(btn=>btn.classList.toggle('active',btn===tab));
  }
  // Leaflet maps must recalculate their size when their container becomes visible.
  const refresh=()=>{
   try{
    for(const key of ['map','leafletMap','mapInstance','geoMap']){
     const instance=window[key];
     if(instance&&typeof instance.invalidateSize==='function')instance.invalidateSize();
    }
   }catch(e){console.warn('Peta interaktif:',e)}
   window.dispatchEvent(new Event('resize'));
  };
  setTimeout(refresh,150);setTimeout(refresh,500);
  return true;
 }
 // Fallback only: do not prevent an already working native click handler.
 document.addEventListener('click',event=>{
  const btn=event.target.closest('button,a,[role="button"]');
  if(!btn)return;
  const label=(btn.textContent||btn.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' ').toLowerCase();
  if(label!=='peta interaktif'&&label!=='peta interaktif ghlgp')return;
  setTimeout(()=>{
   const map=findMap();
   if(!map)return;
   const r=map.getBoundingClientRect();
   if(r.bottom<0||r.top>innerHeight||r.height<50)openMap();
   else window.dispatchEvent(new Event('resize'));
  },80);
 },true);
});
