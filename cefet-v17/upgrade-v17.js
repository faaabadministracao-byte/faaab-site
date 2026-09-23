(()=>{
'use strict';
const DB=JSON.parse(document.getElementById('db').textContent);
const TRAILS=Object.values(DB.trails);
const BANK=window.__CEFET_BANK||{exams:[]};
document.body.innerHTML='<div id="app"></div>';
const APP=document.getElementById('app');
const SUBJECTS=['Português','Matemática','Física','Química','Biologia','História','Geografia'];
const LABEL={'Português':'Português','Matemática':'Matemática','Física':'Física','Química':'Química','Biologia':'Biologia','História':'História','Geografia':'Geografia'};
const STORE='cefet17-study';
let saved={studied:{},mastery:{},last:null};
try{saved={...saved,...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch(_){}
let view={subject:'Português',topic:null,showOptions:false,selected:null,graded:false,options:[],challengeOpen:false};
let exam=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function persist(){try{localStorage.setItem(STORE,JSON.stringify(saved))}catch(_){}}
function step(t,kind){return (t.steps||[]).find(x=>x.kind===kind)||{} }
function setPage(html,title='CEFET 2027'){
 APP.innerHTML=`<main class="v17-page"><header class="v17-head"><div class="v17-kicker">CADERNO DE PREPARAÇÃO</div><h1>${esc(title)}</h1><div class="v17-rule"></div></header>${html}</main>`;
 window.scrollTo(0,0);
}
function home17(){
 const done=Object.keys(saved.studied||{}).length;
 setPage(`<section class="v17-box intro"><p><b>Preparação para o processo seletivo CEFET/RJ 2027.</b></p><p>O modo de estudo usa o programa de 2027. Provas anteriores servem apenas como referência de formato e nível de cobrança.</p></section>
 <div class="v17-menu"><button data-v17="study">ESTUDAR O PROGRAMA</button><button data-v17="exam">FAZER SIMULADO</button></div>
 <section class="v17-box"><h2>Seu caderno</h2><p>Tópicos estudados: <b>${done}/210</b></p>${saved.last?`<button class="v17-link" data-v17="topic" data-id="${esc(saved.last)}">Continuar de onde parei</button>`:''}</section>
 <section class="v17-note"><b>Como estudar aqui:</b> primeiro entenda a ideia e o exemplo. Depois tente a questão sem ver o gabarito. A resposta só aparece depois de você confirmar.</section>`, 'CEFET/RJ — Caderno 2027');
}
function countSubject(s){return TRAILS.filter(t=>t.subject===s).length}
function studyMenu17(){
 setPage(`<section class="v17-box"><h2>Programa de estudo</h2><p>Escolha a disciplina. A quantidade abaixo é a divisão didática do aplicativo; não é uma contagem oficial publicada pelo CEFET.</p></section>
 <div class="v17-subjects">${SUBJECTS.map(s=>`<button data-v17="subject" data-sub="${esc(s)}"><span>${esc(LABEL[s])}</span><small>${countSubject(s)} tópicos</small></button>`).join('')}</div>
 <section class="v17-box"><h2>Conferência curricular</h2><p>O banco inclui os núcleos exigidos no programa 2027: leitura e linguagem; álgebra, funções e geometria; Física, Química e Biologia; mundo moderno e colonização; cartografia, clima, população e globalização.</p></section>
 <button class="v17-back" data-v17="home">Voltar ao início</button>`, 'Estudo — Programa 2027');
}
function subjectPage(s){
 view.subject=s;
 const list=TRAILS.filter(t=>t.subject===s);
 setPage(`<section class="v17-box"><h2>${esc(s)}</h2><p>${list.length} tópicos. Abra um deles para estudar a explicação, os pré-requisitos, o exemplo e a questão.</p></section>
 <div class="v17-topiclist">${list.map(t=>`<button data-v17="topic" data-id="${t.id}" class="${saved.studied?.[t.id]?'done':''}"><b>${t.id}</b> — ${esc(t.title)}<small>${esc(t.level||'')}</small></button>`).join('')}</div>
 <button class="v17-back" data-v17="study">Voltar às disciplinas</button>`, s);
}
function mapExamSubject(sub){
 if(['Física','Química','Biologia'].includes(sub))return 'Ciências da Natureza';
 if(['História','Geografia'].includes(sub))return 'Ciências Humanas';
 return sub;
}
function tokens(s){return norm(s).split(/[^a-z0-9]+/).filter(x=>x.length>3 && !['questao','sobre','tema','forma','exemplo','situacao','apresenta'].includes(x))}
function challengesFor(t){
 const area=mapExamSubject(t.subject);
 const needle=new Set(tokens(`${t.title} ${t.concepts||''}`));
 return (BANK.exams||[]).flatMap(e=>e.questions.map(q=>({...q,exam:e.name})))
  .filter(q=>q.subject===area)
  .map(q=>{let score=0;const hay=tokens(`${q.skill} ${q.prompt}`);hay.forEach(x=>{if(needle.has(x))score+=3; else [...needle].forEach(n=>{if(x.includes(n)||n.includes(x))score+=1})});return {q,score}})
  .sort((a,b)=>b.score-a.score).filter(x=>x.score>0).slice(0,2).map(x=>x.q);
}
function shuffled(arr,seed){
 const a=[...arr];let x=seed||17;
 for(let i=a.length-1;i>0;i--){x=(x*1103515245+12345)&0x7fffffff;const j=x%(i+1);[a[i],a[j]]=[a[j],a[i]]}
 return a;
}
function topicPage(id){
 const t=DB.trails[id];if(!t)return studyMenu17();
 view.topic=id;view.showOptions=false;view.selected=null;view.graded=false;view.challengeOpen=false;
 const q=step(t,'checkpoint');view.options=shuffled(q.options||[],id.split('').reduce((a,c)=>a+c.charCodeAt(0),0));
 saved.last=id;persist();renderTopic();
}
function prereqHTML(t){
 const ids=String(t.prerequisites||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(!ids.length)return '<p>Nenhum pré-requisito obrigatório nesta trilha.</p>';
 return `<div class="v17-prereqs">${ids.map(id=>{const p=DB.trails[id];return p?`<button data-v17="topic" data-id="${id}">${id} — ${esc(p.title)}</button>`:''}).join('')}</div>`;
}
function renderTopic(){
 const t=DB.trails[view.topic];if(!t)return;
 const goal=step(t,'goal'), remember=step(t,'remember'), understand=step(t,'understand'), ex=step(t,'example'), q=step(t,'checkpoint'), repair=step(t,'repair'), cefet=step(t,'cefet');
 const related=challengesFor(t);
 setPage(`<nav class="v17-breadcrumb"><button data-v17="subject" data-sub="${esc(t.subject)}">${esc(t.subject)}</button> / ${t.id}</nav>
 <section class="v17-box lesson-title"><div class="v17-code">${t.id} · ${esc(t.level||'')}</div><h2>${esc(t.title)}</h2><p><b>Conceitos:</b> ${esc(t.concepts||'')}</p></section>
 <section class="v17-section"><h3>1. O que você precisa dominar</h3><p>${esc(goal.content||'')}</p></section>
 <section class="v17-section"><h3>2. Base necessária</h3>${prereqHTML(t)}</section>
 <section class="v17-section"><h3>3. Explicação</h3><p>${esc(remember.content||'')}</p><p>${esc(understand.content||'')}</p></section>
 <section class="v17-section example"><h3>4. Exemplo guiado</h3><p>${esc(ex.content||'')}</p></section>
 <section class="v17-section checkpoint"><h3>5. Agora tente sem gabarito</h3><p class="v17-question">${esc(q.prompt||'')}</p>${checkpointHTML(q)}</section>
 ${related.length?`<section class="v17-section"><h3>6. Questão de nível mais próximo da prova</h3><p>Esta questão vem do banco autoral inspirado no formato das provas anteriores, não de uma prova antiga copiada.</p>${related.map((x,i)=>challengeHTML(x,i)).join('')}</section>`:''}
 <section class="v17-section"><h3>${related.length?'7':'6'}. Se errar</h3><p>${esc(repair.content||'')}</p></section>
 <section class="v17-section"><h3>${related.length?'8':'7'}. Pensar como o CEFET</h3><p>${esc(cefet.content||'')}</p></section>
 <div class="v17-actions"><button data-v17="mark">Marcar tópico como estudado</button><button data-v17="subject" data-sub="${esc(t.subject)}">Voltar à lista</button></div>`, `${t.id} — ${t.title}`);
}
function checkpointHTML(q){
 if(!view.showOptions)return `<button class="v17-main" data-v17="show-options">Já pensei. Mostrar alternativas</button><p class="v17-small">As alternativas ficam escondidas primeiro para você tentar recuperar a resposta da memória.</p>`;
 const opts=view.options.map((o,i)=>`<button class="v17-option ${view.selected===o?'selected':''} ${view.graded?(o===q.answer?'right':view.selected===o?'wrong':''):''}" data-v17="select" data-opt="${encodeURIComponent(o)}"><span>${String.fromCharCode(65+i)})</span> ${esc(o)}</button>`).join('');
 let feedback='';
 if(view.graded){const ok=view.selected===q.answer;feedback=`<div class="v17-feedback ${ok?'ok':'bad'}"><b>${ok?'Correto.':'Não é essa.'}</b><p><b>Resposta:</b> ${esc(q.answer)}</p><p>${esc(q.explanation||'')}</p></div>`}
 return `${opts}${!view.graded?'<button class="v17-main" data-v17="grade">Corrigir</button>':feedback}`;
}
function challengeHTML(q,i){
 return `<article class="v17-challenge">${q.stim||''}${q.visual||''}<p class="v17-question">${esc(q.prompt)}</p><ol type="A">${q.options.map(o=>`<li>${esc(o)}</li>`).join('')}</ol><details><summary>Ver resposta e explicação somente depois de tentar</summary><p><b>Resposta:</b> ${esc(q.answer)}</p><p>${esc(q.explain)}</p></details></article>`;
}
function examMenu17(){
 setPage(`<section class="v17-box"><h2>Simulados completos</h2><p>30 questões por prova: 10 Português, 10 Matemática, 5 Ciências da Natureza e 5 Ciências Humanas. As questões são autorais e usam provas anteriores somente como referência de formato e dificuldade.</p></section>
 <div class="v17-examlist">${(BANK.exams||[]).map((e,i)=>`<button data-v17="start-exam" data-i="${i}"><b>${esc(e.name)}</b><small>30 questões + proposta de redação</small></button>`).join('')}</div>
 <button class="v17-back" data-v17="home">Voltar ao início</button>`, 'Simulados');
}
function startExam17(i){
 const src=(BANK.exams||[])[i]; if(!src)return examMenu17();
 exam={idx:i,pos:0,finished:false,qs:src.questions.map(q=>({...q,display:shuffled(q.options,q.n*97+i*31),chosen:null}))};
 renderExam17();
}
function renderExam17(){
 if(!exam)return examMenu17();
 if(exam.finished)return renderExamResult17();
 const e=BANK.exams[exam.idx],q=exam.qs[exam.pos];
 setPage(`<div class="v17-examtop"><b>${esc(e.name)}</b><span>Questão ${exam.pos+1}/30</span></div>
 <div class="v17-qnav">${exam.qs.map((x,j)=>`<button data-v17="jump-exam" data-i="${j}" class="${j===exam.pos?'cur':''} ${x.chosen?'ans':''}">${j+1}</button>`).join('')}</div>
 <section class="v17-section">${q.stim||''}${q.visual||''}<p class="v17-question">${esc(q.prompt)}</p>
 ${q.display.map((o,k)=>`<button class="v17-option ${q.chosen===o?'selected':''}" data-v17="exam-choice" data-opt="${encodeURIComponent(o)}"><span>${String.fromCharCode(65+k)})</span> ${esc(o)}</button>`).join('')}</section>
 <div class="v17-actions"><button data-v17="exam-prev" ${exam.pos===0?'disabled':''}>Anterior</button><button data-v17="exam-next">${exam.pos===29?'Revisar e entregar':'Próxima'}</button></div>
 <button class="v17-back" data-v17="exam-finish">Entregar prova agora</button>`, e.name);
}
function finishExam17(){
 if(!exam||exam.finished)return;
 const blanks=exam.qs.filter(q=>!q.chosen).length;
 if(!confirm(blanks?`Há ${blanks} questão(ões) em branco. Entregar mesmo assim?`:'Entregar e mostrar a correção?'))return;
 exam.finished=true;renderExamResult17();
}
function renderExamResult17(){
 const e=BANK.exams[exam.idx];
 const score=exam.qs.filter(q=>q.chosen===q.answer).length;
 setPage(`<section class="v17-box result"><h2>Resultado: ${score}/30</h2><p>A correção vem depois da prova; nenhuma resposta correta é mostrada durante o simulado.</p></section>
 <section class="v17-section"><h3>Redação</h3><p><b>${esc(e.essay.title)}</b></p><p>${esc(e.essay.theme)}</p>${e.essay.support.map(x=>`<p class="v17-quote">${esc(x)}</p>`).join('')}</section>
 <h2 class="v17-reviewtitle">Correção questão por questão</h2>
 ${exam.qs.map(q=>`<section class="v17-section ${q.chosen===q.answer?'review-ok':'review-bad'}">${q.stim?`<details><summary>Reabrir texto-base</summary>${q.stim}</details>`:''}${q.visual?`<details><summary>Reabrir figura</summary>${q.visual}</details>`:''}<p><b>${q.n}. ${esc(q.skill)}</b></p><p>${esc(q.prompt)}</p><p>Sua resposta: <b>${esc(q.chosen||'em branco')}</b></p><p>Correta: <b>${esc(q.answer)}</b></p><p>${esc(q.explain)}</p></section>`).join('')}
 <div class="v17-actions"><button data-v17="exam">Outro simulado</button><button data-v17="home">Início</button></div>`, `${e.name} — correção`);
}
function handle(action,el){
 if(action==='home')return home17();
 if(action==='study')return studyMenu17();
 if(action==='exam')return examMenu17();
 if(action==='start-exam')return startExam17(Number(el.dataset.i));
 if(action==='jump-exam'){exam.pos=Number(el.dataset.i);return renderExam17()}
 if(action==='exam-choice'){exam.qs[exam.pos].chosen=decodeURIComponent(el.dataset.opt||'');return renderExam17()}
 if(action==='exam-prev'){if(exam.pos>0)exam.pos--;return renderExam17()}
 if(action==='exam-next'){if(exam.pos<29){exam.pos++;return renderExam17()}return finishExam17()}
 if(action==='exam-finish')return finishExam17();
 if(action==='subject')return subjectPage(el.dataset.sub);
 if(action==='topic')return topicPage(el.dataset.id);
 if(action==='show-options'){view.showOptions=true;return renderTopic()}
 if(action==='select'){if(view.graded)return;view.selected=decodeURIComponent(el.dataset.opt||'');return renderTopic()}
 if(action==='grade'){
   if(!view.selected)return alert('Escolha uma alternativa antes de corrigir.');
   view.graded=true;
   const t=DB.trails[view.topic],q=step(t,'checkpoint');
   saved.mastery[view.topic]=(saved.mastery[view.topic]||0)+(view.selected===q.answer?1:0);persist();return renderTopic();
 }
 if(action==='mark'){saved.studied[view.topic]=Date.now();persist();alert('Tópico marcado como estudado. Ele ainda deve voltar na revisão para virar domínio.');return renderTopic()}
}
document.addEventListener('click',e=>{const el=e.target.closest('[data-v17]');if(!el)return;handle(el.dataset.v17,el)});
window.home=home17;
window.studyMenu=studyMenu17;
window.examMenu=examMenu17;
window.cefetStudySubject=subjectPage;
window.cefetStudyTopic=topicPage;
setTimeout(home17,0);
})();