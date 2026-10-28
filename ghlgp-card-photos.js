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


/* Batu Arang gallery slideshow: 1.png–9.png only; do not alter native controls. */
(function(){
 const FILES=Array.from({length:9},(_,i)=>new URL((i+1)+'.png',document.baseURI).href);
 const NOTICE=/9 gambar arkib batu arang masih perlu dimuat naik/i;
 const TITLE=/galeri warisan batu arang/i;
 function tick(){
  document.querySelectorAll('#ghl-uploaded-gallery,.ghl-uploaded-grid,.ghl-native-slide-photo,.ghl-slideshow-replacement,.ghl-current-archive-photo').forEach(el=>el.remove());
  const leaves=[...document.querySelectorAll('body *')].filter(el=>!el.children.length);
  const note=leaves.find(el=>NOTICE.test(el.textContent||''));
  if(!note)return;
  let stage=note;
  // Central archival message is INSIDE the actual picture stage, not the footer.
  for(let n=0;n<9&&stage;n++,stage=stage.parentElement){
   const r=stage.getBoundingClientRect();
   if(r.width>450&&r.height>320)break;
  }
  if(!stage)return;
  const stageRect=stage.getBoundingClientRect();
  if(stageRect.width<450||stageRect.height<320)return;
  let wrapper=stage;
  for(let n=0;n<5&&wrapper.parentElement;n++){
   if(wrapper.querySelectorAll('button').length>=2)break;
   wrapper=wrapper.parentElement;
  }
  const nodes=[...wrapper.querySelectorAll('*')];
  let count=nodes.find(el=>el.children.length===0&&/^0?[1-9]\s*\/\s*0?9$/.test((el.textContent||'').trim()));
  const match=count?.textContent.match(/\d+/);
  const index=Math.max(0,Math.min(8,(match?Number(match[0]):1)-1));
  if(getComputedStyle(stage).position==='static')stage.style.position='relative';
  let cover=stage.querySelector(':scope > .ghl-batu-arang-photo');
  if(!cover){
   cover=document.createElement('div');
   cover.className='ghl-batu-arang-photo';
   cover.setAttribute('aria-label','Gambar Galeri Warisan Batu Arang');
   Object.assign(cover.style,{position:'absolute',inset:'0',zIndex:'2147483000',backgroundSize:'cover',backgroundPosition:'center',backgroundRepeat:'no-repeat',pointerEvents:'none',borderRadius:'inherit'});
   stage.appendChild(cover);
  }
  if(cover.dataset.frame!==String(index)){
   cover.style.backgroundImage='url("'+FILES[index]+'")';
   cover.dataset.frame=String(index);
  }
  // Recreate only the counter in the photograph zone so it remains visible above the cover.
  let badge=stage.querySelector(':scope > .ghl-batu-arang-counter');
  if(!badge){
   badge=document.createElement('span');badge.className='ghl-batu-arang-counter';
   Object.assign(badge.style,{position:'absolute',top:'24px',left:'24px',zIndex:'2147483001',padding:'10px 18px',borderRadius:'30px',color:'#fff',background:'#075141',font:'bold 12px Arial,sans-serif',pointerEvents:'none'});
   stage.appendChild(badge);
  }
  badge.textContent=String(index+1).padStart(2,'0')+' / 09';
  if(count)count.style.visibility='hidden';
 }
 let pending=false;
 function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;tick()})}
 function setup(){
  schedule();
  new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true});
  document.addEventListener('click',schedule,true);
  setInterval(schedule,1000);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();