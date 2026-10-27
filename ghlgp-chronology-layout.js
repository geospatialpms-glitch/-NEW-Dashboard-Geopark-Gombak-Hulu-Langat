document.addEventListener('DOMContentLoaded',()=>{
 const modal=document.getElementById('chronologyModal');
 const body=modal?.querySelector('.geo-modal-body');
 if(!body||body.querySelector('.ghl-chrono-hero'))return;
 const hero=document.createElement('section');
 hero.className='ghl-chrono-hero';
 hero.setAttribute('aria-label','Pengenalan kronologi Geopark Gombak Hulu Langat');
 hero.innerHTML='<div class="ghl-chrono-hero-copy"><small>GOMBAK – HULU LANGAT GEOPARK</small><h3>Kronologi Geopark</h3><p>Perjalanan penubuhan, perancangan dan pengurusan Gombak–Hulu Langat Geopark.</p></div><div class="ghl-chrono-hero-photo" role="img" aria-label="Panorama landskap Geopark"></div>';
 body.prepend(hero);
});