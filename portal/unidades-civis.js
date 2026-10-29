(()=>{"use strict";const $=id=>document.getElementById(id),out=$("unit-out"),force=document.body.dataset.force==="PM"?"PM":"CBM";const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&quot;","'":"&#39;"}[c])); // safe text formatting
let list=[],training;
function get(id){return list.find(x=>x.id===id)}
function anchor(id){return "#"+encodeURIComponent(id)}
function detail(u){
 const basics=training.gerais||[];
 const specialized=(training.especializados||[]).filter(e=>(e.unidades||[]).includes(u.id));
 return '<article class="area-panel"><span class="area-label">'+esc(u.status)+'</span><h2>'+esc(u.sigla+' — '+u.nome)+'</h2>'+
 '<p>'+esc(u.missao)+'</p>'+
 (u.aviso?'<div class="area-note">'+esc(u.aviso)+'</div>':"")+
 '<h3>Equipes e seções previstas</h3><div class="area-rows">'+u.equipes.map(x=>'<div class="area-row"><h4>'+esc(x[0])+'</h4><p>'+esc(x[1])+'</p></div>').join("")+'</div>'+
 '<h3>Quem pode participar: requisitos propostos</h3><ul class="area-require">'+u.requisitos.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>'+
 '<h3>Funções da unidade</h3><div>'+u.funcoes.map(x=>'<span class="area-pill">'+esc(x)+'</span>').join("")+'</div>'+
 '<h3>Exercícios básicos</h3><p>'+esc(u.treinoPratico)+'</p><div class="area-rows">'+
 basics.map(e=>'<div class="area-row"><h4>'+esc(e.nome)+'</h4><p>'+esc(e.descricao)+'</p></div>').join("")+'</div>'+
 (specialized.length?'<h3>Treinamento especializado — acesso restrito</h3><p>Somente quem tem vínculo à função, qualificação e autorização pode participar. Não é exigência geral de todos os membros da unidade.</p>'+
 '<div class="area-rows">'+specialized.map(e=>'<div class="area-row"><h4>'+esc(e.nome)+'</h4><p>'+esc(e.habilitacao)+'</p></div>').join("")+'</div>':"")+
 '<div class="area-links"><a href="exercicios.html#'+force+'">Exercícios gerais</a><a href="formacao.html#'+force+'">Formação e especializações</a><a href="#inicio">Voltar às unidades</a></div></article>';
}
function render(){
 const slug=decodeURIComponent(location.hash.slice(1)),picked=get(slug);const isPM=force==="PM";
 const title=isPM?"Polícia Militar":"Corpo de Bombeiros";
 out.innerHTML='<header class="area-head"><span class="area-label">FAAAB · '+esc(title)+'</span><h1>'+esc(title)+'</h1>'+
 '<p>'+(isPM?'Atendimento, respeito, comunicação, registro de ocorrências e carreira policial no Roblox.':'Prevenção de riscos, busca, resgate, atendimento inicial e formação de bombeiros no Roblox.')+'</p></header>'+
 '<div class="area-note">As organizações já catalogadas foram mantidas. Departamentos, funções internas e critérios novos abaixo são propostas para deliberação no projeto; não são regulamentos oficiais.</div>'+
 '<nav class="area-links"><a href="formacao.html#'+force+'">Requisitos de formação</a><a href="exercicios.html#'+force+'">Exercícios</a><a href="estudos.html#provas">Provas de ingresso</a><a href="index.html">Portal</a></nav>'+
 '<div class="area-layout"><nav class="area-side" aria-label="Unidades da instituição"><a href="#inicio" aria-current="'+String(!picked)+'">Visão geral</a>'+
 list.map(u=>'<a href="'+anchor(u.id)+'" aria-current="'+String(picked?.id===u.id)+'">'+esc(u.sigla)+'</a>').join("")+'</nav>'+
 '<div class="area-content">'+(picked?detail(picked):'<section class="area-panel"><h2>Unidades e formações</h2><p>Escolha uma unidade para ver missão, equipes, funções, regras de ingresso e exercícios. Os requisitos são apresentados como propostas quando não foram aprovados.</p><div class="area-rows">'+list.map(u=>'<a class="area-row" href="'+anchor(u.id)+'"><strong>'+esc(u.sigla)+' — '+esc(u.nome)+'</strong><p>'+esc(u.missao)+'</p></a>').join("")+'</div></section>')+'</div></div>';
}
window.addEventListener("hashchange",render);
Promise.all([fetch("dados/unidades-pm-bombeiros.json").then(r=>r.json()),fetch("dados/exercicios-formacao.json").then(r=>r.json())]).then(([u,t])=>{list=u[force==="PM"?"policia":"bombeiros"];training=t;render()}).catch(e=>{out.innerHTML='<div class="area-note">Não foi possível carregar as unidades. <a href="index.html">Voltar ao portal</a>.</div>'});
})();