(()=>{
const qs=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
// The visitor's situation, taken from the "What you get" tabs and hero path links ('fix' = already on HubSpot).
let intent='fix';
all('.mode-tab[data-mode],.path-links a[data-mode]').forEach(b=>b.addEventListener('click',()=>{intent=b.dataset.mode;}));
// Carry the visitor's situation into the booking form.
document.addEventListener('click',e=>{if(!e.target.closest('.js-book,.tier-cta'))return;setTimeout(()=>{all('input[name="stage"]').forEach(r=>r.checked=r.value===(intent==='fresh'?'New, just getting started':'Already using it'));const ex=qs('#ff-existing');if(ex)ex.hidden=intent==='fresh';},0)});
// Process steps highlight as they scroll into view.
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('seen')}),{threshold:.3});all('.steps>li').forEach(e=>observer.observe(e));
// Keyboard containment for the written quote dialog.
const qm=qs('#quote-modal');let returnFocus;all('.js-quote').forEach(b=>b.addEventListener('click',()=>{returnFocus=b}));
if(qm)qm.addEventListener('keydown',e=>{if(e.key==='Escape'){returnFocus?.focus();return;}if(e.key!=='Tab')return;const f=[...qm.querySelectorAll('button:not([disabled]),a,input,textarea,select')].filter(x=>x.getClientRects().length);const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
// Mobile booking button: hidden while the booking section is on screen or a dialog is open.
const mobile=qs('.mobile-book'),book=qs('#book');
if(mobile&&book){new IntersectionObserver(entries=>{mobile.classList.toggle('hidden',entries.some(e=>e.isIntersecting))},{threshold:.1}).observe(book);
new MutationObserver(()=>mobile.classList.toggle('hidden',document.body.classList.contains('lock'))).observe(document.body,{attributes:true,attributeFilter:['class']});}
// Testimonial videos: show a placeholder for any video file that is not uploaded yet.
all('.testimonial-video').forEach(card=>{const src=card.querySelector('source')?.getAttribute('src');if(!src)return;const probe=document.createElement('video');probe.preload='metadata';probe.muted=true;probe.addEventListener('error',()=>card.classList.add('is-pending'),{once:true});probe.src=src;});
})();
