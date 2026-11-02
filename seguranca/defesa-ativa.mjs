#!/usr/bin/env node
// FAAAB DPT: contenção automática de cargos não autorizados, usando só Open Cloud.
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const sensitive=['changeRank','exileMembers','banMembers','spendGroupFunds','manageGroupUniverses','createApiKeys','manageApiKeys','manageAvatarItems','createAvatarItems'];
const numeric=x=>/^[0-9]+$/.test(String(x||''));
const userId=x=>/^users\/([0-9]+)$/.exec(String(x||''))?.[1]||null;
const membershipId=x=>/^groups\/([0-9]+)\/memberships\/([0-9]+)$/.exec(String(x||''));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export function validatePolicy(p) {
 if(!Array.isArray(p.groups)||!p.groups.length)throw Error('Grupos ausentes');
 const ids=new Set();
 for(const g of p.groups){
  if(!numeric(g.id)||!numeric(g.expectedOwnerId))throw Error('ID numerico de grupo ou dono nao preenchido');
  if(ids.has(String(g.id)))throw Error('Grupo duplicado'); ids.add(String(g.id));
  if(!Array.isArray(g.allowedAdminUserIds)||!g.allowedAdminUserIds.every(numeric)||!g.allowedAdminUserIds.map(String).includes(String(g.expectedOwnerId)))throw Error('Allowlist invalida: '+g.id);
  if(!Array.isArray(g.protectedRoleIds)||!g.protectedRoleIds.every(numeric))throw Error('protectedRoleIds invalido');
  if(typeof g.protectDangerousPermissions!=='boolean')throw Error('protectDangerousPermissions ausente');
  if(g.maxActionsPerScan!==undefined&&(!Number.isInteger(g.maxActionsPerScan)||g.maxActionsPerScan<1||g.maxActionsPerScan>100))throw Error('maxActionsPerScan fora do limite');
 }
}
export function createApi(key, request=fetch) {
 if(!key)throw Error('FAAAB_ROBLOX_API_KEY ausente');
 return async(method,route,body)=>{
  if(!route.startsWith('/cloud/v2/groups/'))throw Error('Rota nao autorizada');
  const res=await request('https://apis.roblox.com'+route,{method,signal:AbortSignal.timeout(12000),
   headers:{'x-api-key':key,Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},
   ...(body?{body:JSON.stringify(body)}:{})});
  if(!res.ok)throw Error('Open Cloud HTTP '+res.status+' '+method+' '+route.split('?')[0]);
  return res.status===204?{}:await res.json();
 };
}
async function list(api,route,field){
 const result=[];let token='',seen=new Set();
 for(let i=0;i<100;i++){
  const obj=await api('GET',route+(token?'&pageToken='+encodeURIComponent(token):''));
  if(!Array.isArray(obj[field]))throw Error('Formato de resposta invalido: '+field);
  result.push(...obj[field]); if(!obj.nextPageToken)return result;
  if(seen.has(obj.nextPageToken))throw Error('Paginacao repetida');
  seen.add(obj.nextPageToken);token=obj.nextPageToken;
 }
 throw Error('Paginacao incompleta, acao cancelada');
}
const owner=async(api,id)=>userId((await api('GET','/cloud/v2/groups/'+id)).owner);
const membersUrl=(id,filter)=>'/cloud/v2/groups/'+id+'/memberships?maxPageSize=100&filter='+encodeURIComponent(filter);
export async function scanGroup(g,{api,report=async()=>{},armed=false}){
 const id=String(g.id),expected=String(g.expectedOwnerId),allowed=new Set(g.allowedAdminUserIds.map(String));
 let actions=0,suspicious=0;
 const note=async(message)=>report('[FAAAB '+id+'] '+message+' https://www.roblox.com/communities/'+id);
 if(await owner(api,id)!==expected){
  await note('ALERTA: dono divergente; todas as mutacoes suspensas');
  return {actions,suspicious,ownerMismatch:true};
 }
 const roles=await list(api,'/cloud/v2/groups/'+id+'/roles?maxPageSize=100','groupRoles');
 const protectedPaths=new Set(g.protectedRoleIds.map(x=>'groups/'+id+'/roles/'+x));
 for(const role of roles){
  if(!role.path?.startsWith('groups/'+id+'/roles/'))continue;
  if(g.protectDangerousPermissions){
   if(role.permissions&&sensitive.some(p=>role.permissions[p]===true))protectedPaths.add(role.path);
   else if(!role.permissions)await note('Permissoes indisponiveis para '+role.path+'; insira em protectedRoleIds para proteger');
  }
 }
 const visible=new Set(roles.map(r=>r.path));
 for(const rolePath of protectedPaths){
  if(!visible.has(rolePath)){await note('Cargo protegido nao visivel: '+rolePath);continue;}
  const members=await list(api,membersUrl(id,"role == '"+rolePath+"'"),'groupMemberships');
  for(const m of members){
   const uid=userId(m.user),mid=membershipId(m.path);
   if(!uid||!mid||mid[1]!==id||!Array.isArray(m.roles)||!m.roles.includes(rolePath)){
    await note('Membro ou papeis com formato invalido: acao ignorada');continue;
   }
   if(allowed.has(uid)||uid===expected)continue;
   suspicious++;
   if(actions>=(g.maxActionsPerScan||10)){
    await note('LIMITE de contencoes por ciclo atingido');return {actions,suspicious,limited:true};
   }
   if(!armed){await note('SIMULACAO: cargo '+rolePath+' seria retirado de users/'+uid);continue;}
   if(await owner(api,id)!==expected){
    await note('Dono mudou durante a verificacao; contencao interrompida');
    return {actions,suspicious,ownerMismatch:true};
   }
   const updated=await list(api,membersUrl(id,"user == 'users/"+uid+"'"),'groupMemberships');
   const current=updated.find(x=>x.path===m.path&&x.user==='users/'+uid);
   if(!current||!Array.isArray(current.roles)||!current.roles.includes(rolePath))continue;
   await api('POST','/cloud/v2/groups/'+id+'/memberships/'+mid[2]+':unassignRole',{role:rolePath});
   actions++;
   await note('CONTENCAO EXECUTADA: cargo '+rolePath+' retirado de users/'+uid);
  }
 }
 return {actions,suspicious};
}
export async function cycle(p,{api,report,armed}){
 validatePolicy(p);const results=[];
 for(const g of p.groups){
  try{results.push({id:g.id,...await scanGroup(g,{api,report,armed})});}
  catch(e){await report('Erro no grupo '+g.id+': '+e.message+'; operacao suspensa');results.push({id:g.id,error:e.message});}
 }
 return results;
}
async function main(){
 const config=JSON.parse(await fs.readFile(process.env.FAAAB_DEFESA_CONFIG||'./seguranca/politica.json','utf8'));
 validatePolicy(config);
 const api=createApi(process.env.FAAAB_ROBLOX_API_KEY),armed=process.env.FAAAB_ARMED==='SIM';
 const webhook=process.env.FAAAB_DISCORD_WEBHOOK,alerts=new Map();
 const report=async message=>{
  console.error(new Date().toISOString(),message);
  if(!webhook)return;
  if(Date.now()-(alerts.get(message)||0)<120000)return;
  alerts.set(message,Date.now());
  try{
   const r=await fetch(webhook,{method:'POST',signal:AbortSignal.timeout(12000),
    headers:{'Content-Type':'application/json'},body:JSON.stringify({content:message.slice(0,1800),allowed_mentions:{parse:[]}})});
   if(!r.ok)console.error('Discord webhook HTTP',r.status);
  }catch(e){console.error('Erro de notificacao:',e.message);}
 };
 console.log('FAAAB DPT Defesa:',armed?'ARMADO':'SIMULACAO');
 do{
  await cycle(config,{api,report,armed});
  if(process.env.FAAAB_RUN_ONCE==='1')break;
  await sleep(Math.max(30000,Number(process.env.FAAAB_DEFESA_INTERVAL_MS||60000)));
 }while(true);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=1;});
