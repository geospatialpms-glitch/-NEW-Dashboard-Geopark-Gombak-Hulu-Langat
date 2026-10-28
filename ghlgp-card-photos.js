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


/* Scoped 9-image Batu Arang slideshow. Does not alter navigation or homepage. */
document.addEventListener('DOMContentLoaded',()=>{
 const frames=Array.from({length:9},(_,i)=>new URL((i+1)+'.png',document.baseURI).href);
 const noticeText=/9 gambar arkib batu arang masih perlu dimuat naik/i;
 let mounted=null, current=-1, pending=-1;
 let homeSelected=false;
 function clearGalleryOverlay(){
   document.querySelectorAll('.ghl-gallery-photos-only').forEach(el=>el.remove());
   mounted=null;current=-1;pending=-1;
 }
 // Home navigation must always restore the native hero; never use a gallery photo there.
 document.addEventListener('click',e=>{
   const button=e.target.closest('.sidebar button,.sidebar a,.sidebar [role="button"]');
   if(!button)return;
   const label=(button.textContent||button.getAttribute('aria-label')||'').trim().toLowerCase();
   if(label==='utama'||button.getAttribute('data-ghl-go')==='utama'){
     homeSelected=true;
     clearGalleryOverlay();
   }else if(label){homeSelected=false;}
 },true);
 function findStage(){
   const msg=[...document.querySelectorAll('p,small,span,div')].find(e=>e.children.length===0&&noticeText.test(e.textContent||''));
   if(!msg)return null;
   const ancestors=[];for(let e=msg,n=0;e&&n<8;e=e.parentElement,n++)ancestors.push(e);
   // The native slide stage is the smallest sizeable ancestor of the archive notice.
   const stage=ancestors.find(e=>{const r=e.getBoundingClientRect();return r.width>=300&&r.height>=220;});
   if(!stage)return null;
   // Require its slideshow frame counter in a nearby container. No homepage/hero modification.
   let wrap=stage;
   for(let k=0;k<5&&wrap;k++,wrap=wrap.parentElement){
     const txt=wrap.textContent||'';
     if(/galeri warisan batu arang/i.test(txt) && /0?[1-9]\s*\/\s*0?9/.test(txt) && wrap.querySelectorAll('button').length>=2){
       return {stage,wrap};
     }
   }
   return null;
 }
 function draw(){
  if(homeSelected){clearGalleryOverlay();return;}
  const result=findStage();if(!result)return;
  const {stage,wrap}=result;
  const counter=[...wrap.querySelectorAll('*')].find(e=>e.children.length===0&&/^0?[1-9]\s*\/\s*0?9$/.test((e.textContent||'').trim()));
  if(!counter)return;
  const index=Math.max(0,Math.min(8,Number(counter.textContent.match(/\d+/)[0])-1));
  if(mounted!==stage){
    mounted=stage;current=-1;pending=-1;
    if(getComputedStyle(stage).position==='static')stage.style.position='relative';
    const surface=document.createElement('div');
    surface.className='ghl-gallery-photos-only';
    Object.assign(surface.style,{position:'absolute',inset:'0',overflow:'hidden',pointerEvents:'none',zIndex:'5',borderRadius:'inherit'});
    stage.append(surface);
    // Only the old central placeholder is hidden, not the original footer or buttons.
    const msg=[...stage.querySelectorAll('*')].find(e=>e.children.length===0&&noticeText.test(e.textContent||''));
    if(msg){let panel=msg;while(panel.parentElement!==stage&&panel.parentElement){panel=panel.parentElement;}panel.style.display='none';}
  }
  if(index===current||index===pending)return;
  pending=index;
  const preload=new Image();
  preload.onload=()=>{
   if(mounted!==stage||pending!==index)return;
   const surface=stage.querySelector(':scope > .ghl-gallery-photos-only');
   if(!surface)return;
   const layer=document.createElement('img');
   layer.src=frames[index];layer.alt='Galeri Warisan Batu Arang, foto '+(index+1);
   Object.assign(layer.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'cover',opacity:current<0?'1':'0',transition:'opacity 850ms ease-in-out'});
   surface.append(layer);
   if(current>=0)requestAnimationFrame(()=>{layer.style.opacity='1';});
   const finish=()=>{
    if(!layer.isConnected)return;
    [...surface.children].filter(x=>x!==layer).forEach(x=>x.remove());
   };
   if(current>=0)setTimeout(finish,900);else finish();
   current=index;pending=-1;
  };
  preload.onerror=()=>{if(pending===index)pending=-1;};
  preload.src=frames[index];
 }
 // Passive polling follows the native slide timer, pause and arrow controls.
 // Crucially, no global mutation observer or click interception is installed.
 draw();setInterval(draw,450);
});
