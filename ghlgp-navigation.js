/* G31: update only the geotapak description used by the native Info Lanjut popup. */
if(typeof GEOTAPAK_INFO_PDF!=='undefined') GEOTAPAK_INFO_PDF.G31="Geotapak hasilan aktiviti manusia atau antropogenik ini terbentuk melalui proses penggerudian. Jumlah air panas yang keluar daripada telaga berkedalaman 160 kaki ini direkodkan sebagai yang terbanyak di Malaysia dengan suhu di antara 47-49°C. Pembentukan air panas ini dikaitkan dengan kemasukan air permukaan melalui siri retakan yang wujud selaras dengan sesar Kuala Lumpur dan Bukit Tinggi yang dipanaskan berdekatan dengan perut bumi. Air panas ini terperangkap di bawah lapisan batuan granit dan penggerudian melepaskan air yang terperangkap ke permukaan. Pada masa ini kawasan geotapak merupakan kawasan wakaf untuk tujuan masjid namun jangka masa panjang adalah pembangunan pelancongan berasaskan mata air panas dan juga kegunaan komuniti setempat.";

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

/* Gentle, accessible scroll reveal. Only existing content sections/cards.
   Don't animate Leaflet, modal layers, sticky/sidebar controls or chart canvases. */
document.addEventListener('DOMContentLoaded',()=>{
 if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const targets='#utama .ghl-scroll-block, #utama .ghl-trail-card, #utama .dashboard-main-grid > .panel, #utama .ghl-years > article, #jejakFrame .jejak-entry';
 const observed=new WeakSet();
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   entry.target.classList.add('ghl-reveal-visible');
   observer.unobserve(entry.target);
  }
 },{threshold:0.08,rootMargin:'0px 0px 30px 0px'});
 function register(){
  document.querySelectorAll(targets).forEach(el=>{
   if(observed.has(el)||el.closest('.leaflet-container'))return;
   observed.add(el);
   const rect=el.getBoundingClientRect();
   if(rect.top<window.innerHeight*0.92&&rect.bottom>0){
    el.classList.add('ghl-reveal-visible');return;
   }
   el.classList.add('ghl-scroll-reveal');
   observer.observe(el);
  });
 }
 register();
 const host=document.getElementById('utama');
 if(host){
  let pending=false;
  new MutationObserver(()=>{
   if(pending)return;pending=true;
   requestAnimationFrame(()=>{pending=false;register()});
  }).observe(host,{childList:true,subtree:true});
 }
});

/* Scroll reveals within the two inline informational pages only. */
document.addEventListener('DOMContentLoaded',()=>{
 if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const ids=['aboutGeoparkModal','chronologyModal'];
 const selectors='.about-card,.geopark-eight-heading,.kronologi-text-card,.chrono-phase,.chronology-approval,.ghl-chrono-hero,.geopark-narrative-frame';
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(entry.isIntersecting){
    entry.target.classList.add('ghl-info-visible');
    observer.unobserve(entry.target);
   }
  });
 },{threshold:.08,rootMargin:'0px 0px 25px 0px'});
 const seen=new WeakSet();
 function register(){
  ids.forEach(id=>{
   const host=document.getElementById(id);
   if(!host)return;
   host.querySelectorAll(selectors).forEach(el=>{
    if(seen.has(el))return;
    seen.add(el);
    el.classList.add('ghl-info-reveal');
    observer.observe(el);
   });
  });
 }
 register();
 const main=document.getElementById('utama');
 if(main){
  let queued=false;
  new MutationObserver(()=>{
   if(queued)return;queued=true;
   requestAnimationFrame(()=>{queued=false;register()});
  }).observe(main,{subtree:true,childList:true});
 }
});

