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

/* Geometri sempadan daripada mockup Gombak–Hulu Langat (atifmustaffa/malaysia-geojson).
   Embedded locally to keep district polygons consistent without live GeoJSON requests.
   Does not alter geotapak locations, popups, basemaps or district statistics. */
(function(){
 try{
  if(typeof L==='undefined'||typeof DIST==='undefined'||typeof districtLayer==='undefined'||typeof districtSubLayers==='undefined'||typeof map==='undefined')return;
  const reference=[{"name":"Gombak","geometry":{"type":"MultiPolygon","coordinates":[[[[101.45862,3.4012],[101.46291,3.4],[101.4629,3.39672],[101.46551,3.39587],[101.46843,3.38775],[101.47797,3.38518],[101.48001,3.37292],[101.48537,3.36953],[101.49381,3.36869],[101.50136,3.3519],[101.51246,3.35221],[101.52234,3.34832],[101.54589,3.3505],[101.55667,3.34487],[101.55922,3.34637],[101.562,3.34381],[101.56702,3.34321],[101.56799,3.34061],[101.57733,3.34094],[101.58305,3.34499],[101.58613,3.34544],[101.58964,3.34358],[101.58784,3.34077],[101.59063,3.3298],[101.59767,3.32994],[101.60018,3.32771],[101.61506,3.32436],[101.62423,3.32451],[101.62581,3.32604],[101.62728,3.32494],[101.63127,3.32695],[101.63783,3.32388],[101.64912,3.3371],[101.65582,3.33256],[101.66324,3.3327],[101.66891,3.32917],[101.67119,3.3346],[101.67614,3.33993],[101.67881,3.34024],[101.67962,3.33511],[101.68247,3.33599],[101.69848,3.35498],[101.70043,3.36228],[101.7056,3.36718],[101.71059,3.3768],[101.71116,3.38212],[101.71624,3.38993],[101.7187,3.39032],[101.72261,3.38804],[101.72904,3.38111],[101.73411,3.38113],[101.73767,3.37611],[101.7433,3.37619],[101.75049,3.37393],[101.7571,3.37516],[101.75944,3.37418],[101.76959,3.36538],[101.77743,3.36193],[101.78109,3.35344],[101.77944,3.34646],[101.78187,3.3418],[101.79654,3.33605],[101.80055,3.32817],[101.80648,3.3249],[101.80575,3.32013],[101.81148,3.31244],[101.82082,3.30406],[101.82388,3.29936],[101.83807,3.29155],[101.84558,3.29124],[101.85281,3.28288],[101.85288,3.27981],[101.85058,3.27763],[101.84752,3.27612],[101.84368,3.27656],[101.83852,3.26815],[101.83359,3.26604],[101.83021,3.26234],[101.82777,3.25183],[101.81606,3.2357],[101.81392,3.22687],[101.81064,3.22137],[101.81087,3.21022],[101.80208,3.18927],[101.80252,3.18145],[101.81121,3.16031],[101.8098,3.15552],[101.80807,3.15636],[101.80214,3.15343],[101.79826,3.15462],[101.78738,3.16264],[101.77897,3.15122],[101.77314,3.15506],[101.77079,3.15358],[101.76818,3.15523],[101.76618,3.16208],[101.76135,3.16283],[101.76264,3.16546],[101.75809,3.16342],[101.74946,3.16379],[101.74813,3.16521],[101.73924,3.16554],[101.73879,3.16786],[101.73457,3.16784],[101.73473,3.17545],[101.73182,3.17608],[101.73359,3.17978],[101.73274,3.18123],[101.74964,3.1789],[101.75532,3.18322],[101.75676,3.18747],[101.75545,3.18803],[101.75785,3.18837],[101.75872,3.19142],[101.75657,3.19969],[101.754,3.20339],[101.75106,3.20345],[101.75045,3.20575],[101.74748,3.20601],[101.74585,3.21243],[101.74158,3.21746],[101.7384,3.21878],[101.73964,3.2262],[101.74373,3.23145],[101.73981,3.23664],[101.73941,3.23527],[101.73219,3.23485],[101.73033,3.23641],[101.72502,3.2314],[101.72416,3.23217],[101.72403,3.23023],[101.71872,3.22435],[101.71855,3.22128],[101.71596,3.22113],[101.71528,3.21769],[101.71758,3.21843],[101.71488,3.21596],[101.71045,3.21927],[101.70899,3.21826],[101.70265,3.21977],[101.7021,3.2266],[101.69736,3.22639],[101.69724,3.23134],[101.6723,3.23086],[101.67329,3.23577],[101.66641,3.246],[101.66374,3.2472],[101.65756,3.24396],[101.65676,3.2395],[101.65365,3.23959],[101.65347,3.23798],[101.64997,3.23705],[101.64651,3.23776],[101.64577,3.23544],[101.64032,3.23452],[101.63647,3.23137],[101.63897,3.22422],[101.63617,3.21903],[101.63363,3.21994],[101.63326,3.21618],[101.62998,3.2117],[101.6174,3.21036],[101.60576,3.20232],[101.59901,3.20429],[101.5908,3.20402],[101.57635,3.2111],[101.56576,3.22238],[101.55981,3.23158],[101.54994,3.22747],[101.54612,3.22137],[101.53504,3.2208],[101.53085,3.21826],[101.5257,3.22333],[101.5225,3.22294],[101.5202,3.21954],[101.51561,3.2218],[101.51358,3.22068],[101.50891,3.22505],[101.50488,3.22519],[101.50328,3.22254],[101.49701,3.2252],[101.49234,3.23104],[101.49196,3.27626],[101.46176,3.27607],[101.46158,3.2999],[101.43857,3.29989],[101.43676,3.30267],[101.42964,3.30537],[101.44505,3.33441],[101.44514,3.35707],[101.44294,3.35754],[101.44343,3.39724],[101.44994,3.40144],[101.45375,3.40072],[101.45994,3.40278],[101.45862,3.4012]]]]}},{"name":"Ulu Langat","geometry":{"type":"MultiPolygon","coordinates":[[[[101.85643,3.27635],[101.87366,3.27477],[101.87528,3.27106],[101.88358,3.26574],[101.88871,3.26663],[101.89203,3.27072],[101.89625,3.2709],[101.90578,3.26799],[101.90841,3.26334],[101.91272,3.26453],[101.91615,3.2633],[101.92258,3.2639],[101.92666,3.25848],[101.93076,3.25717],[101.93178,3.2552],[101.92935,3.24877],[101.93795,3.24101],[101.94552,3.22744],[101.94856,3.21224],[101.94504,3.2097],[101.94701,3.19855],[101.93984,3.18992],[101.94385,3.18491],[101.94721,3.1712],[101.95719,3.15772],[101.95743,3.15053],[101.96545,3.14352],[101.96218,3.13666],[101.9622,3.12676],[101.95705,3.11824],[101.94944,3.11489],[101.94969,3.10823],[101.95549,3.09935],[101.95905,3.08346],[101.96329,3.08021],[101.96075,3.06408],[101.96771,3.06033],[101.96535,3.05282],[101.96773,3.04875],[101.97075,3.0325],[101.96865,3.02848],[101.965,3.02936],[101.96216,3.02712],[101.9578,3.02902],[101.94673,3.01988],[101.94079,3.01918],[101.94016,3.01538],[101.9429,3.00827],[101.93998,3.0014],[101.93197,3.00133],[101.92962,2.9913],[101.92949,2.98268],[101.92415,2.97603],[101.92294,2.96757],[101.88177,2.86999],[101.78518,2.87223],[101.77926,2.88007],[101.7652,2.88895],[101.76319,2.90531],[101.7569,2.91939],[101.75707,2.92681],[101.75276,2.9523],[101.74656,2.96448],[101.74188,2.98391],[101.73381,2.99815],[101.72582,3.00629],[101.72049,3.01464],[101.72408,3.01695],[101.73125,3.03426],[101.73075,3.05697],[101.74838,3.0573],[101.74823,3.07899],[101.74491,3.08424],[101.746,3.08516],[101.74507,3.08908],[101.75104,3.09509],[101.75232,3.09993],[101.75045,3.10421],[101.75368,3.10748],[101.75184,3.11023],[101.74678,3.11286],[101.74736,3.1137],[101.74447,3.11436],[101.74383,3.11262],[101.74126,3.11274],[101.73804,3.11636],[101.73742,3.12049],[101.7393,3.12193],[101.74084,3.12716],[101.73538,3.13988],[101.74003,3.14645],[101.73856,3.14746],[101.74115,3.15106],[101.74043,3.15359],[101.74639,3.1526],[101.74679,3.15646],[101.74999,3.16079],[101.74819,3.16159],[101.75058,3.16406],[101.75809,3.16342],[101.76264,3.16546],[101.76135,3.16283],[101.76618,3.16208],[101.76818,3.15523],[101.77079,3.15358],[101.77314,3.15506],[101.77897,3.15122],[101.78738,3.16264],[101.79826,3.15462],[101.80214,3.15343],[101.80807,3.15636],[101.8098,3.15552],[101.81121,3.16031],[101.80252,3.18145],[101.80208,3.18927],[101.8104,3.20848],[101.81044,3.22067],[101.81392,3.22687],[101.81559,3.2346],[101.82777,3.25183],[101.83021,3.26234],[101.83359,3.26604],[101.83852,3.26815],[101.84368,3.27656],[101.84821,3.27634],[101.85288,3.27981],[101.85643,3.27635]]]]}}];
  const existing=new Map(DIST.features.map(f=>[f.properties?.Daerah,f]));
  const replacements=reference.map(ref=>{
   const district=ref.name==='Ulu Langat'?'Hulu Langat':ref.name;
   const previous=existing.get(district);
   return {type:'Feature',properties:{...(previous?.properties||{}),Daerah:district},geometry:ref.geometry};
  });
  // Mutate in place so all existing zoom-to-district / reset handlers use the new geometry.
  DIST.features.splice(0,DIST.features.length,...replacements);
  const visible={};
  Object.keys(districtSubLayers).forEach(name=>{visible[name]=districtLayer.hasLayer(districtSubLayers[name])});
  districtLayer.clearLayers();
  districtLayer.addData(DIST);
  Object.keys(districtSubLayers).forEach(name=>delete districtSubLayers[name]);
  districtLayer.eachLayer(layer=>{
   const name=layer.feature?.properties?.Daerah;
   if(!name)return;
   districtSubLayers[name]=layer;
   if(visible[name]===false)districtLayer.removeLayer(layer);
  });
  const current=Object.keys(districtSubLayers).filter(n=>districtLayer.hasLayer(districtSubLayers[n]));
  const bounds=L.latLngBounds([]);
  current.forEach(n=>bounds.extend(districtSubLayers[n].getBounds()));
  if(bounds.isValid())map.fitBounds(bounds,{padding:[18,18],maxZoom:11});
 }catch(err){console.warn('GHLGp: sempadan mockup tidak dapat digunakan',err)}
})();


