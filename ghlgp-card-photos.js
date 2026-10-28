/* Extract each photo from its existing collage without stretching it.
   Only the card preview changes; existing popup detail renderer remains untouched. */
document.addEventListener('DOMContentLoaded',()=>{
 const settings=[
  {id:'jejakMakananList',selector:'.jejak-food-photo',url:'jejak-makanan-foto-e1-e13.png',columns:3,rows:5},
  {id:'jejakWarisanList',selector:'.jejak-heritage-photo',url:'jejak-warisan-foto-w1-w3-b7-b5-g30-g29.png',columns:3,rows:4}
 ];
 for(const spec of settings){
  const host=document.getElementById(spec.id);
  if(!host)continue;
  const source=new Image();
  source.onload=()=>{
   const pieces=[];
   const w=source.naturalWidth/spec.columns,h=source.naturalHeight/spec.rows;
   for(let i=0;i<spec.columns*spec.rows;i++){
    const col=i%spec.columns,row=Math.floor(i/spec.columns);
    const cv=document.createElement('canvas');
    cv.width=Math.round(w);cv.height=Math.round(h);
    const ctx=cv.getContext('2d');
    ctx.drawImage(source,col*w,row*h,w,h,0,0,cv.width,cv.height);
    pieces.push(cv.toDataURL('image/webp',0.9));
   }
   const apply=()=>{
    host.querySelectorAll('.jejak-entry').forEach((card,i)=>{
     const photo=card.querySelector(spec.selector);
     if(!photo||photo.querySelector('img.ghl-uncropped-thumb'))return;
     let index=i;
     if(spec.id==='jejakMakananList'){
      const n=Number(card.querySelector('.jejak-code')?.textContent?.replace(/\D/g,''));if(Number.isFinite(n)&&n>0)index=n-1;
     }
     if(spec.id==='jejakWarisanList'){
      // Restore the original unsorted collage index from existing sprite position.
      const pos=photo.style.backgroundPosition.trim().split(/\\s+/);
      const x=parseFloat(pos[0]),y=parseFloat(pos[1]);
      if(Number.isFinite(x)&&Number.isFinite(y)){
        const col=Math.max(0,Math.min(2,Math.round(x/50)));
        const row=Math.max(0,Math.min(3,Math.round(y/(100/3))));
        index=row*3+col;
      }
     }
     if(index<0||!pieces[index])return;
     const img=document.createElement('img');
     img.className='ghl-uncropped-thumb';img.src=pieces[index];img.alt=photo.getAttribute('aria-label')||'Gambar Jejak';
     img.loading='lazy';img.decoding='async';
     photo.style.backgroundImage='none';photo.append(img);
    });
   };
   apply();
   const observer=new MutationObserver(()=>{observer.disconnect();apply();observer.observe(host,{childList:true});});
   observer.observe(host,{childList:true});
  };
  source.onerror=()=>console.warn('Tidak dapat memuatkan kolaj gambar:',spec.url);
  source.src=spec.url;
 }
});


/* Use uploaded 1.png - 9.png inside existing Batu Arang / Selayang slideshow.
   Preserve its native arrows, autoplay timer, pause button, labels and counter. */
(function(){
 const paths=Array.from({length:9},(_,i)=>String(i+1)+'.png');
 const normalized=s=>(s||'').replace(/\s+/g,' ').trim().toLowerCase();
 function removeSeparateGrid(){
  // Remove only the gallery-grid added by the previous update; preserve other galleries.
  document.querySelectorAll('#ghl-uploaded-gallery, .ghl-uploaded-grid').forEach(el=>{
   if(el.id==='ghl-uploaded-gallery'||el.classList.contains('ghl-uploaded-grid'))el.remove();
  });
  document.getElementById('ghl-uploaded-style')?.remove();
 }
 function locate(){
  removeSeparateGrid();
  // Match the slideshow's existing central archival notice, not the main page heading.
  const nodes=[...document.querySelectorAll('div,p,span,small,strong,h1,h2,h3,h4')];
  const notice=nodes.find(n=>n.children.length===0 && /gambar arkib batu arang masih perlu dimuat naik/i.test(n.textContent||''));
  const label=notice || nodes.find(n=>n.children.length===0 && /galeri warisan batu arang/i.test(n.textContent||''));
  if(!label)return;
  let el=label, host=null;
  for(let i=0;el&&i<10;i++,el=el.parentElement){
   const bounds=el.getBoundingClientRect();
   const txt=normalized(el.textContent);
   if(bounds.width>450&&bounds.height>350&&txt.includes('galeri warisan batu arang')&&(/jeda slideshow|tukar setiap|\d\s*\/\s*09/.test(txt))){host=el;break;}
  }
  if(!host)return;
  let overlay=host.querySelector(':scope > .ghl-native-slide-photo');
  if(!overlay){
   // Native gallery surface may use an image or CSS background; keep it untouched and
   // place the repository photograph over it but below all existing controls and captions.
   const st=getComputedStyle(host);
   if(st.position==='static')host.style.position='relative';
   overlay=document.createElement('div');
   overlay.className='ghl-native-slide-photo';
   Object.assign(overlay.style,{position:'absolute',inset:'0 0 89px 0',backgroundPosition:'center',backgroundSize:'cover',backgroundRepeat:'no-repeat',pointerEvents:'none',zIndex:'0',borderRadius:'inherit'});
   host.prepend(overlay);
   // Keep existing counter, captions and slideshow controls visible above image.
   [...host.children].filter(x=>x!==overlay).forEach(x=>{const p=getComputedStyle(x).position;if(p==='static')x.style.position='relative';x.style.zIndex='1';});
  }
  const match=host.textContent.match(/(?:^|\s)(0?[1-9])\s*\/\s*0?9(?:\s|$)/);
  const num=match?Math.max(1,Math.min(9,Number(match[1]))):1;
  const file=paths[num-1];
  if(overlay.dataset.file!==file){
   overlay.style.backgroundImage='url("'+file+'")';
   overlay.dataset.file=file;
  }
  if(notice){
   const box=notice.parentElement;
   if(box && box!==host && !box.querySelector('button'))box.style.display='none';
  }
 }
 function setup(){
  removeSeparateGrid();
  locate();
  let pending=false;
  const observer=new MutationObserver(()=>{
   if(pending)return;
   pending=true;
   requestAnimationFrame(()=>{pending=false;locate();});
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style','class']});
  document.addEventListener('click',e=>{
   if(e.target.closest('button'))requestAnimationFrame(locate);
  },true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