/* Mockup Info Lanjut: enhancement shared by all geotapak, original data preserved. */
document.addEventListener('DOMContentLoaded',()=>{
 const original=window.openGeotapakInfo;
 if(typeof original!=='function'||original.__ghlMockup)return;
 function decorate(code){
  const overlay=document.querySelector('.geotapak-more-overlay');
  if(!overlay||overlay.dataset.ghlMockup==='1')return;
  overlay.dataset.ghlMockup='1';
  const key=String(code||'').trim().toUpperCase();
  const card=overlay.querySelector('.geotapak-more-card');
  const right=overlay.querySelector('.geotapak-info-right');
  const infra=right?.querySelector('.geotapak-infra');
  const left=overlay.querySelector('.geotapak-info-left');
  if(!card||!right||!infra||!left)return;
  const h=left.querySelector('h3');
  const line=document.createElement('div');line.className='ghl-info-accent';
  if(h)h.after(line);
  const controls=document.createElement('div');controls.className='ghl-more-tabs';
  controls.setAttribute('role','tablist');controls.setAttribute('aria-label','Kandungan geotapak');
  const infraBtn=document.createElement('button');infraBtn.type='button';infraBtn.textContent='◈  Infrastruktur Asas';infraBtn.setAttribute('role','tab');
  const imageBtn=document.createElement('button');imageBtn.type='button';imageBtn.textContent='▧  Gambar Geotapak';imageBtn.setAttribute('role','tab');
  controls.append(infraBtn,imageBtn);
  const photo=document.createElement('section');photo.className='ghl-more-photo-panel';photo.hidden=true;photo.setAttribute('role','tabpanel');
  const label=document.createElement('div');label.className='ghl-more-panel-title';
  label.textContent='Gambar Geotapak';
  const count=document.createElement('small');count.textContent='1 Gambar';label.append(count);photo.append(label);
  let src='';
  try{if(typeof IMG!=='undefined')src=IMG[key]||'';}catch(e){}
  if(src){
   const trigger=document.createElement('button');trigger.type='button';trigger.className='ghl-more-photo-trigger';trigger.setAttribute('aria-label','Paparan penuh gambar geotapak');
   const image=document.createElement('img');image.src=src;image.alt='Gambar '+(h?.textContent||key);image.loading='eager';
   const zoom=document.createElement('span');zoom.textContent='⛶  Paparan Penuh';
   trigger.append(image,zoom);photo.append(trigger);
   const light=document.createElement('div');light.className='ghl-more-lightbox';light.hidden=true;
   const exit=document.createElement('button');exit.type='button';exit.className='ghl-more-lightbox-close';exit.textContent='×';exit.setAttribute('aria-label','Tutup gambar');
   const full=document.createElement('img');full.src=src;full.alt=image.alt;
   light.append(exit,full);overlay.append(light);
   const closeLight=()=>{light.hidden=true;trigger.focus()};
   trigger.addEventListener('click',()=>{light.hidden=false;exit.focus()});
   exit.addEventListener('click',closeLight);
   light.addEventListener('click',e=>{if(e.target===light)closeLight()});
   overlay.addEventListener('keydown',e=>{if(e.key==='Escape'&&!light.hidden){e.stopImmediatePropagation();closeLight()}},true);
  }else{
   count.textContent='Belum tersedia';
   const placeholder=document.createElement('p');placeholder.textContent='Gambar geotapak belum tersedia.';photo.append(placeholder);
  }
  right.prepend(controls);
  right.append(photo);
  const select=mode=>{
   const show=mode==='photo';
   infra.hidden=show;photo.hidden=!show;
   infraBtn.setAttribute('aria-selected',String(!show));
   imageBtn.setAttribute('aria-selected',String(show));
  };
  infraBtn.addEventListener('click',()=>select('infra'));
  imageBtn.addEventListener('click',()=>select('photo'));
  select('infra');
  // Reveal individual content blocks when they enter the popup's own scroll area.
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   const scroller=card.querySelector('.geotapak-more-content');
   const revealItems=[...left.children,controls,...infra.querySelectorAll('.geotapak-infra-item'),infra.querySelector('.geotapak-infra-legend'),photo.querySelector('.ghl-more-panel-title'),photo.querySelector('.ghl-more-photo-trigger')].filter(Boolean);
   const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
     if(entry.isIntersecting){entry.target.classList.add('ghl-more-revealed');revealObserver.unobserve(entry.target)}
    });
   },{root:scroller,threshold:.08,rootMargin:'0px 0px 18px 0px'});
   revealItems.forEach((el,i)=>{
    el.classList.add('ghl-more-reveal');
    el.style.setProperty('--ghl-reveal-delay',Math.min(i%6,4)*65+'ms');
    revealObserver.observe(el);
   });
   imageBtn.addEventListener('click',()=>{requestAnimationFrame(()=>photo.querySelectorAll('.ghl-more-reveal').forEach(el=>el.classList.add('ghl-more-revealed')))});
  }
  // Existing six status indicators and legend remain from createGeotapakInfra().
 }
 function enhanced(code){
  const result=original.apply(this,arguments);
  decorate(code);
  return result;
 }
 enhanced.__ghlMockup=true;
 window.openGeotapakInfo=enhanced;
});

