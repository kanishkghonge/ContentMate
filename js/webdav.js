import { db } from './db.js';

const KEY = 'contentmate.webdav.settings';
export function getWebDavSettings() { try { return { remoteFile: 'contentmate-backup.json', ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (_) { return { remoteFile: 'contentmate-backup.json' }; } }
export function saveWebDavSettings(value) { const next = { ...getWebDavSettings(), ...value }; localStorage.setItem(KEY, JSON.stringify(next)); return next; }
function directoryUrl(s) { const base = String(s.url || '').trim().replace(/\/+$/, ''); if (!base) throw new Error('Enter the WebDAV URL.'); return base; }
function url(s) { const base = directoryUrl(s); const file = String(s.remoteFile || s.filename || 'contentmate-backup.json').trim().replace(/^\/+/, ''); return `${base}/${file.split('/').map(encodeURIComponent).join('/')}`; }
async function request(s, method, body, target = url(s)) { if (!s.username || !s.password) throw new Error('Enter the WebDAV username and app password.'); try { const proxy = typeof location !== 'undefined' && location.protocol !== 'file:'; const response = await fetch(proxy ? '/api/webdav' : target, { method: proxy ? 'POST' : method, headers: proxy ? { 'Content-Type': 'application/json' } : { Authorization: `Basic ${btoa(`${s.username}:${s.password}`)}`, ...(method === 'PROPFIND' ? { Depth: '1' } : {}), ...(body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}) }, body: proxy ? JSON.stringify({ url: target, username: s.username, password: s.password, method, body }) : body, cache: 'no-store' }); if (!response.ok) throw new Error(`WebDAV ${method} failed (${response.status}).`); return response; } catch (e) { if (e instanceof TypeError) throw new Error('Could not reach WebDAV. For local file mode, start server.py and open http://127.0.0.1:8765.'); throw e; } }
export async function pushDatabase(s, backup) { await request(s, 'PUT', JSON.stringify(backup, null, 2)); }
export async function pullDatabase(s) { const data = await (await request(s, 'GET')).json().catch(() => null); if (!data || !data.version) throw new Error('The remote file is not a valid Content Mate backup.'); return data; }
export async function testWebDav(s) { await request(s, 'PROPFIND', null, directoryUrl(s)); }

// Public facade used by the app shell and Settings. WebDAV is optional: all
// callers only touch this facade when sync is explicitly configured.
export const WebDAVClient = {
  getConfig() { return getWebDavSettings(); },
  isConfigured() { const s = getWebDavSettings(); return Boolean(s.url && s.username && s.password); },
  saveConfig(value) { return saveWebDavSettings({ ...value, remoteFile: value.remoteFile || value.filename }); },
  clearConfig() { localStorage.removeItem(KEY); window.dispatchEvent(new CustomEvent('contentmate-webdav-status-change')); },
  async testConnection(config = getWebDavSettings()) { await testWebDav(config); return { message: 'Successfully connected to WebDAV server.' }; },
  async pushToCloud() { await pushDatabase(getWebDavSettings(), await db.exportFullDatabase()); return { message: 'Workspace uploaded successfully.' }; },
  async pullFromCloud() { const backup = await pullDatabase(getWebDavSettings()); await db.resetAllData(); await db.importFullDatabase(backup); return { found: true, message: 'Workspace downloaded successfully.' }; },
  async syncNow() { await this.pushToCloud(); return { action: 'pushed', message: 'Workspace synced successfully.' }; },
  scheduleAutoPush() {
    const config = getWebDavSettings();
    if (config.autoSync && this.isConfigured()) this.pushToCloud().catch((error) => console.warn('[WebDAV auto-sync]', error.message));
  }
};
