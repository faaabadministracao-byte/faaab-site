# AGENTS.md — FAAAB / Codex
Você está trabalhando no projeto **FAAAB** (Roblox, Discord e portal). Antes de editar qualquer coisa, leia integralmente:
**[docs/FAAAB_CODEX_ATUALIZACAO_2026-11-09.md](docs/FAAAB_CODEX_ATUALIZACAO_2026-11-09.md)**

## Prioridade de fontes
1. Decisões expressas mais recentes do usuário.
2. Especificação atualizada de 2026-11-09 acima.
3. Código, catálogo, arquivos e assets existentes (evidências do estado atual, não autorização para manter informação obsoleta).
4. Documentos anteriores, somente como histórico.
**Não converter sugestões anteriores do assistente em decisões aprovadas.** Quando faltar definição, escrever "A CONFIRMAR".

## Mudanças que precisam ser reconhecidas
- EB: 3 divisões, 9 brigadas, **C Op Esp** como comando independente em vez de Bda Op Esp; B Log Sl na Selva, não B Log Pqdt.
- EB: **Internato e Instrução Básica** substituem **Expedição Militar**; **EsAO** é escola, **CAO** é curso; **ECEME** é exclusivamente EB.
- EB: os arquivos antigos documentam três blocos de cursos ECEME. A menção posterior do usuário a quatro cursos ainda precisa ser reconciliada **sem inventar o quarto**.
- FAB: **PARACOM e ECDA rejeitados**; **EAS/PARA-SAR é uma única unidade**; organizar bases, grupos e esquadrões, não copiar brigadas do EB.
- FAB: **EAOAR** (Capitão→elegibilidade a Major); **ECEMAR** (CGAEM/CCEM/CPEA), sem promoções automáticas.
- Ensino: só criar centro se tiver utilidade real no jogo: carreira, ingresso em unidade, função ou atividade; distinguir subordinação administrativa de vínculo técnico-pedagógico.
- EGAF: hierarquia de setores, não escada genérica de escritório; siglas de cargos com **hífen e sem números**.
- MD, SGEx, SGM, SEFA e Taifas são órgãos diferentes, cada qual com permissões e jurisdição definidas.

## Segurança de migração
**Primeiro auditar, depois propor, parar e aguardar aprovação.** Não modificar por conta própria grupos Roblox, patentes, permissões, bots, banco de dados, promoções automáticas, modelos, roupas ou scripts. Não apagar assets sem inspecionar dependências.

Produza inicialmente:
1. Inventário do estado atual.
2. Diferenças entre catálogo e especificação atualizada.
3. Matriz \`ITEM | ORIGEM | DESTINO | AÇÃO | STATUS | DEPENDÊNCIAS\` (KEEP/MOVE/RENAME/REWORK/DEPRECATE).
4. Lista de divergências, itens rejeitados ainda presentes, quarta etapa ECEME não identificada.
5. Plano de mudanças e testes.
6. **Aguarde autorização para implementar.**

Patente, lotação, função, formação e permissão são conceitos diferentes. Toda subordinação e elegibilidade deve ser explícita no modelo de dados.