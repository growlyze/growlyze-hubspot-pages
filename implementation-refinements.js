(()=>{
const qs=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];let intent='fix',timer,phase=0;
const captions=['Clean records and mapped fields','Ownership and qualification rules','Reliable follow-up and exception handling','A clear sales pipeline','A complete customer service handoff','Connected tools and monitored syncs','Reporting your team can trust'];
function animate(){clearInterval(timer);phase=0;all('.sys-node').forEach(n=>n.classList.remove('active','complete'));if(matchMedia('(prefers-reduced-motion: reduce)').matches){all('.sys-node').forEach(n=>n.classList.add('complete'));qs('#system-progress').textContent='A connected system, ready for your team';return;}step();timer=setInterval(step,1350);}
function step(){all('.sys-node').forEach(n=>{let i=+n.dataset.phase;n.classList.toggle('active',i===phase);n.classList.toggle('complete',i<phase)});qs('#system-progress').textContent=captions[phase]||'A connected system, ready for your team';if(phase++>=7)clearInterval(timer);}
let ready=false;
function fadeSwap(fn){const els=['.hero .sub','#hero-h1','.hero-actions .js-book','#system-mode','#record-copy'].map(q=>qs(q)).filter(Boolean);if(!ready||matchMedia('(prefers-reduced-motion: reduce)').matches){fn();return;}els.forEach(e=>e.classList.add('slide-out'));setTimeout(()=>{fn();els.forEach(e=>{e.classList.remove('slide-out');e.classList.add('slide-start');void e.offsetWidth;e.classList.remove('slide-start');});},400);}
function choose(m){intent=m;all('[data-intent]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.intent===m)));const apply=()=>{if(intent!==m)return;qs('#hero-h1').innerHTML=m==='fresh'?'HubSpot, built around<br><em>how you actually work.</em>':'Your HubSpot.<br><em>Finally working together.</em>';qs('.hero .sub').textContent=m==='fresh'?'Start with a clear process, then a connected HubSpot. Our architects design, configure and test your setup, and train your team to use it.':'Untangle the data, workflows and handoffs holding your team back. Our architects keep what works, fix what doesn\u2019t and connect the whole journey.';qs('.hero-actions .js-book').textContent=m==='fresh'?'Plan my HubSpot implementation':'Get my free HubSpot health check';qs('#system-mode').textContent=m==='fresh'?'New portal, designed around your process':'Existing portal, rebuilt around your process';qs('#record-copy').textContent=m==='fresh'?'Map fields \u00b7 import clean data \u00b7 set ownership':'Merge duplicates \u00b7 map fields \u00b7 preserve history';const mode=qs('.mode-tab[data-mode="'+m+'"]');if(mode)mode.click();all('input[name="stage"]').forEach(r=>r.checked=r.value===(m==='fresh'?'New, just getting started':'Already using it'));qs('#ff-existing').hidden=m==='fresh';animate();};fadeSwap(apply);ready=true;}
all('[data-intent]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.intent)));
// Keep the hero switch in sync when the visitor uses the lower tabs or the hero path links.
all('.mode-tab[data-mode],.path-links a[data-mode]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.mode!==intent)choose(b.dataset.mode);}));qs('#replay-system').addEventListener('click',animate);choose('fix');
// Preserve existing booking flow, and carry the visitor's intent into it.
document.addEventListener('click',e=>{if(!e.target.closest('.js-book,.tier-cta'))return;setTimeout(()=>{all('input[name="stage"]').forEach(r=>r.checked=r.value===(intent==='fresh'?'New, just getting started':'Already using it'));qs('#ff-existing').hidden=intent==='fresh';},0)});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('seen')}),{threshold:.3});all('.audit-step,.steps>li').forEach(e=>observer.observe(e));
/* What you get: rows animate in on scroll */
document.documentElement.classList.add('js-anim');
const scopeObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('seen');scopeObs.unobserve(e.target)}}),{threshold:.2});
all('#included .scope-theme').forEach((e,i)=>{e.style.transitionDelay=(i%4)*90+'ms';scopeObs.observe(e)});
// Do not show a successful submission until the configured endpoint confirms receipt.
const submit=qs('#simple-submit');const endpoint=typeof CONFIG!=='undefined'?CONFIG.ghlWebhookUrl:'';
if(endpoint){submit.disabled=false;qs('#inquiry-status').textContent='Send your requirements. We\u2019ll reply within 24 hours; complex projects may need further scoping.';}
qs('#inquiry-email').addEventListener('click',()=>{const body='Name: '+qs('#q-name').value+'\nEmail: '+qs('#q-email').value+'\nWebsite: '+qs('#inquiry-site').value+'\n\n'+qs('#inquiry-goal').value;qs('#inquiry-email').href='mailto:hello@growlyze.com?subject='+encodeURIComponent('HubSpot implementation inquiry')+'&body='+encodeURIComponent(body)});
submit.addEventListener('click',async()=>{const name=qs('#q-name'),email=qs('#q-email'),goal=qs('#inquiry-goal');if(!name.value.trim()||!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)||!goal.value.trim()){qs('#inquiry-status').textContent='Please enter your name, a valid email and what you need help with.';return;}if(!endpoint)return;submit.disabled=true;qs('#inquiry-status').textContent='Sending\u2026';try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({full_name:name.value,email:email.value,goal:goal.value,website:qs('#inquiry-site').value,page:'implementation',stage:intent})});if(!r.ok)throw Error();qs('#inquiry-status').textContent='Thank you. Your requirements have been received. We\u2019ll reply within 24 hours.';submit.textContent='Sent';}catch(e){qs('#inquiry-status').textContent='Your inquiry could not be confirmed. Please try again or email us below.';submit.disabled=false;}});
// Keyboard containment for the written inquiry dialog.
const qm=qs('#quote-modal');let returnFocus;all('.js-quote').forEach(b=>b.addEventListener('click',()=>{returnFocus=b}));qm.addEventListener('keydown',e=>{if(e.key==='Escape'){returnFocus?.focus();return;}if(e.key!=='Tab')return;const f=[...qm.querySelectorAll('button:not([disabled]),a,input,textarea,select')].filter(x=>x.getClientRects().length);const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
const mobile=qs('.mobile-book');new IntersectionObserver(entries=>{mobile.classList.toggle('hidden',entries.some(e=>e.isIntersecting))},{threshold:.1}).observe(qs('#book'));
new MutationObserver(()=>mobile.classList.toggle('hidden',document.body.classList.contains('lock'))).observe(document.body,{attributes:true,attributeFilter:['class']});
})();

// Testimonial videos: show a placeholder for any video file that is not uploaded yet.
document.querySelectorAll('.testimonial-video').forEach(card=>{const src=card.querySelector('source')?.getAttribute('src');if(!src)return;const probe=document.createElement('video');probe.preload='metadata';probe.muted=true;probe.addEventListener('error',()=>card.classList.add('is-pending'),{once:true});probe.src=src;});
/* What you get: hover opens a row on mouse devices (click still toggles) */
if(matchMedia("(hover:hover) and (pointer:fine)").matches){
  all("#included .scope-theme").forEach(d=>{
    let t;
    d.addEventListener("mouseenter",()=>{t=setTimeout(()=>{d.open=true},250)});
    d.addEventListener("mouseleave",()=>clearTimeout(t));
  });
}