/* GHLGp chronology subheading text and gold accent, 2026-11-10 */
(function(){
  function reviseChronologyTitle(root){
    if(!root || !root.querySelectorAll)return;
    const candidates=root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,small,.subtitle,.section-subtitle');
    candidates.forEach(el=>{
      if(el.querySelector('.ghl-chrono-geopark-accent'))return;
      const label=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(!/^Geopark\s+Gombak\s*[-–—]\s*Hulu Langat$/i.test(label) &&
         !/^Gombak\s*[-–—]\s*Hulu Langat\s+Geopark$/i.test(label))return;
      const prefix=document.createTextNode('Gombak-Hulu Langat ');
      const accent=document.createElement('span');
      accent.className='ghl-chrono-geopark-accent';
      accent.textContent='Geopark';
      el.replaceChildren(prefix,accent);
    });
  }
  function apply(){
    reviseChronologyTitle(document.getElementById('section-kronologi'));
    reviseChronologyTitle(document.getElementById('chronologyModal'));
  }
  function ready(){
    apply();
    const containers=['section-kronologi','chronologyModal'];
    containers.forEach(id=>{
      const root=document.getElementById(id);
      if(root)new MutationObserver(apply).observe(root,{childList:true,subtree:true});
    });
    document.addEventListener('click',e=>{
      if(e.target.closest('[href*="kronologi"],[data-target*="kronologi"],[onclick*="chronology"],[onclick*="Kronologi"]')){
        requestAnimationFrame(apply);
      }
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();


/* Remove redundant area-total strip without altering district buttons or map handlers. */
(function(){
  function removeRedundantTotal(){
    const total=document.querySelector('#areaPanel .ghl-area-total');
    if(total)total.remove();
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',removeRedundantTotal,{once:true});
  }else{
    removeRedundantTotal();
  }
})();


/* GHLGp KPI total area: replace leaf with supplied mountain icon (2026-11-12). */
(function(){
  function applyMountainIcon(){
    const card=Array.from(document.querySelectorAll('.kpi')).find(el=>
      (el.querySelector('.kpi-label')?.textContent||'').trim()==='Jumlah Keluasan Geopark');
    if(!card)return;
    const icon=card.querySelector('.kpi-icon');
    if(!icon||icon.querySelector('.ghl-keluasan-mountain'))return;
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('class','ghl-keluasan-mountain');
    svg.setAttribute('viewBox','0 0 36 36');
    svg.setAttribute('fill','none');
    svg.setAttribute('aria-hidden','true');
    svg.setAttribute('focusable','false');
    svg.innerHTML='<path d="M3.5 28.5 13.5 10.5l7 11.2 4.2-7.4 7.8 14.2H3.5Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="m9.7 17.3 4 3.6 3.6-3.4m5.2 3.4 2.6 2.5 2.4-2.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 32h31" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>';
    icon.replaceChildren(svg);
  }
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',applyMountainIcon,{once:true});
  else applyMountainIcon();
})();
