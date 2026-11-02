# FAAAB — Sentinela de grupos Roblox (somente leitura)

Este módulo Node.js monitora **mudanças de propriedade** dos grupos e envia alertas via Discord. Faz consultas públicas a `groups.roblox.com`, sem senha, sem cookie Roblox, sem acesso a sessões e sem permissão para tomar grupos.

## Instalação

1. Instale Node.js 20 ou mais recente numa hospedagem de confiança que execute processos continuamente.
2. Copie `seguranca/grupos.exemplo.json` para `seguranca/grupos.json`.
3. Preencha o campo `expectedOwnerId` com o **ID numérico verificado** da conta dona de cada grupo. Não invente o ID. Repita a estrutura para os demais grupos FAAAB.
4. Configure a variável de ambiente `FAAAB_DISCORD_WEBHOOK` como segredo na hospedagem, caso queira mensagens. Não publique o webhook no GitHub.
5. Rode `node seguranca/monitor-grupos.mjs`. Para apenas uma verificação, use `FAAAB_RUN_ONCE=1` (PowerShell: `$env:FAAAB_RUN_ONCE='1'; node seguranca/monitor-grupos.mjs`).

O intervalo mínimo é 5 minutos. O arquivo `seguranca/estado-local.json` contém os IDs de proprietário observados; mantenha-o num volume persistente que não vá para o repositório.

**Segurança:** alertas não significam invasão comprovada; também podem refletir uma transferência autorizada. Uma pessoa responsável precisa verificar e decidir. O módulo **não** reivindica propriedade, altera patentes, encerra sessões, guarda cookies de login ou usa endpoints privados. O Roblox não fornece uma API pública suportada para uma blacklist de dispositivos com expulsão imediata.

**Resiliência:** falhas HTTP são registradas, mas não confundidas com perda de propriedade. A primeira leitura, quando não se conhece `expectedOwnerId`, cria apenas uma linha de base: ela não comprova que o proprietário seja legítimo.

## DD / DPT

A DD é a direção superior do desenvolvimento da FAAAB; a DPT executa os projetos. A conta reserva, se usada, deve ter identidade protegida, sem acesso administrativo automático nos 100+ grupos. Permissões são atribuídas pelo princípio do mínimo privilégio.

## Referências

- https://create.roblox.com/docs/cloud/reference/features/groups
- https://en.help.roblox.com/hc/pt-br/articles/14482664311060-Gest%C3%A3o-de-sess%C3%B5es
- https://en.help.roblox.com/hc/en-us/articles/46893852740500-Enhanced-Protection-Phishing-Resistant-Account-Security
