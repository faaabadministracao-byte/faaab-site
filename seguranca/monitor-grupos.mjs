#!/usr/bin/env node
/**
 * FAAAB — Sentinela de Propriedade dos Grupos Roblox
 * Só leitura: NÃO faz login, NÃO usa cookie .ROBLOSECURITY e NÃO altera grupos.
 * Node.js 20+. Hospedar em um processo confiável sempre ativo.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const CONFIG_FILE = process.env.FAAAB_GROUPS_CONFIG || path.resolve('seguranca/grupos.json');
const STATE_FILE = process.env.FAAAB_GROUPS_STATE || path.resolve('seguranca/estado-local.json');
const WEBHOOK = process.env.FAAAB_DISCORD_WEBHOOK || '';
const POLL_MS = Math.max(300000, Number(process.env.FAAAB_MONITOR_INTERVAL_MS || 300000));
const REQUEST_TIMEOUT = 12000;
let quitting = false;

async function jsonFile(filename, fallback) {
  try { return JSON.parse(await fs.readFile(filename, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
async function writeAtomic(filename, value) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  const temporary = filename + '.tmp';
  await fs.writeFile(temporary, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  await fs.rename(temporary, filename);
}
async function requestJSON(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT), headers: { 'Accept': 'application/json' } });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return response.json();
}
function ownerId(group) {
  const value = group?.owner?.userId ?? group?.owner?.id ?? null;
  return value == null ? null : String(value);
}
async function notify(message) {
  console.error('[ALERTA FAAAB]', message);
  if (!WEBHOOK) return;
  const response = await fetch(WEBHOOK, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: '🛡️ **FAAAB • Segurança**\n' + message.slice(0, 1750), allowed_mentions: { parse: [] } }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT)
  });
  if (!response.ok) console.error('Falha ao notificar Discord:', response.status);
}
async function checkGroup(entry, state) {
  const id = String(entry.id);
  if (!/^\d+$/.test(id)) throw new Error('ID inválido: ' + id);
  const group = await requestJSON('https://groups.roblox.com/v1/groups/' + id);
  if (group?.id && String(group.id) !== id) throw new Error('Resposta do grupo não corresponde ao ID: ' + id);
  const now = new Date().toISOString(), current = ownerId(group);
  const previous = state.groups[id] || null;
  const expected = entry.expectedOwnerId == null ? null : String(entry.expectedOwnerId);
  const reasons = [];
  if (!current) reasons.push('grupo aparentemente SEM PROPRIETÁRIO');
  if (expected && current !== expected) reasons.push('proprietário diferente do autorizado (' + expected + ' → ' + String(current) + ')');
  if (previous && previous.ownerId !== current) reasons.push('proprietário MUDOU desde a última consulta (' + String(previous.ownerId) + ' → ' + String(current) + ')');
  const fingerprint = reasons.join('; ');
  // Não reenviar o mesmo alerta indefinidamente; notificar novamente se o risco mudar.
  if (fingerprint && fingerprint !== previous?.lastAlert) {
    await notify('Grupo: ' + (entry.name || group?.name || id) + '\nID: ' + id + '\n' + fingerprint +
      '\nVerificar: https://www.roblox.com/communities/' + id);
  }
  state.groups[id] = { ownerId: current, checkedAt: now, lastAlert: fingerprint };
  console.log('[FAAAB]', now, id, 'proprietário:', current ?? 'nenhum', fingerprint ? 'ALERTA' : 'OK');
}
async function runOnce() {
  const config = await jsonFile(CONFIG_FILE, null);
  if (!config?.groups || !Array.isArray(config.groups) || config.groups.length === 0) {
    throw new Error('Configure seguranca/grupos.json com a lista de IDs de grupos.');
  }
  if (config.groups.length > 500) throw new Error('Máximo de 500 grupos por instância.');
  const state = await jsonFile(STATE_FILE, { version: 1, groups: {} });
  state.groups ||= {};
  for (const entry of config.groups) {
    try { await checkGroup(entry, state); }
    catch (err) { console.error('[FAAAB] Falha de consulta:', String(entry.id), err.message); }
    await writeAtomic(STATE_FILE, state);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
process.on('SIGINT', () => { quitting = true; });
process.on('SIGTERM', () => { quitting = true; });
try {
  do {
    await runOnce();
    if (!quitting && process.env.FAAAB_RUN_ONCE !== '1') {
      await new Promise(resolve => setTimeout(resolve, POLL_MS));
    }
  } while (!quitting && process.env.FAAAB_RUN_ONCE !== '1');
} catch (error) { console.error('[FAAAB] Não iniciado:', error.message); process.exitCode = 1; }
