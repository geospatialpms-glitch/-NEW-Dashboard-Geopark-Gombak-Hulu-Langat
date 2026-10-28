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


/* Repository slideshow images: 1.png–9.png. No separate gallery grid. */
(function(){
 const photos=Array.from({length:9},(_,i)=>String(i+1)+'.png');
 function update(){
  document.querySelectorAll('#ghl-uploaded-gallery,.ghl-uploaded-grid').forEach(x=>x.remove());
  document.getElementById('ghl-uploaded-style')?.remove();
  // Find the native gallery via its existing 09-frame counter and caption.
  const all=[...document.querySelectorAll('body *')];
  const count=all.find(e=>e.children.length===0 && /^0?[1-9]\s*\/\s*0?9$/.test((e.textContent||'').trim()));
  if(!count)return;
  let gallery=count;
  for(let i=0;i<12&&gallery;i++,gallery=gallery.parentElement){
   if(!gallery.querySelectorAll('button').length)continue;
   if(!/galeri warisan batu arang/i.test(gallery.textContent||''))continue;
   const rect=gallery.getBoundingClientRect();
   if(rect.width<500||rect.height<350)continue;
   break;
  }
  if(!gallery)return;
  const number=Number((count.textContent||'').match(/\d+/)?.[0]||1);
  const src=photos[Math.max(0,Math.min(8,number-1))];
  const root=getComputedStyle(gallery);
  if(root.position==='static')gallery.style.position='relative';
  let image=gallery.querySelector(':scope > .ghl-slideshow-replacement');
  if(!image){
   image=document.createElement('img');
   image.className='ghl-slideshow-replacement';
   image.alt='Galeri Warisan Batu Arang';
   Object.assign(image.style,{position:'absolute',inset:'0',width:'100%',height:'calc(100% - 88px)',objectFit:'cover',zIndex:'20',pointerEvents:'none',borderRadius:'16px 16px 0 0'});
   gallery.append(image);
   // Native footer, arrows and number badge remain on top and functional.
   const footer=[...gallery.querySelectorAll('*')].filter(n=>n.children.length===0 && (/galeri foto 0?[1-9]|jeda slideshow|tukar setiap 5 saat|\/\s*09/.test((n.textContent||'').toLowerCase())));
   footer.forEach(node=>{
    let ancestor=node;
    for(let j=0;j<5&&ancestor&&ancestor!==gallery;j++,ancestor=ancestor.parentElement){
     if(getComputedStyle(ancestor).position==='static')ancestor.style.position='relative';
     ancestor.style.zIndex='30';
    }
   });
  }
  if(image.getAttribute('src')!==src)image.setAttribute('src',src);
 }
 let scheduled=false;
 function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;update()});
 }
 function start(){
  update();
  new MutationObserver(schedule).observe(document.body,{childList:true,characterData:true,subtree:true});
  document.addEventListener('click',schedule,true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();