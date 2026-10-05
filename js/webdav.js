/**
 * Content Mate — WebDAV Storage & Sync Engine
 * Enables self-hosted cloud sync across multiple devices (Nextcloud, ownCloud, Caddy/Nginx WebDAV, NAS, etc.)
 * Works offline-first with IndexedDB and syncs seamlessly over standard WebDAV protocol.
 */

import { db } from './db.js';
import { showToast } from './utils.js';

const WEBDAV_STORAGE_KEY = 'contentmate_webdav_config';
const WEBDAV_SYNC_META_KEY = 'contentmate_webdav_sync_meta';

export const WebDAVClient = {
  /**
   * Retrieve saved WebDAV configuration
   */
  getConfig() {
    try {
      const raw = localStorage.getItem(WEBDAV_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || '',
        username: parsed.username || '',
        password: parsed.password || '',
        filename: parsed.filename || 'contentmate-data.json',
        autoSync: Boolean(parsed.autoSync)
      };
    } catch (e) {
      console.error('Failed to parse WebDAV config:', e);
      return null;
    }
  },

  /**
   * Save WebDAV configuration
   */
  saveConfig(config) {
    const cleanConfig = {
      url: (config.url || '').trim(),
      username: (config.username || '').trim(),
      password: config.password || '',
      filename: (config.filename || 'contentmate-data.json').trim() || 'contentmate-data.json',
      autoSync: Boolean(config.autoSync)
    };
    localStorage.setItem(WEBDAV_STORAGE_KEY, JSON.stringify(cleanConfig));
    window.dispatchEvent(new CustomEvent('contentmate-webdav-status-change', { detail: { isConfigured: this.isConfigured() } }));
    return cleanConfig;
  },

  /**
   * Clear WebDAV configuration
   */
  clearConfig() {
    localStorage.removeItem(WEBDAV_STORAGE_KEY);
    localStorage.removeItem(WEBDAV_SYNC_META_KEY);
    window.dispatchEvent(new CustomEvent('contentmate-webdav-status-change', { detail: { isConfigured: false } }));
  },

  /**
   * Check if WebDAV is configured
   */
  isConfigured() {
    const conf = this.getConfig();
    return Boolean(conf && conf.url && conf.url.startsWith('http'));
  },

  /**
   * Get sync metadata (last synced timestamp, etag, etc.)
   */
  getSyncMeta() {
    try {
      const raw = localStorage.getItem(WEBDAV_SYNC_META_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Save sync metadata
   */
  saveSyncMeta(meta) {
    localStorage.setItem(WEBDAV_SYNC_META_KEY, JSON.stringify({
      ...meta,
      savedAt: new Date().toISOString()
    }));
  },

  /**
   * Safe base64 encode for UTF-8 credentials
   */
  encodeAuth(user, pass) {
    const str = `${user}:${pass}`;
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return btoa(str);
    }
  },

  /**
   * Normalize WebDAV base directory URL
   */
  normalizeBaseUrl(url) {
    let clean = (url || '').trim();
    if (!clean) return '';
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    if (!clean.endsWith('/')) {
      clean += '/';
    }
    return clean;
  },

  /**
   * Build complete file URL
   */
  getFileUrl(config) {
    const baseUrl = this.normalizeBaseUrl(config.url);
    const filename = (config.filename || 'contentmate-data.json').replace(/^\/+/, '');
    return baseUrl + filename;
  },

  /**
   * Build authorization headers
   */
  getHeaders(config, extraHeaders = {}) {
    const headers = { ...extraHeaders };
    if (config.username || config.password) {
      const auth = this.encodeAuth(config.username || '', config.password || '');
      headers['Authorization'] = `Basic ${auth}`;
    }
    return headers;
  },

  /**
   * Test connection to WebDAV server
   */
  async testConnection(customConfig) {
    const config = customConfig || this.getConfig();
    if (!config || !config.url) {
      throw new Error('WebDAV URL is required.');
    }

    const baseUrl = this.normalizeBaseUrl(config.url);

    try {
      // Try PROPFIND first with depth 0 on the directory
      const propfindRes = await fetch(baseUrl, {
        method: 'PROPFIND',
        headers: this.getHeaders(config, {
          'Depth': '0',
          'Content-Type': 'application/xml; charset=utf-8'
        })
      });

      if (propfindRes.status === 401) {
        throw new Error('Authentication failed (401 Unauthorized). Please check your username and app password.');
      }

      if (propfindRes.status === 403) {
        throw new Error('Access forbidden (403 Forbidden). Ensure your account has permissions for this folder.');
      }

      if (propfindRes.ok || propfindRes.status === 207 || propfindRes.status === 405 || propfindRes.status === 404) {
        // Also verify or test the file endpoint
        return {
          success: true,
          status: propfindRes.status,
          message: 'Successfully connected to WebDAV server.'
        };
      }

      // Fallback: try GET / HEAD if PROPFIND method is disallowed by server
      const headRes = await fetch(baseUrl, {
        method: 'HEAD',
        headers: this.getHeaders(config)
      });

      if (headRes.ok || headRes.status === 401 || headRes.status === 403) {
        if (headRes.status === 401) throw new Error('Authentication failed (401 Unauthorized).');
        if (headRes.status === 403) throw new Error('Access forbidden (403 Forbidden).');
        return { success: true, status: headRes.status, message: 'Connected to server.' };
      }

      return {
        success: true,
        status: propfindRes.status,
        message: `Server responded with status ${propfindRes.status}`
      };
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Network error or CORS issue. If self-hosting, ensure your server allows CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods: PROPFIND, GET, PUT, OPTIONS, HEAD, DELETE, MKCOL).');
      }
      throw err;
    }
  },

  /**
   * Upload (Push) local workspace data to WebDAV server
   */
  async pushToCloud(customConfig) {
    const config = customConfig || this.getConfig();
    if (!config || !config.url) {
      throw new Error('WebDAV is not configured.');
    }

    const fileUrl = this.getFileUrl(config);
    const localData = await db.exportFullDatabase();
    
    // Add sync metadata to the backup payload
    const payload = {
      ...localData,
      _syncMeta: {
        syncedAt: new Date().toISOString(),
        client: 'ContentMate WebDAV Sync',
        version: 1
      }
    };

    const jsonString = JSON.stringify(payload, null, 2);

    try {
      const res = await fetch(fileUrl, {
        method: 'PUT',
        headers: this.getHeaders(config, {
          'Content-Type': 'application/json; charset=utf-8'
        }),
        body: jsonString
      });

      if (res.status === 401) {
        throw new Error('Authentication failed (401 Unauthorized). Check your WebDAV credentials.');
      }

      if (res.status === 403) {
        throw new Error('Access forbidden (403 Forbidden). Cannot write to WebDAV destination.');
      }

      if (res.status === 409 || res.status === 404) {
        // Parent collection may not exist; attempt MKCOL on base URL
        try {
          await fetch(this.normalizeBaseUrl(config.url), {
            method: 'MKCOL',
            headers: this.getHeaders(config)
          });
          // Retry PUT once
          const retryRes = await fetch(fileUrl, {
            method: 'PUT',
            headers: this.getHeaders(config, { 'Content-Type': 'application/json; charset=utf-8' }),
            body: jsonString
          });
          if (!retryRes.ok && retryRes.status !== 201 && retryRes.status !== 204) {
            throw new Error(`Upload failed with status ${retryRes.status}`);
          }
        } catch (mkcolErr) {
          throw new Error(`Upload failed: Directory might not exist (${res.status}).`);
        }
      } else if (!res.ok && res.status !== 201 && res.status !== 204) {
        throw new Error(`Upload failed with status ${res.status}: ${res.statusText}`);
      }

      const etag = res.headers.get('ETag') || null;
      this.saveSyncMeta({
        lastSync: new Date().toISOString(),
        lastSyncAction: 'push',
        etag: etag,
        itemsSynced: {
          notes: payload.notes?.length || 0,
          insights: payload.insights?.length || 0,
          scripts: payload.scripts?.length || 0,
          reels: payload.scheduledReels?.length || 0
        }
      });

      window.dispatchEvent(new CustomEvent('contentmate-webdav-synced', {
        detail: { action: 'push', timestamp: new Date().toISOString() }
      }));

      return {
        success: true,
        message: 'Successfully backed up local data to WebDAV cloud.'
      };
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Upload failed due to CORS or network error. Please verify server CORS configuration.');
      }
      throw err;
    }
  },

  /**
   * Download (Pull) remote workspace data from WebDAV server
   */
  async pullFromCloud(customConfig) {
    const config = customConfig || this.getConfig();
    if (!config || !config.url) {
      throw new Error('WebDAV is not configured.');
    }

    const fileUrl = this.getFileUrl(config);

    try {
      const res = await fetch(fileUrl, {
        method: 'GET',
        headers: this.getHeaders(config, {
          'Cache-Control': 'no-cache'
        })
      });

      if (res.status === 404) {
        return {
          found: false,
          message: 'No existing sync file found on WebDAV server. You can push your local workspace to create it.'
        };
      }

      if (res.status === 401) {
        throw new Error('Authentication failed (401 Unauthorized).');
      }

      if (res.status === 403) {
        throw new Error('Access forbidden (403 Forbidden).');
      }

      if (!res.ok) {
        throw new Error(`Failed to download remote data (${res.status} ${res.statusText}).`);
      }

      const rawText = await res.text();
      let parsedData;
      try {
        parsedData = JSON.parse(rawText);
      } catch (parseErr) {
        throw new Error('Remote file is not valid ContentMate JSON data.');
      }

      // Import into local database
      await db.importFullDatabase(parsedData);

      const etag = res.headers.get('ETag') || null;
      this.saveSyncMeta({
        lastSync: new Date().toISOString(),
        lastSyncAction: 'pull',
        etag: etag,
        itemsSynced: {
          notes: parsedData.notes?.length || 0,
          insights: parsedData.insights?.length || 0,
          scripts: parsedData.scripts?.length || 0,
          reels: parsedData.scheduledReels?.length || 0
        }
      });

      window.dispatchEvent(new CustomEvent('contentmate-webdav-synced', {
        detail: { action: 'pull', timestamp: new Date().toISOString() }
      }));

      return {
        found: true,
        success: true,
        data: parsedData,
        message: 'Successfully pulled and restored workspace from WebDAV cloud.'
      };
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Download failed due to CORS or network error.');
      }
      throw err;
    }
  },

  /**
   * Check remote file status without downloading entire payload
   */
  async checkRemoteStatus(customConfig) {
    const config = customConfig || this.getConfig();
    if (!config || !config.url) return null;

    const fileUrl = this.getFileUrl(config);

    try {
      const res = await fetch(fileUrl, {
        method: 'HEAD',
        headers: this.getHeaders(config, { 'Cache-Control': 'no-cache' })
      });

      if (res.status === 404) {
        return { exists: false };
      }

      if (res.ok) {
        return {
          exists: true,
          lastModified: res.headers.get('Last-Modified'),
          contentLength: res.headers.get('Content-Length'),
          etag: res.headers.get('ETag')
        };
      }

      return null;
    } catch {
      return null;
    }
  },

  /**
   * Smart Sync: compares local export date with remote and syncs appropriately
   */
  async syncNow() {
    const config = this.getConfig();
    if (!config || !config.url) {
      throw new Error('WebDAV is not configured.');
    }

    // Try pulling remote file first
    const fileUrl = this.getFileUrl(config);
    try {
      const res = await fetch(fileUrl, {
        method: 'GET',
        headers: this.getHeaders(config, { 'Cache-Control': 'no-cache' })
      });

      if (res.status === 404) {
        // Remote file does not exist yet -> push local data to create it
        const pushResult = await this.pushToCloud(config);
        return {
          action: 'created_remote',
          message: 'Initialized remote WebDAV storage with your local workspace.'
        };
      }

      if (!res.ok) {
        if (res.status === 401) throw new Error('WebDAV authentication failed.');
        throw new Error(`WebDAV sync failed (${res.status}).`);
      }

      const remoteData = await res.json();
      const localData = await db.exportFullDatabase();

      const remoteDate = new Date(remoteData.exportDate || remoteData._syncMeta?.syncedAt || 0).getTime();
      const localDate = new Date(localData.exportDate || 0).getTime();

      // If remote is newer (by more than 2 seconds), pull remote
      if (remoteDate > localDate + 2000) {
        await db.importFullDatabase(remoteData);
        this.saveSyncMeta({
          lastSync: new Date().toISOString(),
          lastSyncAction: 'pull',
          etag: res.headers.get('ETag')
        });
        return {
          action: 'pulled',
          message: 'Updated local workspace with newer data from WebDAV cloud.'
        };
      } else {
        // Local is same or newer -> push local changes to cloud
        await this.pushToCloud(config);
        return {
          action: 'pushed',
          message: 'Pushed latest local workspace changes to WebDAV cloud.'
        };
      }
    } catch (err) {
      throw err;
    }
  },

  /**
   * Debounced auto-sync scheduler for when data changes locally
   */
  _debounceTimer: null,
  scheduleAutoPush() {
    const config = this.getConfig();
    if (!config || !config.autoSync || !config.url) return;

    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }

    this._debounceTimer = setTimeout(async () => {
      try {
        console.log('[WebDAV] Auto-syncing local changes to cloud...');
        await this.pushToCloud();
      } catch (err) {
        console.warn('[WebDAV] Auto-sync background push failed:', err.message);
      }
    }, 5000); // 5-second debounce
  }
};
