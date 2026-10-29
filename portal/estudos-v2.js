(()=>{"use strict";
const $=id=>document.getElementById(id);
const STORAGE="faaab-study-tracks-v2",DAY=86400000;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const normalize=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const shuffle=arr=>{let a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const localDate=ts=>{const d=new Date(ts);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const readableDate=ts=>new Date(ts).toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});
const durationDays=ts=>Math.max(0,Math.ceil((ts-Date.now())/DAY));
let supports={},theoryStep=0,quizIsSim=false,practiceExtraAdded=false,practiceChallengeAdded=false;let tracks=[],courses=[],current=null,lesson=null,screen="directory",filterForce="todos",onlyReady=false,view="theory",recallOpen=false,questions=[],cursor=0,results=[],answered=false,reviewQueue=[],reviewEarly=false,reviewReveal=false,reviewDraft="",reviewRatings={};
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
 current=t.id;lesson=t.unidades[0]?.id||null;saved.selected=current;save();view="theory";theoryStep=0;recallOpen=false;
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
 $("reviewAll").disabled=due(t).length===0;
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
 $("lessonList").querySelectorAll("[data-lesson]").forEach(b=>b.addEventListener("click",()=>{lesson=b.dataset.lesson;view="theory";theoryStep=0;recallOpen=false;renderTrack()}));
}
function selectedLesson(){return lessons(track()).find(l=>l.id===lesson)}
function material(){return supports[current]?.[lesson]||null}
function listen(text){
 if(typeof window==="undefined"||!("speechSynthesis" in window))return;
 try{const t=window.speechSynthesis; t.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="pt-BR";u.rate=.92;t.speak(u)}catch(e){}
}
function stopReading(){if(typeof window!=="undefined"&&window.speechSynthesis)try{window.speechSynthesis.cancel()}catch(e){}}
function showTheory(){
 view="theory";const l=selectedLesson();if(!l)return;
 const m=material(),steps=m?.passos?.length?m.passos:l.teoria;
 theoryStep=Math.min(Math.max(0,theoryStep),steps.length);
 const isEnd=theoryStep===steps.length,p=progressRead(current,l.id);
 const step=steps[theoryStep]||"",prev=steps[theoryStep-1]||"";
 let content='<span class="edu-step">Aula '+(isEnd?"— Vamos praticar":"— Parte "+(theoryStep+1)+" de "+steps.length)+'</span>'+
 '<h2>'+esc(l.titulo)+'</h2><p class="edu-preamble"><strong>O que você vai aprender:</strong> '+esc(l.objetivo)+'</p>';
 if(!isEnd){
   content+='<div class="edu-shortstep" aria-live="polite"><span class="edu-eyebrow">Leia com calma</span><p>'+esc(step)+'</p></div>'+
   (theoryStep>0?'<p class="edu-quiet"><strong>Antes:</strong> '+esc(prev)+'</p>':"")+
   '<div class="edu-progressbar" role="progressbar" aria-label="Explicação da aula" aria-valuemin="0" aria-valuemax="'+steps.length+'" aria-valuenow="'+(theoryStep+1)+'"><span style="width:'+Math.round((theoryStep+1)/steps.length*100)+'%"></span></div>'+
   '<div class="edu-actions"><button id="continueStep" class="edu-primary" type="button">'+(theoryStep===steps.length-1?"Ver o exemplo":"Continuar")+'</button>'+
   (theoryStep>0?'<button id="priorStep" class="edu-secondary" type="button">Ver parte anterior</button>':"")+
   '</div>';
 }else{
   content+='<div class="edu-example"><strong>Veja um exemplo:</strong><p>'+esc(l.exemplo)+'</p></div>'+
   (m?.palavras?.length?'<div class="edu-glossary"><h3>Palavras importantes</h3>'+m.palavras.map(a=>'<p><strong>'+esc(a[0])+':</strong> '+esc(a[1])+'</p>').join("")+'</div>':"")+
   '<div class="edu-mistake"><strong>Guarde esta ideia:</strong> '+esc(l.erros)+'</div>'+
   '<div class="edu-recall"><h3>Agora tente lembrar</h3><p>'+esc(l.lembrar)+'</p>'+
   '<label for="recallText" class="edu-quiet">Responda com suas palavras, por escrito ou em voz alta. Não é preciso digitar para continuar.</label>'+
   '<textarea id="recallText" placeholder="Como você explicaria isso para outra pessoa?"></textarea>'+
   '<div class="edu-actions"><button class="edu-secondary" id="revealTheory" type="button">'+(recallOpen?"Ocultar explicação":"Conferir explicação")+'</button></div>'+
   '<div id="theoryAnswer" class="edu-recall-answer'+(recallOpen?"":" edu-hidden")+'">'+esc(l.resposta)+'</div></div>'+
   '<div class="edu-actions"><button id="startQuiz" class="edu-primary" type="button">Resolver questões</button>'+
   '<button id="priorStep" class="edu-secondary" type="button">Rever a explicação</button>'+
   (p?.quizAttempts?'<button id="reviewThis" class="edu-soft" type="button">Relembrar o que estudei</button>':"")+
   '</div>';
 }
 if(typeof window!=="undefined"&&"speechSynthesis" in window)content+='<div class="edu-actions"><button id="listenStep" type="button" class="edu-soft">Ouvir o texto</button></div>';
 $("lessonMain").innerHTML=content;
 if($("continueStep"))$("continueStep").addEventListener("click",()=>{stopReading();theoryStep++;showTheory()});
 if($("priorStep"))$("priorStep").addEventListener("click",()=>{stopReading();theoryStep=isEnd?0:Math.max(0,theoryStep-1);recallOpen=false;showTheory()});
 if($("revealTheory"))$("revealTheory").addEventListener("click",()=>{recallOpen=!recallOpen;$("theoryAnswer").classList.toggle("edu-hidden",!recallOpen);$("revealTheory").textContent=recallOpen?"Ocultar explicação":"Conferir explicação"});
 if($("startQuiz"))$("startQuiz").addEventListener("click",()=>{stopReading();startQuiz(false)});
 if($("reviewThis"))$("reviewThis").addEventListener("click",()=>{stopReading();startReview(true,l.id)});
 if($("listenStep"))$("listenStep").addEventListener("click",()=>listen(isEnd?l.exemplo+" "+l.lembrar:step));
}
function questionsFor(isSim){
 let t=track();
 if(!isSim){let l=selectedLesson();return shuffle(l.questoes.map(q=>({...q,from:l.id,lessonTitle:l.titulo,optionOrder:shuffle([0,1,2,3])})))}
 return shuffle(lessons(t).flatMap(l=>l.questoes.map(q=>({...q,from:l.id,lessonTitle:l.titulo,optionOrder:shuffle([0,1,2,3])})))).slice(0,Math.min(12,lessons(t).reduce((n,l)=>n+l.questoes.length,0)));
}
function startQuiz(sim){
 questions=questionsFor(sim);cursor=0;results=[];answered=false;quizIsSim=sim;practiceExtraAdded=false;practiceChallengeAdded=false;view=sim?"sim":"quiz";renderTrack();
}
function addPracticeQuestion(right){
 const l=selectedLesson(),bank=material();if(!bank)return;
 const missed=results.some(x=>!x.correct);
 const put=(raw,source)=>{if(!raw||raw.length<4)return;questions.push({
   enunciado:raw[0],alternativas:raw[1],correta:raw[2],explicacao:raw[3],optionOrder:shuffle([0,1,2,3]),
   from:l.id,lessonTitle:l.titulo,addedType:source
 })};
 if(!right&&!practiceExtraAdded){
   practiceExtraAdded=true;
   put(bank.reforco,"reforco");
 }else if(!missed&&!practiceChallengeAdded&&results.length===l.questoes.length){
   practiceChallengeAdded=true;
   put(bank.desafio,"aplicacao");
 }
}
function score(){return results.filter(x=>x.correct).length}
function showQuestion(){
 const q=questions[cursor];if(!q){showSummary();return}
 const sim=quizIsSim,isAnswered=!!results[cursor];
 const options=q.optionOrder;
 const selection=isAnswered?results[cursor]:null;
 $("lessonMain").innerHTML='<span class="edu-step">'+(sim?"Simulado desta prova — sem gabarito durante a tentativa":"Prática da aula")+'</span>'+
 '<h2>'+(sim?"Simulado exclusivo: "+esc(track().nome):esc(selectedLesson().titulo))+'</h2>'+
 '<p class="edu-quiet">Questão '+(cursor+1)+' de '+questions.length+(sim?" · Assunto: "+esc(q.lessonTitle):"")+'</p>'+
 '<div class="edu-progressbar"><span style="width:'+((cursor+1)/questions.length*100).toFixed(1)+'%"></span></div>'+
 '<p class="edu-question">'+esc(q.enunciado)+'</p>'+
 options.map((original,i)=>'<button type="button" class="edu-choice" data-choice="'+original+'" '+(isAnswered?"disabled":"")+'>'+String.fromCharCode(65+i)+") "+esc(q.alternativas[original])+'</button>').join("")+
 (isAnswered?'<div class="edu-feedback'+(selection.correct?"":" error")+'"><strong>'+(selection.correct?"Você acertou.":"Vamos entender o motivo.")+'</strong><p>'+esc(q.explicacao)+'</p>'+(!selection.correct&&material()?.pista?'<p><strong>Como pensar:</strong> '+esc(material().pista)+'</p>':"")+'<p>Resposta correta: '+esc(q.alternativas[q.correta])+'</p></div>'+
 '<div class="edu-actions"><button id="nextQuestion" class="edu-primary" type="button">'+(cursor===questions.length-1?"Ver resultado da aula":"Próxima questão")+'</button></div>':"");
 if(!isAnswered){$("lessonMain").querySelectorAll("[data-choice]").forEach(b=>b.addEventListener("click",()=>{
   let original=Number(b.dataset.choice);
   const right=original===q.correta;
   results.push({chosen:original,correct:right,source:q.from,question:q.enunciado,explanation:q.explicacao,correctText:q.alternativas[q.correta]});
   if(!sim)addPracticeQuestion(right);
   if(sim){cursor++;if(cursor>=questions.length)finishQuiz();else showQuestion()}
   else showQuestion();
 }))}
 if(isAnswered&&$("nextQuestion"))$("nextQuestion").addEventListener("click",()=>{cursor++;if(cursor>=questions.length)finishQuiz();else showQuestion()});
}
function finishQuiz(){
 const t=track(),sim=quizIsSim,raw=score(),total=questions.length;
 if(!sim){const p=getProgress(current,lesson);p.quizAttempts++;p.lastScore=Math.round(raw/total*100);p.passed=raw/total>=.75&&results.slice(-2).every(x=>x.correct);p.earlyErrors=(p.earlyErrors||0)+results.filter(x=>!x.correct).length;p.lastQuizAt=Date.now();p.errors=results.filter(x=>!x.correct).map(x=>x.question);if(!p.nextReview||!p.passed)p.nextReview=p.passed?Date.now()+DAY:Date.now();save()}
 else{saved.simulados[current]??=[];saved.simulados[current].push({date:Date.now(),score:Math.round(raw/total*100),correct:raw,total});saved.simulados[current]=saved.simulados[current].slice(-30);save()}
 view="summary";renderTrack();
}
function showSummary(){
 view="summary";let t=track(),sim=quizIsSim,pct=Math.round(score()/results.length*100),missed=results.filter(x=>!x.correct);
 $("lessonMain").innerHTML='<span class="edu-step">'+(sim?"Resultado do simulado":"Resultado da prática")+'</span>'+
 '<h2>'+score()+' de '+results.length+' questões corretas · '+pct+'%</h2>'+
 '<p>'+ (sim?"Este simulado usou somente os assuntos disponíveis nesta prova. É um treino demonstrativo, não uma prova oficial.":pct>=80?"Você concluiu a prática inicial. O próximo desafio é recuperar o conteúdo em outro dia.":"Há conceitos a reforçar. Volte ao exemplo e às explicações antes de tentar novamente.") +'</p>'+
 (missed.length?'<h3>O que precisa ser entendido</h3>'+missed.map(x=>'<article class="edu-simresult wrong"><strong>'+esc(x.question)+'</strong><p>'+esc(x.explanation)+'</p><p><strong>Resposta correta:</strong> '+esc(x.correctText)+'</p></article>').join(""):'<div class="edu-example">Você respondeu a todas as questões corretamente. Isso mede esta tentativa; não comprova retenção a longo prazo.</div>')+
 '<div class="edu-actions"><button id="againTheory" class="edu-secondary" type="button">Voltar à explicação</button><button id="againQuiz" class="edu-primary" type="button">'+(sim?"Refazer simulado":"Fazer novo treino")+'</button>'+(sim?"":'<button id="goReview" class="edu-soft" type="button">Treinar recordação</button>')+'</div>';
 $("againTheory").addEventListener("click",()=>{view="theory";theoryStep=0;recallOpen=false;renderTrack()});
 $("againQuiz").addEventListener("click",()=>startQuiz(sim));
 if($("goReview"))$("goReview").addEventListener("click",()=>startReview(true,lesson));
}
function reviewCards(l,scheduled){
 const facts=[{front:l.lembrar,back:l.resposta,kind:"Conceito"}];
 for(const q of l.questoes.slice(0,2)){facts.push({front:q.enunciado,back:q.alternativas[q.correta]+". "+q.explicacao,kind:"Aplicação sem alternativas"})}
 return facts.map(x=>({...x,lesson:l,scheduled}));
}
function startReview(includeEarly,onlyOne=null){
 const t=track(),reviewed=lessons(t).filter(l=>{const p=progressRead(current,l.id);return p?.quizAttempts&&(onlyOne===null||onlyOne===l.id)&&(includeEarly||p.nextReview<=Date.now())});
 reviewQueue=reviewed.flatMap(l=>reviewCards(l,progressRead(current,l.id).nextReview<=Date.now()));
 reviewRatings={};reviewEarly=includeEarly;reviewReveal=false;reviewDraft="";view="review";renderTrack();
}
function showReview(){
 view="review";const card=reviewQueue[0];
 if(!card){$("lessonMain").innerHTML='<h2>Revisões desta prova</h2><p>Você terminou as perguntas desta rodada. A próxima revisão será planejada conforme seu desempenho e só contará como revisão espaçada se ocorrer em outro dia.</p><div class="edu-actions"><button id="backLesson" class="edu-primary" type="button">Voltar às aulas</button></div>';$("backLesson").addEventListener("click",()=>{view="theory";renderTrack()});return}
 const l=card.lesson,scheduled=card.scheduled;
 $("lessonMain").innerHTML='<span class="edu-step">Recordação ativa · '+esc(track().nome)+'</span>'+
 '<h2>O que você ainda lembra?</h2><p class="edu-eyebrow">'+esc(l.materia+" / "+l.titulo)+' · '+esc(card.kind)+'</p><div class="edu-recall"><p class="edu-cardfront">'+esc(card.front)+'</p>'+
 '<label class="edu-quiet" for="reviewInput">Tente explicar sem alternativas e sem consultar a aula. Resposta por escrito ou mental.</label>'+
 '<textarea aria-label="Sua resposta" id="reviewInput" placeholder="Sua explicação... Também pode responder em voz alta."></textarea>'+
 '<div class="edu-actions"><button class="edu-secondary" id="showRecallAnswer" type="button">Revelar resposta para conferir</button></div>'+
 (reviewReveal?'<div class="edu-recall-answer"><strong>Resposta modelo:</strong> '+esc(card.back)+'</div>'+
 '<p class="edu-quiet">Compare o que lembrou com a explicação. Uma resposta incompleta conta como «lembrei com esforço» ou «não lembrei».</p>'+
 '<div class="edu-reviewbar"><button class="missed" data-rate="again">Não lembrei</button><button data-rate="hard">Lembrei com esforço</button><button data-rate="easy">Lembrei bem</button></div>':"")+'</div>'+
 '<p class="edu-quiet">'+(scheduled?"Revisão programada.":"Treino antecipado: não acelera a progressão de memória.")+' Restam '+(reviewQueue.length-1)+' perguntas de revisão nesta fila.</p>';
 $("reviewInput").value=reviewDraft;$("reviewInput").addEventListener("input",e=>{reviewDraft=e.target.value});
 $("showRecallAnswer").addEventListener("click",()=>{reviewDraft=$("reviewInput").value;reviewReveal=true;showReview()});
 $("lessonMain").querySelectorAll("[data-rate]").forEach(b=>b.addEventListener("click",()=>gradeRecall(b.dataset.rate,card)));
}
function gradeRecall(rate,card){
 const l=card.lesson,id=l.id;
 reviewRatings[id]??=[];
 reviewRatings[id].push(rate);
 reviewQueue.shift();reviewReveal=false;reviewDraft="";
 if(!reviewQueue.some(x=>x.lesson.id===id)){
   const p=getProgress(current,id),today=localDate(Date.now()),r=reviewRatings[id];
   const overall=r.includes("again")?"again":r.includes("hard")?"hard":"easy";
   p.reviewAttempts=(p.reviewAttempts||0)+1;p.lastRecall=Date.now();p.lastRating=overall;
   if(overall==="again"){p.stage=0;p.nextReview=Date.now()+DAY}
   else if(card.scheduled){
     p.stage=Math.min(5,(p.stage||0)+(overall==="easy"?1:0));
     const intervals=[1,3,7,14,30,45],span=overall==="hard"?1:intervals[p.stage];
     p.nextReview=Date.now()+span*DAY;
     if(!p.successDays.includes(today))p.successDays.push(today);
   }
   save();
 }
 renderTrack();
}
function showSimulation(){if(!lessons(track()).length)return;startQuiz(true)}
function boot(){
 const exam=tracks.find(x=>x.id===saved.selected);
 $("examFilters").querySelectorAll("[data-force]").forEach(b=>b.addEventListener("click",()=>{filterForce=b.dataset.force;directory()}));
 $("find").addEventListener("input",directory);
 $("onlyReady").addEventListener("change",e=>{onlyReady=e.target.checked;directory()});
 $("changeExam").addEventListener("click",()=>{stopReading();current=null;saved.selected=null;save();directory()});
 $("reviewAll").addEventListener("click",()=>startReview(false));
 $("simulation").addEventListener("click",showSimulation);
 $("loader").hidden=true;
 if(exam){current=exam.id;lesson=exam.unidades[0]?.id||null;renderTrack()}
 else directory();
}
Promise.all([
 fetch("dados/provas.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("provas indisponíveis");return r.json()}),
 fetch("dados/cursos.json").then(r=>{if(!r.ok)throw Error("cursos indisponíveis");return r.json()}),
 fetch("dados/etapas-estudo.json").then(r=>{if(!r.ok)throw Error("etapas indisponíveis");return r.json()})
]).then(([j,c,m])=>{tracks=j.trilhas;courses=c;supports=m.apoios;boot()}).catch(e=>{$("loader").textContent="Não foi possível carregar as provas: "+e.message;$("loader").hidden=false});
})();