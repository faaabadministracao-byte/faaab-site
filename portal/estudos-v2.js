(()=>{"use strict";
const $=id=>document.getElementById(id);
const STORAGE="faaab-study-tracks-v2",DAY=86400000;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const normalize=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const shuffle=arr=>{let a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const localDate=ts=>{const d=new Date(ts);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const readableDate=ts=>new Date(ts).toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});
const durationDays=ts=>Math.max(0,Math.ceil((ts-Date.now())/DAY));
let tracks=[],courses=[],current=null,lesson=null,screen="directory",filterForce="todos",onlyReady=false,view="theory",recallOpen=false,questions=[],cursor=0,results=[],answered=false,reviewQueue=[],reviewEarly=false,reviewReveal=false,reviewDraft="";
let saved={selected:null,progress:{},simulados:{}};try{const x=JSON.parse(localStorage.getItem(STORAGE)||"null");if(x&&typeof x==="object"){saved={selected:x.selected||null,progress:x.progress||{},simulados:x.simulados||{}}}}catch(e){}
const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(saved))}catch(e){$("storageNotice").textContent="Este navegador não conseguiu guardar o progresso. Verifique se o armazenamento está permitido.";$("storageNotice").hidden=false}};
const selectPanel=(name)=>{screen=name;$("directory").classList.toggle("edu-hidden",name!=="directory");$("learning").classList.toggle("edu-hidden",name==="directory");$("breadcrumb").innerHTML=name==="directory"?'<span class="active">1. Escolha a prova</span><span>2. Estude o conteúdo</span><span>3. Treine e revise</span>':'<span>1. Prova escolhida</span><span class="active">2. Conteúdo exclusivo</span><span class="active">3. Exercícios e revisão</span>'};
function track(){return tracks.find(t=>t.id===current)}
function getProgress(tid,lid){saved.progress[tid]??={}; saved.progress[tid][lid]??={quizAttempts:0,lastScore:null,passed:false,nextReview:null,stage:0,successDays:[],errors:[]};return saved.progress[tid][lid]}
function progressRead(tid,lid){return saved.progress[tid]?.[lid]||null}
function lessons(t){return t?.unidades||[]}
function due(t){return lessons(t).filter(l=>{let p=progressRead(t.id,l.id);return p&&p.quizAttempts>0&&p.nextReview!==null&&p.nextReview<=Date.now()})}
function stateLabel(t,l){let p=progressRead(t.id,l.id);if(!p||!p.quizAttempts)return"Não iniciada";if(p.successDays?.length>=2&&p.passed)return"Revisada em dias diferentes";if(p.nextReview!==null&&p.nextReview<=Date.now())return"Revisão pendente";if(!p.passed)return"Reforço necessário";return"Revisão em "+durationDays(p.nextReview)+" dia(s)"}
function jumpTop(){if(innerWidth<=700){$("learning").scrollIntoView({behavior:"smooth",block:"start"})}}
function directory(){
  selectPanel("directory");$("find").value=$("find").value||"";
  $("examFilters").querySelectorAll("[data-force]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.force===filterForce)));
  const q=normalize($("find").value);
  const filtered=tracks.filter(t=>(filterForce==="todos"||t.forca===filterForce)&&(!onlyReady||t.status==="piloto")&&normalize(t.nome+" "+t.preparo+" "+t.forca).includes(q));
  $("examCount").textContent=filtered.length+" trilhas encontradas de "+tracks.length+".";
  $("examList").innerHTML=filtered.map(t=>'<button type="button" class="eduexam" data-open="'+esc(t.id)+'" aria-current="'+(t.id===current)+'">'+
  '<span class="edu-eyebrow">'+esc(t.forca==='FTB'?"Exército":t.forca==='FAB'?"Força Aérea":"Marinha")+'</span><b>'+esc(t.nome)+'</b><span class="edu-status '+(t.status==="piloto"?"":"pending")+'">'+(t.status==="piloto"?"Aulas disponíveis":"Programa da prova pendente")+'</span>'+
  '<small>'+esc(t.preparo)+'</small></button>').join("")||'<p>Nenhuma prova corresponde aos filtros. Mude a força ou remova a pesquisa.</p>';
  $("examList").querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>selectTrack(b.dataset.open)));
}
function selectTrack(id){
 let t=tracks.find(x=>x.id===id);if(!t)return;
 current=t.id;lesson=t.unidades[0]?.id||null;saved.selected=current;save();view="theory";recallOpen=false;
 renderTrack();jumpTop();
}
function renderTrack(){
 const t=track();if(!t){directory();return}
 selectPanel("learning");
 $("trackTitle").textContent=t.nome;
 $("trackIntro").textContent=t.preparo;
 $("trackForce").textContent=(t.forca==="FTB"?"Exército":t.forca==="FAB"?"FAB":"Marinha")+" · "+(t.status==="piloto"?"Treino piloto separado para esta prova":"Programa a confirmar");
 $("examDisclaimer").textContent=t.carater+" | "+t.observacao;
 const all=lessons(t),learned=all.filter(l=>progressRead(t.id,l.id)?.passed).length,reviewed=all.filter(l=>(progressRead(t.id,l.id)?.successDays||[]).length>=2).length;
 $("stats").innerHTML=[
   ["Aulas com treino aprovado",learned+" / "+all.length],
   ["Revisões vencidas",due(t).length],
   ["Memória revisada em dias diferentes",reviewed+" / "+all.length]
 ].map(s=>'<div class="edu-stat"><strong>'+esc(s[1])+'</strong><small>'+esc(s[0])+'</small></div>').join("");
 $("lessonLayout").classList.toggle("edu-hidden",!all.length);
 $("pendingPanel").classList.toggle("edu-hidden",!!all.length);
 $("reviewAll").disabled=!all.some(l=>progressRead(t.id,l.id)?.quizAttempts);
 $("simulation").disabled=!all.length;
 if(!all.length){
   $("pendingReason").textContent=t.observacao;
   const c=courses.find(c=>c.id===t.id);
   $("pendingCourse").innerHTML=c?'<details class="edu-courseraw"><summary>Ver a descrição já registrada do curso</summary><pre>'+esc(c.detalhes)+'</pre></details>':"";
   $("lessonMain").innerHTML="";return
 }
 if(!lesson||!all.some(l=>l.id===lesson))lesson=all[0].id;
 drawLessonList();
 if(view==="theory")showTheory();
 else if(view==="quiz"||view==="sim")showQuestion();
 else if(view==="summary")showSummary();
 else if(view==="review")showReview();
}
function drawLessonList(){
 const t=track();$("lessonList").innerHTML=lessons(t).map(l=>{
 const status=stateLabel(t,l);
 return '<button class="edu-mod" type="button" data-lesson="'+esc(l.id)+'" aria-current="'+(lesson===l.id)+'"><strong>'+esc(l.materia+" — "+l.titulo)+'</strong><span>'+esc(status)+'</span></button>'
 }).join("");
 $("lessonList").querySelectorAll("[data-lesson]").forEach(b=>b.addEventListener("click",()=>{lesson=b.dataset.lesson;view="theory";recallOpen=false;renderTrack()}));
}
function selectedLesson(){return lessons(track()).find(l=>l.id===lesson)}
function showTheory(){
 view="theory";let l=selectedLesson();if(!l)return;
 const p=progressRead(current,l.id);
 $("lessonMain").innerHTML=
 '<span class="edu-step">Aula exclusiva desta prova · Estudo guiado</span><h2>'+esc(l.titulo)+'</h2><p class="edu-preamble"><strong>Objetivo:</strong> '+esc(l.objetivo)+'</p>'+
 '<div class="edu-explain">'+l.teoria.map(t=>'<p>'+esc(t)+'</p>').join("")+'</div>'+
 '<div class="edu-example"><strong>Exemplo resolvido:</strong><p>'+esc(l.exemplo)+'</p></div>'+
 '<div class="edu-mistake"><strong>Atenção ao erro frequente:</strong> '+esc(l.erros)+'</div>'+
 '<div class="edu-recall"><h3>Antes de ver as alternativas, tente lembrar</h3><p>'+esc(l.lembrar)+'</p>'+
 '<label for="recallText" class="edu-quiet">Escreva sua explicação com suas palavras (opcional; não é enviada ao servidor)</label><textarea id="recallText" placeholder="Pense na resposta. Você também pode explicar em voz alta."></textarea>'+
 '<div class="edu-actions"><button class="edu-secondary" id="revealTheory" type="button">'+(recallOpen?"Ocultar resposta modelo":"Conferir a resposta modelo")+'</button></div>'+
 '<div id="theoryAnswer" class="edu-recall-answer'+(recallOpen?"":" edu-hidden")+'">'+esc(l.resposta)+'</div></div>'+
 '<div class="edu-actions"><button id="startQuiz" class="edu-primary" type="button">Praticar com questões desta aula</button>'+
 (p?.quizAttempts?'<button id="reviewThis" class="edu-secondary" type="button">Revisar de memória</button>':"")+
 '</div><p class="edu-quiet">As respostas corretas não aparecem antes da tentativa. Acertar hoje não elimina a necessidade de revisar em outro dia.</p>';
 $("revealTheory").addEventListener("click",()=>{recallOpen=!recallOpen;$("theoryAnswer").classList.toggle("edu-hidden",!recallOpen);$("revealTheory").textContent=recallOpen?"Ocultar resposta modelo":"Conferir a resposta modelo"});
 $("startQuiz").addEventListener("click",()=>startQuiz(false));
 if($("reviewThis"))$("reviewThis").addEventListener("click",()=>startReview(true,l.id));
}
function questionsFor(isSim){
 let t=track();
 if(!isSim){let l=selectedLesson();return shuffle(l.questoes.map(q=>({...q,from:l.id,lessonTitle:l.titulo,optionOrder:shuffle([0,1,2,3])})))}
 return shuffle(lessons(t).flatMap(l=>l.questoes.map(q=>({...q,from:l.id,lessonTitle:l.titulo,optionOrder:shuffle([0,1,2,3])})))).slice(0,Math.min(12,lessons(t).reduce((n,l)=>n+l.questoes.length,0)));
}
function startQuiz(sim){
 questions=questionsFor(sim);cursor=0;results=[];answered=false;view=sim?"sim":"quiz";renderTrack();
}
function score(){return results.filter(x=>x.correct).length}
function showQuestion(){
 const q=questions[cursor];if(!q){showSummary();return}
 const sim=view==="sim",isAnswered=!!results[cursor];
 const options=q.optionOrder;
 const selection=isAnswered?results[cursor]:null;
 $("lessonMain").innerHTML='<span class="edu-step">'+(sim?"Simulado desta prova — sem gabarito durante a tentativa":"Prática da aula")+'</span>'+
 '<h2>'+(sim?"Simulado exclusivo: "+esc(track().nome):esc(selectedLesson().titulo))+'</h2>'+
 '<p class="edu-quiet">Questão '+(cursor+1)+' de '+questions.length+(sim?" · Assunto: "+esc(q.lessonTitle):"")+'</p>'+
 '<div class="edu-progressbar"><span style="width:'+((cursor+1)/questions.length*100).toFixed(1)+'%"></span></div>'+
 '<p class="edu-question">'+esc(q.enunciado)+'</p>'+
 options.map((original,i)=>'<button type="button" class="edu-choice" data-choice="'+original+'" '+(isAnswered?"disabled":"")+'>'+String.fromCharCode(65+i)+") "+esc(q.alternativas[original])+'</button>').join("")+
 (isAnswered?'<div class="edu-feedback'+(selection.correct?"":" error")+'"><strong>'+(selection.correct?"Você acertou.":"Você errou.")+'</strong><p>'+esc(q.explicacao)+'</p><p>Resposta correta: '+esc(q.alternativas[q.correta])+'</p></div>'+
 '<div class="edu-actions"><button id="nextQuestion" class="edu-primary" type="button">'+(cursor===questions.length-1?"Ver resultado da aula":"Próxima questão")+'</button></div>':"");
 if(!isAnswered){$("lessonMain").querySelectorAll("[data-choice]").forEach(b=>b.addEventListener("click",()=>{
   let original=Number(b.dataset.choice);
   results.push({chosen:original,correct:original===q.correta,source:q.from,question:q.enunciado,explanation:q.explicacao,correctText:q.alternativas[q.correta]});
   if(sim){cursor++;if(cursor>=questions.length)finishQuiz();else showQuestion()}
   else showQuestion();
 }))}
 if(isAnswered&&$("nextQuestion"))$("nextQuestion").addEventListener("click",()=>{cursor++;if(cursor>=questions.length)finishQuiz();else showQuestion()});
}
function finishQuiz(){
 const t=track(),sim=view==="sim",raw=score(),total=questions.length;
 if(!sim){const p=getProgress(current,lesson);p.quizAttempts++;p.lastScore=Math.round(raw/total*100);p.passed=raw/total>=.8;p.lastQuizAt=Date.now();p.errors=results.filter(x=>!x.correct).map(x=>x.question);if(!p.nextReview||!p.passed)p.nextReview=p.passed?Date.now()+DAY:Date.now();save()}
 else{saved.simulados[current]??=[];saved.simulados[current].push({date:Date.now(),score:Math.round(raw/total*100),correct:raw,total});saved.simulados[current]=saved.simulados[current].slice(-30);save()}
 view="summary";renderTrack();
}
function showSummary(){
 view="summary";let t=track(),sim=results.some(x=>x.source!==lesson)||(results.length>3),pct=Math.round(score()/results.length*100),missed=results.filter(x=>!x.correct);
 $("lessonMain").innerHTML='<span class="edu-step">'+(sim?"Resultado do simulado":"Resultado da prática")+'</span>'+
 '<h2>'+score()+' de '+results.length+' questões corretas · '+pct+'%</h2>'+
 '<p>'+ (sim?"Este simulado usou somente os assuntos disponíveis nesta prova. É um treino demonstrativo, não uma prova oficial.":pct>=80?"Você concluiu a prática inicial. O próximo desafio é recuperar o conteúdo em outro dia.":"Há conceitos a reforçar. Volte ao exemplo e às explicações antes de tentar novamente.") +'</p>'+
 (missed.length?'<h3>O que precisa ser entendido</h3>'+missed.map(x=>'<article class="edu-simresult wrong"><strong>'+esc(x.question)+'</strong><p>'+esc(x.explanation)+'</p><p><strong>Resposta correta:</strong> '+esc(x.correctText)+'</p></article>').join(""):'<div class="edu-example">Você respondeu a todas as questões corretamente. Isso mede esta tentativa; não comprova retenção a longo prazo.</div>')+
 '<div class="edu-actions"><button id="againTheory" class="edu-secondary" type="button">Voltar à explicação</button><button id="againQuiz" class="edu-primary" type="button">'+(sim?"Refazer simulado":"Fazer novo treino")+'</button>'+(sim?"":'<button id="goReview" class="edu-soft" type="button">Treinar recordação</button>')+'</div>';
 $("againTheory").addEventListener("click",()=>{view="theory";recallOpen=false;renderTrack()});
 $("againQuiz").addEventListener("click",()=>startQuiz(sim));
 if($("goReview"))$("goReview").addEventListener("click",()=>startReview(true,lesson));
}
function startReview(includeEarly,onlyOne=null){
 let t=track(),reviewed=lessons(t).filter(l=>{let p=progressRead(current,l.id);return p?.quizAttempts&&(onlyOne===null||onlyOne===l.id)&&(includeEarly||p.nextReview<=Date.now())});
 if(!reviewed.length){view="review";reviewQueue=[];showReview();return}
 reviewQueue=reviewed;reviewEarly=includeEarly;reviewReveal=false;reviewDraft="";view="review";renderTrack();
}
function showReview(){
 view="review";const l=reviewQueue[0];
 if(!l){$("lessonMain").innerHTML='<h2>Revisões desta prova</h2><p>Não há mais revisões na fila. As próximas aparecerão conforme o prazo de cada módulo; você não precisa estudar todas as provas juntas.</p><div class="edu-actions"><button id="backLesson" class="edu-primary" type="button">Voltar às aulas</button></div>';$("backLesson").addEventListener("click",()=>{view="theory";renderTrack()});return}
 const p=progressRead(current,l.id),scheduled=p.nextReview<=Date.now();
 $("lessonMain").innerHTML='<span class="edu-step">Recordação ativa · '+esc(track().nome)+'</span>'+
 '<h2>O que você ainda lembra?</h2><p class="edu-eyebrow">'+esc(l.materia+" / "+l.titulo)+'</p><div class="edu-recall"><p class="edu-cardfront">'+esc(l.lembrar)+'</p>'+
 '<textarea aria-label="Sua resposta" id="reviewInput" placeholder="Tente lembrar sem consultar o texto; também pode responder em voz alta."></textarea>'+
 '<div class="edu-actions"><button class="edu-secondary" id="showRecallAnswer" type="button">Revelar resposta para conferir</button></div>'+
 (reviewReveal?'<div class="edu-recall-answer"><strong>Resposta modelo:</strong> '+esc(l.resposta)+'</div>'+
 '<p class="edu-quiet">Compare sinceramente sua resposta com o modelo. Esta autoavaliação não substitui prova supervisionada.</p>'+
 '<div class="edu-reviewbar"><button class="missed" data-rate="again">Não lembrei</button><button data-rate="hard">Lembrei com esforço</button><button data-rate="easy">Lembrei bem</button></div>':"")+'</div>'+
 '<p class="edu-quiet">'+(scheduled?"Revisão prevista para agora.":"Revisão antecipada: ela não acelera a contagem de dias de memória.")+' Faltam '+(reviewQueue.length-1)+' tópicos nesta fila.</p>';
 $("reviewInput").value=reviewDraft;$("reviewInput").addEventListener("input",e=>{reviewDraft=e.target.value});$("showRecallAnswer").addEventListener("click",()=>{reviewDraft=$("reviewInput").value;reviewReveal=true;showReview()});
 $("lessonMain").querySelectorAll("[data-rate]").forEach(b=>b.addEventListener("click",()=>gradeRecall(b.dataset.rate,l,scheduled)));
}
function gradeRecall(rate,l,scheduled){
 const p=getProgress(current,l.id),today=localDate(Date.now());
 p.reviewAttempts=(p.reviewAttempts||0)+1;p.lastRecall=Date.now();p.lastRating=rate;
 if(rate==="again"){p.stage=0;p.nextReview=Date.now()+DAY}
 else if(scheduled){p.stage=Math.min(5,(p.stage||0)+(rate==="easy"?1:0));const intervals=[1,3,7,14,30,45];const span=rate==="hard"?1:intervals[p.stage];p.nextReview=Date.now()+span*DAY;if(!p.successDays.includes(today))p.successDays.push(today)}
 save();reviewQueue.shift();reviewReveal=false;reviewDraft="";renderTrack();
}
function showSimulation(){if(!lessons(track()).length)return;startQuiz(true)}
function boot(){
 const exam=tracks.find(x=>x.id===saved.selected);
 $("examFilters").querySelectorAll("[data-force]").forEach(b=>b.addEventListener("click",()=>{filterForce=b.dataset.force;directory()}));
 $("find").addEventListener("input",directory);
 $("onlyReady").addEventListener("change",e=>{onlyReady=e.target.checked;directory()});
 $("changeExam").addEventListener("click",()=>{current=null;saved.selected=null;save();directory()});
 $("reviewAll").addEventListener("click",()=>startReview(false));
 $("simulation").addEventListener("click",showSimulation);
 $("refreshTrack").addEventListener("click",renderTrack);
 if(exam){current=exam.id;lesson=exam.unidades[0]?.id||null;renderTrack()}
 else directory();
}
Promise.all([
 fetch("dados/provas.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("provas indisponíveis");return r.json()}),
 fetch("dados/cursos.json").then(r=>{if(!r.ok)throw Error("cursos indisponíveis");return r.json()})
]).then(([j,c])=>{tracks=j.trilhas;courses=c;boot()}).catch(e=>{$("loader").textContent="Não foi possível carregar as provas: "+e.message;$("loader").hidden=false});
})();