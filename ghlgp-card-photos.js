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


/* GHLGp gallery: replace the legacy Batu Caves slide inside the existing slideshow. */
(function(){
 const images=Array.from({length:9},(_,i)=>String(i+1)+'.png');
 let lastFrame='';
 const clean=()=>{
  document.querySelectorAll('#ghl-uploaded-gallery,.ghl-uploaded-grid,.ghl-native-slide-photo,.ghl-slideshow-replacement').forEach(e=>e.remove());
  document.getElementById('ghl-uploaded-style')?.remove();
 };
 function apply(){
  clean();
  const leaves=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0);
  const notice=leaves.find(e=>/9 gambar arkib batu arang masih perlu dimuat naik/i.test(e.textContent||''));
  const title=leaves.find(e=>/galeri warisan batu arang/i.test(e.textContent||''));
  const seed=notice||title;
  if(!seed)return;
  // Find the gallery surface by its archive notice + wide picture; don't depend on CSS names.
  let photo=seed, whole=null;
  for(let i=0;i<12&&photo;i++,photo=photo.parentElement){
   const r=photo.getBoundingClientRect();
   if(r.width>550 && r.height>320){whole=photo;break}
  }
  if(!whole)return;
  let slider=whole;
  for(let i=0;i<4&&slider?.parentElement;i++){
   if(slider.querySelectorAll('button').length>=2)break;
   slider=slider.parentElement;
  }
  const text=(slider.textContent||'');
  const match=text.match(/(?:^|\D)(0?[1-9])\s*\/\s*0?9(?:\D|$)/);
  const number=match?Number(match[1]):1;
  const src=images[Math.min(8,Math.max(0,number-1))];
  // Native slider is an image, CSS background, or a slide containing a photo.
  // Hide the old photo only in the slideshow's picture zone, not its controls/footer.
  const target=whole;
  if(getComputedStyle(target).position==='static')target.style.position='relative';
  const backgroundNodes=[target,...target.querySelectorAll('*')];
  for(const el of backgroundNodes){
   if(el.classList?.contains('ghl-current-archive-photo'))continue;
   if(el===target){el.style.backgroundImage='none';continue}
   const r=el.getBoundingClientRect(),b=target.getBoundingClientRect();
   if(r.width>=b.width*.7 && r.height>=b.height*.65){
    if(el.tagName==='IMG')el.style.visibility='hidden';
    else if(getComputedStyle(el).backgroundImage!=='none')el.style.backgroundImage='none';
   }
  }
  let newPhoto=target.querySelector(':scope > .ghl-current-archive-photo');
  if(!newPhoto){
   newPhoto=document.createElement('img');
   newPhoto.className='ghl-current-archive-photo';
   newPhoto.alt='Foto Galeri Batu Arang';
   Object.assign(newPhoto.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'cover',display:'block',zIndex:'999',pointerEvents:'none'});
   target.append(newPhoto);
  }
  if(newPhoto.getAttribute('src')!==src){newPhoto.src=src;lastFrame=src;}
  // Preserve the existing counter, slideshow controls and bottom information bar.
  const counter=leaves.find(el=>/^0?[1-9]\s*\/\s*0?9$/.test((el.textContent||'').trim()));
  if(counter&&slider.contains(counter)){
   let n=counter;while(n&&n!==target&&n!==slider){n.style.position='relative';n.style.zIndex='1001';n=n.parentElement}
  }
  if(notice){
   let panel=notice;
   for(let i=0;i<3&&panel.parentElement&&panel.parentElement!==target;i++){
    if(panel.parentElement.querySelector('button'))break;
    panel=panel.parentElement;
   }
   panel.style.display='none';
  }
 }
 let busy=false;
 function schedule(){if(busy)return;busy=true;requestAnimationFrame(()=>{busy=false;apply()})}
 function boot(){
  schedule();
  new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true});
  document.addEventListener('click',schedule,true);
  setInterval(schedule,1500);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();