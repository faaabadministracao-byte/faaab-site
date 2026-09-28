from pathlib import Path

p=Path('cefet-trainer/app/src/main/assets/upgrade-v23.js')
s=p.read_text(encoding='utf-8')

s=s.replace("const STORE='cefet_retafinal23_state';","const STORE='cefet_retafinal24_state';")
s=s.replace("v:23,skills:","v:24,skills:")

old=""" <section class="sheet mission"><div class="eyebrow">POR QUE ESTE APP NÃO VAI TE MOER</div><p><b>Sem sequência infinita de múltipla escolha.</b> Ele alterna explicação curta, previsão, questão, troca de matéria, flashback e desafio final. Se você acerta depois de alguns minutos sem reler, o assunto começa a sair da fila. Se erra, volta com outra situação — não com a mesma pergunta.</p></section>`}"""
new=""" <section class="sheet mission"><div class="eyebrow">AGORA</div><h2>1 missão. 1 alvo. Sem enrolação.</h2><p class="muted">Comece. O app decide quando explicar, quando te testar e quando trocar de assunto.</p><button class="btn primary big" onclick="RF.startEpisode()">▶ ENTRAR NA MISSÃO</button></section>`}"""
if old not in s: raise SystemExit('home block not found')
s=s.replace(old,new)
s=s.replace('Um episódio leva cerca de 8 minutos e muda de atividade antes de ficar repetitivo.','Uma missão curta muda de ação antes de ficar repetitiva.')

old="""function episodeSteps(){return [
 ()=>cold(episode.skills[0]),()=>micro(episode.skills[0]),()=>question(episode.skills[0],'apply'),()=>switchStep(episode.skills[1]),()=>question(episode.skills[1],'apply'),()=>flash(episode.skills[0]),()=>micro(episode.skills[2],true),()=>question(episode.skills[2],'boss'),()=>finishEpisode()
]}
function epProgress(){return Math.round((episode.step)/8*100)}"""
new="""function episodeSteps(){return [
 ()=>cold(episode.skills[0]),()=>micro(episode.skills[0]),()=>question(episode.skills[0],'apply'),()=>ruleTap(episode.skills[1]),()=>question(episode.skills[1],'apply'),()=>flash(episode.skills[0]),()=>question(episode.skills[2],'boss'),()=>finishEpisode()
]}
function epProgress(){return Math.round((episode.step)/7*100)}"""
if old not in s: raise SystemExit('episode steps not found')
s=s.replace(old,new)

old="""function epShell(inner){return `<section class="sheet fadein"><div class="epHead"><div><div class="oplabel">EPISÓDIO ${st.episodes+1}</div><h2>${esc(episode.skills[Math.min(episode.step<6?0:2,2)].subject)}</h2></div><div class="stepnum">${Math.min(episode.step+1,9)}/9</div></div><div class="bar"><i style="width:${epProgress()}%"></i></div><div class="cardline"></div>${inner}</section>`}"""
new="""function epShell(inner){let ix=episode.step<=2?0:episode.step<=4?1:episode.step===5?0:2;return `<section class="sheet fadein"><div class="epHead"><div><div class="oplabel">MISSÃO ${st.episodes+1}</div><h2>${esc(episode.skills[ix].subject)}</h2></div><div class="stepnum">${Math.min(episode.step+1,8)}/8</div></div><div class="bar"><i style="width:${epProgress()}%"></i></div><div class="cardline"></div>${inner}</section>`}"""
if old not in s: raise SystemExit('epshell not found')
s=s.replace(old,new)

s=s.replace('<p class="muted">Não precisa saber ainda. Primeiro tenta prever o caminho.</p><div class="row"><button class="btn primary big" onclick="RF.epNext()">Quero descobrir</button><button class="btn" onclick="RF.coldGuess()">Acho que sei</button></div>',
            '<p class="muted">Escolha rápido: tenta agora ou pega uma pista curta.</p><div class="row"><button class="btn primary big" onclick="RF.coldGuess()">⚡ TENTAR AGORA</button><button class="btn" onclick="RF.epNext()">Ver pista de 20s</button></div>')

