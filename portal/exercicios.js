(()=>{"use strict";
const $=id=>document.getElementById(id),out=$("ex-out");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let data=null,selected="FTB";
function item(ex,force){
 const appl=force.adaptacao.aplicacoes?.[ex.id]||"Critérios específicos ainda não definidos.";
 const list=(ex.variantes||[]);
 return '<article class="area-exercise area-core"><h3>'+esc(ex.nome)+'</h3>'+
 '<p>'+esc(ex.descricao)+'</p>'+
 (list.length?'<div class="area-rows">'+list.map(v=>'<div class="area-row"><strong>'+esc(v.nome)+'</strong>'+
 (v.descricao?'<p>'+esc(v.descricao)+'</p>':"")+'</div>').join("")+'</div>':"")+
 '<div class="area-use"><strong>Como pode ser usado nesta força:</strong> '+esc(appl)+'</div>'+
 (ex.situacao==="Repertório em planejamento"?'<p class="edu3-muted">Possibilidade de treinamento, ainda não obrigatória.</p>':"")+
 '</article>';
}
function render(){
if(!data)return;
const hash=decodeURIComponent((location.hash||"").slice(1));
if(data.forcas.some(f=>f.id===hash))selected=hash;
const force=data.forcas.find(f=>f.id===selected);
out.innerHTML='<header class="area-head"><span class="area-label">Treino básico do Roblox</span><h1>Exercícios gerais</h1>'+
 '<p>O exercício é o mesmo tipo para todas as forças. O que muda é a quantidade, a dificuldade, o mapa e o regulamento de cada treinamento.</p></header>'+
 '<nav class="area-tabs" aria-label="Força responsável pelo treinamento">'+data.forcas.map(f=>'<button type="button" data-force="'+esc(f.id)+'" aria-pressed="'+String(f.id===selected)+'">'+esc(f.nome)+'</button>').join("")+'</nav>'+
 '<section class="area-panel"><h2>'+esc(force.nome)+'</h2><p>'+esc(force.adaptacao.texto)+'</p>'+
 '<p><strong>Cenário básico:</strong> '+esc(force.adaptacao.ambiente)+'</p>'+
 '<div class="area-note">Os exemplos abaixo mostram como organizar os treinos desta força. Só os números da seleção de Recruta do Exército já estão registrados como exigência específica; os demais são propostas, sem aprovação automática.</div></section>'+
 '<section class="area-block"><h2>Tipos de exercício</h2><p class="edu3-muted">O parkour é um único exercício com cinco níveis. Flexões e polichinelos também são exercícios gerais, não exclusivos do Exército.</p>'+
 '<div class="area-exercises">'+data.gerais.map(ex=>item(ex,force)).join("")+'</div></section>'+
 '<section class="area-panel"><h2>E os treinamentos avançados?</h2><p>Pilotagem de avião, helicóptero, blindado e embarcação não entra nesta lista. Exige vínculo à área responsável, formação/habilitação e autorização dentro do jogo. A patente sozinha não libera esse treinamento.</p>'+
 '<div class="area-links"><a href="formacao.html#'+selected+'">Ver formação e especialidades</a><a href="estudos.html#provas">Provas de ingresso</a></div></section>';
out.querySelectorAll("[data-force]").forEach(btn=>btn.addEventListener("click",()=>{
 const next=btn.dataset.force;if(next===selected)return;selected=next;location.hash=next;render();
}));
}
window.addEventListener("hashchange",render);
fetch("dados/exercicios-formacao.json",{cache:"no-cache"}).then(r=>{
 if(!r.ok)throw Error("dados não disponíveis");return r.json()
}).then(d=>{
 if(!Array.isArray(d.gerais)||!Array.isArray(d.forcas))throw Error("catálogo incompleto");
 data=d;render();
}).catch(e=>{out.innerHTML='<div class="area-note">Não foi possível abrir os exercícios gerais: '+esc(e.message)+'</div><a href="index.html">Voltar ao portal</a>'});
})();