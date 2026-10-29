(()=>{"use strict";const $=id=>document.getElementById(id),out=$("formation-out");const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));const line=s=>esc(s).replace(/\n/g,"<br>");
let tracks,courses=[],cat=[],units,selected="FTB";
const flow={
FTB:["Seleção de ingresso autorizada","Recruta e orientação","CDP: TC-1, Expedição Militar, Seleção de Brigada e Formação de Soldado","Carreira, batalhões e cursos próprios"],
FAB:["Ingresso na FAB (critérios a homologar)","Formação militar inicial e segurança de base","Escolha da linha funcional e matrícula","Habilitações específicas de aviação, controle, defesa ou apoio"],
FMB:["Ingresso naval (critérios a homologar)","Formação e disciplina de bordo","Escolha de escola, Corpo ou especialidade","Habilitação em navegação, tripulação ou Fuzileiros Navais"],
CBM:["Ingresso no CBM (proposta de requisitos)","Formação básica e atendimento ao público","Atividades de prevenção e comunicação","Qualificação e designação em grupamento"],
PM:["Ingresso na PM (proposta de requisitos)","Formação básica e direitos do cidadão","Atendimento, mediação e registro","Seleção interna para unidade, quando aprovada"]
};
function pick(force){return tracks.forcas.find(x=>x.id===force)}
function show(){
 if(!tracks)return;let hash=location.hash.slice(1);if(tracks.forcas.some(x=>x.id===hash))selected=hash;
 const force=pick(selected),unitsList=units[selected==="CBM"?"bombeiros":"policia"]||[];
 const list=courses.filter(c=>c.forca===selected);
 const cbm=selected==="CBM"?cat.filter(c=>c.forca==="CBM"&&c.tipo==="curso"):[];
 const proposal=selected==="PM"?unitsList.filter(x=>x.tipo==="centro"):[];
 out.innerHTML='<header class="area-head"><span class="area-label">Carreira e formação</span><h1>Formação por força</h1><p>O caminho de ingresso, treinamento, curso e progressão é diferente em cada instituição. Prova de entrada é uma seleção à parte; estágio de aula não vira prova de concurso.</p></header>'+
 '<nav class="area-tabs" aria-label="Força">'+tracks.forcas.map(f=>'<button type="button" data-force="'+f.id+'" aria-pressed="'+(selected===f.id)+'">'+esc(f.nome)+'</button>').join("")+'</nav>'+
 '<section class="area-panel"><span class="area-label">'+esc(force.status)+'</span><h2>'+esc(force.nome)+'</h2><p><strong>Requisitos:</strong> '+esc(force.requisitos)+'</p><div class="area-note">'+esc(force.ingresso)+'</div>'+
 '<h3>Etapas da carreira no jogo</h3><div class="area-rows">'+flow[selected].map((x,i)=>'<div class="area-row"><h4>'+(i+1)+'. '+esc(x)+'</h4></div>').join("")+'</div></section>'+
 '<section class="area-panel"><h2>Escolas, centros e cursos</h2><p>Os nomes abaixo são registros do projeto. O fato de haver curso não prova que exista concurso público ou promoção automática.</p>'+
 (list.length?list.map(c=>'<details class="area-course"><summary>'+esc(c.titulo)+'</summary><p><span class="area-pill">'+esc(c.estado)+'</span></p><pre>'+esc(c.detalhes)+'</pre></details>').join(""):"")+
 cbm.map(c=>'<details class="area-course"><summary>'+esc(c.sigla)+' — '+esc(c.nome)+'</summary><p><span class="area-pill">Formação catalogada</span></p><p>'+esc(c.noJogo||"Requisitos e matriz exatos ainda a definir.")+'</p></details>').join("")+
 proposal.map(c=>'<details class="area-course"><summary>'+esc(c.sigla)+' — '+esc(c.nome)+'</summary><p>'+esc(c.missao)+'</p><p><strong>Requisitos propostos:</strong> '+esc(c.requisitos.join("; "))+'</p></details>').join("")+
 '<p class="edu3-muted">Qualquer curso com requisitos incompletos permanece em planejamento. Não serão criados exames fictícios.</p></section>'+
 '<section class="area-panel"><h2>O que treinar antes de ingressar numa unidade?</h2><p>'+esc(force.foco.join(", "))+'.</p><div class="area-links"><a href="exercicios.html#'+selected+'">Ver os exercícios desta força</a>'+
 (selected==="PM"?'<a href="policia.html">Unidades da PM</a>':selected==="CBM"?'<a href="bombeiros.html">Grupamentos dos Bombeiros</a>':'<a href="central.html?forca='+selected+'">Organizações</a>')+
 '<a href="estudos.html#provas">Provas de seleção</a></div></section>';
 out.querySelectorAll("[data-force]").forEach(b=>b.addEventListener("click",()=>{selected=b.dataset.force;location.hash=selected;show()}));
}
window.addEventListener("hashchange",show);
Promise.all([
 fetch("dados/exercicios-formacao.json").then(r=>r.json()),
 fetch("dados/cursos.json").then(r=>r.json()),
 fetch("dados/catalogo.json").then(r=>r.json()),
 fetch("dados/unidades-pm-bombeiros.json").then(r=>r.json())
]).then(([t,c,k,u])=>{tracks=t;courses=c;cat=k;units=u;show()}).catch(e=>{out.innerHTML='<div class="area-note">Falha ao carregar as formações. <a href="index.html">Voltar ao portal</a>.</div>'});
})();