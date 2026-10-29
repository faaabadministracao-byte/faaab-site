(()=>{"use strict";
const $=id=>document.getElementById(id),out=$("ex-out");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let data=null,selected="FTB",done={};
try{done=JSON.parse(localStorage.getItem("faaab-exercicio-progresso-v2")||"{}")||{}}catch(e){}
function save(){try{localStorage.setItem("faaab-exercicio-progresso-v2",JSON.stringify(done))}catch(e){}}
function fullID(force,item){return force+"-"+item.id}
function tile(item,force){
const checked=done[fullID(force,item)]===true,details=(item.modelos||[]);
return '<article class="area-exercise"><span class="area-label">'+esc(item.tipo||"Circuito")+'</span>'+
'<h3>'+esc(item.nome)+'</h3>'+
'<p>'+esc(item.como)+'</p>'+
(details.length?'<p><strong>Exemplos de obstáculos:</strong> '+esc(details.join(", "))+'.</p>':"")+
'<p class="edu3-muted"><strong>Uso no jogo:</strong> '+esc(item.avaliacao)+'</p>'+
'<label><input type="checkbox" data-mark="'+esc(fullID(force,item))+'" '+(checked?'checked':'')+'> Já pratiquei no jogo</label></article>';
}
function render(){
if(!data)return;
let hash=decodeURIComponent(location.hash.slice(1));if(data.forcas.some(x=>x.id===hash))selected=hash;
const force=data.forcas.find(x=>x.id===selected),extra=force.exercicios||[],current=[...data.comuns,...extra];
const count=current.filter(x=>done[fullID(selected,x)]).length;
out.innerHTML='<header class="area-head"><span class="area-label">Treinamento prático no Roblox</span>'+
'<h1>Parkours e exercícios</h1>'+
'<p>Os exercícios são circuitos e movimentos que o jogador executa no mapa. As aulas e perguntas teóricas ficam na página de Estudos, não aqui.</p></header>'+
'<nav class="area-tabs" aria-label="Escolher força">'+data.forcas.map(f=>
'<button type="button" data-force="'+esc(f.id)+'" aria-pressed="'+String(selected===f.id)+'">'+esc(f.nome)+'</button>').join("")+'</nav>'+
'<section class="area-panel"><span class="area-label">'+esc(force.status)+'</span><h2>'+esc(force.nome)+'</h2>'+
'<p>'+esc(force.requisitos)+'</p>'+
'<div class="area-note">Os circuitos são opções de treino do jogo. A obrigatoriedade, o número de tentativas e a aprovação precisam ser definidos por prova, curso ou unidade. Marcar uma atividade aqui não libera patente.</div>'+
'<strong>Treinos realizados neste navegador: '+count+' de '+current.length+'</strong><div class="area-bar"><span style="width:'+Math.round(100*count/current.length)+'%"></span></div></section>'+
'<section><h2>Os cinco parkours</h2><p class="edu3-muted">Tipos de circuito que você definiu para o projeto. As variações abaixo são ideias de construção do mapa, não novas categorias.</p>'+
'<div class="area-exercises">'+data.comuns.map(x=>tile(x,selected)).join("")+'</div></section>'+
(extra.length?'<section><h2>Outros exercícios do Exército</h2>'+
'<p class="edu3-muted">Atividades registradas na seleção para Recruta e uma marcha de planejamento. As quantidades citadas são exclusivas daquela seleção.</p>'+
'<div class="area-exercises">'+extra.map(x=>tile(x,selected)).join("")+'</div></section>':
'<section class="area-panel"><h2>Exercícios específicos desta força</h2>'+
'<p>Os exercícios obrigatórios da '+esc(force.nome)+' ainda não foram confirmados. Por enquanto, os cinco parkours estão disponíveis para prática, sem copiar automaticamente os requisitos do Exército.</p></section>')+
'<nav class="area-links"><a href="estudos.html#provas">Provas de ingresso</a><a href="formacao.html#'+selected+'">Formação desta força</a><a href="index.html">Início do portal</a></nav>';
out.querySelectorAll("[data-force]").forEach(btn=>btn.addEventListener("click",()=>{selected=btn.dataset.force;location.hash=selected;render()}));
out.querySelectorAll("[data-mark]").forEach(el=>el.addEventListener("change",()=>{done[el.dataset.mark]=el.checked;save();const pos=window.scrollY;render();if(typeof window.scrollTo==="function")window.scrollTo(0,pos)}));
}
window.addEventListener("hashchange",render);
fetch("dados/exercicios-formacao.json",{cache:"no-cache"})
.then(r=>{if(!r.ok)throw Error("catálogo indisponível");return r.json()})
.then(j=>{data=j;render()})
.catch(e=>{out.innerHTML='<p class="area-note">Não foi possível carregar os exercícios: '+esc(e.message)+'</p><a href="index.html">Voltar ao portal</a>'});
})();