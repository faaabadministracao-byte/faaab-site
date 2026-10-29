(()=>{"use strict";const $=id=>document.getElementById(id),out=$("ex-out");const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let data,selected="FTB",done={};try{done=JSON.parse(localStorage.getItem("faaab-exercicio-progresso-v1")||"{}")||{}}catch(e){}
function persist(){try{localStorage.setItem("faaab-exercicio-progresso-v1",JSON.stringify(done))}catch(e){}}
function id(force,item){return force+"-"+item.id}
function exercise(e,force){const checked=done[id(force,e)]===true;return '<article class="area-exercise"><span class="area-label">'+esc(e.formato||"Atividade")+'</span><h3>'+esc(e.nome)+'</h3>'+
 '<p><strong>Como fazer no jogo:</strong> '+esc(e.como||e.objetivo)+'</p>'+
 '<p><strong>Como avaliar:</strong> '+esc(e.avaliacao)+'</p>'+
 '<label><input type="checkbox" data-mark="'+esc(id(force,e))+'" '+(checked?'checked':'')+'> Já pratiquei este exercício</label></article>'}
function render(){
 if(!data)return;const hash=location.hash.replace("#","");selected=data.forcas.some(x=>x.id===hash)?hash:selected;const force=data.forcas.find(x=>x.id===selected);
 const all=[...data.comuns,...force.exercicios],count=all.filter(x=>done[id(selected,x)]).length;
 out.innerHTML='<header class="area-head"><span class="area-label">Treinamento FAAAB</span><h1>Exercícios das cinco forças</h1>'+
 '<p>Há fundamentos que todos podem aprender e situações próprias de cada instituição. Os exercícios são simulações seguras no Roblox, não testes físicos oficiais nem inscrições em provas.</p></header>'+
 '<nav class="area-tabs" aria-label="Escolher força">'+data.forcas.map(f=>'<button type="button" data-force="'+f.id+'" aria-pressed="'+(selected===f.id)+'">'+esc(f.nome)+'</button>').join("")+'</nav>'+
 '<section class="area-panel"><div class="area-forcehead"><span class="area-label">'+esc(force.status)+'</span><h2>'+esc(force.nome)+'</h2><p>'+esc(force.requisitos)+'</p>'+
 '<a href="'+esc(force.home)+'">Conhecer a organização</a> <span aria-hidden="true">·</span> <a href="formacao.html#'+selected+'">Ver formação</a></div>'+
 '<div class="area-note">Marcar “Já pratiquei” salva apenas sua lista neste navegador. Não significa aprovação, habilitação nem promoção.</div>'+
 '<strong>Prática registrada: '+count+' de '+all.length+'</strong><div class="area-bar"><span style="width:'+Math.round(count/all.length*100)+'%"></span></div></section>'+
 '<section><h2>Fundamentos compartilhados</h2><p class="edu3-muted">Mesmas habilidades gerais, aplicadas de modo apropriado a cada força.</p><div class="area-exercises">'+data.comuns.map(e=>exercise(e,selected)).join("")+'</div></section>'+
 '<section><h2>Atividades da '+esc(force.nome)+'</h2><p class="edu3-muted">Exercícios diferentes conforme a missão e os equipamentos da instituição.</p><div class="area-exercises">'+force.exercicios.map(e=>exercise(e,selected)).join("")+'</div></section>'+
 '<div class="edu3-info">A avaliação considera entendimento, comunicação, organização e segurança. Os números de flexões, tempos e condições das provas oficiais da FAAAB continuam somente nos regulamentos de cada seleção.</div>'+
 '<nav class="area-links"><a href="estudos.html#provas">Ver provas</a><a href="formacao.html#'+selected+'">Ver requisitos de formação</a><a href="index.html">Voltar ao portal</a></nav>';
 out.querySelectorAll("[data-force]").forEach(btn=>btn.addEventListener("click",()=>{selected=btn.dataset.force;location.hash=selected;render()}));
 out.querySelectorAll("[data-mark]").forEach(el=>el.addEventListener("change",()=>{done[el.dataset.mark]=el.checked;persist();const y=window.scrollY;render();window.scrollTo(0,y)}));
}
window.addEventListener("hashchange",render);
fetch("dados/exercicios-formacao.json").then(r=>{if(!r.ok)throw Error("catálogo indisponível");return r.json()}).then(d=>{data=d;render()}).catch(e=>{out.innerHTML='<p class="area-note">Não foi possível abrir as atividades: '+esc(e.message)+'</p><a href="index.html">Voltar ao portal</a>'});
})();