old="""function switchStep(skill){return epShell(`<div class="oplabel">TROCA DE CANAL</div><div class="prompt">Antes de voltar ao primeiro assunto, vamos mudar o tipo de raciocínio.</div><span class="priority">${skill.tier} · ${esc(skill.subject)}</span><h3>${esc(skill.title)}</h3><p class="muted">Essa troca é proposital: o primeiro assunto vai voltar quando já tiver saído da memória de curto prazo.</p><button class="btn primary" onclick="RF.epNext()">Mudar agora</button>`)}"""
new="""function ruleTap(skill){let decoys=shuffle(SKILLS.filter(s=>s.id!==skill.id)).slice(0,2).map(s=>s.rule);let opts=shuffle([skill.rule,...decoys]);episode.ruleSkill=skill;episode.ruleOpts=opts;return epShell(`<div class="oplabel">TROCA RÁPIDA</div><span class="priority">${skill.tier} · ${esc(skill.subject)}</span><div class="prompt">Qual regra parece pertencer a <b>${esc(skill.title)}</b>?</div><div class="choices">${opts.map((x,i)=>`<button class="choice" onclick="RF.ruleAnswer(${i},this)">${esc(x)}</button>`).join('')}</div><div id="fb"></div>`)}
function ruleAnswer(i,btn){if(!episode||episode.ruleAnswered)return;episode.ruleAnswered=true;let skill=episode.ruleSkill,txt=episode.ruleOpts[i],ok=txt===skill.rule;document.querySelectorAll('.choice').forEach((b,j)=>{b.disabled=true;if(episode.ruleOpts[j]===skill.rule)b.classList.add('correct')});if(!ok)btn.classList.add('wrong');buzz(ok);let fb=document.getElementById('fb');fb.innerHTML=`<div class="feedback ${ok?'good':'bad'}"><b>${ok?'✓ É ESSA':'QUASE — GUARDA ESTA'}</b><div>${esc(skill.rule)}</div></div><div class="row" style="margin-top:12px"><button class="btn primary" onclick="RF.epNext()">Próximo</button></div>`}"""
if old not in s: raise SystemExit('switchStep not found')
s=s.replace(old,new)