/* Gallery control: icon-only pause/play without modifying the 5-second timer. */
document.addEventListener('DOMContentLoaded',()=>{
 const play=document.getElementById('ghlGalleryPlay');
 if(!play)return;
 const sync=()=>{
  const label=play.textContent||'';
  const isPause=/Jeda|Ⅱ|❚❚/.test(label);
  const icon=isPause?'Ⅱ':'▶';
  play.setAttribute('aria-label',isPause?'Jeda Slideshow':'Main Slideshow');
  play.setAttribute('title',isPause?'Jeda Slideshow':'Main Slideshow');
  play.setAttribute('aria-pressed',String(!isPause));
  if(label!==icon)play.textContent=icon;
 };
 new MutationObserver(sync).observe(play,{childList:true,characterData:true,subtree:true});
 sync();
});

/* Jejak Makanan: 'Lihat Lokasi' based on the supplied GHLGp popup mockup. */
document.addEventListener('DOMContentLoaded',()=>{
 const original=window.showJejakCardPopup;
 if(typeof original!=='function'||original.__foodLocationEnhanced)return;
 function enhanced(detail){
  const result=original.apply(this,arguments);
  if(!detail?.querySelector?.('.jejak-food-detail-photo'))return result;
  const body=document.querySelector('#jejakCardPopup .jejak-card-popup-body');
  if(!body||body.querySelector('.ghl-food-location-btn'))return result;
  const label=body.querySelector('h3')?.textContent?.trim()||'';
  const match=label.match(/^\s*(E\d+)\s*[·—-]\s*(.+)$/i);
  if(!match)return result;
  const code=match[1].toUpperCase(),name=match[2].trim();
  const address=Array.from(body.querySelectorAll('p')).find(p=>/Alamat\s*:/i.test(p.textContent||''))?.textContent?.replace(/^\s*Alamat\s*:\s*/i,'').trim()||'';
  // The supplied reference contains a verified target Place ID for E1.
  // Other entries use their own recorded name and address, not E1's pin.
  const query=encodeURIComponent([name,address].filter(Boolean).join(', '));
  const href=code==='E1'
   ?'https://www.google.com/maps/search/?api=1&query=Roti%20Leleh%20Batu%20Arang&query_place_id=ChIJy53W3a5dzDERhWB3jCUS7hk'
   :'https://www.google.com/maps/search/?api=1&query='+query;
  const a=document.createElement('a');
  a.className='ghl-food-location-btn';
  a.href=href;a.target='_blank';a.rel='noopener noreferrer';
  a.setAttribute('aria-label','Lihat lokasi '+name+' di Google Maps');
  a.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 18-8-8 18-2.8-7.2L3 11Z"/><path d="m10.2 13.8 4.7-4.7"/></svg><span>Lihat Lokasi</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  body.append(a);
  return result;
 }
 enhanced.__foodLocationEnhanced=true;
 window.showJejakCardPopup=enhanced;
});
