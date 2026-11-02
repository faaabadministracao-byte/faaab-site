# FAAAB — Defesa ativa de grupos Roblox

Este agente (Node.js >=20) é o módulo de CONTENÇÃO. Usa Open Cloud, não cookies Roblox.
Detecta membros não autorizados em cargos protegidos ou com permissões sensíveis e REMOVE AUTOMATICAMENTE os cargos via API oficial unassignRole (quando ARMADO e autorizado). Depois avisa.

Como implantar:
1. Copiar seguranca/politica.exemplo.json para seguranca/politica.json (não versionar), preenchendo os IDs numéricos verdadeiros de grupo, proprietário, cargos e administradores autorizados.
2. Guardar FAAAB_ROBLOX_API_KEY como segredo na hospedagem. A chave precisa dos escopos e direitos necessários para ver e retirar cargos INFERIORES aos da conta que a emitiu. Não publicar credenciais em GitHub, chat ou arquivos de site.
3. Executar FAAAB_RUN_ONCE=1 node seguranca/defesa-ativa.mjs para simular sem alterações.
4. Conferir a allowlist e testar usando conta de teste. Só então definir FAAAB_ARMED=SIM e executar node seguranca/defesa-ativa.mjs num serviço sempre ligado. Caso não esteja ARMADO, o script nunca escreve no Roblox.
5. Para notificações, configurar FAAAB_DISCORD_WEBHOOK como segredo separado. Rodar testes: node --test seguranca/defesa-ativa.test.mjs.

Garantias e limites:
- Impede apenas atribuições de cargos não autorizadas que a credencial do bot TENHA permissão para retirar.
- A versão inicial consulta grupos a cada 60 segundos (variável FAAAB_DEFESA_INTERVAL_MS). Não é bloqueio instantâneo na tela de login, nem garante superar um invasor rápido.
- Se o proprietário deixar de ser o esperado, o bot interrompe alterações e alerta.
- Se a API não mostrar as permissões de um cargo, liste o ID dele em protectedRoleIds. Se um cargo administrativo for criado com permissões omitidas, a defesa não pode assumir automaticamente que é perigoso.
- Protege a identidade do proprietário por allowlist, sem transferir propriedade e sem coletar sessão.
- NÃO acessa dispositivo, NÃO encerra login desconhecido, NÃO reivindica grupos e NÃO protege contra o roubo da conta proprietária ou da própria chave.
- Coloque as contas autorizadas dos chefes da DD e da equipe de confiança na allowlist; não confunda cargos pagos da DPT com permissões administrativas.
- Recomendamos autenticação forte/passkey e chave de segurança física para a conta dona.

Referências:
https://create.roblox.com/docs/cloud/reference/features/groups
https://create.roblox.com/docs/cloud/reference/scopes
https://create.roblox.com/docs/cloud/reference/patterns