old="""function questionHTML(skill,q,phase){let lbl=phase==='boss'?'BOSS — SEM DICA':phase==='preview'?'PREVISÃO':'APLICAÇÃO';let opts=shuffle(q.options);return `<div class="oplabel">${lbl}</div><span class="priority">${skill.tier} · ${esc(skill.title)}</span>${q.stim?`<div class="stim">${esc(q.stim)}</div>`:''}<div class="prompt">${esc(q.prompt)}</div><div class="choices">${opts.map((o,i)=>`<button class="choice" onclick="RF.answer('${skill.id}',${JSON.stringify(q).replace(/'/g,'&#39;')},${JSON.stringify(o.t).replace(/'/g,'&#39;')},'${phase}',this)">${String.fromCharCode(65+i)}) ${esc(o.t)}</button>`).join('')}</div><div id="fb"></div>`}
function answer(skillId,qObj,txt,phase,btn){if(episode&&episode.answered)return;let skill=BYID[skillId],q=qObj;let chosen=q.options.find(o=>o.t===txt),ok=!!chosen?.ok;if(episode)episode.answered=true;grade(skill,q,ok,phase==='flash'?'flash':phase);document.querySelectorAll('.choice').forEach(b=>{b.disabled=true;let o=q.options.find(x=>x.t===b.textContent.replace(/^[A-D]\\)\\s*/,''));if(o?.ok)b.classList.add('correct')});if(!ok)btn.classList.add('wrong');let fb=document.getElementById('fb');fb.innerHTML=`<div class="feedback ${ok?'good':'bad'}"><b>${ok?'✓ PEGOU O PADRÃO':'AINDA NÃO — O ERRO ESTÁ AQUI'}</b><div>${esc(q.explain)}</div>${!ok?`<div class="tiny muted" style="margin-top:7px">Ele vai voltar depois com outra superfície, não com esta mesma pergunta.</div>`:''}</div><div class="row" style="margin-top:12px"><button class="btn primary" onclick="RF.epNext()">Continuar</button></div>`;save()}"""
new="""function questionHTML(skill,q,phase){let lbl=phase==='boss'?'CHEFE — SEM DICA':phase==='preview'?'TENTATIVA A FRIO':'APLICAÇÃO';let opts=shuffle(q.options);episode.q=q;episode.renderOpts=opts;episode.skillId=skill.id;episode.phase=phase;return `<div class="oplabel">${lbl}</div><span class="priority">${skill.tier} · ${esc(skill.title)}</span>${q.stim?`<div class="stim">${esc(q.stim)}</div>`:''}<div class="prompt">${esc(q.prompt)}</div><div class="choices">${opts.map((o,i)=>`<button class="choice" onclick="RF.answerIndex(${i},this)">${String.fromCharCode(65+i)}) ${esc(o.t)}</button>`).join('')}</div><div id="fb"></div>`}
function buzz(ok){try{if(navigator.vibrate)navigator.vibrate(ok?25:[30,35,30])}catch(e){}}
function answerIndex(i,btn){if(!episode||episode.answered)return;let skill=BYID[episode.skillId],q=episode.q,phase=episode.phase,chosen=episode.renderOpts[i],ok=!!chosen?.ok;episode.answered=true;if(phase==='preview'&&ok)episode.skipIntro=true;grade(skill,q,ok,phase==='flash'?'flash':phase);document.querySelectorAll('.choice').forEach((b,j)=>{b.disabled=true;if(episode.renderOpts[j]?.ok)b.classList.add('correct')});if(!ok)btn.classList.add('wrong');buzz(ok);let fb=document.getElementById('fb');if(!fb)return;fb.innerHTML=`<div class="feedback ${ok?'good':'bad'}"><b>${ok?'✓ ACERTOU':'ERRO LOCALIZADO'}</b><div>${esc(q.explain)}</div>${!ok?`<div class="tiny muted" style="margin-top:7px">Vai voltar depois com outra situação.</div>`:''}</div><div class="row" style="margin-top:12px"><button class="btn primary" onclick="RF.epNext()">${phase==='preview'&&ok?'Pular explicação básica':'Continuar'}</button></div>`;save()}"""
if old not in s: raise SystemExit('question/answer block not found')
s=s.replace(old,new)

old="""<button class="btn" onclick="RF.flashChoices('${skill.id}',${JSON.stringify(q).replace(/'/g,'&#39;')})">Já pensei · mostrar opções</button>"""
new="""<button class="btn" onclick="RF.flashChoices('${skill.id}')">Já pensei · mostrar opções</button>"""
if old not in s: raise SystemExit('flash button not found')
s=s.replace(old,new)
s=s.replace("function flashChoices(id,q){episode.q=q;let skill=BYID[id];document.getElementById('rfMain').innerHTML=epShell(questionHTML(skill,q,'flash'));navState();window.scrollTo(0,0)}",
            "function flashChoices(id){let q=episode.q,skill=BYID[id];document.getElementById('rfMain').innerHTML=epShell(questionHTML(skill,q,'flash'));navState();window.scrollTo(0,0)}")

old="""function epNext(){if(!episode)return;episode.step++;if(episode.step>=9){view='home';episode=null;render();return}renderEpisode()}"""
new="""function epNext(){if(!episode)return;if(episode.step===0&&episode.skipIntro){episode.step=3}else{episode.step++}episode.ruleAnswered=false;if(episode.step>=8){view='home';episode=null;render();return}renderEpisode()}"""
if old not in s: raise SystemExit('epNext not found')
s=s.replace(old,new)

