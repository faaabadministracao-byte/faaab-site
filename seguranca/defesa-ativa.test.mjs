import test from 'node:test';
import assert from 'node:assert/strict';
import {scanGroup,validatePolicy,cycle} from './defesa-ativa.mjs';
const g={id:'922723164',expectedOwnerId:'100',allowedAdminUserIds:['100','200'],protectedRoleIds:[],protectDangerousPermissions:true,maxActionsPerScan:10};
function mock(opts={}){
 let writes=[];
 const api=async(method,url,body)=>{
  if(url==='/cloud/v2/groups/922723164')return {owner:opts.owner||'users/100'};
  if(url.includes('/roles?'))return {groupRoles:[{path:'groups/922723164/roles/99',permissions:opts.permissions||{changeRank:true}}]};
  if(url.includes('/memberships?')){
   const data=(opts.users||['200','333']).map(user=>({user:'users/'+user,path:'groups/922723164/memberships/'+user,roles:['groups/922723164/roles/99']}));
   if(url.includes('user%20%3D%3D'))return {groupMemberships:data.filter(x=>url.includes(encodeURIComponent(x.user)))};
   return {groupMemberships:data};
  }
  if(method==='POST'){writes.push({url,body});return {};}
  throw Error('Unexpected route '+url);
 };
 return {api,writes};
}
test('politica numerica obrigatoria',()=>assert.throws(()=>validatePolicy({groups:[{...g,expectedOwnerId:'texto'}]})));
test('modo simulação nao modifica',async()=>{
 const x=mock();const r=await scanGroup(g,{api:x.api,armed:false});
 assert.equal(r.suspicious,1);assert.equal(r.actions,0);assert.equal(x.writes.length,0);
});
test('modo armado revoga apenas cargo de nao autorizado',async()=>{
 const x=mock();const r=await scanGroup(g,{api:x.api,armed:true});
 assert.equal(r.actions,1);assert.equal(x.writes.length,1);
 assert.equal(x.writes[0].body.role,'groups/922723164/roles/99');
 assert.ok(x.writes[0].url.includes('/memberships/333:unassignRole'));
});
test('grupo com dono divergente nao escreve',async()=>{
 const x=mock({owner:'users/999'});const r=await scanGroup(g,{api:x.api,armed:true});
 assert.equal(r.ownerMismatch,true);assert.equal(x.writes.length,0);
});
test('cargo inocuo nao e retirado automaticamente',async()=>{
 const x=mock({permissions:{viewWallPosts:true}});const r=await scanGroup(g,{api:x.api,armed:true});
 assert.equal(r.actions,0);assert.equal(x.writes.length,0);
});
test('API falha sem acao cega',async()=>{
 const result=await cycle({groups:[g]},{api:async()=>{throw Error('HTTP 503')},report:async()=>{},armed:true});
 assert.equal(result[0].error,'HTTP 503');
});
