(()=>{"use strict";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#39;"}[c]));
const simplify=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const $=id=>document.getElementById(id);
const labels={FTB:"Exército",FAB:"Força Aérea",FMB:"Marinha",CBM:"Corpo de Bombeiros",PM:"Polícia Militar"};
const forces=Object.keys(labels);
let data=[],selected="FTB";
const special=/comandante|marechal|almirante$/i;
function isOffice(r){return /comandante/i.test(r.cargo)||/^Marechal|^Almirante$/.test(r.cargo)}
function type(r){const c=r.cargo;
 if(/Recruta|Aprendiz|Mobilizado|Aluno Bombeiro/.test(c))return"Etapa inicial";
 if(isOffice(r))return"Função ou posto especial";
 if(c==="Taifeiro Especial")return"Carreira de apoio";
 if(/General|Brigadeiro|Almirante/.test(c))return"Alto oficialato";
 return"Patente ou graduação da FAAAB";
}
function format(days){return days===null?"Por etapa":days===1?"1 dia":days>=7&&days%7===0?(days/7)+" "+(days===7?"semana":"semanas"):days+" dias"}
function next(r){return String(r.proximaEtapa||"A definir").replace(/^Etapa seguinte prevista na lista:\s*/,"").replace(/\s*\(transição a confirmar\)$/," — transição a confirmar")}
function card(r,i){
 let d=r.tempoMinimoNaPatenteDias??null;const tenure=d===null?"Sem prazo automático":r.diasMinimos;
 return '<details class="career-rank"><summary><span class="career-n">'+String(i+1).padStart(2,"0")+'</span>'+
 '<span class="career-name">'+esc(r.cargo)+'<small>'+esc(r.sigla)+" · "+esc(type(r))+'</small></span>'+
 '<span class="career-time">'+esc(format(d))+'<small>'+esc(d===null?"Condição especial":"mínimo na patente")+'</small></span>'+
 '<span class="career-next">'+esc(next(r))+'</span></summary>'+
 '<div class="career-detail"><div class="career-detail-grid">'+
 '<div><h3>Permanência mínima</h3><p>'+esc(tenure)+'</p></div>'+
 '<div><h3>Formação e cursos previstos</h3><p>'+esc(r.formacao||"A definir")+'</p><p class="career-note">'+esc(r.formacaoStatus||"")+'</p></div>'+
 '<div><h3>Requisitos da progressão</h3><p>'+esc(r.requisitos||"A regulamentar")+'</p></div>'+
 '<div><h3>Competências</h3><p>'+esc(r.competencias||"Em definição")+'</p></div>'+
 '<div class="full"><h3>Duração dos cursos e estágios</h3><p>'+esc(r.duracaoCursos||"A combinar; não cadastrada.")+'</p></div>'+
 '<div class="full"><h3>Regra de autorização</h3><p>'+esc(r.regraDePromocao||"Depende de avaliação e autorização.")+'</p></div>'+
 '<div class="full"><a href="formacao.html#'+esc(r.forca)+'">Consultar formação e cursos da força</a></div>'+
 '</div></div></details>';
}
function render(){
 const hashed=decodeURIComponent((location.hash||"").slice(1));
 if(forces.includes(hashed))selected=hashed;
 $("force-title").textContent=labels[selected];
 $("force-count").textContent=data.filter(r=>r.forca===selected).length+" registros";
 $("force-buttons").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.f===selected)));
 const q=simplify($("search-rank").value);
 const list=data.filter(r=>r.forca===selected&&simplify([r.cargo,r.sigla,r.formacao,r.proximaEtapa].join(" ")).includes(q));
 $("rank-list").innerHTML=list.map(card).join("")||'<div class="career-empty">Nenhum registro encontrado. Experimente outra patente ou curso.</div>';
 $("visible-count").textContent=list.length+" "+(list.length===1?"resultado":"resultados");
}
$("force-buttons").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{selected=b.dataset.f;location.hash=selected;render()}));
$("search-rank").addEventListener("input",render);
window.addEventListener("hashchange",render);
fetch("dados/patentes.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("Dados indisponíveis");return r.json()}).then(rows=>{data=rows;render()}).catch(e=>{$("rank-list").innerHTML='<div class="career-empty">Não foi possível carregar a hierarquia. '+esc(e.message)+'</div>'});
})();