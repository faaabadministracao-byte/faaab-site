# FAAAB — Atualização de contexto para Codex
**Versão:** 2026-11-09  
**Alcance:** documentação de migração do projeto, portal, jogo Roblox e integração Discord.  
**Estado:** especificação para auditoria; não é ordem de implantação direta.

## 0. Regra de precedência e execução
1. A decisão mais recente do usuário tem prioridade sobre sugestões anteriores do assistente e catálogos desatualizados. Nunca converter propostas do assistente em decisão aprovada sem confirmação.
2. Diferenciar: **DEFINIDO** (decisão expressa do usuário), **ESTRUTURA PROPOSTA** (organização aceita como proposta, ainda não implementada), **A CONFIRMAR** (falta informação), **REJEITADO** (não reapresentar).
3. Antes de modificar o projeto, inventariar arquivos, unidades, cursos, assets, grupos e dependências; construir uma matriz de diferenças.
4. Para cada asset/entrada, produzir: **ITEM | ORIGEM ATUAL | DESTINO PROPOSTO | AÇÃO | STATUS | DEPENDÊNCIAS**, com AÇÃO em KEEP, MOVE, RENAME, REWORK, DEPRECATE ou DELETE-CANDIDATE.
5. **PARAR e pedir aprovação depois do relatório de auditoria.** Não editar no escuro grupos Roblox, permissões, bots, banco de dados, ranks, promoções automáticas ou arquivos de produção. Não excluir texturas/modelos antes de verificar referências.
6. O catálogo em \`portal/dados/catalogo.json\` e \`portal/dados/estrutura-detalhada.json\` ainda contém nomenclaturas antigas. Não tratá-las como decisões posteriores à presente especificação.

## 1. Conceito organizacional
Cadeia-base da FAAAB: **especialização → batalhão/unidade → brigada → divisão quando aplicável → força → Ministério da Defesa → governo → administração → desenvolvimento → criador**. Isto é um modelo de escalonamento do jogo, não uma autorização para interferência automática de uma instância sobre todas as outras. Exceções: comandos independentes, escolas, órgãos de inteligência e apoio não devem ser forçados a uma brigada.
Distinguir dados:
- **patente/graduação** (carreira do militar);
- **função/comando** (atribuição temporária);
- **lotação** (unidade onde serve);
- **qualificação/curso** (credencial, acesso);
- **grupo Roblox / cargo Discord** (controle de acesso).
Em siglas de cargos e patentes, preferir identificadores descritivos **com hífen e sem algarismos**, como \`[SUB-TEN]\`, \`[PRI-TEN]\`, \`[DIR-SET]\`. Não alterar automaticamente siglas oficiais de unidades numeradas como 1º GDA.

## 2. Exército (EB) — Divisões, brigadas e unidades
**ESTRUTURA PROPOSTA MAIS RECENTE — 3 divisões, 9 brigadas:**

### 1ª Divisão de Exército — tropas leves
- **Bda Inf Sl — Brigada de Infantaria de Selva:** BIS; 17º B Fron; **B Log Sl — Batalhão Logístico de Selva**.
- **Bda Inf Mth — Brigada de Infantaria de Montanha:** BIM.
- **Bda Inf Pqdt — Brigada de Infantaria Paraquedista:** BIP; Cia Prec Pqdt.
- **Bda Inf L Aeromóvel — Brigada de Infantaria Leve (Aeromóvel):** BIL.

### 3ª Divisão de Exército — tropas mecanizadas / motorizadas
- **Bda Inf Mec — Brigada de Infantaria Mecanizada:** BI Mec; BI Caat.
- **Bda C Mec — Brigada de Cavalaria Mecanizada:** RC Mec; BI Pan.
- **Bda Inf Mtz — Brigada de Infantaria Motorizada:** BI Mtz; B Log; GAC.

### 5ª Divisão de Exército — blindados
- **Bda Inf Bld — Brigada de Infantaria Blindada:** BIB; B Log Bld.
- **Bda C Bld — Brigada de Cavalaria Blindada:** RCC; RC Bld.

### Subordinação direta / de apoio
- **C Op Esp — Comando de Operações Especiais** (NÃO Brigada): BFE, BAC, B Op Psi. Vincular diretamente ao comando do EB na FAAAB.
- BPE e B Com: apoio/comando fora das brigadas.
- 1º RCG: unidade de guarda/cerimonial, sem forçar a brigada de cavalaria.
- Centros/escolas/CIE permanecem em cadeias específicas de ensino ou inteligência.

### EXCLUSÕES explícitas
- **REJEITADO:** B Log Pqdt — Batalhão Logístico Paraquedista.
- **REJEITADO:** B Log Mth — Batalhão Logístico de Montanha.
- **REJEITADO:** B Eng Sl — Batalhão de Engenharia de Selva.
- **REJEITADO:** B Eng Mec — Batalhão de Engenharia Mecanizado.
- **REJEITADO:** B Eng Bld — Batalhão de Engenharia Blindado.
- **REJEITADO:** tratar \`Bda Op Esp\` como brigada ativa; usar \`C Op Esp\`.
- **IMPORTANTE:** B Log Sl tinha sido rejeitado em versão anterior, mas foi **explicitamente reintegrado depois**, em substituição à logística paraquedista. A última decisão prevalece.
- Unidades novas BI Mec, RC Mec, BI Mtz, B Log Bld e RC Bld aparecem na proposta de organização: auditar existência de grupo/asset antes de criar.

## 3. Formação inicial do EB
**DEFINIDO:** substituir a antiga **Expedição Militar** por:
1. **Internato:** acolhimento, alojamento, rotina, identificação, convivência, reconhecimento das bases.
2. **Instrução Básica:** hierarquia, tratamento aos superiores, disciplina, ordem unida, uniformes, estrutura divisões/brigadas/batalhões, comunicações e avaliação.
A antiga Expedição era sobretudo passeio de apresentação; suas visitas podem ser reaproveitadas dentro do Internato. **Não manter Expedição como curso separado obrigatório**.
Fluxo planejado: **CAS → seleção de brigada com inscrições abertas → Recruta → Internato → Instrução Básica → Formação de Soldados da brigada → Soldado**. Não criar "Formação de Recrutas" paralela. O CAS não precisa de grupo Roblox próprio.
Cursos especializados como CIGS, CIOpC, CIOpMth, CIOPan, CIOpEsp, CI Pqdt GPB e CIBld devem desbloquear ingresso, habilitação ou atividades concretas; a qualificação não é patente.

## 4. Escolas, cursos e promoção EB
- **EsAO — Escola de Aperfeiçoamento de Oficiais**: destinada ao aperfeiçoamento dos Capitães; **habilitação para Capitão → Major** na FAAAB. **CAO é nome de curso, NÃO organização separada** no projeto.
- **ECEME — Escola de Comando e Estado-Maior do Exército**: formação superior de Estado-Maior e alto comando; conclusão não equivale a promoção automática.
- Os materiais anteriores da FAAAB documentam **três blocos principais**: **CP/CAEM** (Major → elegibilidade a Tenente-Coronel), **CAEM/CCEM** (Tenente-Coronel → elegibilidade a Coronel) e **CPEAEx** (Coronel → processo de generalato, com fase \`General em Treinamento\` antes de General de Brigada).
- **A CONFIRMAR:** o usuário menciona **quatro cursos da ECEME**, mas os documentos recuperados só especificam estes três blocos. Não inventar quarto, não inventar requisitos. Há referência ao CDEM em material descritivo, sem aprovação como quarta etapa de promoção.
- **General em Treinamento** é etapa própria da FAAAB, não posto oficial real. Promoção a General de Brigada requer seleção e autorização humana, não conclusão automática.
- Preservar as propostas antigas de ESG/CIG apenas como legado a auditar: não sobrescrever o fluxo atualizado da EsAO/ECEME com cursos anteriores de 2026-10-03 sem revisão.

## 5. FAB — organização operacional
**DEFINIDO:** remover \`PARACOM\` e \`ECDA\`; usuário afirmou que nunca pediu essas unidades. Não reconstruir em novos catálogos.
**EAS/PARA-SAR é uma unidade única**: Esquadrão Aeroterrestre de Salvamento, não "EAS" + "PARA-SAR" como dois grupos.
A FAB não copia divisões/brigadas/batalhões do EB. Organizar por comandos, **bases aéreas**, grupos e esquadrões. A implantação das nove bases foi **proposta**, não confirmada como compra de grupos Roblox.

### Proposta de seis bases operacionais principais
- **BAAN — Anápolis:** 1º GDA Jaguar; 1º/6º GAV Carcará; 2º/6º GAV Guardião; 1º GTT Zeus; 3º GDAAE; GSD da base.
- **BACO — Canoas:** 1º/14º GAV Pampa; 2º/7º GAV Phoenix; 1º GDAAE; GSD da base.
- **BASM — Santa Maria:** 1º/10º GAV Poker; 3º/10º GAV Centauro; 1º/12º GAV Hórus; 5º/8º GAV Pantera; GSD da base.
- **BACG — Campo Grande:** 3º/3º GAV Flecha; 1º/15º GAV Onça; 2º/10º GAV Pelicano; **EAS/PARA-SAR**; GSD da base.
- **BANT — Natal:** 1º/5º GAV Rumba; 2º/5º GAV Joker; 1º/8º GAV Falcão; 1º/11º GAV Gavião; 2º ETA Pastor.
- **BAGL — Galeão:** 1º/1º GT Gordo; 1º/2º GT Condor; 2º/2º GT Corsário.
**Expansão apenas proposta:** BAMN — Manaus, BAPV — Porto Velho, BASC — Santa Cruz.
Grupos/órgãos fora das bases: COMAE, DECEA, CIAER, SEFA, 1º GCC e estruturas aplicáveis; validar subordinações exatas, distinguindo lotação operacional de subordinação administrativa.
**GSD:** admitir suas subdivisões reais EPA, ESI, EFSd e, mediante confirmação de unidade, EADS; evitar grupo duplicado.

## 6. FAB — ensino que produz efeito no jogo
**CRITÉRIO DEFINIDO:** não criar escola apenas para distribuir certificados. Cada formação importante deve habilitar carreira, função, seleção ou ingresso em unidade.
- EFSd / CFSD: formação inicial de Soldado FAB.
- EEAR: formação dos sargentos/especialistas.
- EPCAR → AFA: carreira de oficiais aviadores.
- CIAAR: formação/adaptação de determinados quadros de oficiais.
- **EAOAR**: aperfeiçoamento, **Capitão → elegibilidade a Major**.
- **ECEMAR**: altos estudos da FAB; **CGAEM** (Major → elegibilidade a Tenente-Coronel), **CCEM** (Tenente-Coronel → elegibilidade a Coronel), **CPEA** (Coronel → processo seletivo para Brigadeiro).
- GITE: formação operacional relevante para os esquadrões de aviação.
- EAS/PARA-SAR: seleção e formação específicas para operações de salvamento/especiais; **CCFA é curso**, não organização independente.
- GSD: EFSd, EPA, ESI; defesa antiaérea: GDAAE.
- **DIRENS** é diretoria de ensino da FAB; ensino das escolas não significa que a DIRENS comande esquadrões operacionais.
- UNIFA, ITA, ILA, IPEV, colégios assistenciais, EAOAR, ECEMAR etc. foram discutidos. EAOAR e ECEMAR são **mantidas por decisão posterior**; não adicionar novas instituições opcionais sem utilidade concreta.
- Não criar "Brigadeiro em Treinamento" como nova patente. Pode existir **status de Candidato ao Generalato** após seleção, permanecendo Coronel até promoção autorizada.
- Respeitar a ordem correta dos oficiais-generais FAB: **Brigadeiro → Major-Brigadeiro → Tenente-Brigadeiro do Ar**. Marechal-do-Ar é especial, não promoção comum.
- Não inventar "Capitão-Sênior" na FAB.

## 7. Ensino EB e estruturas administrativas
- **DECEx**: Departamento de Educação e Cultura do Exército; **DESMil** e **DETMil** são diretorias reais.
- **DESMil:** EsPCEx, AMAN, EsAO, ECEME, ESFCEx, entre outros conforme estrutura escolar verificada.
- **DETMil:** ESA, EsSLog, outras escolas técnicas; centros CIGS, CIOpC, CIOpMth, CIOPan, CIOpEsp, CIBld, CI Pqdt GPB, CIOU podem ter **vínculos técnico-pedagógicos**, o que não deve ser confundido com subordinação administrativa direta.
- A FAAAB discutiu novas comunidades Roblox para DECEx, DESMil, DETMil, DIRENS e três Taifas; **planejamento não equivale a grupo adquirido**. Confirmar IDs reais antes de sincronizar permissões.
- Três Taifas: **TAI-EB**, **TAI-MB**, **TAI-FAB**, com carreiras e hierarquias próprias, não um órgão único.

## 8. Grupos e administração
Os dez grupos comprados anteriormente:
**CFN(MB), SEFA(FAB), SGEx(EB), SGM(MB), EGAF, BOPE(PM), CIAER(FAB), CIM(MB), CIE(EB), MD**.
Não inventar cargos administrativos reais; distinguir cargos comprovados, postos militares e funções próprias do jogo.
**EGAF**: setor da administração geral da FAAAB, não secretaria genérica. Progressão de setor: Auxiliar → Assistente → Agente → Analista → Supervisor → Coordenador → Vice-Diretor → Diretor → Líder dos Setores. Setores **SEP, DOC, EVC, SMP**. Criador, Sub-Criador e Desenvolvimento pertencem a blocos superiores separados. Abreviações propostas com hífen: \`[AUX-SET]\`, \`[ASS-SET]\`, \`[AGE-SET]\`, \`[ANA-SET]\`, \`[SUP-SET]\`, \`[COORD-SET]\`, \`[VIC-DIR-SET]\`, \`[DIR-SET]\`, \`[LID-SET]\`; não usar números nas siglas de cargos.
**SGEx (FAAAB):** oficiais podem solicitar/realizar promoções/rebaixamentos conforme competência; SGEx analisa e **autoriza ou nega** solicitações do EB. Não criar promoção irrestrita ou automática. Outras forças têm suas instâncias próprias (SGM, SEFA).
**MD (FAAAB):** agendas/eventos gerais, coordenação conjunta e casos interforças. Tickets administrativos ordinários do EB devem ir à SGEx. Sistema de painéis/categorias de tickets ainda é **proposta de UX**, não implantação aprovada. Agrupar problemas correlatos (patente ausente, promoção, rebaixamento, punição/recurso) sem dezenas de canais fixos.

## 9. Sistema Roblox, Discord e portal
- Roblox: unidades podem ter grupo individual **quando comprado de fato**, mas a existência de divisão/brigada/batalhão no organograma **não** prova que há grupo Roblox.
- Discord: grupos/servidores de brigadas e batalhões de acordo com disponibilidade. Permissões explícitas; cargos de comando não concedem poderes técnicos irrestritos.
- Site: separar **organização**, **curso**, **cargo**, **patente**, **função**, **lotação**, **permissão**, **requisito de ingresso**. Evitar árvore única rígida onde existam vínculos acadêmicos/operacionais distintos.
- Modelo sugerido: organizações têm \`id, sigla, nome, forca, tipo, status\`; relações possuem \`parentId, childId, relationType\` (ex.: comando, lotação, vínculo pedagógico); cursos separados com requisitos e consequências, SEM promoção automática.
- Preservar IDs estáveis; criar aliases e relatório de depreciação para \`Bda Op Esp\`, \`PARACOM\`, \`ECDA\` e \`Expedição Militar\`. Não remover referências antes de identificar dependências.
- Registrar origem de cada regra: **decisão do usuário**, **proposta do assistente**, **documento legado**, **referência militar externa**.
- O catálogo pode incluir organizações projetadas; interface deve exibir **planejado / ativo / a confirmar / rejeitado** sem fingir implementação.

## 10. Uniformes, instrutores e assets
A política anterior de fardas continua válida quando não contrariar as novas decisões:
**OPERACIONAL** (uniforme cotidiano da escola), **TREINAMENTO**, **FORMATURA**, **DESFILE** (promocional ou de formatura), **INSTRUTOR**, **INSTRUTOR FORMAL**, **DIREÇÃO/COMANDO**.
Não transformar patente adquirida em habilitação automática de instrutor.
Reaproveitar modelos, UVs, texturas e acessórios; preferir base institucional + patch para cursos menores. Não gerar famílias completas de uniforme sem necessidade.
Conferir cursos antigos da ESG e categorias visuais sem assumir que correspondem ao novo caminho de promoções. Proteger trabalho existente.

## 11. Entrega exigida do Codex — PRIMEIRA EXECUÇÃO
Produzir SOMENTE auditoria e planejamento, em ordem:
1. Arquivos e fontes encontrados (catálogos, scripts, manifests, assets, grupos configurados).
2. Tabela de decisões **DEFINIDO / PROPOSTA / A CONFIRMAR / REJEITADO**.
3. Árvore organizacional existente versus nova, com diffs de pai/filho.
4. Matriz de cursos e promoções com gates de elegibilidade; destacar quarto curso ECEME não identificado.
5. Matriz de migração de assets: **ASSET | CURSO ANTIGO | NOVO DESTINO | AÇÃO | REFERÊNCIAS**.
6. Lista de referências órfãs, nomes obsoletos, conflitos e novas unidades sem assets/grupos.
7. Plano de alterações em fases e testes, sem executar.
8. **PARAR para aprovação humana.**

## 12. Critérios mínimos de aceitação futuros
- Nove brigadas estão sob exatamente uma das três divisões na árvore proposta; **C Op Esp não é brigada**.
- B Log Sl presente na brigada de Selva; B Log Pqdt ausente.
- Siglas de cargos não usam números e usam hífens descritivos; nomes oficiais numerados de unidades permanecem intactos.
- Não aparecem PARACOM, ECDA, Expedição Militar ativa, CAO como organização separada, Bda Op Esp ativa.
- PARA-SAR e EAS não são duplicados.
- EAOAR e ECEMAR permanecem; ECEME não oferece cursos da MB/FAB.
- Graduação ≠ função ≠ qualificação; cursos não promovem automaticamente.
- Nenhum arquivo, grupo, bot, rank ou asset apagado sem inspeção de impacto e aprovação.

**Nota de integridade:** este documento consolida decisões de conversa de 2026-11-07 a 2026-11-09 com material de projeto anterior. Pontos não explicitamente aprovados são marcados como propostas e não devem ser implementados como fatos.