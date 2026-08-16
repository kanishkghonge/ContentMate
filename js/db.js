/**
 * Content OS for Doctors — Local-First IndexedDB Persistence Layer
 * Calm, fast, offline-first storage for doctor knowledge, notes, scripts & reels.
 */

const DB_NAME = 'DoctorContentOS_DB';
const DB_VERSION = 1;

let dbInstance = null;

export function openDatabase() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = (e) => {
      console.error('IndexedDB open error:', e.target.error);
      reject(e.target.error);
    };

    req.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      // 1. Profile Store (holds doctor settings & preferences)
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile');
      }

      // 2. Notes Store (lightweight thoughts)
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('by_created', 'created_at', { unique: false });
        noteStore.createIndex('by_archived', 'is_archived', { unique: false });
      }

      // 3. Insights Store (core clinical ideas)
      if (!db.objectStoreNames.contains('insights')) {
        const insightStore = db.createObjectStore('insights', { keyPath: 'id' });
        insightStore.createIndex('by_status', 'status', { unique: false });
        insightStore.createIndex('by_created', 'created_at', { unique: false });
      }

      // 4. Scripts Store (generated script cards for flashcard review)
      if (!db.objectStoreNames.contains('scripts')) {
        const scriptStore = db.createObjectStore('scripts', { keyPath: 'id' });
        scriptStore.createIndex('by_insight', 'insight_id', { unique: false });
        scriptStore.createIndex('by_status', 'status', { unique: false });
      }

      // 5. Scheduled Reels Store (Trial Reels & Main Reels on the calendar)
      if (!db.objectStoreNames.contains('scheduled_reels')) {
        const reelStore = db.createObjectStore('scheduled_reels', { keyPath: 'id' });
        reelStore.createIndex('by_insight', 'insight_id', { unique: false });
        reelStore.createIndex('by_date', 'scheduled_date', { unique: false });
        reelStore.createIndex('by_status', 'status', { unique: false });
        reelStore.createIndex('by_main_reel', 'is_main_reel', { unique: false });
      }
    };
  });
}

// Transaction Helper
async function performTx(storeName, mode, callback) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result = null;

    tx.oncomplete = () => resolve(result);
    tx.onerror = (e) => reject(e.target.error);

    try {
      result = callback(store);
    } catch (err) {
      reject(err);
    }
  });
}

// Default Doctor Profile
export const defaultDoctorProfile = {
  name: 'Dr. Sarah Chen',
  specialty: 'Cardiologist & Preventative Health',
  audience: 'Patients', // 'Patients' | 'Doctors' | 'Both'
  language: 'English', // 'English' | 'Hindi' | 'Hinglish' | 'Spanish'
  tone: 'Conversational & Empathetic', // 'Conversational' | 'Authoritative' | 'Friendly'
  cta: 'both', // 'caption' | 'comment' | 'both'
  reelLength: '45-60s',
  postingDays: ['Mon', 'Wed', 'Fri'], // Posting schedule
  sprinkleWindowDays: 14, // Uniform 2-week scheduling window by default
  maxPostsPerDay: 1, // Max posts per day limit
  sprinkleStrategy: 'uniform', // 'uniform' | 'front_loaded' | 'preferred_days'
  enableFilmingWorkflow: false, // Optional filming status workflow toggle
  missedPostRescheduleMode: 'manual', // 'manual' | 'auto'
  clinicName: 'Heart & Vascular Institute',
  website: 'drsarahchen.com',
  instagram: '@drsarahchen_md',
  onboarded: true
};


