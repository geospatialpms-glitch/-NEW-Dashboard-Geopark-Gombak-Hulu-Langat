document.addEventListener('DOMContentLoaded',function(){
  const side=document.querySelector('.sidebar');
  const links={utama:'utama',aboutGeoparkBtn:'section-about',chronologyBtn:'section-kronologi',geoTrailBtn:'section-jejak'};
  const go=id=>{const el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});history.replaceState(null,'','#'+id);};
  side?.querySelectorAll('.navbtn').forEach(b=>{
    const id=links[b.id||b.dataset.target]||b.dataset.ghlGo;
    if(id)b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();go(id)},true);
  });
  // Submenu jejak: biarkan onclick asal membuka maklumat penuh kategori.
  // Jangan sekat klik atau tukarkan kepada scroll ke kad ringkasan.
  document.querySelectorAll('a[data-ghl-go]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go(a.dataset.ghlGo)},true));
  // Pautan yang menuju ke halaman penuh tidak diganggu.
});