old="""let x=test.qs[test.i],q=x.q,opts=shuffle(q.options);main.innerHTML=`<section class="sheet fadein"><div class="epHead"><div><div class="oplabel">TESTE LIMPO</div><h2>${esc(x.skill.subject)}</h2></div><div class="stepnum">${test.i+1}/${test.n}</div></div><div class="bar"><i style="width:${test.i/test.n*100}%"></i></div>${q.stim?`<div class="stim">${esc(q.stim)}</div>`:''}<div class="prompt">${esc(q.prompt)}</div><div class="choices">${opts.map((o,i)=>`<button class="choice" onclick="RF.testAnswer(${JSON.stringify(o.t).replace(/'/g,'&#39;')})">${String.fromCharCode(65+i)}) ${esc(o.t)}</button>`).join('')}</div><p class="tiny muted">Sem feedback agora. Isso evita a falsa sensação de “aprendi porque acabei de ver”.</p></section>`;navState();window.scrollTo(0,0)}
function testAnswer(txt){let x=test.qs[test.i];x.chosen=txt;let ok=x.q.options.find(o=>o.t===txt)?.ok;grade(x.skill,x.q,!!ok,'test');if(test.i<test.n-1){test.i++;renderTest()}else{test.done=true;let score=test.qs.filter(y=>y.chosen&&y.q.options.find(o=>o.t===y.chosen)?.ok).length;st.lastTest={score,n:test.n,at:Date.now()};st.testHistory.unshift(st.lastTest);st.testHistory=st.testHistory.slice(0,20);save();renderTest()}}"""
new="""let x=test.qs[test.i],q=x.q,opts=shuffle(q.options);test.renderOpts=opts;main.innerHTML=`<section class="sheet fadein"><div class="epHead"><div><div class="oplabel">TESTE LIMPO</div><h2>${esc(x.skill.subject)}</h2></div><div class="stepnum">${test.i+1}/${test.n}</div></div><div class="bar"><i style="width:${test.i/test.n*100}%"></i></div>${q.stim?`<div class="stim">${esc(q.stim)}</div>`:''}<div class="prompt">${esc(q.prompt)}</div><div class="choices">${opts.map((o,i)=>`<button class="choice" onclick="RF.testAnswerIndex(${i})">${String.fromCharCode(65+i)}) ${esc(o.t)}</button>`).join('')}</div><p class="tiny muted">Marca e segue. A correção vem no fim.</p></section>`;navState();window.scrollTo(0,0)}
function testAnswerIndex(i){let x=test.qs[test.i],chosen=test.renderOpts[i];x.chosen=chosen.t;grade(x.skill,x.q,!!chosen.ok,'test');buzz(!!chosen.ok);if(test.i<test.n-1){test.i++;renderTest()}else{test.done=true;let score=test.qs.filter(y=>y.chosen&&y.q.options.find(o=>o.t===y.chosen)?.ok).length;st.lastTest={score,n:test.n,at:Date.now()};st.testHistory.unshift(st.lastTest);st.testHistory=st.testHistory.slice(0,20);save();renderTest()}}"""
if old not in s: raise SystemExit('test block not found')
s=s.replace(old,new)

old="window.RF={go,startEpisode,epNext,coldGuess,answer,flashChoices,flashForgot,startTest,testAnswer,redTab:redTabSet,newTheme,redDone};"
new="window.RF={go,startEpisode,epNext,coldGuess,answerIndex,ruleAnswer,flashChoices,flashForgot,startTest,testAnswerIndex,redTab:redTabSet,newTheme,redDone};"
if old not in s: raise SystemExit('RF api not found')
s=s.replace(old,new)

s=s.replace(".choice:hover{background:#f4ead8}",".choice:active{transform:scale(.985);background:#f4ead8}.choice{transition:transform .08s ease,background .12s ease}")

out=Path('cefet-trainer/app/src/main/assets/upgrade-v24.js')
out.write_text(s,encoding='utf-8')
print('patched',out,len(s))