export const db = {
  // PROFILE
  async getProfile() {
    return performTx('profile', 'readonly', (store) => {
      return new Promise((resolve) => {
        const req = store.get('doctor_profile');
        req.onsuccess = () => resolve(req.result || { ...defaultDoctorProfile, onboarded: false });
      });
    });
  },

  async saveProfile(profile) {
    return performTx('profile', 'readwrite', (store) => {
      store.put(profile, 'doctor_profile');
    });
  },

  // NOTES (Lightweight thoughts)
  async getNotes() {
    return performTx('notes', 'readonly', (store) => {
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const notes = req.result || [];
          notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          resolve(notes);
        };
      });
    });
  },

  async addNote(note) {
    return performTx('notes', 'readwrite', (store) => {
      store.put(note);
    });
  },

  async updateNote(note) {
    return performTx('notes', 'readwrite', (store) => {
      store.put(note);
    });
  },

  async deleteNote(id) {
    return performTx('notes', 'readwrite', (store) => {
      store.delete(id);
    });
  },

  // INSIGHTS (Core clinical ideas)
  async getInsights() {
    return performTx('insights', 'readonly', (store) => {
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const items = req.result || [];
          items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          resolve(items);
        };
      });
    });
  },

  async getInsight(id) {
    return performTx('insights', 'readonly', (store) => {
      return new Promise((resolve) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
      });
    });
  },

  async saveInsight(insight) {
    return performTx('insights', 'readwrite', (store) => {
      store.put(insight);
    });
  },

  async deleteInsight(id) {
    // Delete insight and associated scripts
    await performTx('insights', 'readwrite', (store) => {
      store.delete(id);
    });
    const scripts = await this.getScriptsByInsight(id);
    for (const s of scripts) {
      await this.deleteScript(s.id);
    }
  },

  // SCRIPTS (Flashcard review queue)
  async getScripts() {
    return performTx('scripts', 'readonly', (store) => {
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
      });
    });
  },

  async getScriptsByInsight(insightId) {
    return performTx('scripts', 'readonly', (store) => {
      return new Promise((resolve) => {
        const index = store.index('by_insight');
        const req = index.getAll(insightId);
        req.onsuccess = () => resolve(req.result || []);
      });
    });
  },

  async getPendingReviewScripts() {
    return performTx('scripts', 'readonly', (store) => {
      return new Promise((resolve) => {
        const index = store.index('by_status');
        const req = index.getAll('pending_review');
        req.onsuccess = () => {
          const scripts = req.result || [];
          resolve(scripts);
        };
      });
    });
  },

  async saveScript(script) {
    return performTx('scripts', 'readwrite', (store) => {
      store.put(script);
    });
  },

  async saveScripts(scriptsArray) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('scripts', 'readwrite');
      const store = tx.objectStore('scripts');
      scriptsArray.forEach((script) => store.put(script));
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async updateScript(script) {
    return performTx('scripts', 'readwrite', (store) => {
      store.put(script);
    });
  },

  async deleteScript(id) {
    return performTx('scripts', 'readwrite', (store) => {
      store.delete(id);
    });
  },

  // SCHEDULED REELS (Trial Reels & Main Reels on Calendar)
  async getScheduledReels() {
    return performTx('scheduled_reels', 'readonly', (store) => {
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const items = req.result || [];
          items.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
          resolve(items);
        };
      });
    });
  },

  async getScheduledReel(id) {
    return performTx('scheduled_reels', 'readonly', (store) => {
      return new Promise((resolve) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
      });
    });
  },

  async saveScheduledReel(reel) {
    return performTx('scheduled_reels', 'readwrite', (store) => {
      store.put(reel);
    });
  },

  async saveScheduledReels(reelsArray) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('scheduled_reels', 'readwrite');
      const store = tx.objectStore('scheduled_reels');
      reelsArray.forEach((reel) => store.put(reel));
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async updateScheduledReel(reel) {
    return performTx('scheduled_reels', 'readwrite', (store) => {
      store.put(reel);
    });
  },

  async deleteScheduledReel(id) {
    return performTx('scheduled_reels', 'readwrite', (store) => {
      store.delete(id);
    });
  },

  // FULL EXPORT & IMPORT (Zero-loss JSON Backup)
  async exportFullDatabase() {
    const profile = await this.getProfile();
    const notes = await this.getNotes();
    const insights = await this.getInsights();
    const scripts = await this.getScripts();
    const scheduledReels = await this.getScheduledReels();

    return {
      appName: 'Content Mate',
      exportedAt: new Date().toISOString(),
      version: 1,
      profile,
      notes,
      insights,
      scripts,
      scheduledReels
    };
  },

  async importFullDatabase(data) {
    if (!data || !data.version) {
      throw new Error('Invalid backup file format');
    }

    if (data.profile) await this.saveProfile(data.profile);
    
    // Clear and restore notes
    if (Array.isArray(data.notes)) {
      for (const n of data.notes) await this.addNote(n);
    }

    // Clear and restore insights
    if (Array.isArray(data.insights)) {
      for (const i of data.insights) await this.saveInsight(i);
    }

    // Clear and restore scripts
    if (Array.isArray(data.scripts)) {
      await this.saveScripts(data.scripts);
    }

    // Clear and restore scheduled reels
    if (Array.isArray(data.scheduledReels)) {
      await this.saveScheduledReels(data.scheduledReels);
    }

    return true;
  },

  async resetAllData() {
    const database = await openDatabase();
    const stores = ['profile', 'notes', 'insights', 'scripts', 'scheduled_reels'];
    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const tx = database.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      });
    }
    // Clear localStorage
    localStorage.clear();

    // Save a clean blank doctor profile marked onboarded so demo data doesn't auto-populate
    await this.saveProfile({
      name: 'Doctor',
      specialty: 'Clinical Specialist',
      audience: 'Patients',
      language: 'English',
      tone: 'Conversational & Empathetic',
      cta: 'both',
      postingDays: ['Mon', 'Wed', 'Fri'],
      onboarded: true
    });
  },

  async clearAll() {
    return this.resetAllData();
  }
};
