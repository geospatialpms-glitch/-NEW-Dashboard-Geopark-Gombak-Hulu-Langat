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


/* Gallery GHLGp: use the nine original PNGs uploaded to the repository.
   Existing Batu Arang and Selayang gallery content is preserved. */
(function(){
 const photos=Array.from({length:9},(_,i)=>`${i+1}.png`);
 function installGallery(){
  if(document.getElementById('ghl-uploaded-gallery'))return true;
  const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,[role="heading"]')];
  const heading=headings.find(el=>/^galeri\s*(?:ghlgp|gombak\s*[–-]\s*hulu\s*langat)$/i.test(el.textContent.trim()));
  if(!heading)return false;
  const gallery=document.createElement('section');
  gallery.id='ghl-uploaded-gallery';
  gallery.setAttribute('aria-label','Galeri foto GHLGp');
  const grid=document.createElement('div');grid.className='ghl-uploaded-grid';
  photos.forEach((src,i)=>{
   const anchor=document.createElement('a');
   anchor.className='ghl-uploaded-photo';anchor.href=src;anchor.target='_blank';anchor.rel='noopener';
   const img=document.createElement('img');img.src=src;img.alt='Galeri GHLGp – Foto '+(i+1);
   img.loading='lazy';img.decoding='async';
   anchor.append(img);grid.append(anchor);
  });
  gallery.append(grid);
  heading.insertAdjacentElement('afterend',gallery);
  return true;
 }
 const style=document.createElement('style');
 style.textContent=`
 #ghl-uploaded-gallery{width:100%;margin:20px 0 30px}
 .ghl-uploaded-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
 .ghl-uploaded-photo{position:relative;display:block;aspect-ratio:4/3;overflow:hidden;border-radius:16px;background:#183e28;box-shadow:0 6px 18px rgba(12,52,28,.12)}
 .ghl-uploaded-photo img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .35s ease}
 .ghl-uploaded-photo:hover img{transform:scale(1.055)}
 .ghl-uploaded-photo:focus-visible{outline:3px solid #ed9637;outline-offset:3px}
 @media(max-width:700px){.ghl-uploaded-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}}
 @media(max-width:420px){.ghl-uploaded-grid{grid-template-columns:1fr}}
 @media(prefers-reduced-motion:reduce){.ghl-uploaded-photo img{transition:none}}
 `;
 document.head.append(style);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installGallery,{once:true});
 else installGallery();
 const watcher=new MutationObserver(()=>{if(installGallery())watcher.disconnect()});
 watcher.observe(document.documentElement,{childList:true,subtree:true});
})();
