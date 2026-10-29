(()=>{"use strict";
const selectors=[
 "body.faaab-portal nav.nav:not(.edu3-site-nav)",
 "body.faaab-portal nav.mainnav",
 "body.faaab-portal nav.mini-nav",
 "body.faaab-portal nav.navmini",
 "body.faaab-portal nav.bar",
 "body.faaab-portal nav.career-nav",
 "body.faaab-portal nav.legal-nav",
 "body.faaab-portal nav.edu3-site-nav",
 "body.faaab-portal nav.edu3-menu:not([aria-label='Estudos'])",
 "body.faaab-root nav.navlinks"
];
const navs=Array.from(new Set(selectors.flatMap(sel=>[...document.querySelectorAll(sel)])));
let index=0;
for(const nav of navs){
 if(nav.classList.contains("faaab-nav-ready"))continue;
 const inner=[...nav.children].find(e=>e.tagName==="DIV"&&([...e.children].some(x=>x.tagName==="A")));
 const host=inner||nav;
 let links=[...host.children].filter(e=>e.tagName==="A");
 if(!links.length)continue;
 let box=inner||document.createElement("div");
 if(!inner){for(const a of links)box.appendChild(a);nav.appendChild(box)}
 box.classList.add("faaab-nav-links");
 const button=document.createElement("button");
 button.type="button";
 button.className="faaab-nav-toggle";
 button.setAttribute("aria-controls","faaab-nav-"+(++index));
 button.setAttribute("aria-expanded","false");
 button.setAttribute("aria-label","Abrir menu de navegação");
 button.innerHTML='<span>Menu</span><span class="faaab-nav-icon" aria-hidden="true">☰</span>';
 box.id="faaab-nav-"+index;
 nav.insertBefore(button,nav.firstChild);
 nav.classList.add("faaab-site-nav","faaab-nav-ready");
 function setOpen(on){
 nav.classList.toggle("faaab-nav-open",on);
 button.setAttribute("aria-expanded",String(on));
 button.setAttribute("aria-label",on?"Fechar menu de navegação":"Abrir menu de navegação");
 button.lastElementChild.textContent=on?"×":"☰";
 }
 button.addEventListener("click",()=>setOpen(!nav.classList.contains("faaab-nav-open")));
 nav.addEventListener("keydown",e=>{if(e.key==="Escape"&&nav.classList.contains("faaab-nav-open")){setOpen(false);button.focus()}});
 for(const a of links)a.addEventListener("click",()=>setOpen(false));
}
})();