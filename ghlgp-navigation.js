document.addEventListener('DOMContentLoaded',function(){
const side=document.querySelector('.sidebar');
const links={utama:'utama',aboutGeoparkBtn:'section-about',chronologyBtn:'section-kronologi',geoTrailBtn:'section-jejak'};
function go(id){const el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});history.replaceState(null,'','#'+id);side?.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',(links[b.id||b.dataset.target]||b.dataset.ghlGo)===id));}
side?.querySelectorAll('.navbtn').forEach(b=>{const id=links[b.id||b.dataset.target]||b.dataset.ghlGo;if(id)b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();go(id)},true)});
const subs=['section-geologi','section-makanan','section-warisan'];side?.querySelectorAll('.jejak-sidebar-link').forEach((b,i)=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();go(subs[i])},true));
document.querySelectorAll('a[data-ghl-go]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();go(a.dataset.ghlGo)},true));
document.querySelectorAll('a[data-ghl-show]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();if(typeof window.openGeoTrailCategory==='function')window.openGeoTrailCategory(a.dataset.ghlShow);else go('section-'+a.dataset.ghlShow)},true));
});