(()=>{"use strict";
const $=id=>document.getElementById(id),out=$("ex-out");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const simplify=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
let data=null,selected="FTB",search="",only="todos";
function matches(c){
 const q=simplify(search);
 return (only==="todos"||only==="agua"&&simplify(c.ambiente).includes("agua")||only==="voo"&&simplify(c.ambiente).includes("voo")||only==="altura"&&/altura|torre/i.test(c.ambiente))&&
 (!q||simplify([c.nome,c.ambiente,...c.etapas].join(" ")).includes(q));
}
function special(c,index){
 return '<details class="area-exercise area-circuit" id="circuit-'+esc(c.id)+'">'+
 '<summary><span class="area-label">Circuito '+String(index).padStart(2,"0")+' · '+esc(c.ambiente)+'</span><h3>'+esc(c.nome)+'</h3><span class="area-see">Ver percurso e obstáculos</span></summary>'+
 '<div class="area-circuit-body"><ol class="area-stages">'+c.etapas.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol>'+
 '<p><strong>O mapa precisa de:</strong> '+esc(c.dependencias.join(", "))+'.</p>'+
 (c.nota?'<p class="area-note">'+esc(c.nota)+'</p>':"")+
 '</div></details>';
}
function core(c){
 return '<article class="area-exercise area-core"><span class="area-label">Parkour base</span><h3>'+esc(c.nome)+'</h3><p>'+esc(c.como)+'</p>'+
 '<p><strong>Exemplos de obstáculos:</strong> '+esc((c.modelos||[]).join(", "))+'.</p></article>';
}
function other(c){
 return '<article class="area-exercise area-other"><span class="area-label">'+esc(c.tipo)+'</span><h3>'+esc(c.nome)+'</h3><p>'+esc(c.como)+'</p>'+
 '<p><strong>Na seleção já definida:</strong> '+esc(c.avaliacao)+'</p></article>';
}
function displayCircuits(){
const force=data.forcas.find(f=>f.id===selected),all=data.circuitosEspeciais.filter(c=>c.forcas.includes(selected)),filtered=all.filter(matches),section=$("area-special-list"),count=$("area-special-count");
if(!section||!count)return;
count.textContent=filtered.length+" circuitos para explorar nesta força.";
section.innerHTML=filtered.map(c=>special(c,all.indexOf(c)+1)).join("")||'<div class="area-panel"><p>Nenhum circuito corresponde à pesquisa. Apague a busca para ver todos.</p></div>';
}
function render(){
if(!data)return;
let h=decodeURIComponent(location.hash.slice(1)),f=data.forcas.find(x=>x.id===h);
if(f)selected=f.id;
const force=data.forcas.find(x=>x.id===selected),otherExercises=force.exercicios||[];
out.innerHTML='<header class="area-head"><span class="area-label">Percursos e obstáculos do Roblox</span><h1>Parkours, água e voo</h1>'+
'<p>De saltos simples até percursos que começam numa torre, passam pela água e terminam numa aeronave. Clique no nome de um circuito para ver todas as etapas que ele teria no mapa.</p></header>'+
'<nav class="area-tabs" aria-label="Escolher força">'+data.forcas.map(x=>'<button type="button" data-force="'+esc(x.id)+'" aria-pressed="'+String(x.id===selected)+'">'+esc(x.nome)+'</button>').join("")+'</nav>'+
'<section class="area-panel"><span class="area-label">'+esc(force.nome)+'</span><h2>Obstáculos e treinamento desta força</h2><p>'+esc(force.requisitos)+'</p>'+
'<p class="area-note"><strong>Importante:</strong> os cinco níveis básicos são parte do planejamento confirmado. Os circuitos mistos abaixo são conceitos de mapas e mecânicas novas — ainda precisam ser construídos no Roblox Studio. Eles não são provas obrigatórias.</p></section>'+
'<section class="area-block" id="parkours"><h2>Os cinco parkours principais</h2><div class="area-exercises">'+data.comuns.map(core).join("")+'</div></section>'+
'<section class="area-block" id="especiais"><h2>Circuitos especiais</h2>'+
'<p class="edu3-muted">Combine saltos, nado, barcos, helicópteros, planadores, pontes móveis, torres, túneis e eventos do mapa. Cada circuito tem começo, sequência e chegada.</p>'+
'<div class="area-explore"><label for="area-search">Encontrar um circuito</label><input id="area-search" type="search" placeholder="Ex.: água, voo, torre, helicóptero..." autocomplete="off" value="'+esc(search)+'">'+
'<div class="area-quick" aria-label="Buscar circuitos por ambiente">'+
[['todos','Todos'],['agua','Com água'],['voo','Com voo'],['altura','Com altura']].map(([id,label])=>'<button type="button" data-quick="'+id+'" aria-pressed="'+String(only===id)+'">'+label+'</button>').join("")+'</div></div>'+
'<p id="area-special-count" class="edu3-muted"></p><div id="area-special-list" class="area-exercises"></div></section>'+
(otherExercises.length?'<section class="area-block" id="outros"><h2>Outros movimentos do Exército</h2>'+
'<p class="edu3-muted">Flexões, polichinelos, pulos, corrida e comandos já aparecem nas regras do ingresso para Recruta. A marcha fica como possibilidade de treinamento, sem exigência fixada.</p>'+
'<div class="area-exercises">'+otherExercises.map(other).join("")+'</div></section>':"")+
'<nav class="area-links"><a href="estudos.html#provas">Provas</a><a href="formacao.html#'+selected+'">Formação</a><a href="index.html">Voltar ao portal</a></nav>';
out.querySelectorAll("[data-force]").forEach(btn=>btn.addEventListener("click",()=>{selected=btn.dataset.force;search="";only="todos";location.hash=selected;render()}));
$("area-search").addEventListener("input",e=>{search=e.target.value;displayCircuits()});
out.querySelectorAll("[data-quick]").forEach(btn=>btn.addEventListener("click",()=>{
only=btn.dataset.quick;out.querySelectorAll("[data-quick]").forEach(x=>x.setAttribute("aria-pressed",String(x===btn)));displayCircuits()
}));
displayCircuits();
}
window.addEventListener("hashchange",render);
fetch("dados/exercicios-formacao.json",{cache:"no-cache"}).then(r=>{
if(!r.ok)throw Error("catálogo não disponível");return r.json()
}).then(j=>{data=j;render()})
.catch(e=>{out.innerHTML='<div class="area-note">Não foi possível carregar os circuitos. '+esc(e.message)+'</div><a href="index.html">Voltar ao portal</a>'});
})();