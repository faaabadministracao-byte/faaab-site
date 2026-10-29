(()=>{"use strict";
const $=id=>document.getElementById(id);
const root=$("edu3-content"),err=$("edu3-error"),loading=$("edu3-loading");
const key="faaab-estudos-v3",oneDay=86400000;
let exams=[],courses=[],route="",session={lesson:"",stage:0,mode:"explain",index:0,answers:[],choices:[],peek:false},filter="todos",search="";
let historyData={};try{historyData=JSON.parse(localStorage.getItem(key)||"{}");if(!historyData||typeof historyData!=="object")historyData={}}catch(e){historyData={}}
const save=()=>{try{localStorage.setItem(key,JSON.stringify(historyData))}catch(e){/* Reading and exercises remain available when storage is blocked. */}};
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const plain=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const makeHref=s=>"#"+s;
const humanForce=s=>({FTB:"Exército",FAB:"Força Aérea",FMB:"Marinha"})[s]||s;
const getExam=id=>exams.find(e=>e.id===id);
const getCourse=id=>courses.find(c=>c.id===id);
const getLesson=(exam,id)=>exam?.aulas?.find(l=>l.id===id);
const shuffle=a=>{let r=[...a];for(let n=r.length-1;n>0;n--){let i=Math.floor(Math.random()*(n+1));[r[n],r[i]]=[r[i],r[n]]}return r};
function crumb(items){return '<nav class="edu3-crumbs" aria-label="Você está aqui">'+items.map((x,i)=>i===items.length-1?'<strong>'+escape(x[0])+'</strong>':'<a href="'+makeHref(x[1])+'">'+escape(x[0])+'</a>').join(' <span aria-hidden="true">/</span> ')+'</nav>'}
function heading(label,title,description){return '<header class="edu3-hero"><span class="edu3-eyebrow">'+escape(label)+'</span><h1>'+escape(title)+'</h1><p>'+escape(description)+'</p></header>'}
function card(href,title,desc,badge,small=""){return '<a class="edu3-card" href="'+makeHref(href)+'"><span class="edu3-tag">'+escape(badge)+'</span><h3>'+escape(title)+'</h3><p>'+escape(desc)+'</p>'+(small?'<small>'+escape(small)+'</small>':"")+'</a>'}
function actions(left,leftText,right,rightText){return '<nav class="edu3-subnav" aria-label="Navegação da página"><a class="edu3-btn secondary" href="'+makeHref(left)+'">'+escape(leftText)+'</a><a class="edu3-btn mild" href="'+makeHref(right)+'">'+escape(rightText)+'</a></nav>'}
function renderHome(){
root.innerHTML=heading("Centro de aprendizagem","O que você quer fazer?","Escolha uma atividade. Provas, matérias e cursos são coisas diferentes; aqui não fica tudo misturado.")+
'<div class="edu3-cards">'+
card("provas","Estudar para uma prova","Veja apenas as avaliações que já estão documentadas no projeto.","AVALIAÇÕES")+
card("materias","Aprender uma matéria","Leia a explicação, veja como resolver e faça exercícios para praticar.","AULAS")+
card("cursos","Consultar cursos e treinamentos","Veja quais formações existem, sem transformar todas elas em prova.","FORMAÇÕES")+'</div>'+
'<section class="edu3-box"><h2>Como funciona</h2><p>Primeiro você escolhe o que precisa. Se houver uma matéria definida, a aula ensina em pequenas etapas. Se uma prova ainda não tiver conteúdo cadastrado, não mostramos questões aleatórias.</p></section>';
}
function renderExams(){
root.innerHTML=crumb([["Início","inicio"],["Provas"]])+heading("Provas e avaliações","Provas cadastradas","Uma formação pode ter aulas e atividades sem ter uma prova escrita. Por isso, a lista abaixo só mostra avaliações documentadas; não são 38 provas.")+
'<div class="edu3-list">'+exams.map(e=>card("prova="+encodeURIComponent(e.id),e.nome,e.tipo+" · "+(e.programa==="apoio"?"Há aulas preparatórias": "Conteúdo da prova não cadastrado"),e.programa==="apoio"?"APOIO DISPONÍVEL":"PROGRAMA PENDENTE")).join("")+'</div>'+
'<div class="edu3-info">Não encontrar uma avaliação aqui não significa que ela não exista: significa que seu formato ou conteúdo ainda não foi registrado com segurança no portal.</div>'+
actions("inicio","Voltar ao início","cursos","Ver todos os cursos");
}
function examLessonCards(e){
return e.materias.map(m=>'<section class="edu3-section"><h2>'+escape(m)+'</h2><div class="edu3-list">'+
 e.aulas.filter(l=>l.materia===m).map(l=>card("aula="+encodeURIComponent(e.id)+"/"+encodeURIComponent(l.id),l.titulo,l.objetivo,"AULA")).join("")+'</div></section>').join("");
}
function renderExam(e){
root.innerHTML=crumb([["Início","inicio"],["Provas","provas"],[e.nome]])+
heading(e.tipo,e.nome,e.confirmacao)+
(e.programa==="apoio"?'<div class="edu3-info">'+escape(e.observacao)+'</div>'+examLessonCards(e):
'<section class="edu3-box"><h2>O que estudar para esta avaliação?</h2><p>O programa de matérias e assuntos ainda não foi definido no projeto. Por enquanto, não há aulas ou questões para esta avaliação.</p><p>'+escape(e.observacao)+'</p></section>')+
actions("provas","Voltar à lista de provas","cursos","Consultar formações");
}
function renderSubjects(){
let e=exams.find(e=>e.programa==="apoio"&&e.aulas.length);
root.innerHTML=crumb([["Início","inicio"],["Matérias"]])+heading("Biblioteca de aulas","Aprender uma matéria","As aulas abaixo ensinam assuntos concretos. Elas só aparecem como preparação para provas quando a relação com a prova foi registrada.")+
(e?'<div class="edu3-info">Aulas de apoio ao alistamento: Matemática básica e Português. Não foram copiadas automaticamente para ESA, AMAN ou outros cursos.</div>'+examLessonCards(e):
'<section class="edu3-box"><p>Não há aulas publicadas nesta biblioteca.</p></section>')+
actions("inicio","Voltar ao início","provas","Ver provas cadastradas");
}
const summaries={
"CUR-10-1":"Formação inicial de Recruta com Expedição Militar, Seleção de Brigada e TC-1.",
"CUR-10-2":"Habilitação para o acesso aos equipamentos previstos no jogo.",
"CUR-10-3":"Especialização para Soldado e progressão conforme requisitos do projeto.",
"CUR-10-4":"Formação ligada à atuação terrestre e à progressão para Cabo.",
"CUR-10-5":"Escola de formação de sargentos com etapas para Cabo e 3º Sargento.",
"CUR-10-6":"Formação ligada à progressão de sargentos; requisitos incompletos.",
"CUR-10-7":"Curso específico de formação de sargentos no âmbito de uma brigada.",
"CUR-10-8":"Treinamento interno da brigada; não é uma prova geral.",
"CUR-10-9":"Qualificação operacional com ingresso próprio, não obrigatória para todos.",
"CUR-10-10":"Formação por fases; a documentação determina não chamá-la de 'testes'.",
"CUR-10-11":"Etapa de formação de Subtenente para Cadete.",
"CUR-10-12":"Academia de oficiais da FAAAB com formação dividida em dez fases.",
"CUR-10-13":"Aperfeiçoamento na carreira de oficiais.",
"CUR-10-14":"Formação de Estado-Maior e progressão do oficialato.",
"CUR-10-15":"Teste específico para oficiais que retornam após inatividade prolongada.",
"CUR-10-16":"Formação de oficiais-generais e avaliações da carreira.",
"CUR-10-17":"Formação do alto escalão com requisitos ainda incompletos.",
"CUR-11-1":"Centro e proposta de formação inicial da FAB, com escolha de linha de atuação.",
"CUR-11-2":"Formação para Soldado de 2ª Classe, com progressão segundo critérios.",
"CUR-11-3":"Curso destinado à progressão de Soldado de 1ª Classe para Cabo.",
"CUR-11-4":"Formação de sargentos da FAB: Cabo como aluno e 3º Sargento na formatura.",
"CUR-11-5":"Aperfeiçoamento ligado à progressão para Suboficial.",
"CUR-11-6":"Formação superior própria da FAAAB ainda em revisão.",
"CUR-11-7":"Instituição em revisão no projeto, com estrutura congelada.",
"CUR-11-8":"Formação de oficiais da Aeronáutica; requisitos ainda incompletos.",
"CUR-11-9":"Curso de Estado-Maior da FAB para oficiais superiores.",
"CUR-11-10":"Formação avançada de oficiais; não concede promoção automática.",
"CUR-11-11":"Curso de pilotagem com atividades teóricas e práticas; forma habilitação, não patente.",
"CUR-11-12":"Qualificação para a função de controle aéreo no simulador.",
"CUR-11-13":"Qualificação de resgate aéreo ainda com regras pendentes.",
"CUR-11-14":"Formação relacionada a operações de solo da FAB.",
"CUR-11-15":"Habilitação para atuar como instrutor de cursos da FAB.",
"CUR-MB-01":"Curso de navegação com orientação, cartas, sinais e manobras simuladas.",
"CUR-MB-02":"Formação inicial de Fuzileiros Navais com atividades em campo.",
"CUR-MB-03":"Formação de aprendizes-marinheiros em fase de planejamento.",
"CUR-MB-04":"Centro de especialização de praças e certificações profissionais.",
"CUR-MB-05":"Centro de formação e adaptação de oficiais da Marinha.",
"CUR-MB-06":"Academia de formação de oficiais da Marinha em planejamento."
};
function coursesBlock(){
let set=courses.filter(c=>(filter==="todos"||filter===c.forca)&&plain(c.titulo+" "+(summaries[c.id]||"")).includes(plain(search)));
return '<p class="edu3-small">'+set.length+" cursos e formações encontrados"+'</p><div class="edu3-list">'+set.map(c=>card("curso="+encodeURIComponent(c.id),c.titulo,summaries[c.id]||"Formação documentada no projeto.",humanForce(c.forca),c.estado)).join("")+'</div>';
}
function renderCourses(){
root.innerHTML=crumb([["Início","inicio"],["Cursos e treinamentos"]])+heading("Catálogo de formação","Cursos e treinamentos","Consulte escolas, centros e treinamentos da FAAAB. Aparecer neste catálogo não significa ter prova escrita.")+
'<div class="edu3-box"><label for="edu3-search"><strong>Buscar curso</strong></label><input id="edu3-search" class="edu3-input" type="search" placeholder="Digite um nome, como ESA ou CIG" value="'+escape(search)+'">'+
'<div class="edu3-filters" aria-label="Filtrar por força">'+[["todos","Todas"],["FTB","Exército"],["FAB","FAB"],["FMB","Marinha"]].map(a=>'<button type="button" data-filter="'+a[0]+'" aria-pressed="'+String(filter===a[0])+'">'+a[1]+'</button>').join("")+'</div></div>'+
'<div id="edu3-course-list">'+coursesBlock()+'</div>'+
actions("inicio","Voltar ao início","provas","Ver provas");
}
function renderCourse(c){
const x=exams.find(x=>x.id===c.id);
root.innerHTML=crumb([["Início","inicio"],["Cursos e treinamentos","cursos"],[c.titulo]])+
heading(humanForce(c.forca),c.titulo,summaries[c.id]||"Informações do curso FAAAB.")+
'<div class="edu3-box"><h2>Sobre esta formação</h2><p>'+escape(summaries[c.id]||"Formação em organização no projeto.")+'</p>'+
'<p><strong>Situação do planejamento:</strong> '+escape(c.estado)+'</p>'+
'<p><strong>Avaliação:</strong> '+(x?'Há uma avaliação documentada. Seu programa pode ainda estar pendente.':'Não há uma prova teórica específica cadastrada para esta formação. Isso não significa que o curso não tenha atividades ou avaliações práticas.')+'</p></div>'+
(x?'<div class="edu3-actions"><a href="#prova='+encodeURIComponent(c.id)+'" class="edu3-btn">Ver avaliação vinculada</a></div>':"")+
actions("cursos","Voltar aos cursos","provas","Ver provas");
}
function lessonKey(e,l){return e.id+"/"+l.id}
function setSession(e,l){
const id=lessonKey(e,l);
if(session.lesson!==id){session={lesson:id,stage:0,mode:"explain",index:0,answers:[],choices:[],peek:false}}
}
function footerLesson(e,l){
return '<nav class="edu3-subnav" aria-label="Voltar ou trocar de matéria">'+
'<a class="edu3-btn secondary" href="#prova='+encodeURIComponent(e.id)+'">Voltar às matérias desta prova</a>'+
'<a class="edu3-btn mild" href="#provas">Trocar de prova</a>'+
'</nav>';
}
function progress(e,l){
const id=lessonKey(e,l);return historyData[id]||null
}
function stageProgress(count,position){
return '<div class="edu3-progress" role="progressbar" aria-label="Progresso da aula" aria-valuemin="0" aria-valuemax="'+count+'" aria-valuenow="'+position+'"><span style="width:'+Math.round(100*position/count)+'%"></span></div>';
}
function renderLesson(e,l){
setSession(e,l);
let crumbs=crumb([["Início","inicio"],["Provas","provas"],[e.nome,"prova="+e.id],[l.titulo]]);
let body=crumbs+heading(l.materia,l.titulo,l.objetivo);
if(session.mode==="explain"){
 let n=session.stage,length=l.etapas.length;
 if(n<length){
  let s=l.etapas[n];
  body+='<div class="edu3-stage"><span class="edu3-eyebrow">Entenda a ideia · '+(n+1)+" de "+length+'</span><h2>'+escape(s.titulo)+'</h2>'+
  '<p>'+escape(s.texto)+'</p>'+
  '<div class="edu3-worked">'+escape(s.conta)+'</div>'+
  '<div class="edu3-tip"><strong>Para lembrar:</strong> '+escape(s.lembrete)+'</div>'+
  stageProgress(length+1,n+1)+
  '<div class="edu3-actions">'+(n>0?'<button class="edu3-btn secondary" data-action="prev-stage">Parte anterior</button>':"")+
  '<button class="edu3-btn" data-action="next-stage">'+(n===length-1?"Terminar explicação":"Próxima parte")+'</button></div></div>';
 }else{
  body+='<div class="edu3-stage"><span class="edu3-eyebrow">Agora você entendeu a explicação</span><h2>Vamos conferir o que ficou na memória</h2>'+
  '<p>Você viu as ideias e os exemplos. Resolva uma pergunta de cada vez. Se errar, vai receber uma explicação do cálculo ou do texto.</p>'+
  '<div class="edu3-actions"><button class="edu3-btn" data-action="start-practice">Praticar '+l.perguntas.length+' questões</button>'+
  '<button class="edu3-btn secondary" data-action="restart-explanation">Ler a explicação de novo</button></div></div>';
 }
}else if(session.mode==="quiz"){
 let q=l.perguntas[session.index],answer=session.answers[session.index],order=session.choices[session.index]||[0,1,2,3];
 body+='<div class="edu3-stage"><span class="edu3-eyebrow">Prática · questão '+(session.index+1)+" de "+l.perguntas.length+'</span><h2>'+escape(q.pergunta)+'</h2>'+
 stageProgress(l.perguntas.length,session.index+1)+
 '<div class="edu3-options">'+order.map((real,i)=>'<button class="edu3-choice'+(answer!==undefined?(real===q.correta?" correct":real===answer?" wrong":""):"")+'" type="button" data-action="answer" data-value="'+real+'" '+(answer!==undefined?"disabled":"")+'><strong>'+String.fromCharCode(65+i)+'.</strong> '+escape(q.alternativas[real])+'</button>').join("")+'</div>';
 if(answer===undefined){
  body+='<div class="edu3-actions"><button class="edu3-btn mild" data-action="hint">Preciso de uma dica</button><button class="edu3-btn secondary" data-action="restart-explanation">Rever a explicação</button></div>'+
  (session.peek?'<div class="edu3-tip"><strong>Dica:</strong> '+escape(q.dica)+'</div>':"");
 }else{
  body+='<div class="edu3-feedback'+(answer===q.correta?"":" error")+'"><strong>'+(answer===q.correta?"Você acertou a questão.":"Vamos entender a resposta.")+'</strong>'+
  '<p>'+escape(q.explicacao)+'</p><p><strong>Resposta:</strong> '+escape(q.alternativas[q.correta])+'</p></div>'+
  '<div class="edu3-actions"><button class="edu3-btn" data-action="next-question">'+(session.index===l.perguntas.length-1?"Ver resultado":"Próxima questão")+'</button></div>';
 }
 body+='</div>';
}else if(session.mode==="result"){
 let score=session.answers.filter((value,i)=>value===l.perguntas[i].correta).length;
 let ok=score===l.perguntas.length;
 body+='<div class="edu3-stage"><span class="edu3-eyebrow">Resultado da prática</span><h2>'+score+" de "+l.perguntas.length+" respostas corretas"+'</h2>'+
 '<p>'+(ok?"Você entendeu estas questões. Volte em outro dia para verificar se ainda lembra.":"Algumas respostas precisam ser revistas. A explicação está disponível de novo, sem perder a matéria.")+'</p>'+
 '<div class="edu3-actions"><button class="edu3-btn" data-action="restart-explanation">Estudar a explicação</button><button class="edu3-btn secondary" data-action="start-practice">Praticar novamente</button></div>'+
 '<div class="edu3-info">Apenas estes exercícios de treino foram corrigidos. Isso não equivale a aprovação no alistamento ou em qualquer curso da FAAAB.</div></div>';
}
let old=progress(e,l);
if(old&&session.mode==="explain")body+='<p class="edu3-small">Sua última prática: '+old.score+" de "+old.total+" questões. Você pode revisar quantas vezes precisar.</p>";
root.innerHTML=body+footerLesson(e,l);
}
function startPractice(e,l){
session.mode="quiz";session.index=0;session.peek=false;session.answers=[];session.choices=l.perguntas.map(()=>shuffle([0,1,2,3]));renderLesson(e,l);
}
function finishPractice(e,l){
const score=session.answers.filter((x,i)=>x===l.perguntas[i].correta).length;
historyData[lessonKey(e,l)]={score,total:l.perguntas.length,updated:Date.now()};save();
session.mode="result";renderLesson(e,l);
}
function onButton(ev){
let btn=ev.target?.closest?.("[data-action]");
if(!btn||!root.contains(btn))return;
const hash=decodeURIComponent(location.hash||"#inicio"),m=hash.match(/^#aula=([^/]+)\/(.+)$/);
if(!m)return;const e=getExam(m[1]),l=getLesson(e,m[2]);if(!e||!l)return;
switch(btn.dataset.action){
case "next-stage":session.stage=Math.min(l.etapas.length,session.stage+1);break;
case "prev-stage":session.stage=Math.max(0,session.stage-1);break;
case "restart-explanation":session.mode="explain";session.stage=0;session.peek=false;break;
case "start-practice":startPractice(e,l);return;
case "hint":session.peek=!session.peek;break;
case "answer":{
if(session.mode!=="quiz"||session.answers[session.index]!==undefined)return;
const val=Number(btn.dataset.value);
if(!Number.isInteger(val)||val<0||val>3)return;
session.answers[session.index]=val;
break;}
case "next-question":{
 if(session.answers[session.index]===undefined)return;
 if(session.index===l.perguntas.length-1){finishPractice(e,l);return}
 session.index++;session.peek=false;break;}
default:return;
}
renderLesson(e,l);
}
function updateActive(section){document.querySelectorAll(".edu3-menu [data-route]").forEach(a=>a.setAttribute("aria-current",a.dataset.route===section?"page":"false"))}
function render(){
 if(!exams.length)return;
 const raw=(location.hash||"#inicio").slice(1);
 let v;try{v=decodeURIComponent(raw)}catch(e){v="inicio"}
 const oldRoute=route;route=v;
 const section=v==="inicio"?"inicio":v==="materias"?"materias":v==="provas"||v.startsWith("prova=")?"provas":v==="cursos"||v.startsWith("curso=")?"cursos":v.startsWith("aula=")?"materias":"inicio";
 updateActive(section);
 try{
 if(v==="inicio"||v==="")renderHome();
 else if(v==="provas")renderExams();
 else if(v==="materias")renderSubjects();
 else if(v==="cursos")renderCourses();
 else if(v.startsWith("prova=")){let e=getExam(v.slice(6));e?renderExam(e):renderExams()}
 else if(v.startsWith("curso=")){let c=getCourse(v.slice(6));c?renderCourse(c):renderCourses()}
 else if(v.startsWith("aula=")){let p=v.slice(5).split("/"),e=getExam(p[0]),l=getLesson(e,p[1]);e&&l?renderLesson(e,l):renderSubjects()}
 else renderHome();
 err.hidden=true;
 }catch(e){root.innerHTML='<div class="edu3-box"><h2>Não foi possível abrir esta parte</h2><p>Volte para a lista de estudos e tente outra aula.</p><a class="edu3-btn" href="#inicio">Início dos estudos</a></div>';err.hidden=false;err.textContent="Erro ao apresentar o conteúdo: "+String(e.message||e)}
 if(oldRoute!==v&&typeof window!=="undefined")window.scrollTo?.(0,0);
}
root.addEventListener("click",onButton);
root.addEventListener("input",e=>{
if(e.target?.id==="edu3-search"){
search=e.target.value;
const result=$("edu3-course-list");if(result)result.innerHTML=coursesBlock();
}});
root.addEventListener("click",e=>{
const b=e.target?.closest?.("[data-filter]");if(!b)return;
filter=b.dataset.filter;root.querySelectorAll("[data-filter]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
const result=$("edu3-course-list");if(result)result.innerHTML=coursesBlock();
});
window.addEventListener("hashchange",render);
Promise.all([
 fetch("dados/roteiros-v3.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("roteiros não disponíveis");return r.json()}),
 fetch("dados/cursos.json").then(r=>{if(!r.ok)throw Error("cursos não disponíveis");return r.json()})
]).then(([data,list])=>{
exams=data.avaliacoes;courses=list;
loading.hidden=true;render();
}).catch(e=>{
 loading.hidden=true;err.hidden=false;err.textContent="Não foi possível carregar os estudos. Verifique sua conexão e recarregue a página. Detalhes: "+String(e.message||e);
 root.innerHTML='<div class="edu3-actions"><a href="estudos.html" class="edu3-btn">Recarregar estudos</a><a href="index.html" class="edu3-btn secondary">Voltar ao portal</a></div>';
});
})();