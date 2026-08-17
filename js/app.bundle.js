/**
 * Content Mate — generated standalone bundle.
 * Generated from the ES module sources; supports direct file:// use.
 */

(function () {
  "use strict";

/* js/db.js */
/**
 * Content OS for Doctors — Local-First IndexedDB Persistence Layer
 * Calm, fast, offline-first storage for doctor knowledge, notes, scripts & reels.
 */

const DB_NAME = 'DoctorContentOS_DB';
const DB_VERSION = 1;

let dbInstance = null;

function openDatabase() {
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
const defaultDoctorProfile = {
  name: 'Dr. Sarah Chen',
  specialty: 'Cardiologist & Preventative Health',
  audience: 'Patients', // 'Patients' | 'Doctors' | 'Both'
  language: 'English', // English | Hinglish | Hindi | Marathi | Telugu | Kannada | Punjabi
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


const db = {
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

    // A reset returns to first-run onboarding with a clean workspace.
    await this.saveProfile({
      name: '',
      specialty: '',
      audience: 'Patients',
      language: 'English',
      tone: 'Conversational & Empathetic',
      cta: 'both',
      postingDays: ['Mon', 'Wed', 'Fri'],
      onboarded: false,
      tutorialSeen: false
    });
  },

  async clearAll() {
    return this.resetAllData();
  }
};


/* js/formats.js */
/**
 * Content OS for Doctors — Script Formats & Content Balancing Taxonomy
 * Easily extensible formats with archetype metadata for calendar balancing.
 */

const scriptFormats = [
  {
    id: 'talking_head',
    name: 'Talking Head',
    category: 'education',
    duration: '45s',
    icon: '🗣️',
    description: 'Direct-to-camera clinical tip with authoritative clarity and empathetic delivery.',
    promptInstruction: 'Write a direct-to-camera hook, 3 concise points, and a single clear takeaway.'
  },
  {
    id: 'patient_story',
    name: 'Patient Story',
    category: 'story',
    duration: '60s',
    icon: '🩺',
    description: 'Anonymized narrative: symptom discovery to diagnosis, treatment, and recovery.',
    promptInstruction: 'Start with the emotional patient presentation, reveal the hidden cause, and end with the clinical lesson.'
  },
  {
    id: 'myth_vs_fact',
    name: 'Myth vs Fact',
    category: 'myth_busting',
    duration: '45s',
    icon: '⚖️',
    description: 'Busting a common, dangerous medical misconception with evidence-based facts.',
    promptInstruction: 'Rapid-fire debunking of 2-3 persistent myths followed by the exact science in simple language.'
  },
  {
    id: 'qa',
    name: 'Q&A Consultation',
    category: 'education',
    duration: '40s',
    icon: '❓',
    description: 'Answering a question every patient asks in clinic using plain, jargon-free language.',
    promptInstruction: 'State the exact patient question as the hook, explain why it happens, and give actionable guidance.'
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard / Concept Breakdown',
    category: 'breakdown',
    duration: '60s',
    icon: '📋',
    description: 'Conceptual breakdown using a simple everyday analogy (plumbing, wiring, traffic).',
    promptInstruction: 'Use a vivid physical analogy to explain the underlying anatomy/physiology so anyone gets it immediately.'
  },
  {
    id: 'consultation_pov',
    name: 'Consultation POV',
    category: 'story',
    duration: '50s',
    icon: '👁️',
    description: 'Puts the viewer in the patient chair across the doctor desk, speaking to them directly.',
    promptInstruction: 'Speak directly to "you" as if sitting in the consult room discussing their latest test results or symptoms.'
  },
  {
    id: 'carousel',
    name: 'Step-by-Step Carousel',
    category: 'breakdown',
    duration: 'Slide-deck',
    icon: '📑',
    description: 'A 7-slide written guide with headline, concise body bullets, and final saveable summary.',
    promptInstruction: 'Format as Slide 1 (Hook), Slides 2-6 (Bite-sized points), Slide 7 (Summary + CTA).'
  },
  {
    id: 'podcast_clip',
    name: 'Podcast Conversation',
    category: 'conversational',
    duration: '50s',
    icon: '🎙️',
    description: 'Off-the-cuff, candid conversation about a controversial or overlooked clinical topic.',
    promptInstruction: 'Write as an unfiltered, thoughtful reflection on clinical practice that challenges conventional thinking.'
  },
  {
    id: 'interview',
    name: 'Doctor & Patient Interview',
    category: 'conversational',
    duration: '60s',
    icon: '👥',
    description: 'Dialogue format between an interviewer / patient and the doctor explaining the treatment.',
    promptInstruction: 'Host asks a probing question, doctor delivers the reassuring, evidence-based answer.'
  },
  {
    id: 'news_reaction',
    name: 'Medical News Reaction',
    category: 'myth_busting',
    duration: '45s',
    icon: '📰',
    description: 'Reacting to a trending health headline or viral social media fad with scientific reality.',
    promptInstruction: 'Cite the viral claim immediately, evaluate whether the science supports it, and give doctor advice.'
  }
];

function getFormatById(id) {
  return scriptFormats.find((f) => f.id === id) || {
    id,
    name: id,
    category: 'education',
    duration: '45s',
    icon: '💡',
    description: 'Clinical health content.'
  };
}


/* js/utils.js */
/**
 * Content OS for Doctors — Utility Helpers
 */

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function formatFullDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatDateForInput(dateOrString) {
  if (!dateOrString) return '';
  const d = new Date(dateOrString);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateOrString, days) {
  const d = new Date(dateOrString);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function getDaysDifference(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const diffTime = b.getTime() - a.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function formatRelativeDate(isoDate) {
  if (!isoDate) return '';
  const now = new Date();
  const d = new Date(isoDate);
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 14) {
    return formatDate(isoDate);
  } else if (diffDay >= 2) {
    return `${diffDay} days ago`;
  } else if (diffDay === 1) {
    return 'Yesterday';
  } else if (diffHour >= 1) {
    return `${diffHour}h ago`;
  } else if (diffMin >= 1) {
    return `${diffMin}m ago`;
  } else {
    return 'Just now';
  }
}

async function copyToClipboard(text) {
  if (!navigator.clipboard) {
    // Fallback for older contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Copied to clipboard!', 'success');
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      showToast('Copy failed. Please manually select.', 'error');
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard! Ready to paste into ChatGPT/Claude', 'success');
    return true;
  } catch (err) {
    console.error('Clipboard error:', err);
    showToast('Failed to copy. Please manually copy.', 'error');
    return false;
  }
}

function showToast(message, type = 'success', duration = 3200) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = '';
  if (type === 'success') {
    icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === 'error') {
    icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else {
    icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <span>${icon}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Vibration for tactile feel if supported
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  }, duration);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncateText(str, maxLen = 80) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen).trim() + '...';
}

// Simulated Time Travel Helpers (Testing)
let systemTimeOffsetDays = parseInt(localStorage.getItem('doctor_os_time_offset_days') || '0', 10);

function getSystemDate() {
  const d = new Date();
  if (systemTimeOffsetDays !== 0) {
    d.setDate(d.getDate() + systemTimeOffsetDays);
  }
  return d;
}

function getTimeShiftDays() {
  return systemTimeOffsetDays;
}

function setTimeShiftDays(days) {
  systemTimeOffsetDays = days;
  localStorage.setItem('doctor_os_time_offset_days', String(days));
  window.dispatchEvent(new Event('doctor-os-system-date-change'));
}

// Developer tools are intentionally session-only. They provide a light gate for
// demo/testing controls, not a security boundary for sensitive data.
const DEV_TOOLS_STORAGE_KEY = 'doctor_os_dev_tools_enabled';

function getDevToolsEnabled() {
  return sessionStorage.getItem(DEV_TOOLS_STORAGE_KEY) === 'true';
}

function setDevToolsEnabled(enabled) {
  if (enabled) {
    sessionStorage.setItem(DEV_TOOLS_STORAGE_KEY, 'true');
  } else {
    sessionStorage.removeItem(DEV_TOOLS_STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent('doctor-os-dev-tools-change', { detail: { enabled } }));
}


/* js/scheduler.js */
/**
 * Content OS for Doctors — Intelligent Auto-Scheduler
 * Balances content formats and medical topics across calendar days.
 * Uniformly sprinkles unposted scripts over 14 days (or doctor's configured window).
 */


/**
 * Returns an array of target posting dates starting from startDate,
 * matching the doctor's posting schedule (e.g. Mon/Wed/Fri or Daily).
 */
function getNextPostingDates(startDate, count, postingDays = ['Mon', 'Wed', 'Fri']) {
  const dates = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const allowAllDays = !postingDays || postingDays.length === 0 || postingDays.includes('Daily');

  let safetyCount = 0;
  while (dates.length < count && safetyCount < 365) {
    const dayName = dayNames[current.getDay()];

    if (allowAllDays || postingDays.includes(dayName)) {
      dates.push(formatDateForInput(current));
    }
    current.setDate(current.getDate() + 1);
    safetyCount++;
  }

  return dates;
}

/**
 * Intelligently interleaves scripts so adjacent dates have distinct formats and topics.
 */
function balanceContentQueue(items) {
  if (!items || items.length <= 1) return items;

  const remaining = [...items];
  const balanced = [];

  // Pick first item
  balanced.push(remaining.shift());

  while (remaining.length > 0) {
    const lastItem = balanced[balanced.length - 1];
    const lastFormat = lastItem.format;
    const lastCategory = getFormatById(lastFormat).category;
    const lastInsight = lastItem.insight_id;

    // Find best candidate: different topic, different format, different category
    let bestIdx = remaining.findIndex(
      (item) => item.insight_id !== lastInsight && item.format !== lastFormat && getFormatById(item.format).category !== lastCategory
    );

    // Fallback 1: different format
    if (bestIdx === -1) {
      bestIdx = remaining.findIndex((item) => item.format !== lastFormat);
    }

    // Fallback 2: different insight
    if (bestIdx === -1) {
      bestIdx = remaining.findIndex((item) => item.insight_id !== lastInsight);
    }

    // Fallback 3: take next available
    if (bestIdx === -1) {
      bestIdx = 0;
    }

    const [chosen] = remaining.splice(bestIdx, 1);
    balanced.push(chosen);
  }

  return balanced;
}

/**
 * Core Uniform Sprinkle Auto-Scheduling Routine
 * - Preserves posted, filmed (if enabled), locked, or past reels.
 * - Uniformly distributes all unposted, unlocked trial reels over the sprinkle window (default 14 days).
 * - Enforces max posts per day limit.
 */
async function recalculateFutureSchedule() {
  const profile = await db.getProfile();
  const allReels = await db.getScheduledReels();
  const todayStr = formatDateForInput(getSystemDate());

  const sprinkleWindowDays = profile.sprinkleWindowDays || 14;
  const maxPostsPerDay = profile.maxPostsPerDay || 1;
  const postingDays = profile.postingDays || ['Mon', 'Wed', 'Fri'];
  const strategy = profile.sprinkleStrategy || 'uniform';
  const enableFilming = profile.enableFilmingWorkflow === true;

  // 1. Separate FROZEN reels from MUTABLE reels
  // Frozen: already posted, strictly past date (< todayStr), locked, or filmed (if filming enabled)
  const frozenReels = allReels.filter((reel) => {
    const isPast = reel.scheduled_date < todayStr;
    const isPosted = reel.status === 'posted';
    const isFilmed = enableFilming && (reel.status === 'filmed' || reel.is_filmed);
    const isLocked = reel.is_locked === true;
    const isMainReel = reel.is_main_reel === true;

    return isPast || isPosted || isFilmed || isLocked || isMainReel;
  });

  // Count how many frozen posts exist on each date
  const postsCountByDate = {};
  frozenReels.forEach((r) => {
    if (r.scheduled_date) {
      postsCountByDate[r.scheduled_date] = (postsCountByDate[r.scheduled_date] || 0) + 1;
    }
  });

  // Mutable reels: unposted, unlocked, non-filmed reels on or after today
  const mutableReels = allReels.filter((reel) => {
    return !frozenReels.some((f) => f.id === reel.id);
  });

  if (mutableReels.length === 0) {
    return { updatedCount: 0, totalReels: allReels.length };
  }

  // 2. Interleave formats & topics for variety
  const balancedQueue = balanceContentQueue(mutableReels);

  // 3. Generate candidate open dates for the sprinkle window
  // Represent every available post slot, not just every available day. This is
  // essential when the doctor allows more than one post per day.
  const candidateDates = [];
  const rawDates = getNextPostingDates(getSystemDate(), Math.max(sprinkleWindowDays * 3, balancedQueue.length * 2), postingDays);

  for (const dateStr of rawDates) {
    const existingCount = postsCountByDate[dateStr] || 0;
    const openSlots = Math.max(0, maxPostsPerDay - existingCount);
    for (let slot = 0; slot < openSlots; slot++) {
      candidateDates.push(dateStr);
    }
    if (candidateDates.length >= Math.max(sprinkleWindowDays, balancedQueue.length * 3)) {
      break;
    }
  }

  // 4. Uniformly space posts across candidate dates
  const assignedDates = [];
  const totalPosts = balancedQueue.length;

  if (strategy === 'front_loaded' || totalPosts === 1 || candidateDates.length <= totalPosts) {
    // Fill first available open slots
    for (let i = 0; i < totalPosts; i++) {
      assignedDates.push(candidateDates[i] || candidateDates[candidateDates.length - 1]);
    }
  } else {
    // True UNIFORM SPRINKLE: Spreads totalPosts evenly across candidateDates over 2 weeks
    // Repeated dates only occur when that day genuinely has remaining capacity.
    const maxIndex = candidateDates.length - 1;
    const step = maxIndex / Math.max(1, totalPosts - 1 || 1);

    for (let i = 0; i < totalPosts; i++) {
      let targetIdx = Math.round(i * step);
      if (targetIdx > maxIndex) targetIdx = maxIndex;
      assignedDates.push(candidateDates[targetIdx]);
    }
  }

  // 5. Assign calculated dates to the balanced queue
  const updatedReels = balancedQueue.map((reel, idx) => {
    return {
      ...reel,
      scheduled_date: assignedDates[idx] || reel.scheduled_date || todayStr,
      updated_at: new Date().toISOString()
    };
  });

  // 6. Save back to IndexedDB
  await db.saveScheduledReels([...frozenReels, ...updatedReels]);

  return {
    updatedCount: updatedReels.length,
    totalReels: frozenReels.length + updatedReels.length
  };
}

/**
 * Moves only missed, ready-to-post trial reels into the next available slots.
 * Existing future plans stay where they are, so catching up never reshuffles
 * content the doctor has already planned or filmed.
 */
async function rescheduleMissedPosts() {
  const profile = await db.getProfile();
  const allReels = await db.getScheduledReels();
  const todayStr = formatDateForInput(getSystemDate());
  const maxPostsPerDay = profile.maxPostsPerDay || 1;
  const postingDays = profile.postingDays || ['Mon', 'Wed', 'Fri'];
  const enableFilming = profile.enableFilmingWorkflow === true;

  const missedReels = allReels.filter((reel) => {
    const isMissed = reel.scheduled_date < todayStr && reel.status === 'scheduled';
    const isFilmed = enableFilming && (reel.status === 'filmed' || reel.is_filmed);
    return isMissed && !reel.is_locked && !reel.is_main_reel && !isFilmed;
  });

  if (missedReels.length === 0) {
    return { rescheduledCount: 0, totalMissed: 0 };
  }

  const fixedReels = allReels.filter((reel) => !missedReels.some((missed) => missed.id === reel.id));
  const postsCountByDate = {};
  fixedReels.forEach((reel) => {
    if (reel.scheduled_date >= todayStr) {
      postsCountByDate[reel.scheduled_date] = (postsCountByDate[reel.scheduled_date] || 0) + 1;
    }
  });

  const candidateSlots = [];
  const rawDates = getNextPostingDates(getSystemDate(), 365, postingDays);
  for (const dateStr of rawDates) {
    const openSlots = Math.max(0, maxPostsPerDay - (postsCountByDate[dateStr] || 0));
    for (let slot = 0; slot < openSlots; slot++) candidateSlots.push(dateStr);
    if (candidateSlots.length >= missedReels.length) break;
  }

  const rescheduledReels = balanceContentQueue(missedReels).map((reel, index) => {
    const newDate = candidateSlots[index];
    if (!newDate) return reel;
    return {
      ...reel,
      scheduled_date: newDate,
      updated_at: new Date().toISOString(),
      rescheduled_at: new Date().toISOString()
    };
  });

  await db.saveScheduledReels([...fixedReels, ...rescheduledReels]);
  return { rescheduledCount: Math.min(candidateSlots.length, missedReels.length), totalMissed: missedReels.length };
}

/**
 * Creates a Trial Reel from an accepted script and triggers uniform sprinkle auto-scheduling.
 */
async function scheduleAcceptedScript(script) {
  const existingReels = await db.getScheduledReels();
  const duplicate = existingReels.find((r) => r.script_id === script.id);

  if (duplicate) {
    return duplicate;
  }

  const todayStr = formatDateForInput(getSystemDate());

  const newReel = {
    id: uuidv4(),
    script_id: script.id,
    insight_id: script.insight_id,
    title: script.title,
    format: script.format,
    hook: script.hook,
    script: script.script,
    cta: script.cta,
    estimated_duration: script.estimated_duration || '45s',
    scheduled_date: todayStr, // Will be uniformly positioned by recalculateFutureSchedule
    status: 'scheduled',
    is_locked: false,
    is_main_reel: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await db.saveScheduledReel(newReel);
  await recalculateFutureSchedule();

  return newReel;
}

/**
 * Adds a hand-written script straight to the publishing calendar. Manual
 * entries are pinned so a future Re-Sprinkle never changes the chosen date.
 */
async function scheduleManualScript({ title, script, scheduledDate, cta = '' }) {
  const newReel = {
    id: uuidv4(),
    script_id: null,
    insight_id: null,
    source: 'manual',
    title,
    format: 'Custom Script',
    hook: title,
    script,
    cta,
    estimated_duration: '',
    scheduled_date: scheduledDate,
    status: 'scheduled',
    is_locked: true,
    is_main_reel: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await db.saveScheduledReel(newReel);
  return newReel;
}

/**
 * Promotes a tested Trial Reel to a permanent Main Reel.
 */
async function promoteToMainReel(trialReelId) {
  const reel = await db.getScheduledReel(trialReelId);
  if (!reel) throw new Error('Reel not found');

  const profile = await db.getProfile();
  const nextDates = getNextPostingDates(getSystemDate(), 8, profile.postingDays || ['Mon', 'Wed', 'Fri']);
  // Place Main Reel 5-7 days out into prime slot
  const mainReelDate = nextDates[2] || nextDates[0];

  const mainReel = {
    id: uuidv4(),
    parent_trial_reel_id: reel.id,
    script_id: reel.script_id,
    insight_id: reel.insight_id,
    title: `⭐ [Main Reel] ${reel.title}`,
    format: reel.format,
    hook: reel.hook,
    script: reel.script,
    cta: reel.cta,
    estimated_duration: reel.estimated_duration,
    scheduled_date: mainReelDate,
    status: 'scheduled',
    is_locked: true,
    is_main_reel: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Mark original trial reel as winner
  reel.status = 'winner';
  reel.promoted_to_main_reel_id = mainReel.id;
  reel.is_main_reel_winner = true;

  await db.saveScheduledReel(reel);
  await db.saveScheduledReel(mainReel);
  await recalculateFutureSchedule();

  return mainReel;
}


/* js/sampleData.js */
/**
 * Content OS for Doctors — Realistic Clinical Sample Dataset
 * Enables instant 1-click testing of all workflows without manual typing.
 */


async function populateSampleDoctorWorkspace() {
  await db.clearAll();

  const todayStr = formatDateForInput(new Date());
  const threeDaysAgoStr = formatDateForInput(addDays(new Date(), -3));
  const yesterdayStr = formatDateForInput(addDays(new Date(), -1));
  const tomorrowStr = formatDateForInput(addDays(new Date(), 1));
  const threeDaysLaterStr = formatDateForInput(addDays(new Date(), 3));

  // 1. Doctor Profile
  await db.saveProfile({
    ...defaultDoctorProfile,
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiologist & Preventative Health',
    audience: 'Patients',
    language: 'English',
    tone: 'Conversational & Empathetic',
    cta: 'both',
    reelLength: '45-60s',
    postingDays: ['Mon', 'Wed', 'Fri'],
    clinicName: 'Heart & Vascular Institute',
    website: 'drsarahchen.com',
    instagram: '@drsarahchen_md',
    onboarded: true
  });

  // 2. Quick Clinical Notes
  await db.addNote({
    id: 'note-1',
    text: 'I should explain why high calcium score in younger patients is an opportunity, not a life sentence.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    is_archived: false
  });

  await db.addNote({
    id: 'note-2',
    text: 'Had a 42-year-old marathon runner with hidden coronary plaque today. Need to talk about athletic heart vs vascular risk.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    is_archived: false
  });

  await db.addNote({
    id: 'note-3',
    text: 'Need to make something debunking the myth that coconut oil cleans your arteries.',
    created_at: new Date().toISOString(),
    is_archived: false
  });

  // 3. Clinical Insights
  const insight1 = {
    id: 'insight-101',
    title: 'Why Normal Blood Pressure at 25 Does Not Guarantee Clean Arteries at 45',
    description: 'Vascular stiffness and ApoB cholesterol accumulation start decades before blood pressure monitors turn red.',
    supporting_points: '1. Standard cuff BP only measures macro vessel resistance.\n2. Endothelial micro-inflammation happens silently.\n3. Why early ApoB testing and lifestyle changes matter more than waiting for hypertension.',
    references: 'JACC 2024 preventative cardiology review on cumulative lifetime exposure.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: 'active'
  };

  const insight2 = {
    id: 'insight-102',
    title: 'Magnesium Taurate vs Glycinate for Heart Palpitations and Ectopic Beats',
    description: 'Patients are constantly confused by different magnesium chelates for cardiac rhythm stability.',
    supporting_points: '1. Taurine acts on calcium channels in myocardial cells.\n2. Glycinate is superior for sleep and anxiety-triggered PVCs.\n3. Dosages, timing, and kidney function cautions.',
    references: 'Clinical electrophysiology patient education protocol.',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    status: 'active'
  };

  const insight3 = {
    id: 'insight-103',
    title: 'The "Fit but Clogged" Paradox: Why Exercise Alone Does Not Erase Plaque',
    description: 'High VO2 max does not protect against family history of elevated Lp(a) or dietary inflammation.',
    supporting_points: '1. The heart is a muscle, but arteries are plumbing.\n2. High exercise capacity masks early symptoms.\n3. Coronary CT angiography for asymptomatic athletes.',
    references: 'Sports Cardiology Consensus 2023.',
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    status: 'active'
  };

  await db.saveInsight(insight1);
  await db.saveInsight(insight2);
  await db.saveInsight(insight3);

  // 4. Scripts in Review Queue (Insight 2 — ready to swipe in Flashcard review!)
  const reviewScripts = [
    {
      id: 'script-201',
      insight_id: 'insight-102',
      format: 'Talking Head',
      title: 'If Your Heart Skips a Beat at Night, Watch This',
      hook: 'If your heart ever does that weird flutter or flip-flop the second your head hits the pillow, stop scrolling.',
      script: 'In my cardiology clinic, 8 out of 10 patients with night palpitations are taking the wrong form of magnesium. Magnesium citrate draws water into your bowels, while Magnesium Taurate specifically calms myocardial excitability. Here are 3 signs you need taurate over glycinate...',
      cta: 'Read caption for my clinical breakdown and safe dosage guide.',
      estimated_duration: '45s',
      confidence: 9.6,
      status: 'pending_review',
      review_order: 0,
      created_at: new Date().toISOString()
    },
    {
      id: 'script-202',
      insight_id: 'insight-102',
      format: 'Patient Story',
      title: 'The 34-Year-Old Designer with 4,000 Extra Heartbeats a Day',
      hook: 'A 34-year-old came to my office convinced they were having daily heart attacks.',
      script: 'Their Holter monitor showed 4,000 premature ventricular contractions. Their ECG was normal, but their stress and cellular taurine levels were depleted. 4 weeks after switching to targeted cardiac electrolytes, their PVCs dropped by 85%. Here is the exact clinical lesson...',
      cta: 'Comment "HEART" and I\'ll DM you the patient checklist.',
      estimated_duration: '60s',
      confidence: 9.3,
      status: 'pending_review',
      review_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'script-203',
      insight_id: 'insight-102',
      format: 'Myth vs Fact',
      title: 'Stop Buying Generic Magnesium for Palpitations',
      hook: 'Myth: "All magnesium supplements are the same for your heart." Reality: Absolutely not.',
      script: 'Magnesium Oxide has only 4% absorption. Magnesium Glycinate is for brain and sleep. Magnesium Taurate is the only one bonded with taurine, which stabilizes heart rhythm membranes. Save your money and protect your heart.',
      cta: 'Save this video before your next pharmacy visit.',
      estimated_duration: '40s',
      confidence: 9.5,
      status: 'pending_review',
      review_order: 2,
      created_at: new Date().toISOString()
    }
  ];

  await db.saveScripts(reviewScripts);

  // 5. Scheduled Reels (Trial Reels & Feedback Due)
  const scheduledReels = [
    // Today's Scheduled Post (Ready to film or mark posted)
    {
      id: 'reel-301',
      script_id: 'script-101-a',
      insight_id: 'insight-101',
      title: 'Why Normal Blood Pressure at 25 is Deceptive',
      format: 'Talking Head',
      hook: 'Your blood pressure cuff can read 120/80 while your coronary arteries are quietly filling with plaque.',
      script: 'Blood pressure is a measure of vessel resistance today, not plaque accumulation over 20 years. If your family has early heart disease, ask your doctor for an ApoB and Lp(a) test before age 30.',
      cta: 'Read caption for the 3 tests that catch heart disease 10 years earlier.',
      estimated_duration: '45s',
      scheduled_date: todayStr,
      status: 'scheduled',
      is_locked: false,
      is_main_reel: false,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    // Past Posted Trial Reel (Posted 3 days ago — FEEDBACK DUE!)
    {
      id: 'reel-302',
      script_id: 'script-103-a',
      insight_id: 'insight-103',
      title: 'The "Fit but Clogged" Myth: Marathon Runners & Heart Plaque',
      format: 'Patient Story',
      hook: 'I just reviewed a CT scan of a 45-year-old marathon runner whose arteries looked like a 70-year-old smoker.',
      script: 'Running 20 miles a week gives you incredible lung capacity and muscle tone, but it cannot dissolve genetic cholesterol particles. If you are fit, don\'t skip preventative lipid panels.',
      cta: 'Comment "CHECK" for my preventative screening guide.',
      estimated_duration: '60s',
      scheduled_date: threeDaysAgoStr,
      status: 'posted',
      posted_date: threeDaysAgoStr,
      is_locked: true,
      is_main_reel: false,
      created_at: new Date(Date.now() - 3600000 * 96).toISOString()
    },
    // Upcoming Trial Reel 1
    {
      id: 'reel-303',
      script_id: 'script-101-b',
      insight_id: 'insight-101',
      title: '3 Silent Symptoms of High ApoB Cholesterol',
      format: 'Whiteboard / Concept Breakdown',
      hook: 'Your body rarely gives you warning sirens before vascular events, but watch for these 3 subtle cues.',
      script: 'Arterial walls have no pain sensors. That is why high cholesterol never hurts. Here is how lipid particles penetrate the endothelial wall using a simple plumbing analogy...',
      cta: 'Read caption for safe dietary protocols.',
      estimated_duration: '50s',
      scheduled_date: tomorrowStr,
      status: 'scheduled',
      is_locked: false,
      is_main_reel: false,
      created_at: new Date().toISOString()
    },
    // Upcoming Trial Reel 2
    {
      id: 'reel-304',
      script_id: 'script-101-c',
      insight_id: 'insight-101',
      title: 'Debunking the Top 3 Heart Health Myths',
      format: 'Myth vs Fact',
      hook: 'Myth 1: Eating fat clogs arteries overnight. Fact: Refined sugar and chronic endothelial inflammation do far more damage.',
      script: 'Myth 2: If you feel fine, your heart is fine. 50% of first heart attacks happen with zero prior symptoms. Myth 3: Salt is the only cause of high blood pressure.',
      cta: 'Share this with someone over 40.',
      estimated_duration: '45s',
      scheduled_date: threeDaysLaterStr,
      status: 'scheduled',
      is_locked: false,
      is_main_reel: false,
      created_at: new Date().toISOString()
    }
  ];

  await db.saveScheduledReels(scheduledReels);
  await recalculateFutureSchedule();
}


/* js/components/dashboard.js */
/**
 * Content OS for Doctors — Home Dashboard (The Doctor's Daily Action Center)
 * Zero analytics clutter. Shows only what requires immediate action today.
 */


const greetingBank = {
  morning: [
    'Good morning, Dr. {{name}}. Let\'s set a calm, focused pace for the day.',
    'Good morning, Dr. {{name}}. Your content plan is ready when you are.',
    'Good morning, Dr. {{name}}. A clear start makes today\'s work lighter.',
    'Good morning, Dr. {{name}}. Let\'s turn today\'s expertise into useful content.',
    'Good morning, Dr. {{name}}. Your next helpful post starts here.'
  ],
  afternoon: [
    'Good afternoon, Dr. {{name}}. Let\'s make a little progress between appointments.',
    'Good afternoon, Dr. {{name}}. Your content workspace is ready for the next step.',
    'Good afternoon, Dr. {{name}}. A few focused minutes can move the plan forward.',
    'Good afternoon, Dr. {{name}}. Let\'s keep today\'s content moving.',
    'Good afternoon, Dr. {{name}}. Pick up exactly where you left off.'
  ],
  evening: [
    'Good evening, Dr. {{name}}. Let\'s make today\'s final content decisions easy.',
    'Good evening, Dr. {{name}}. A quick review now keeps tomorrow clear.',
    'Good evening, Dr. {{name}}. Your day\'s content priorities are right here.',
    'Good evening, Dr. {{name}}. Let\'s wrap up today with one useful step.',
    'Good evening, Dr. {{name}}. Your plan is ready whenever clinic slows down.'
  ],
  night: [
    'Good night, Dr. {{name}}. Take one last look at tomorrow\'s content plan.',
    'Good night, Dr. {{name}}. A small step now can make tomorrow smoother.',
    'Good night, Dr. {{name}}. Your workspace has tomorrow\'s priorities waiting.',
    'Good night, Dr. {{name}}. Close the day with a clear content plan.',
    'Good night, Dr. {{name}}. Everything important for tomorrow is in one place.'
  ]
};

function getDashboardGreeting(date, name) {
  const hour = date.getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 22 ? 'evening' : 'night';
  const messages = greetingBank[timeOfDay];
  const greeting = messages[(date.getDate() + date.getMonth() * 3 + hour) % messages.length];
  return greeting.replace('{{name}}', name || 'Doctor');
}

function scriptViewerButton(reelId) {
  return `<button class="btn btn-sm btn-secondary btn-view-script" data-id="${reelId}">View Script</button>`;
}

const DashboardView = {
  async render(container, navigateTo, openModal) {
    const profile = await db.getProfile();
    const systemDate = getSystemDate();
    const todayStr = formatDateForInput(systemDate);
    const enableFilming = profile.enableFilmingWorkflow === true;

    // 1. Gather actionable items
    const allReels = await db.getScheduledReels();
    const pendingScripts = await db.getPendingReviewScripts();
    const allNotes = await db.getNotes();

    // A. Posts Scheduled for Today
    const todayPosts = allReels.filter(
      (r) => r.scheduled_date === todayStr && r.status !== 'posted' && r.status !== 'archived'
    );

    // B. Trial Reels Not Yet Shot (Filming queue - shown only if filming workflow is enabled)
    const filmingQueue = enableFilming
      ? allReels.filter((r) => r.status === 'scheduled' && !r.is_filmed).slice(0, 3)
      : [];
    const filmingToday = enableFilming
      ? allReels.filter((r) => r.scheduled_date === todayStr && r.status !== 'posted' && r.status !== 'archived' && !r.is_filmed).length
      : 0;

    // C. Posts That Were Missed (scheduled < today and unposted)
    // Anything scheduled in the past but not published must be surfaced—even
    // if it has been filmed—so it cannot quietly disappear from the workflow.
    const missedPosts = allReels.filter(
      (r) => r.scheduled_date < todayStr && r.status !== 'posted' && r.status !== 'archived' && r.status !== 'winner'
    );

    // D. Feedback Due (posted >= 3 days ago and no metrics logged yet)
    const feedbackDuePosts = allReels.filter((r) => {
      if (r.status !== 'posted' || r.is_main_reel_winner || r.feedback_logged) return false;
      const postDate = new Date(r.posted_date || r.scheduled_date);
      const diffDays = Math.floor((systemDate - postDate) / (1000 * 60 * 60 * 24));
      return diffDays >= 3;
    });

    // E. Promoted Main Reels awaiting scheduling
    const pendingMainReels = allReels.filter(
      (r) => r.is_main_reel && r.status === 'scheduled'
    );

    const activeNotes = allNotes.filter((n) => !n.is_archived).slice(0, 2);

    let html = `
      <div class="action-deck">

        <!-- Time-aware greeting and daily snapshot. Capture actions live in the header. -->
        <div class="card card-hero">
          <p class="dashboard-greeting-eyebrow">Today\'s workspace</p>
          <h2>${getDashboardGreeting(systemDate, profile.name)}</h2>
          <p>Here\'s what needs your attention today.</p>
          <div class="dashboard-daily-summary" aria-label="Today\'s content summary">
            <div class="dashboard-summary-item"><strong>${todayPosts.length}</strong><span>${todayPosts.length === 1 ? 'post scheduled' : 'posts scheduled'}</span></div>
            <div class="dashboard-summary-item"><strong>${pendingScripts.length}</strong><span>${pendingScripts.length === 1 ? 'script to review' : 'scripts to review'}</span></div>
            <div class="dashboard-summary-item"><strong>${feedbackDuePosts.length}</strong><span>${feedbackDuePosts.length === 1 ? 'performance update due' : 'performance updates due'}</span></div>
            ${enableFilming ? `<div class="dashboard-summary-item"><strong>${filmingToday}</strong><span>${filmingToday === 1 ? 'post to film today' : 'posts to film today'}</span></div>` : ''}
          </div>
        </div>
    `;

    // 1. Posts Scheduled for Today Card
    if (todayPosts.length > 0) {
      html += `
        <div class="action-card" style="border-left: 4px solid var(--accent-blue);">
          <div class="action-card-header">
            <span class="action-card-badge badge-blue">⚡ Scheduled For Today</span>
            <span style="font-size: 12px; color: var(--text-tertiary);">${formatDate(todayStr)}</span>
          </div>
          <h3 class="action-card-title">${todayPosts.length === 1 ? '1 Post to Publish Today' : `${todayPosts.length} Posts to Publish Today`}</h3>
          <p class="action-card-desc">Review your hook and mark as posted once published to social media.</p>

          <div class="today-item-list">
            ${todayPosts.map((post) => `
              <div class="today-item">
                <div class="today-item-info">
                  <div class="today-item-title">${post.is_main_reel ? '⭐ ' : ''}${post.title}</div>
                  <div class="today-item-meta">
                    <span>${post.format}</span>
                    <span>•</span>
                    <span>${post.estimated_duration}</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  ${scriptViewerButton(post.id)}
                  ${
                    enableFilming
                      ? `<button class="btn btn-sm btn-secondary btn-mark-filmed" data-id="${post.id}">
                          ${post.status === 'filmed' ? '✓ Filmed' : 'Mark Filmed'}
                        </button>`
                      : ''
                  }
                  <button class="btn btn-sm btn-primary btn-mark-posted" data-id="${post.id}">
                    Mark as Posted
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2. Scripts Waiting for Review Card (Flashcard swiper trigger)
    if (pendingScripts.length > 0) {
      html += `
        <div class="action-card" style="border-left: 4px solid var(--accent-amber);">
          <div class="action-card-header">
            <span class="action-card-badge badge-amber">🃏 Review Queue</span>
            <span style="font-size: 12px; font-weight: 600; color: var(--accent-amber);">${pendingScripts.length} Pending</span>
          </div>
          <h3 class="action-card-title">Scripts Waiting for Review</h3>
          <p class="action-card-desc">Swipe through scripts one card at a time. Accept, edit inline, or reject in under 30 seconds.</p>
          <div class="action-card-footer">
            <span style="font-size: 12.5px; color: var(--text-secondary);">Cards ready from recent AI imports</span>
            <button class="btn btn-primary btn-sm" id="dash-btn-start-review">
              <span>Start Review (${pendingScripts.length} left) →</span>
            </button>
          </div>
        </div>
      `;
    }

    // 3. Feedback Due Card (3-day post evaluation)
    if (feedbackDuePosts.length > 0) {
      html += `
        <div class="action-card" style="border-left: 4px solid var(--accent-purple);">
          <div class="action-card-header">
            <span class="action-card-badge badge-purple">📊 3-Day Performance Check</span>
            <span style="font-size: 12px; color: var(--accent-purple); font-weight: 600;">${feedbackDuePosts.length} Due</span>
          </div>
          <h3 class="action-card-title">Trial Reel Feedback Due</h3>
          <p class="action-card-desc">It's been 3 days since you posted. Enter your basic engagement to decide if this should become a permanent Main Reel.</p>

          <div class="today-item-list">
            ${feedbackDuePosts.map((post) => `
              <div class="today-item">
                <div class="today-item-info">
                  <div class="today-item-title">${post.title}</div>
                  <div class="today-item-meta">
                    <span>Posted ${formatRelativeDate(post.posted_date || post.scheduled_date)}</span>
                    <span>•</span>
                    <span>${post.format}</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  ${scriptViewerButton(post.id)}
                  <button class="btn btn-sm btn-primary btn-log-feedback" data-id="${post.id}">Log Feedback & Decide</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 4. Posts That Were Missed Card (Auto Reshuffle trigger)
    if (missedPosts.length > 0) {
      html += `
        <div class="action-card" style="border-left: 4px solid var(--accent-red);">
          <div class="action-card-header">
            <span class="action-card-badge badge-red">⚠️ Past Due</span>
            <span style="font-size: 12px; color: var(--accent-red); font-weight: 600;">${missedPosts.length} Missed</span>
          </div>
          <h3 class="action-card-title">Posts That Were Missed</h3>
          <p class="action-card-desc">Life in clinic gets busy. Reschedule these into open upcoming slots, or skip any post you no longer want to publish.</p>
          <div class="today-item-list">
            ${missedPosts.map((post) => `
              <div class="today-item">
                <div class="today-item-info">
                  <div class="today-item-title">${post.title}</div>
                  <div class="today-item-meta">Was due ${formatDate(post.scheduled_date)}</div>
                </div>
                <div class="flex gap-2" style="flex-wrap: wrap; justify-content: flex-end;">
                  ${scriptViewerButton(post.id)}
                  <input class="form-input missed-date-input" data-id="${post.id}" type="date" min="${todayStr}" value="${todayStr}" aria-label="New post date" style="width: 142px; padding: 6px 8px; font-size: 12px;" />
                  <button class="btn btn-sm btn-primary btn-reschedule-missed-date" data-id="${post.id}">Reschedule</button>
                  <button class="btn btn-sm btn-secondary btn-skip-missed" data-id="${post.id}">Skip</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="action-card-footer">
            <span style="font-size: 12.5px; color: var(--text-secondary);">${missedPosts.length} posts can be rescheduled</span>
            <button class="btn btn-danger btn-sm" id="dash-btn-auto-reshuffle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
              <span>Auto-Sprinkle All</span>
            </button>
          </div>
        </div>
      `;
    }

    // 5. Trial Reels Not Yet Shot (Filming Queue)
    if (filmingQueue.length > 0) {
      html += `
        <div class="action-card">
          <div class="action-card-header">
            <span class="action-card-badge badge-gray">🎥 Filming Queue</span>
            <span style="font-size: 12px; color: var(--text-tertiary);">Next Up</span>
          </div>
          <h3 class="action-card-title">Trial Reels Not Yet Shot</h3>
          <p class="action-card-desc">Ready to record between patient consultations? Keep these 45-second scripts handy.</p>

          <div class="today-item-list">
            ${filmingQueue.map((post) => `
              <div class="today-item">
                <div class="today-item-info">
                  <div class="today-item-title">${post.is_main_reel ? '⭐ ' : ''}${post.title}</div>
                  <div class="today-item-meta">
                    <span>${post.format}</span>
                    <span>•</span>
                    <span>Due ${formatDate(post.scheduled_date)}</span>
                  </div>
                </div>
                <button class="btn btn-sm btn-secondary btn-mark-filmed" data-id="${post.id}">
                  Mark Shot
                </button>
                ${scriptViewerButton(post.id)}
              </div>
            `).join('')}
          </div>
          <div class="action-card-footer">
            <span style="font-size: 12.5px; color: var(--text-secondary);">Auto-balanced across formats</span>
            <button class="btn btn-ghost btn-sm" id="dash-btn-view-schedule">View Full Calendar →</button>
          </div>
        </div>
      `;
    }

    // 6. Quick Notes Drawer Preview (if any)
    if (activeNotes.length > 0) {
      html += `
        <div class="action-card">
          <div class="action-card-header">
            <span class="action-card-badge badge-gray">💡 Recent Thoughts</span>
            <button class="btn btn-ghost btn-sm" id="dash-btn-view-notes">All Notes →</button>
          </div>
          <div class="today-item-list" style="margin-bottom: 0;">
            ${activeNotes.map((note) => `
              <div class="today-item">
                <div class="today-item-info">
                  <div class="today-item-title" style="font-weight: 500;">"${note.text}"</div>
                  <div class="today-item-meta">${formatRelativeDate(note.created_at)}</div>
                </div>
                <button class="btn btn-sm btn-secondary btn-convert-note" data-id="${note.id}">
                  Convert to Insight
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Zen state if all caught up
    if (todayPosts.length === 0 && pendingScripts.length === 0 && feedbackDuePosts.length === 0 && missedPosts.length === 0) {
      html += `
        <div class="action-card text-center" style="padding: 32px 20px; align-items: center;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--accent-green-subtle); color: var(--accent-green); display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary);">All Caught Up for Today!</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 380px; margin-top: 4px;">
            Your calendar is naturally balanced. Have a new clinical thought from your clinic rounds? Tap below.
          </p>
          <button class="btn btn-primary btn-sm" id="dash-zen-record-insight" style="margin-top: 16px;">
            Record a New Insight
          </button>
        </div>
      `;
    }

    html += `</div>`; // end action-deck
    container.innerHTML = html;

    // Attach Event Listeners
    document.getElementById('dash-zen-record-insight')?.addEventListener('click', () => openModal('insightCreate'));
    document.getElementById('dash-btn-start-review')?.addEventListener('click', () => navigateTo('review'));
    document.getElementById('dash-btn-view-schedule')?.addEventListener('click', () => navigateTo('schedule'));
    document.getElementById('dash-btn-view-notes')?.addEventListener('click', () => navigateTo('notes'));

    // Auto Reshuffle button
    document.getElementById('dash-btn-auto-reshuffle')?.addEventListener('click', async () => {
      const result = await rescheduleMissedPosts();
      showToast(
        result.rescheduledCount > 0
          ? `${result.rescheduledCount} missed post${result.rescheduledCount === 1 ? '' : 's'} rescheduled.`
          : 'No missed posts could be rescheduled.',
        result.rescheduledCount > 0 ? 'success' : 'info'
      );
      DashboardView.render(container, navigateTo, openModal);
    });

    container.querySelectorAll('.btn-skip-missed').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const reel = await db.getScheduledReel(e.currentTarget.dataset.id);
        if (!reel) return;
        reel.status = 'archived';
        reel.skipped_at = new Date().toISOString();
        await db.saveScheduledReel(reel);
        showToast('Missed post skipped.', 'info');
        DashboardView.render(container, navigateTo, openModal);
      });
    });

    container.querySelectorAll('.btn-reschedule-missed-date').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const dateInput = container.querySelector(`.missed-date-input[data-id="${id}"]`);
        const newDate = dateInput?.value;
        if (!newDate || newDate < todayStr) {
          showToast('Choose today or a future date.', 'error');
          return;
        }
        const reel = await db.getScheduledReel(id);
        if (!reel) return;
        reel.scheduled_date = newDate;
        reel.rescheduled_at = new Date().toISOString();
        reel.updated_at = new Date().toISOString();
        await db.saveScheduledReel(reel);
        showToast(`Rescheduled for ${formatDate(newDate)}.`, 'success');
        DashboardView.render(container, navigateTo, openModal);
      });
    });

    container.querySelectorAll('.btn-view-script').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const reel = await db.getScheduledReel(e.currentTarget.dataset.id);
        if (!reel?.script) {
          showToast('There is no script available for this reel.', 'info');
          return;
        }
        openModal('scriptDetail', { reel });
      });
    });

    // Mark Filmed buttons
    container.querySelectorAll('.btn-mark-filmed').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const reel = await db.getScheduledReel(id);
        if (reel) {
          reel.status = 'filmed';
          reel.is_filmed = true;
          await db.saveScheduledReel(reel);
          showToast('Marked as Filmed!', 'success');
          DashboardView.render(container, navigateTo, openModal);
        }
      });
    });

    // Mark Posted buttons
    container.querySelectorAll('.btn-mark-posted').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const reel = await db.getScheduledReel(id);
        if (reel) {
          reel.status = 'posted';
          reel.posted_date = formatDateForInput(new Date());
          await db.saveScheduledReel(reel);
          showToast('Marked as Posted! 3-day feedback timer started.', 'success');
          DashboardView.render(container, navigateTo, openModal);
        }
      });
    });

    // Log Feedback buttons
    container.querySelectorAll('.btn-log-feedback').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openModal('trialFeedback', { reelId: id });
      });
    });

    // Convert Note buttons
    container.querySelectorAll('.btn-convert-note').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const notes = await db.getNotes();
        const note = notes.find((n) => n.id === id);
        if (note) {
          openModal('insightCreate', { prefillTitle: note.text, noteId: note.id });
        }
      });
    });
  }
};


/* js/components/notes.js */
/**
 * Content OS for Doctors — Quick Notes System
 * Instant, lightweight thoughts with 1-tap conversion to full clinical Insights.
 */


const NotesView = {
  async render(container, navigateTo, openModal) {
    const notes = await db.getNotes();
    const activeNotes = notes.filter((n) => !n.is_archived);

    let html = `
      <div class="action-deck">
        <div class="card">
          <h2 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; margin-bottom: 6px;">
            Clinical Thoughts & Scratchpad
          </h2>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 16px;">
            Got an idea during patient rounds? Capture it in 5 seconds. When you have downtime, tap <strong>Convert to Insight</strong> to generate your AI prompt pack.
          </p>

          <form id="form-quick-note" class="flex flex-col gap-2">
            <textarea
              id="input-note-text"
              class="form-textarea"
              placeholder="e.g. I should explain Vitamin D deficiency vs active calcitriol... or Had a patient with thyroid brain fog today."
              rows="3"
              required
            ></textarea>
            <div class="flex justify-between items-center" style="margin-top: 4px;">
              <span style="font-size: 12px; color: var(--text-tertiary);">Saves locally & instantly</span>
              <button type="submit" class="btn btn-primary btn-sm">
                <span>Save Quick Thought</span>
              </button>
            </div>
          </form>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 0 4px;">
          <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary);">
            Saved Thoughts (${activeNotes.length})
          </span>
        </div>
    `;

    if (activeNotes.length === 0) {
      html += `
        <div class="card text-center" style="padding: 36px 20px;">
          <p style="font-size: 14px; color: var(--text-tertiary);">No pending thoughts. Record your first clinical spark above!</p>
        </div>
      `;
    } else {
      html += `
        <div class="flex flex-col gap-3">
          ${activeNotes.map((note) => `
            <div class="action-card" style="padding: 16px;">
              <div style="font-size: 15px; color: var(--text-primary); line-height: 1.45; margin-bottom: 12px; font-weight: 500;">
                "${escapeHtml(note.text)}"
              </div>
              <div class="action-card-footer" style="padding-top: 10px; margin-top: 0;">
                <span style="font-size: 12px; color: var(--text-tertiary);">${formatRelativeDate(note.created_at)}</span>
                <div class="flex gap-2">
                  <button class="btn btn-ghost btn-sm btn-delete-note" data-id="${note.id}" style="color: var(--text-tertiary);">
                    Delete
                  </button>
                  <button class="btn btn-accent btn-sm btn-convert-note-view" data-id="${note.id}">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span>Convert to Insight</span>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Form Submission
    document.getElementById('form-quick-note')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const textInput = document.getElementById('input-note-text');
      const val = textInput.value.trim();
      if (!val) return;

      const newNote = {
        id: uuidv4(),
        text: val,
        created_at: new Date().toISOString(),
        is_archived: false
      };

      await db.addNote(newNote);
      showToast('Quick thought saved!', 'success');
      textInput.value = '';
      NotesView.render(container, navigateTo, openModal);
    });

    // Delete Note
    container.querySelectorAll('.btn-delete-note').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        await db.deleteNote(id);
        showToast('Note deleted', 'success');
        NotesView.render(container, navigateTo, openModal);
      });
    });

    // Convert Note to Insight
    container.querySelectorAll('.btn-convert-note-view').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const note = activeNotes.find((n) => n.id === id);
        if (note) {
          openModal('insightCreate', { prefillTitle: note.text, noteId: note.id });
        }
      });
    });
  }
};


/* js/prompt.js */
/**
 * Content OS for Doctors — Prompt Generator Engine
 * Keeps the JSON contract locked while allowing doctors to tune writing direction.
 */

function escapeJsonString(value) {
  return JSON.stringify(String(value ?? '')).slice(1, -1);
}

// This is the only prompt section exposed in Settings. The surrounding prompt
// owns data injection and JSON safety, so user edits cannot break importing.
const DEFAULT_WRITING_INSTRUCTIONS = String.raw`1. Start with the clinical insight, but do not just explain it. Find the most interesting way to frame it so the viewer sees it differently. Look for a misconception, surprising consequence, hidden detail, contradiction, diagnostic mystery, patient misunderstanding, something the doctor notices that the patient does not, or a mechanism that can be made visual. Find the best angle, not a summary.

2. Create 3–4 genuinely different script ideas when the topic supports them. They must not be the same script with different wording. Change the angle, opening, story structure, curiosity mechanism, reveal, and viewer perspective. If there are only 2 strong ideas, return 2. Do not force a fourth script.

3. Make the viewer curious before giving them the answer. Start with a question, tension, observation, or clinical moment that makes the viewer wonder what happened or what the doctor means. Do not give away the whole point immediately. Never open with generic lines such as Today we are going to talk about.

4. Keep creating small information gaps throughout the script. The viewer should understand what is happening without being able to predict exactly what comes next. A useful flow is: interesting statement, question, partial explanation, complication, deeper question, reveal, payoff. Every beat should answer a question, create a new one, introduce a contradiction, or raise the stakes.

5. Think like the viewer. At every major beat, ask what the viewer expects to happen next, then make the next beat slightly more interesting or unexpected without becoming confusing. Gently disrupt their prediction through real clinical reasoning.

6. Make the hook sound like a real doctor, not a social-media marketer. Do not use manufactured drama such as This will shock you, You will not believe this, Doctors do not want you to know, or This changes everything. Curiosity must come from the actual clinical situation.

7. Prioritise real clinical detail over generic health advice. Explain what the body is doing, what a test measures and misses, why a symptom occurs, why a treatment works or fails, why a doctor makes a decision, or what changes the diagnosis. Medical depth should make the story more interesting, not merely technical. Do not invent facts, statistics, outcomes, diagnoses, or certainty not supported by the supplied insight.

8. Use concrete examples sparingly. One vivid clinical situation is usually stronger than several weak examples.

9. Choose or invent the format that best fits the idea; do not default to talking head. A patient story, case breakdown, report or scan breakdown, Q&A, demonstration, whiteboard, doctor-patient conversation, myth-versus-reality, reframe, or another format may be best. The format serves the angle. Put the format name you choose in the format field.

10. Internally build each script as: hook, curiosity, context, complication, clinical reveal, payoff, CTA. Do not label these sections in the final spoken script.

11. Add [Visual Cue], [Pacing], or [On-Screen Text] only when it improves filming or understanding. Do not add a direction to every sentence.

12. End by resolving the curiosity created at the beginning, then move naturally into the required CTA. Keep the spoken content tight enough to fit the selected duration and write naturally in the selected language.`;

const LOCKED_PROMPT_TEMPLATE = String.raw`You are a medical copywriter and clinical storyteller for doctor-created short videos.

Create an accurate, high-retention script pack from the clinical insight below.

DOCTOR AND VIDEO SETTINGS
- Doctor: {{doctor_name}}
- Specialty: {{specialty}}
- Audience: {{audience}}
- Write the spoken content in: {{language}}
- Tone: {{tone}}
- Target duration for every video: {{reel_length}}
- Required CTA: {{selected_cta}}

CLINICAL INSIGHT
- Title: {{insight_title}}
- Details: {{insight_details}}
- Extra context: {{additional_context}}

WRITING INSTRUCTIONS
{{writing_instructions}}

JSON OUTPUT CONTRACT — LOCKED
Return only one complete JSON object. No markdown fence, preface, explanation, comments, or trailing comma.

The response is pasted directly into JSON.parse(). Before sending, silently validate the entire response as JSON.
- Use double quotes for every key and every string value.
- Keep every field value on one JSON string line. Represent any needed line break as \n, not as a literal line break.
- Use apostrophes for dialogue where possible. If a double quote is needed inside a string, escape it as \".
- Escape backslashes as \\.
- Do not add, remove, or rename fields.
- confidence must be a number. estimated_duration must be exactly "{{reel_length}}" for every script.

Return this exact shape:
{
  "version": 1,
  "insight_title": "{{insight_title_json}}",
  "doctor_specialty": "{{specialty_json}}",
  "scripts": [
    {
      "format": "The format chosen for this specific angle",
      "angle": "The distinct framing used for this script",
      "title": "A concise curiosity-driven title",
      "hook": "The first spoken line",
      "script": "The complete spoken script with optional square-bracket filming directions",
      "cta": "{{selected_cta_json}}",
      "estimated_duration": "{{reel_length}}",
      "confidence": 9.2
    }
  ]
}`;

function getDefaultWritingInstructions() {
  return DEFAULT_WRITING_INSTRUCTIONS;
}

function buildDoctorPrompt(profile = {}, insight = {}) {
  const selectedDuration = insight.reel_length || profile.reelLength || '40s';
  const selectedLanguage = insight.language || profile.language || 'English';
  const specialty = profile.specialty || 'General Medicine & Preventative Care';
  const selectedCta = insight.custom_cta || 'Check caption for more';
  const values = {
    doctor_name: profile.name || 'Doctor',
    specialty,
    audience: profile.audience || 'Patients',
    language: selectedLanguage,
    tone: profile.tone || 'Conversational & Empathetic',
    reel_length: selectedDuration,
    insight_title: insight.title || '',
    insight_title_json: escapeJsonString(insight.title),
    specialty_json: escapeJsonString(specialty),
    insight_details: insight.supporting_points || insight.description || 'Explain the underlying mechanism with clinical clarity.',
    additional_context: insight.references || 'None provided.',
    selected_cta: selectedCta,
    selected_cta_json: escapeJsonString(selectedCta),
    writing_instructions: profile.writingInstructions || DEFAULT_WRITING_INSTRUCTIONS
  };

  return LOCKED_PROMPT_TEMPLATE.replace(/\{\{([a-z_]+)\}\}/g, (token, key) => (
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : token
  ));
}


/* js/components/insightCreate.js */
/**
 * Content OS for Doctors — Insight Capture & Custom Prompt Generator Modal
 */


const InsightCreateModal = {
  async render(container, options = {}, onDone, openModal) {
    const prefillTitle = options.prefillTitle || '';
    const noteId = options.noteId || null;
    const profile = await db.getProfile();
    const languageOptions = ['English', 'Hinglish', 'Hindi', 'Marathi', 'Telugu', 'Kannada', 'Punjabi'];
    const selectedLanguage = languageOptions.includes(profile.language)
      ? profile.language
      : 'English';
    const durationOptions = ['20s', '30s', '40s', '50s'];
    const selectedDuration = durationOptions.includes(profile.reelLength)
      ? profile.reelLength
      : '40s';

    container.innerHTML = `
      <div class="modal-view-step" id="step-insight-form">
        <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 16px;">
          Turn a clinical experience, patient question, or medical concept into a tailored AI prompt pack.
        </p>

        <form id="form-create-insight">
          <div class="form-group">
            <label class="form-label" for="insight-title">Topic / Core Idea *</label>
            <input
              type="text"
              id="insight-title"
              class="form-input"
              placeholder="e.g. Why normal blood pressure doesn't guarantee clean arteries..."
              value="${escapeHtml(prefillTitle)}"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="insight-details">Clinical Explanation & Key Points *</label>
            <textarea
              id="insight-details"
              class="form-textarea"
              rows="4"
              placeholder="1. Endothelial micro-damage happens decades before hypertension.&#10;2. High ApoB and Lp(a) drive plaque formation.&#10;3. Early screening recommendation..."
              required
            ></textarea>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;">
            <div class="form-group">
              <label class="form-label" for="insight-language">Video language</label>
              <select id="insight-language" class="form-select">
                ${languageOptions.map((language) => `<option value="${language}" ${language === selectedLanguage ? 'selected' : ''}>${language}</option>`).join('')}
              </select>
              <p style="font-size: 11.5px; color: var(--text-tertiary); margin-top: 3px;">Defaults to your Settings choice.</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="insight-duration">Video length</label>
              <select id="insight-duration" class="form-select">
                ${durationOptions.map((duration) => `<option value="${duration}" ${duration === selectedDuration ? 'selected' : ''}>${duration.replace('s', ' sec')}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="insight-cta">What CTA do you want to have in the video?</label>
            <input
              type="text"
              id="insight-cta"
              class="form-input"
              placeholder="Leave empty for default: Check caption for more"
            />
            <p style="font-size: 11.5px; color: var(--text-tertiary); margin-top: 3px;">
              If left blank, automatically defaults to "Check caption for more"
            </p>
          </div>

          <div class="form-group">
            <label class="form-label" for="insight-references">Extra context for the AI <span class="form-sublabel">optional</span></label>
            <input
              type="text"
              id="insight-references"
              class="form-input"
              placeholder="e.g. Keep the tone calm and reassuring; speak to worried first-time patients"
            />
            <p style="font-size: 11.5px; color: var(--text-tertiary); margin-top: 3px;">Add any non-script direction, such as tone, audience context, or details the AI should keep in mind.</p>
          </div>

          <div class="flex justify-between items-center" style="margin-top: 20px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
            <button type="button" class="btn btn-ghost" id="btn-cancel-insight">Cancel</button>
            <button type="submit" class="btn btn-primary btn-lg" id="btn-generate-prompt">
              <span>Save & Generate Prompt →</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Step 2: Prompt Ready (Copy Prompt + Paste AI Response) -->
      <div class="modal-view-step hidden" id="step-prompt-ready">
        <div style="text-align: center; margin-bottom: 18px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--accent-blue-subtle); color: var(--accent-blue); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: var(--text-primary);">
            Bespoke Doctor Prompt Ready
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); max-width: 420px; margin: 4px auto 0;">
            Copy this prompt, paste it into ChatGPT, Claude or Gemini, then bring the JSON response back.
          </p>
        </div>

        <!-- Prompt Text Box -->
        <div class="form-group">
          <textarea
            id="generated-prompt-box"
            class="form-textarea"
            rows="7"
            readonly
            style="font-family: var(--font-mono); font-size: 12px; background: var(--bg-subtle); color: var(--text-primary); border-color: var(--border-subtle);"
          ></textarea>
        </div>

        <!-- Large Copy Prompt Primary Action -->
        <button class="btn btn-accent btn-lg w-full" id="btn-copy-prompt-hero" style="margin-bottom: 12px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Copy Prompt (1-Tap)</span>
        </button>

        <div class="flex gap-2 justify-between items-center" style="margin-top: 10px;">
          <a href="https://chatgpt.com" target="_blank" rel="noopener" class="btn btn-secondary btn-sm flex-1" style="text-decoration: none;">
            Open ChatGPT ↗
          </a>
          <a href="https://claude.ai" target="_blank" rel="noopener" class="btn btn-secondary btn-sm flex-1" style="text-decoration: none;">
            Open Claude ↗
          </a>
        </div>

        <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; margin-top: 18px; text-align: center;">
          <button class="btn btn-primary btn-lg w-full" id="btn-proceed-to-import">
            <span>I Have the AI Response → Paste JSON</span>
          </button>
        </div>
      </div>
    `;

    let activeInsightId = null;

    // Form Submission
    document.getElementById('form-create-insight')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('insight-title').value.trim();
      const details = document.getElementById('insight-details').value.trim();
      const language = document.getElementById('insight-language').value;
      const reel_length = document.getElementById('insight-duration').value;
      const ctaVal = document.getElementById('insight-cta').value.trim();
      const references = document.getElementById('insight-references').value.trim();

      if (!title || !details) return;

      const custom_cta = ctaVal || 'Check caption for more';

      activeInsightId = uuidv4();
      const newInsight = {
        id: activeInsightId,
        title,
        description: details.substring(0, 140) + '...',
        supporting_points: details,
        language,
        reel_length,
        custom_cta,
        references,
        status: 'active',
        created_at: new Date().toISOString()
      };

      await db.saveInsight(newInsight);

      // If created from a quick note, archive the note
      if (noteId) {
        const note = await db.getNotes().then((notes) => notes.find((n) => n.id === noteId));
        if (note) {
          note.is_archived = true;
          note.converted_to_insight_id = activeInsightId;
          await db.updateNote(note);
        }
      }

      // Generate bespoke prompt
      const latestProfile = await db.getProfile();
      const promptText = buildDoctorPrompt(latestProfile, newInsight);

      document.getElementById('generated-prompt-box').value = promptText;
      document.getElementById('step-insight-form').classList.add('hidden');
      document.getElementById('step-prompt-ready').classList.remove('hidden');

      // Auto copy for smooth experience
      await copyToClipboard(promptText);
    });

    document.getElementById('btn-cancel-insight')?.addEventListener('click', onDone);

    document.getElementById('btn-copy-prompt-hero')?.addEventListener('click', async () => {
      const promptText = document.getElementById('generated-prompt-box').value;
      await copyToClipboard(promptText);
    });

    document.getElementById('btn-proceed-to-import')?.addEventListener('click', () => {
      openModal('aiImport', { insightId: activeInsightId });
    });
  }
};


/* js/importer.js */
/**
 * Content OS for Doctors — AI Response Importer & Schema Validator
 * Robust parser that strips preambles, fences, and validates clinical script packs.
 */


function extractJSONObject(text) {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed?.scripts)) return parsed;
  } catch {
    // AI tools sometimes add a preamble or code fence. Scan complete JSON
    // objects instead of blindly taking the first "{" and the last "}".
  }

  let fallbackObject = null;

  for (let start = text.indexOf('{'); start !== -1; start = text.indexOf('{', start + 1)) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < text.length; index += 1) {
      const character = text[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') inString = false;
        continue;
      }

      if (character === '"') inString = true;
      else if (character === '{') depth += 1;
      else if (character === '}') {
        depth -= 1;
        if (depth === 0) {
          try {
            const parsed = JSON.parse(text.slice(start, index + 1));
            if (Array.isArray(parsed?.scripts)) return parsed;
            fallbackObject ??= parsed;
          } catch {
            // This opening brace did not start JSON. Keep scanning for the
            // actual response object later in the pasted text.
          }
          break;
        }
      }
    }
  }

  if (fallbackObject) return fallbackObject;
  throw new Error('Invalid JSON syntax. Ask the AI to return only the JSON object, with double quotes escaped inside script text.');
}

function parseAndValidateAIResponse(rawText, insightId) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Pasted content is empty. Please paste the JSON returned by your AI.');
  }

  let cleaned = rawText.trim();

  // 1. Strip markdown code fences if wrapped in ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  cleaned = cleaned.trim();

  let data;
  try {
    data = extractJSONObject(cleaned);
  } catch (err) {
    throw new Error(`${err.message} Check that the response was not cut off.`);
  }

  // 3. Schema Validation
  if (typeof data !== 'object' || data === null) {
    throw new Error('Parsed response is not a valid JSON object.');
  }

  if (!Array.isArray(data.scripts) || data.scripts.length === 0) {
    throw new Error('No "scripts" array found in JSON. Expected at least 1 script.');
  }

  // 4. Extract and normalize script cards
  const normalizedScripts = data.scripts.map((item, index) => {
    if (!item.format) item.format = 'Talking Head';
    if (!item.title) item.title = `Clinical Script #${index + 1}`;
    if (!item.hook) item.hook = 'Attention-grabbing medical hook...';
    if (!item.script) item.script = 'Clinical explanation...';
    if (!item.cta) item.cta = 'Read caption for more information.';

    return {
      id: uuidv4(),
      insight_id: insightId,
      format: item.format.trim(),
      angle: typeof item.angle === 'string' ? item.angle.trim() : '',
      title: item.title.trim(),
      hook: item.hook.trim(),
      script: item.script.trim(),
      cta: item.cta.trim(),
      estimated_duration: item.estimated_duration || '45s',
      confidence: typeof item.confidence === 'number' ? item.confidence : 9.0,
      status: 'pending_review', // 'pending_review' | 'accepted' | 'edited' | 'rejected' | 'review_later'
      review_order: index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });

  return {
    version: data.version || 1,
    insight_title: data.insight_title || '',
    doctor_specialty: data.doctor_specialty || '',
    scripts: normalizedScripts
  };
}


/* js/components/aiImport.js */
/**
 * Content OS for Doctors — AI JSON Importer Modal
 * Paste AI response, validate schema, and auto-link scripts to parent Insight.
 */


const AIImportModal = {
  render(container, options = {}, onDone, openModal, navigateTo) {
    const insightId = options.insightId || null;

    container.innerHTML = `
      <div class="ai-importer-flow">
        <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 14px;">
          Paste the JSON response you received from ChatGPT / Claude / Gemini below:
        </p>

        <form id="form-ai-import">
          <div class="form-group">
            <textarea
              id="ai-pasted-text"
              class="form-textarea"
              rows="8"
              placeholder="Paste raw response or JSON object here..."
              required
              style="font-family: var(--font-mono); font-size: 12.5px;"
            ></textarea>
          </div>

          <div id="ai-import-error" class="hidden" style="background: var(--accent-red-subtle); color: var(--accent-red); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 14px;"></div>

          <div id="ai-import-preview" class="hidden" style="background: var(--accent-green-subtle); color: #1E7E34; padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 14px;"></div>

          <div class="flex justify-between items-center" style="border-top: 1px solid var(--border-subtle); padding-top: 16px;">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-paste-sample-json">
              Paste Sample JSON
            </button>
            <button type="submit" class="btn btn-primary btn-lg" id="btn-submit-import">
              <span>Save & Start Flashcard Review →</span>
            </button>
          </div>
        </form>
      </div>
    `;

    const form = document.getElementById('form-ai-import');
    const textarea = document.getElementById('ai-pasted-text');
    const errorBox = document.getElementById('ai-import-error');
    const previewBox = document.getElementById('ai-import-preview');

    // Paste sample JSON button for quick testing
    document.getElementById('btn-paste-sample-json')?.addEventListener('click', () => {
      textarea.value = JSON.stringify(
        {
          version: 1,
          insight_title: 'Magnesium Chelates for Cardiac Palpitations',
          scripts: [
            {
              format: 'Talking Head',
              title: 'The #1 Supplement Mistake with Night Palpitations',
              hook: 'If your heart feels like it is fluttering when you lie down in bed, listen closely.',
              script: '80% of patients taking magnesium for heart palpitations are buying magnesium citrate, which only causes loose stools. Magnesium Taurate specifically crosses cellular cardiac membranes to calm ectopic beats. Here is my 3-step clinical rule...',
              cta: 'Read caption for my daily safe dosage protocol.',
              estimated_duration: '45s',
              confidence: 9.6
            },
            {
              format: 'Patient Story',
              title: 'From 5,000 PVCs a Day to Normal Rhythm',
              hook: 'A 29-year-old software engineer came to my clinic with debilitating daily heart palpitations.',
              script: 'Their cardiac ultrasound was completely normal, but cellular intracellular magnesium and taurine were depleted from chronic caffeine and stress. 3 weeks after targeted replacement, palpitations stopped by 90%.',
              cta: 'Comment "CALM" for my clinical guide.',
              estimated_duration: '60s',
              confidence: 9.4
            },
            {
              format: 'Myth vs Fact',
              title: '3 Big Magnesium Myths for Heart Health',
              hook: 'Myth: You can just grab any random bottle of magnesium at the grocery store.',
              script: 'Fact 1: Oxide has only 4% absorption. Fact 2: Glycinate is for sleep and anxiety. Fact 3: Taurate is the only chelate proven to stabilize myocardial excitability.',
              cta: 'Save this before your next supplement restock.',
              estimated_duration: '40s',
              confidence: 9.5
            }
          ]
        },
        null,
        2
      );
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.classList.add('hidden');
      previewBox.classList.add('hidden');

      const raw = textarea.value.trim();
      if (!raw) return;

      try {
        // Parse and validate schema
        const parsed = parseAndValidateAIResponse(raw, insightId);

        // Save scripts to IndexedDB
        await db.saveScripts(parsed.scripts);

        showToast(`Imported ${parsed.scripts.length} scripts successfully!`, 'success');
        onDone(); // Close modal
        navigateTo('review'); // Open Flashcard Review immediately!
      } catch (err) {
        errorBox.textContent = `⚠️ ${err.message}`;
        errorBox.classList.remove('hidden');
      }
    });
  }
};


/* js/components/scriptReview.js */
/**
 * Content OS for Doctors — Flashcard Script Review Deck
 * 1 card at a time. Zero spreadsheets. Accept, in-place Edit, Reject, Review Later.
 */


const ScriptReviewView = {
  queue: [],
  currentIndex: 0,
  isEditing: false,
  acceptedCount: 0,

  async render(container, navigateTo, openModal) {
    // 1. Fetch pending scripts
    const pending = await db.getPendingReviewScripts();
    this.queue = pending;
    this.currentIndex = 0;
    this.isEditing = false;
    this.acceptedCount = 0;

    this.renderCurrentCard(container, navigateTo, openModal);
  },

  renderCurrentCard(container, navigateTo, openModal) {
    if (this.queue.length === 0 || this.currentIndex >= this.queue.length) {
      this.renderCompletionScreen(container, navigateTo);
      return;
    }

    const script = this.queue[this.currentIndex];
    const formatMeta = getFormatById(script.format);
    const progressPercent = Math.round(((this.currentIndex) / this.queue.length) * 100);

    let html = `
      <div class="flashcard-wrapper">

        <!-- Progress & Deck Counter -->
        <div>
          <div class="flashcard-progress-bar">
            <span>Script Review Deck</span>
            <span>Card ${this.currentIndex + 1} of ${this.queue.length}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>

        <!-- The Single Flashcard -->
        <div class="flashcard" id="active-flashcard">

          <!-- Card Top Format Header -->
          <div class="flashcard-header">
            <div class="flex items-center gap-2">
              <span style="font-size: 18px;">${formatMeta.icon || '💡'}</span>
              <span style="font-family: var(--font-heading); font-size: 14px; font-weight: 700; color: var(--text-primary);">
                ${escapeHtml(script.format)}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="action-card-badge badge-gray">${script.estimated_duration || '45s'}</span>
              <span class="action-card-badge badge-blue">AI Score ${script.confidence || 9.0}</span>
            </div>
          </div>

          <!-- Card Content Body (Readable or In-place Editable) -->
          <div class="flashcard-body ${this.isEditing ? 'flashcard-editable' : ''}">

            <!-- Title -->
            <div class="flashcard-section">
              <span class="section-label">Script Title</span>
              ${
                this.isEditing
                  ? `<input type="text" id="edit-title" value="${escapeHtml(script.title)}" />`
                  : `<h2 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: var(--text-primary);">${escapeHtml(script.title)}</h2>`
              }
            </div>

            <!-- Hook (Stopping the scroll) -->
            <div class="flashcard-section">
              <span class="section-label">Hook (First 2 Seconds)</span>
              ${
                this.isEditing
                  ? `<textarea id="edit-hook" rows="2">${escapeHtml(script.hook)}</textarea>`
                  : `<div class="flashcard-hook">"${escapeHtml(script.hook)}"</div>`
              }
            </div>

            <!-- Body Spoken Script -->
            <div class="flashcard-section">
              <span class="section-label">Spoken Script Body</span>
              ${
                this.isEditing
                  ? `<textarea id="edit-script" rows="6">${escapeHtml(script.script)}</textarea>`
                  : `<div class="flashcard-script-text">${escapeHtml(script.script)}</div>`
              }
            </div>

            <!-- Call-To-Action -->
            <div class="flashcard-section">
              <span class="section-label">Call-To-Action (CTA)</span>
              ${
                this.isEditing
                  ? `<input type="text" id="edit-cta" value="${escapeHtml(script.cta)}" />`
                  : `<div class="flashcard-cta">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      <span>${escapeHtml(script.cta)}</span>
                    </div>`
              }
            </div>
          </div>

          <!-- 4 Clear Dedicated Actions: Accept | Edit | Reject | Review Later -->
          <div class="flashcard-actions">
            <button class="btn btn-reject btn-lg" id="btn-card-reject" title="Archive and remove from workflow">
              <span>✕ Reject</span>
            </button>

            <button class="btn btn-later btn-lg" id="btn-card-later" title="Skip for now and return later">
              <span>⏱ Later</span>
            </button>

            <button class="btn btn-edit btn-lg" id="btn-card-edit">
              <span>${this.isEditing ? '✓ Done Editing' : '✎ Edit'}</span>
            </button>

            <button class="btn btn-accept btn-lg" id="btn-card-accept" title="Good enough to become a Trial Reel">
              <span>Accept (Trial Reel) →</span>
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // 1. ACCEPT ACTION (Converts to Trial Reel & auto-schedules)
    document.getElementById('btn-card-accept')?.addEventListener('click', async () => {
      // If was editing, capture latest changes first
      if (this.isEditing) {
        this.saveCurrentEdits(script);
      }

      script.status = 'accepted';
      script.updated_at = new Date().toISOString();
      await db.updateScript(script);

      // Auto-schedule accepted Trial Reel into smart calendar
      await scheduleAcceptedScript(script);
      this.acceptedCount++;

      showToast('Accepted! Added to Trial Reel schedule.', 'success');
      this.isEditing = false;
      this.currentIndex++;
      this.renderCurrentCard(container, navigateTo, openModal);
    });

    // 2. IN-PLACE EDIT ACTION (No page jump!)
    document.getElementById('btn-card-edit')?.addEventListener('click', async () => {
      if (this.isEditing) {
        // Save inline edits
        this.saveCurrentEdits(script);
        await db.updateScript(script);
        this.isEditing = false;
        showToast('Changes saved to script!', 'success');
        this.renderCurrentCard(container, navigateTo, openModal);
      } else {
        this.isEditing = true;
        this.renderCurrentCard(container, navigateTo, openModal);
      }
    });

    // 3. REJECT ACTION (Archives script cleanly)
    document.getElementById('btn-card-reject')?.addEventListener('click', async () => {
      script.status = 'rejected';
      script.updated_at = new Date().toISOString();
      await db.updateScript(script);

      showToast('Script rejected and archived.', 'error');
      this.isEditing = false;
      this.currentIndex++;
      this.renderCurrentCard(container, navigateTo, openModal);
    });

    // 4. REVIEW LATER ACTION (Skips to end of queue)
    document.getElementById('btn-card-later')?.addEventListener('click', () => {
      const [skipped] = this.queue.splice(this.currentIndex, 1);
      this.queue.push(skipped);

      showToast('Skipped. Card moved to end of review.', 'info');
      this.isEditing = false;
      this.renderCurrentCard(container, navigateTo, openModal);
    });
  },

  saveCurrentEdits(script) {
    const titleInput = document.getElementById('edit-title');
    const hookInput = document.getElementById('edit-hook');
    const scriptInput = document.getElementById('edit-script');
    const ctaInput = document.getElementById('edit-cta');

    if (titleInput) script.title = titleInput.value.trim();
    if (hookInput) script.hook = hookInput.value.trim();
    if (scriptInput) script.script = scriptInput.value.trim();
    if (ctaInput) script.cta = ctaInput.value.trim();
  },

  renderCompletionScreen(container, navigateTo) {
    container.innerHTML = `
      <div class="action-deck">
        <div class="card text-center" style="padding: 40px 24px; max-width: 560px; margin: 20px auto;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--accent-green-subtle); color: var(--accent-green); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>

          <h2 style="font-family: var(--font-heading); font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            All Scripts Reviewed!
          </h2>

          <p style="font-size: 14.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 24px;">
            Every accepted script has been automatically balanced across your content calendar as a <strong>Trial Reel</strong>.
          </p>

          <div class="flex gap-3 justify-center" style="flex-wrap: wrap;">
            <button class="btn btn-primary btn-lg" id="btn-completion-view-schedule">
              <span>View Auto-Balanced Schedule →</span>
            </button>
            <button class="btn btn-secondary btn-lg" id="btn-completion-go-today">
              <span>Back to Today</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-completion-view-schedule')?.addEventListener('click', () => navigateTo('schedule'));
    document.getElementById('btn-completion-go-today')?.addEventListener('click', () => navigateTo('dashboard'));
  }
};


/* js/components/scheduleView.js */
/**
 * Content OS for Doctors — Visual Interactive Calendar View
 * Displays a full visual calendar grid showing scheduled posts on every day.
 * Clicking any day cell opens a clean modal sheet with full details and action controls.
 */


const ScheduleView = {
  currentMonthDate: getSystemDate(), // Active calendar month

  async render(container, navigateTo, openModal) {
    const profile = await db.getProfile();
    const enableFilming = profile.enableFilmingWorkflow === true;
    const allReels = await db.getScheduledReels();
    const todayStr = formatDateForInput(getSystemDate());

    // Map scheduled reels by date
    const reelsByDate = {};
    allReels.forEach((reel) => {
      const d = reel.scheduled_date;
      if (!d) return;
      if (!reelsByDate[d]) reelsByDate[d] = [];
      reelsByDate[d].push(reel);
    });

    const year = this.currentMonthDate.getFullYear();
    const month = this.currentMonthDate.getMonth();
    const monthName = this.currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Calendar grid calculations
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `
      <div class="calendar-lane" style="max-width: 900px;">

        <!-- Header & View Mode Switcher -->
        <div class="schedule-header">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">
              Publishing Calendar
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
              Uniformly sprinkled across ${profile.sprinkleWindowDays || 14} days. Click any cell to view post details.
            </p>
          </div>

          <div class="flex gap-2">
            <button class="btn btn-primary btn-sm" id="btn-add-manual-script">
              + Add Your Own Script
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-recalculate-schedule">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
              <span>Re-Sprinkle Schedule</span>
            </button>
          </div>
        </div>

        <!-- Month Navigation Bar -->
        <div class="card" style="padding: 12px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
          <button class="btn btn-ghost btn-sm" id="btn-prev-month">
            ← Previous
          </button>

          <h3 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: var(--text-primary);">
            ${monthName}
          </h3>

          <button class="btn btn-ghost btn-sm" id="btn-next-month">
            Next →
          </button>
        </div>

        <!-- Visual Grid Calendar -->
        <div class="card" style="padding: 12px; overflow-x: auto;">
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; font-size: 12px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 8px;">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
    `;

    // Blank cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div style="background: var(--bg-subtle); border-radius: var(--radius-sm); min-height: 78px; opacity: 0.3;"></div>`;
    }

    // Days of the month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = formatDateForInput(dateObj);
      const isToday = dateStr === todayStr;
      const reelsOnDay = reelsByDate[dateStr] || [];

      let dayStyle = 'background: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 6px; min-height: 84px; display: flex; flex-direction: column; cursor: pointer; transition: all var(--transition-fast);';
      if (isToday) {
        dayStyle = 'background: #FFFFFF; border: 2px solid var(--accent-blue); border-radius: var(--radius-md); padding: 6px; min-height: 84px; display: flex; flex-direction: column; cursor: pointer; box-shadow: var(--shadow-xs);';
      }

      html += `
        <div class="cal-day-cell" data-date="${dateStr}" style="${dayStyle}">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 13px; font-weight: ${isToday ? '800' : '600'}; color: ${isToday ? 'var(--accent-blue)' : 'var(--text-primary)'};">
              ${day} ${isToday ? '📍' : ''}
            </span>
            ${reelsOnDay.length > 0 ? `<span class="nav-badge" style="font-size: 10px; padding: 1px 5px;">${reelsOnDay.length}</span>` : ''}
          </div>

          <div style="display: flex; flex-direction: column; gap: 3px; flex: 1; overflow: hidden;">
            ${reelsOnDay.slice(0, 3).map((r) => {
              const formatMeta = getFormatById(r.format);
              const isMain = r.is_main_reel;
              const isPosted = r.status === 'posted';
              const isFilmed = enableFilming && (r.status === 'filmed' || r.is_filmed);

              let badgeBg = 'background: var(--bg-subtle); color: var(--text-primary);';
              if (isMain) badgeBg = 'background: var(--accent-purple-subtle); color: var(--accent-purple); border: 1px solid var(--accent-purple);';
              else if (isPosted) badgeBg = 'background: var(--accent-green-subtle); color: var(--accent-green);';
              else if (isFilmed) badgeBg = 'background: var(--accent-blue-subtle); color: var(--accent-blue);';

              return `
                <div class="cal-reel-card" draggable="true" data-reel-id="${r.id}" style="font-size: 10.5px; font-weight: 600; padding: 2px 4px; border-radius: var(--radius-xs); ${badgeBg} white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; items-center; gap: 3px; cursor: grab;" title="Drag to another date: ${escapeHtml(r.title)}">
                  <span>${formatMeta.icon || '💡'}</span>
                  <span>${isMain ? '⭐ ' : ''}${escapeHtml(r.title)}</span>
                </div>
              `;
            }).join('')}

            ${reelsOnDay.length > 3 ? `<span style="font-size: 10px; color: var(--text-tertiary);">+${reelsOnDay.length - 3} more</span>` : ''}
          </div>
        </div>
      `;
    }

    html += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Month Navigation
    document.getElementById('btn-prev-month')?.addEventListener('click', () => {
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() - 1);
      ScheduleView.render(container, navigateTo, openModal);
    });

    document.getElementById('btn-next-month')?.addEventListener('click', () => {
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() + 1);
      ScheduleView.render(container, navigateTo, openModal);
    });

    document.getElementById('btn-add-manual-script')?.addEventListener('click', () => {
      openModal('manualScript');
    });

    // Auto Reshuffle Future
    document.getElementById('btn-recalculate-schedule')?.addEventListener('click', async () => {
      const res = await recalculateFutureSchedule();
      showToast(`Uniformly re-sprinkled ${res.updatedCount} future trial reels over 2 weeks!`, 'success');
      ScheduleView.render(container, navigateTo, openModal);
    });

    // CLICK DAY CELL -> OPEN DAY DETAIL MODAL
    container.querySelectorAll('.cal-day-cell').forEach((cell) => {
      cell.addEventListener('click', async (e) => {
        const dateStr = e.currentTarget.dataset.date;
        const reelsOnDate = reelsByDate[dateStr] || [];
        this.openDayDetailModal(dateStr, reelsOnDate, navigateTo, openModal, enableFilming);
      });
    });

    // Drag a scheduled item directly to another calendar day.
    container.querySelectorAll('.cal-reel-card').forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.currentTarget.dataset.reelId);
      });
    });

    container.querySelectorAll('.cal-day-cell').forEach((cell) => {
      cell.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      cell.addEventListener('drop', async (e) => {
        e.preventDefault();
        const reelId = e.dataTransfer.getData('text/plain');
        const newDate = e.currentTarget.dataset.date;
        const reel = await db.getScheduledReel(reelId);
        if (!reel || reel.scheduled_date === newDate) return;
        if (newDate < todayStr) {
          showToast('Posts can only be moved to today or a future date.', 'error');
          return;
        }
        if (reel.status === 'posted' || reel.is_locked) {
          showToast(reel.is_locked ? 'Unpin this date before moving the post.' : 'Posted items cannot be rescheduled.', 'info');
          return;
        }
        reel.scheduled_date = newDate;
        reel.rescheduled_at = new Date().toISOString();
        reel.updated_at = new Date().toISOString();
        await db.saveScheduledReel(reel);
        showToast(`Moved to ${formatDate(newDate)}.`, 'success');
        ScheduleView.render(container, navigateTo, openModal);
      });
    });
  },

  openDayDetailModal(dateStr, reels, navigateTo, openModal, enableFilming = false) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');

    modalTitle.textContent = `Scheduled Posts for ${formatFullDate(dateStr)}`;

    if (!reels || reels.length === 0) {
      modalBody.innerHTML = `
        <div class="text-center" style="padding: 30px 16px;">
          <p style="font-size: 14px; color: var(--text-tertiary); margin-bottom: 14px;">
            No content scheduled for this date.
          </p>
          <button class="btn btn-primary btn-sm" id="btn-modal-capture-for-day">
            + Record New Insight for this Date
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-modal-add-script-for-day">
            + Add Your Own Script
          </button>
        </div>
      `;
      modalOverlay.classList.remove('hidden');

      document.getElementById('btn-modal-capture-for-day')?.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        openModal('insightCreate');
      });
      document.getElementById('btn-modal-add-script-for-day')?.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        openModal('manualScript', { scheduledDate: dateStr });
      });
      return;
    }

    let html = `
      <div class="flex flex-col gap-3">
        ${reels.map((reel) => {
          const formatMeta = getFormatById(reel.format);
          const isFilmed = enableFilming && (reel.status === 'filmed' || reel.is_filmed);
          const isPosted = reel.status === 'posted';
          const isMain = reel.is_main_reel;
          const isLocked = reel.is_locked;

          return `
            <div class="card" style="padding: 16px; border-left: 4px solid ${isMain ? 'var(--accent-purple)' : isPosted ? 'var(--accent-green)' : isFilmed ? 'var(--accent-blue)' : 'var(--border-strong)'}">
              <div class="flex items-center justify-between" style="margin-bottom: 6px;">
                <div class="flex items-center gap-2">
                  <span style="font-size: 18px;">${formatMeta.icon || '💡'}</span>
                  <span class="action-card-badge ${isMain ? 'badge-purple' : 'badge-gray'}">
                    ${isMain ? '⭐ Main Reel' : 'Trial Reel'}
                  </span>
                  <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">
                    ${escapeHtml(reel.format)}
                  </span>
                </div>

                <span class="action-card-badge ${isPosted ? 'badge-green' : isFilmed ? 'badge-blue' : 'badge-amber'}">
                  ${isPosted ? '✓ Posted' : isFilmed ? '✓ Filmed' : 'Ready to post'}
                </span>
              </div>

              <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                ${escapeHtml(reel.title)}
              </h3>

              <div style="font-size: 13.5px; color: var(--text-primary); background: var(--bg-subtle); padding: 10px 12px; border-radius: var(--radius-md); margin-bottom: 10px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 2px;">Hook</div>
                "${escapeHtml(reel.hook)}"
              </div>

              ${
                reel.script
                  ? `<div style="font-size: 13px; color: var(--text-secondary); line-height: 1.45; background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 10px 12px; border-radius: var(--radius-md); max-height: 140px; overflow-y: auto; margin-bottom: 10px;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 2px;">Script Body</div>
                      ${escapeHtml(reel.script)}
                    </div>`
                  : ''
              }

              ${
                reel.cta
                  ? `<div style="font-size: 12.5px; font-weight: 600; color: var(--accent-blue); margin-bottom: 12px;">
                      CTA: ${escapeHtml(reel.cta)}
                    </div>`
                  : ''
              }

              ${
                !isPosted
                  ? `<div class="flex gap-2 items-center" style="margin-bottom: 12px; flex-wrap: wrap;">
                      <label style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">Reschedule
                        <input class="form-input detail-reschedule-date" data-id="${reel.id}" type="date" min="${formatDateForInput(getSystemDate())}" value="${reel.scheduled_date}" style="width: 150px; margin-left: 5px; padding: 6px 8px; font-size: 12px;" />
                      </label>
                      <button class="btn btn-secondary btn-sm btn-detail-reschedule" data-id="${reel.id}">Set Date</button>
                    </div>`
                  : ''
              }

              <!-- Quick Action Controls -->
              <div class="flex gap-2 justify-between items-center" style="border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                <button class="btn btn-ghost btn-sm btn-detail-lock" data-id="${reel.id}">
                  ${isLocked ? '🔒 Unpin Date' : '📌 Pin Date'}
                </button>

                <div class="flex gap-2">
                  ${
                    enableFilming && !isFilmed && !isPosted
                      ? `<button class="btn btn-secondary btn-sm btn-detail-film" data-id="${reel.id}">Mark Filmed</button>`
                      : ''
                  }
                  ${
                    !isPosted
                      ? `<button class="btn btn-primary btn-sm btn-detail-post" data-id="${reel.id}">Mark Posted</button>`
                      : `<button class="btn btn-secondary btn-sm btn-detail-feedback" data-id="${reel.id}">Log 3-Day Feedback</button>`
                  }
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    modalBody.innerHTML = html;
    modalOverlay.classList.remove('hidden');

    // Handle detail modal buttons
    modalBody.querySelectorAll('.btn-detail-film').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const reel = await db.getScheduledReel(id);
        if (reel) {
          reel.status = 'filmed';
          reel.is_filmed = true;
          await db.saveScheduledReel(reel);
          showToast('Marked as Filmed!', 'success');
          modalOverlay.classList.add('hidden');
          ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal);
        }
      });
    });

    modalBody.querySelectorAll('.btn-detail-post').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const reel = await db.getScheduledReel(id);
        if (reel) {
          reel.status = 'posted';
          reel.posted_date = formatDateForInput(new Date());
          await db.saveScheduledReel(reel);
          showToast('Marked as Posted! 3-day feedback timer started.', 'success');
          modalOverlay.classList.add('hidden');
          ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal);
        }
      });
    });

    modalBody.querySelectorAll('.btn-detail-feedback').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        modalOverlay.classList.add('hidden');
        openModal('trialFeedback', { reelId: id });
      });
    });

    modalBody.querySelectorAll('.btn-detail-lock').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const reel = await db.getScheduledReel(id);
        if (reel) {
          reel.is_locked = !reel.is_locked;
          await db.saveScheduledReel(reel);
          showToast(reel.is_locked ? 'Locked date' : 'Unlocked date', 'info');
          modalOverlay.classList.add('hidden');
          ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal);
        }
      });
    });

    modalBody.querySelectorAll('.btn-detail-reschedule').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const dateInput = modalBody.querySelector(`.detail-reschedule-date[data-id="${id}"]`);
        const newDate = dateInput?.value;
        const today = formatDateForInput(getSystemDate());
        if (!newDate || newDate < today) {
          showToast('Choose today or a future date.', 'error');
          return;
        }
        const reel = await db.getScheduledReel(id);
        if (!reel || reel.status === 'posted') return;
        if (reel.is_locked) {
          showToast('Unpin this date before rescheduling.', 'info');
          return;
        }
        reel.scheduled_date = newDate;
        reel.rescheduled_at = new Date().toISOString();
        reel.updated_at = new Date().toISOString();
        await db.saveScheduledReel(reel);
        showToast(`Rescheduled for ${formatDate(newDate)}.`, 'success');
        modalOverlay.classList.add('hidden');
        ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal);
      });
    });
  }
};


/* js/components/manualScript.js */
/**
 * Hand-written script modal — saves directly to the selected calendar date.
 */


const ManualScriptModal = {
  async render(container, options, closeModal, navigateTo) {
    const today = formatDateForInput(getSystemDate());
    const scheduledDate = options.scheduledDate && options.scheduledDate >= today
      ? options.scheduledDate
      : today;

    container.innerHTML = `
      <form id="manual-script-form" class="flex flex-col gap-3">
        <p style="font-size: 13px; color: var(--text-secondary);">
          Write a script yourself and place it directly on your publishing calendar.
        </p>
        <div class="form-group">
          <label class="form-label" for="manual-script-topic">Topic</label>
          <input id="manual-script-topic" class="form-input" type="text" placeholder="e.g. Why high blood pressure is silent" required autofocus />
        </div>
        <div class="form-group">
          <label class="form-label" for="manual-script-body">Script</label>
          <textarea id="manual-script-body" class="form-textarea" rows="8" placeholder="Write your complete script here..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="manual-script-date">Schedule date</label>
          <input id="manual-script-date" class="form-input" type="date" min="${today}" value="${scheduledDate}" required />
        </div>
        <div class="flex justify-between items-center" style="margin-top: 6px;">
          <button type="button" class="btn btn-ghost btn-sm" id="btn-cancel-manual-script">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Add to Calendar</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-cancel-manual-script')?.addEventListener('click', closeModal);
    container.querySelector('#manual-script-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const title = container.querySelector('#manual-script-topic').value.trim();
      const script = container.querySelector('#manual-script-body').value.trim();
      const date = container.querySelector('#manual-script-date').value;

      if (!title || !script || !date) return;
      if (date < today) {
        showToast('Choose today or a future date.', 'error');
        return;
      }

      await scheduleManualScript({ title, script, scheduledDate: date });
      showToast(`Added to ${date}.`, 'success');
      closeModal();
      navigateTo('schedule');
    });
  }
};


/* js/components/trialFeedback.js */
/**
 * Content OS for Doctors — 3-Day Trial Reel Feedback & Best Format Selection Sheet
 * 3 days after posting, evaluates performance across formats for an Insight,
 * identifies the single best-performing format, and automatically schedules it as a Main Reel.
 */


const TrialFeedbackModal = {
  async render(container, options = {}, onDone, openModal, navigateTo) {
    const reelId = options.reelId;
    if (!reelId) {
      onDone();
      return;
    }

    const currentReel = await db.getScheduledReel(reelId);
    if (!currentReel) {
      onDone();
      return;
    }

    // Fetch all reels for the same parent Insight to compare formats
    const allReels = await db.getScheduledReels();
    const siblingReels = allReels.filter((r) => r.insight_id === currentReel.insight_id);
    const postedSiblings = siblingReels.filter((r) => r.status === 'posted' || r.feedback_logged || r.id === currentReel.id);

    const existingMetrics = currentReel.metrics || {};

    container.innerHTML = `
      <div class="feedback-sheet">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span class="action-card-badge badge-purple">📊 3-Day Post Evaluation</span>
          <span style="font-size: 12px; color: var(--text-tertiary);">Posted ${formatDate(currentReel.posted_date || currentReel.scheduled_date)}</span>
        </div>

        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
          Feedback is recorded <strong>3 days after posting</strong>. Out of all tested trial formats for this insight, the best-performing format will be selected and automatically scheduled as a <strong>Main Reel</strong>.
        </p>

        <!-- Current Reel Card -->
        <div class="card" style="padding: 14px; background: var(--bg-subtle); margin-bottom: 16px; border-left: 4px solid var(--accent-purple);">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-purple); margin-bottom: 2px;">
            Testing Format: ${escapeHtml(currentReel.format)}
          </div>
          <div style="font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
            ${escapeHtml(currentReel.title)}
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
            "${escapeHtml(currentReel.hook)}"
          </div>
        </div>

        <form id="form-reel-feedback">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin-bottom: 8px;">
            1. Enter 3-Day Performance Metrics
          </div>

          <div class="feedback-grid">
            <div class="metric-input-group">
              <label for="metric-views">Views</label>
              <input type="number" id="metric-views" placeholder="e.g. 18500" value="${existingMetrics.views || ''}" required />
            </div>

            <div class="metric-input-group">
              <label for="metric-likes">Likes</label>
              <input type="number" id="metric-likes" placeholder="e.g. 920" value="${existingMetrics.likes || ''}" />
            </div>

            <div class="metric-input-group">
              <label for="metric-comments">Comments</label>
              <input type="number" id="metric-comments" placeholder="e.g. 84" value="${existingMetrics.comments || ''}" />
            </div>

            <div class="metric-input-group">
              <label for="metric-shares">Shares / Saves</label>
              <input type="number" id="metric-shares" placeholder="e.g. 165" value="${existingMetrics.shares || ''}" />
            </div>
          </div>

          <div class="metric-input-group" style="margin-bottom: 16px;">
            <label for="metric-notes">Doctor Observations / Qualitative Feedback</label>
            <input type="text" id="metric-notes" placeholder="e.g. High retention; patients asked about this in clinic." value="${escapeHtml(existingMetrics.notes || '')}" />
          </div>

          <!-- Format Performance Comparison if sibling trial reels exist -->
          ${
            postedSiblings.length > 1
              ? `
                <div style="background: var(--bg-subtle); padding: 12px 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
                  <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                    Tested Formats Comparison for this Insight:
                  </div>
                  ${postedSiblings.map((s) => `
                    <div style="display: flex; justify-content: space-between; font-size: 12.5px; padding: 4px 0; border-bottom: 1px solid var(--border-subtle);">
                      <span>${escapeHtml(s.format)}: <strong>${escapeHtml(s.title)}</strong></span>
                      <span style="font-weight: 600; color: var(--accent-purple);">
                        ${s.metrics?.views ? `${s.metrics.views.toLocaleString()} views` : s.id === currentReel.id ? 'Currently Entering' : 'Pending'}
                      </span>
                    </div>
                  `).join('')}
                </div>
              `
              : ''
          }

          <!-- Core Decision Box -->
          <div class="main-reel-decision-box">
            <div style="font-size: 26px;">⭐</div>
            <div>
              <h3>Is this the Best-Performing Format?</h3>
              <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
                Selecting <strong>Yes</strong> automatically picks this format as the winner for this Insight and schedules it on its own as a Main Reel.
              </p>
            </div>

            <div class="decision-button-group">
              <button type="button" class="btn btn-secondary btn-lg flex-1" id="btn-decision-no">
                <span>No (Archive Trial)</span>
              </button>
              <button type="button" class="btn btn-primary btn-lg flex-1" id="btn-decision-yes" style="background: var(--accent-purple); border-color: var(--accent-purple);">
                <span>⭐ Select Best Format & Schedule Main Reel</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    `;

    const getMetricsFromForm = () => {
      return {
        views: parseInt(document.getElementById('metric-views').value) || 0,
        likes: parseInt(document.getElementById('metric-likes').value) || 0,
        comments: parseInt(document.getElementById('metric-comments').value) || 0,
        shares: parseInt(document.getElementById('metric-shares').value) || 0,
        notes: document.getElementById('metric-notes').value.trim(),
        logged_at: new Date().toISOString()
      };
    };

    // DECISION: YES -> Best Format selected, auto-schedules Main Reel
    document.getElementById('btn-decision-yes')?.addEventListener('click', async () => {
      currentReel.metrics = getMetricsFromForm();
      currentReel.feedback_logged = true;
      await db.saveScheduledReel(currentReel);

      await promoteToMainReel(currentReel.id);
      showToast('⭐ Best format selected! Main Reel automatically scheduled on your calendar.', 'success');
      onDone();
      navigateTo('schedule');
    });

    // DECISION: NO -> Archive Trial Reel with metrics
    document.getElementById('btn-decision-no')?.addEventListener('click', async () => {
      currentReel.metrics = getMetricsFromForm();
      currentReel.feedback_logged = true;
      currentReel.status = 'archived';
      await db.saveScheduledReel(currentReel);

      showToast('3-day performance logged. Trial Reel archived.', 'info');
      onDone();
      navigateTo('dashboard');
    });
  }
};


/* js/components/feedbackView.js */
/**
 * Content OS for Doctors — Feedback Due Workspace View
 * Manages 3-day performance evaluations for trial reels, pending checks, and feedback history.
 */


const FeedbackView = {
  activeTab: 'due', // 'due', 'awaiting', 'history'

  async render(container, navigateTo, openModal) {
    const allReels = await db.getScheduledReels();
    const systemDate = getSystemDate();
    const devToolsEnabled = getDevToolsEnabled();

    // Categorize reels
    const feedbackDue = [];
    const awaitingCheck = [];
    const historyReels = [];

    allReels.forEach((r) => {
      if (r.status !== 'posted' && !r.feedback_logged) return;

      if (r.feedback_logged) {
        historyReels.push(r);
        return;
      }

      if (r.status === 'posted') {
        const postedTime = new Date(r.posted_date || r.scheduled_date);
        const diffDays = Math.floor((systemDate - postedTime) / (1000 * 60 * 60 * 24));
        if (diffDays >= 3) {
          feedbackDue.push({ reel: r, diffDays });
        } else {
          awaitingCheck.push({ reel: r, diffDays, daysRemaining: 3 - diffDays });
        }
      }
    });

    let html = `
      <div class="feedback-lane" style="max-width: 900px; margin: 0 auto;">
        <!-- Header -->
        <div class="schedule-header" style="margin-bottom: 20px;">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 22px; font-weight: 700;">📊 3-Day Performance Checks & Feedback</h2>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">
              Trial reels are evaluated 3 days after posting to select the single highest-performing format as a <strong>Main Reel</strong> winner.
            </p>
          </div>
        </div>

        <!-- Metric Summary Cards -->
        <div class="grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 24px;">
          <div class="card" style="padding: 16px; border-left: 4px solid var(--accent-purple);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">Due For Review</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--accent-purple); margin: 4px 0;">${feedbackDue.length}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Posts ready for 3-day metrics</div>
          </div>

          <div class="card" style="padding: 16px; border-left: 4px solid var(--accent-blue);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">In 3-Day Window</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--accent-blue); margin: 4px 0;">${awaitingCheck.length}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Gathering audience data</div>
          </div>

          <div class="card" style="padding: 16px; border-left: 4px solid var(--accent-green);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">Evaluated / History</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--accent-green); margin: 4px 0;">${historyReels.length}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Completed performance reviews</div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-2" style="border-bottom: 1px solid var(--border-subtle); margin-bottom: 20px; padding-bottom: 8px;">
          <button class="btn btn-ghost btn-sm tab-btn ${this.activeTab === 'due' ? 'active' : ''}" id="tab-btn-due" style="${this.activeTab === 'due' ? 'font-weight: 700; color: var(--accent-purple); border-bottom: 2px solid var(--accent-purple); border-radius: 0;' : ''}">
            🚨 Action Required (${feedbackDue.length})
          </button>
          <button class="btn btn-ghost btn-sm tab-btn ${this.activeTab === 'awaiting' ? 'active' : ''}" id="tab-btn-awaiting" style="${this.activeTab === 'awaiting' ? 'font-weight: 700; color: var(--accent-blue); border-bottom: 2px solid var(--accent-blue); border-radius: 0;' : ''}">
            ⏳ Gathering Data (${awaitingCheck.length})
          </button>
          <button class="btn btn-ghost btn-sm tab-btn ${this.activeTab === 'history' ? 'active' : ''}" id="tab-btn-history" style="${this.activeTab === 'history' ? 'font-weight: 700; color: var(--accent-green); border-bottom: 2px solid var(--accent-green); border-radius: 0;' : ''}">
            🏆 Evaluated History (${historyReels.length})
          </button>
        </div>

        <!-- Tab Contents -->
        <div id="feedback-tab-content">
    `;

    if (this.activeTab === 'due') {
      if (feedbackDue.length === 0) {
        html += `
          <div class="card text-center" style="padding: 40px 20px; align-items: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">✅</div>
            <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">No Performance Checks Due Right Now</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 480px; margin: 8px auto 16px;">
              You're all caught up! When scheduled trial reels reach 3 days after posting, they will automatically land here for performance scoring and winner selection.
            </p>
            ${awaitingCheck.length > 0 ? `
              ${devToolsEnabled ? `<p style="font-size: 12.5px; color: var(--accent-purple); font-weight: 600;">
                💡 You have ${awaitingCheck.length} post(s) currently in their 3-day window. Use Developer options in Settings to fast-forward time for testing.
              </p>` : ''}
            ` : `
              <button class="btn btn-primary btn-sm" id="btn-feedback-goto-schedule">Go to Publishing Calendar →</button>
            `}
          </div>
        `;
      } else {
        html += `
          <div class="flex flex-col gap-3">
            ${feedbackDue.map(({ reel, diffDays }) => {
              const formatMeta = getFormatById(reel.format);
              return `
                <div class="card" style="padding: 18px; border-left: 4px solid var(--accent-purple);">
                  <div class="flex items-center justify-between" style="margin-bottom: 8px;">
                    <div class="flex items-center gap-2">
                      <span style="font-size: 18px;">${formatMeta.icon || '💡'}</span>
                      <span class="action-card-badge badge-purple">📊 3-Day Check Due (${diffDays} days ago)</span>
                      <span style="font-size: 13px; font-weight: 600;">${escapeHtml(reel.format)}</span>
                    </div>
                    <span style="font-size: 12px; color: var(--text-tertiary);">Posted ${formatDate(reel.posted_date || reel.scheduled_date)}</span>
                  </div>

                  <h3 style="font-family: var(--font-heading); font-size: 16.5px; font-weight: 700; margin-bottom: 6px;">${escapeHtml(reel.title)}</h3>
                  <div style="background: var(--bg-subtle); padding: 10px 12px; border-radius: var(--radius-md); font-size: 13.5px; margin-bottom: 12px;">
                    "${escapeHtml(reel.hook)}"
                  </div>

                  <div class="flex gap-2 justify-between items-center" style="border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                    <span style="font-size: 12.5px; font-weight: 600; color: var(--accent-blue);">CTA: ${escapeHtml(reel.cta)}</span>
                    <button class="btn btn-primary btn-sm btn-feedback-log" data-id="${reel.id}">
                      Log 3-Day Feedback & Pick Winner →
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    } else if (this.activeTab === 'awaiting') {
      if (awaitingCheck.length === 0) {
        html += `
          <div class="card text-center" style="padding: 40px 20px; align-items: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">📱</div>
            <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">No Posts Currently Gathering Data</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 480px; margin: 8px auto 16px;">
              Mark your scheduled reels as "Posted" on the Publishing Calendar or Today's Dashboard to start their 3-day performance clock.
            </p>
            <button class="btn btn-primary btn-sm" id="btn-feedback-goto-schedule-2">View Publishing Schedule →</button>
          </div>
        `;
      } else {
        html += `
          <div class="flex flex-col gap-3">
            ${awaitingCheck.map(({ reel, diffDays, daysRemaining }) => {
              const formatMeta = getFormatById(reel.format);
              return `
                <div class="card" style="padding: 18px; border-left: 4px solid var(--accent-blue);">
                  <div class="flex items-center justify-between" style="margin-bottom: 8px;">
                    <div class="flex items-center gap-2">
                      <span style="font-size: 18px;">${formatMeta.icon || '💡'}</span>
                      <span class="action-card-badge badge-blue">⏳ ${daysRemaining} Day${daysRemaining === 1 ? '' : 's'} Remaining</span>
                      <span style="font-size: 13px; font-weight: 600;">${escapeHtml(reel.format)}</span>
                    </div>
                    <span style="font-size: 12px; color: var(--text-tertiary);">Posted ${formatDate(reel.posted_date || reel.scheduled_date)}</span>
                  </div>

                  <h3 style="font-family: var(--font-heading); font-size: 16.5px; font-weight: 700; margin-bottom: 6px;">${escapeHtml(reel.title)}</h3>
                  <div style="background: var(--bg-subtle); padding: 10px 12px; border-radius: var(--radius-md); font-size: 13.5px; margin-bottom: 12px;">
                    "${escapeHtml(reel.hook)}"
                  </div>

                  <div class="flex gap-2 justify-between items-center" style="border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                    <span style="font-size: 12px; color: var(--text-secondary);">3-day performance timer active (${diffDays} day${diffDays === 1 ? '' : 's'} elapsed)</span>
                    <button class="btn btn-secondary btn-sm btn-feedback-log" data-id="${reel.id}">
                      Log Feedback Early
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    } else if (this.activeTab === 'history') {
      if (historyReels.length === 0) {
        html += `
          <div class="card text-center" style="padding: 40px 20px; align-items: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">📜</div>
            <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">No Evaluated Reels Yet</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 480px; margin: 8px auto;">
              Once you log performance feedback on trial reels, they will appear here along with their view counts and winning Main Reel statuses.
            </p>
          </div>
        `;
      } else {
        html += `
          <div class="flex flex-col gap-3">
            ${historyReels.map((reel) => {
              const formatMeta = getFormatById(reel.format);
              const m = reel.metrics || {};
              const isWinner = reel.is_main_reel_winner || reel.is_main_reel;

              return `
                <div class="card" style="padding: 18px; border-left: 4px solid ${isWinner ? 'var(--accent-purple)' : 'var(--accent-green)'};">
                  <div class="flex items-center justify-between" style="margin-bottom: 8px;">
                    <div class="flex items-center gap-2">
                      <span style="font-size: 18px;">${formatMeta.icon || '💡'}</span>
                      <span class="action-card-badge ${isWinner ? 'badge-purple' : 'badge-green'}">
                        ${isWinner ? '⭐ Main Reel Winner' : '✓ Trial Evaluated'}
                      </span>
                      <span style="font-size: 13px; font-weight: 600;">${escapeHtml(reel.format)}</span>
                    </div>
                    <span style="font-size: 12px; color: var(--text-tertiary);">Logged ${m.logged_at ? formatDate(m.logged_at) : 'Completed'}</span>
                  </div>

                  <h3 style="font-family: var(--font-heading); font-size: 16.5px; font-weight: 700; margin-bottom: 8px;">${escapeHtml(reel.title)}</h3>

                  <!-- Metric Pill Badges -->
                  <div class="flex gap-3" style="margin-bottom: 10px; background: var(--bg-subtle); padding: 8px 12px; border-radius: var(--radius-md); font-size: 12.5px; flex-wrap: wrap;">
                    <span>👀 <strong>${(m.views || 0).toLocaleString()}</strong> views</span>
                    <span>❤️ <strong>${(m.likes || 0).toLocaleString()}</strong> likes</span>
                    <span>💬 <strong>${(m.comments || 0).toLocaleString()}</strong> comments</span>
                    <span>🔖 <strong>${(m.shares || 0).toLocaleString()}</strong> shares/saves</span>
                  </div>

                  ${m.notes ? `
                    <p style="font-size: 12.5px; color: var(--text-secondary); font-style: italic; margin-bottom: 8px;">
                      Doctor notes: "${escapeHtml(m.notes)}"
                    </p>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    }

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Attach Event Listeners
    document.getElementById('tab-btn-due')?.addEventListener('click', () => {
      this.activeTab = 'due';
      this.render(container, navigateTo, openModal);
    });

    document.getElementById('tab-btn-awaiting')?.addEventListener('click', () => {
      this.activeTab = 'awaiting';
      this.render(container, navigateTo, openModal);
    });

    document.getElementById('tab-btn-history')?.addEventListener('click', () => {
      this.activeTab = 'history';
      this.render(container, navigateTo, openModal);
    });

    document.getElementById('btn-feedback-goto-schedule')?.addEventListener('click', () => {
      navigateTo('schedule');
    });

    document.getElementById('btn-feedback-goto-schedule-2')?.addEventListener('click', () => {
      navigateTo('schedule');
    });

    container.querySelectorAll('.btn-feedback-log').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openModal('trialFeedback', { reelId: id });
      });
    });
  }
};


/* js/components/library.js */
/**
 * Content OS for Doctors — Content Library & Unified Insight Timelines
 * Every idea has its own chronological timeline from clinical spark to Main Reel.
 */


const LibraryView = {
  activeInsightId: null,

  async render(container, navigateTo, openModal) {
    const insights = await db.getInsights();
    const scripts = await db.getScripts();
    const reels = await db.getScheduledReels();

    if (this.activeInsightId) {
      this.renderInsightTimeline(container, this.activeInsightId, insights, scripts, reels, navigateTo, openModal);
      return;
    }

    let html = `
      <div class="library-grid">
        <div class="schedule-header">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">
              Clinical Content Library
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
              Every insight has a single chronological timeline. Tap any idea to view its full lifecycle.
            </p>
          </div>

          <button class="btn btn-primary btn-sm" id="btn-library-new-insight">
            <span>+ New Insight</span>
          </button>
        </div>
    `;

    if (insights.length === 0) {
      html += `
        <div class="card text-center" style="padding: 40px 20px;">
          <p style="font-size: 14.5px; color: var(--text-tertiary);">No clinical insights yet. Record your first insight to build your library.</p>
        </div>
      `;
    } else {
      html += `
        <div class="flex flex-col gap-3">
          ${insights.map((ins) => {
            const insScripts = scripts.filter((s) => s.insight_id === ins.id);
            const insReels = reels.filter((r) => r.insight_id === ins.id);
            const acceptedCount = insScripts.filter((s) => s.status === 'accepted').length;
            const postedCount = insReels.filter((r) => r.status === 'posted').length;
            const hasMainReel = insReels.some((r) => r.is_main_reel);

            return `
              <div class="card btn-open-insight" data-id="${ins.id}" style="cursor: pointer;">
                <div class="flex items-center justify-between" style="margin-bottom: 6px;">
                  <span style="font-size: 12px; color: var(--text-tertiary);">${formatRelativeDate(ins.created_at)}</span>
                  <div class="flex gap-2">
                    ${hasMainReel ? `<span class="action-card-badge badge-purple">⭐ Main Reel</span>` : ''}
                    <span class="action-card-badge badge-blue">${insScripts.length} Scripts</span>
                  </div>
                </div>

                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                  ${escapeHtml(ins.title)}
                </h3>

                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 12px;">
                  ${escapeHtml(ins.description || ins.supporting_points || '')}
                </p>

                <div class="flex items-center justify-between" style="border-top: 1px solid var(--border-subtle); padding-top: 10px; font-size: 12.5px; color: var(--text-secondary);">
                  <span>${acceptedCount} Accepted • ${postedCount} Posted</span>
                  <span style="color: var(--accent-blue); font-weight: 600;">View Timeline →</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Open Insight detail timeline
    container.querySelectorAll('.btn-open-insight').forEach((el) => {
      el.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.activeInsightId = id;
        LibraryView.render(container, navigateTo, openModal);
      });
    });

    document.getElementById('btn-library-new-insight')?.addEventListener('click', () => {
      openModal('insightCreate');
    });
  },

  renderInsightTimeline(container, insightId, insights, scripts, reels, navigateTo, openModal) {
    const insight = insights.find((i) => i.id === insightId);
    if (!insight) {
      this.activeInsightId = null;
      LibraryView.render(container, navigateTo, openModal);
      return;
    }

    const insScripts = scripts.filter((s) => s.insight_id === insight.id);
    const insReels = reels.filter((r) => r.insight_id === insight.id);

    let html = `
      <div class="library-grid">
        <button class="btn btn-ghost btn-sm" id="btn-back-to-library" style="margin-bottom: 12px; align-self: flex-start;">
          ← Back to Library
        </button>

        <div class="card" style="margin-bottom: 16px;">
          <div class="flex justify-between items-center">
            <span style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: var(--accent-blue);">
              Clinical Insight Timeline
            </span>
            <button class="btn btn-danger btn-sm" id="btn-delete-insight-timeline" data-id="${insight.id}">
              Delete Insight
            </button>
          </div>
          <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; margin: 4px 0 8px;">
            ${escapeHtml(insight.title)}
          </h2>
          <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.45;">
            ${escapeHtml(insight.supporting_points || insight.description || '')}
          </p>
          ${
            insight.references
              ? `<div style="margin-top: 10px; font-size: 12px; color: var(--text-tertiary);">References: ${escapeHtml(insight.references)}</div>`
              : ''
          }
        </div>

        <!-- The Chronological Timeline -->
        <div class="insight-timeline">

          <!-- Node 1: Clinical Spark Recorded -->
          <div class="timeline-node">
            <div class="timeline-dot done">✓</div>
            <div class="timeline-content">
              <div class="flex justify-between items-center" style="margin-bottom: 4px;">
                <strong style="font-size: 14px;">1. Clinical Idea Captured</strong>
                <span style="font-size: 12px; color: var(--text-tertiary);">${formatDate(insight.created_at)}</span>
              </div>
              <p style="font-size: 13px; color: var(--text-secondary);">Recorded in doctor workspace.</p>
            </div>
          </div>

          <!-- Node 2: Generated Scripts & Review Status -->
          <div class="timeline-node">
            <div class="timeline-dot ${insScripts.length > 0 ? 'done' : ''}">
              ${insScripts.length > 0 ? '✓' : '2'}
            </div>
            <div class="timeline-content">
              <div class="flex justify-between items-center" style="margin-bottom: 4px;">
                <strong style="font-size: 14px;">2. AI Scripts Review (${insScripts.length} Formats)</strong>
              </div>

              ${
                insScripts.length === 0
                  ? `<p style="font-size: 13px; color: var(--text-tertiary);">No scripts imported yet.</p>
                     <button class="btn btn-primary btn-sm" id="btn-timeline-import-now" style="margin-top: 6px;">Import AI Pack</button>`
                  : `<div class="flex flex-col gap-2" style="margin-top: 6px;">
                      ${insScripts.map((s) => `
                        <div style="font-size: 12.5px; display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid var(--border-subtle);">
                          <span>${escapeHtml(s.format)}: <strong>${escapeHtml(s.title)}</strong></span>
                          <span class="action-card-badge ${s.status === 'accepted' ? 'badge-green' : s.status === 'rejected' ? 'badge-red' : 'badge-amber'}">
                            ${s.status}
                          </span>
                        </div>
                      `).join('')}
                    </div>`
              }
            </div>
          </div>

          <!-- Node 3: Trial Reel Scheduling -->
          <div class="timeline-node">
            <div class="timeline-dot ${insReels.length > 0 ? 'done' : ''}">
              ${insReels.length > 0 ? '✓' : '3'}
            </div>
            <div class="timeline-content">
              <div class="flex justify-between items-center" style="margin-bottom: 4px;">
                <strong style="font-size: 14px;">3. Trial Reels on Calendar</strong>
              </div>
              ${
                insReels.length === 0
                  ? `<p style="font-size: 13px; color: var(--text-tertiary);">Accept a script in Flashcard Review to automatically schedule a Trial Reel.</p>`
                  : insReels.map((r) => `
                      <div style="font-size: 13px; margin-top: 4px;">
                        • ${r.is_main_reel ? '⭐ ' : ''}${r.format} scheduled for <strong>${formatDate(r.scheduled_date)}</strong> (${r.status})
                      </div>
                    `).join('')
              }
            </div>
          </div>

          <!-- Node 4: 3-Day Feedback & Main Reel Result -->
          <div class="timeline-node">
            <div class="timeline-dot ${insReels.some((r) => r.is_main_reel || r.feedback_logged) ? 'done' : ''}">
              4
            </div>
            <div class="timeline-content">
              <div class="flex justify-between items-center" style="margin-bottom: 4px;">
                <strong style="font-size: 14px;">4. 3-Day Performance & Main Reel Decision</strong>
              </div>
              ${
                insReels.some((r) => r.feedback_logged)
                  ? insReels.filter((r) => r.feedback_logged).map((r) => `
                      <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                        Logged: ${r.metrics?.views || 0} views • ${r.metrics?.likes || 0} likes • Decision: ${r.is_main_reel_winner ? '⭐ Promoted to Main Reel' : 'Archived'}
                      </div>
                    `).join('')
                  : `<p style="font-size: 13px; color: var(--text-tertiary);">Feedback will trigger automatically 3 days after posting.</p>`
              }
            </div>
          </div>

        </div>
      </div>
    `;

    container.innerHTML = html;

    document.getElementById('btn-back-to-library')?.addEventListener('click', () => {
      this.activeInsightId = null;
      LibraryView.render(container, navigateTo, openModal);
    });

    document.getElementById('btn-delete-insight-timeline')?.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (confirm('Delete this insight and all associated scripts & reels?')) {
        await db.deleteInsight(id);
        showToast('Insight deleted!', 'info');
        this.activeInsightId = null;
        LibraryView.render(container, navigateTo, openModal);
      }
    });

    document.getElementById('btn-timeline-import-now')?.addEventListener('click', () => {
      openModal('aiImport', { insightId: insight.id });
    });
  }
};


/* js/components/settings.js */
/** Doctor profile, workflow settings, data controls, and gated developer tools. */


const DEV_ACCESS_KEYS = new Set(['kg-01', 'sm-01', 'tj-01']);

function cardHead(icon, title, description) {
  return `<div class="settings-card-head"><div class="settings-card-icon" aria-hidden="true">${icon}</div><div><h3 class="settings-card-title">${title}</h3><p class="settings-card-description">${description}</p></div></div>`;
}

const SettingsView = {
  async render(container, navigateTo) {
    const profile = await db.getProfile();
    const timeShift = getTimeShiftDays();
    const devToolsEnabled = getDevToolsEnabled();
    const writingInstructions = profile.writingInstructions || getDefaultWritingInstructions();

    container.innerHTML = `
      <div class="settings-shell">
        <header class="settings-hero">
          <p class="settings-eyebrow">Workspace preferences</p>
          <h2 class="settings-title">Settings that stay out of your way</h2>
          <p class="settings-subtitle">Set up your voice, scheduling rules, workflow, and backups in one organized workspace.</p>
        </header>

        <div class="settings-grid">
          <form id="form-doctor-profile" class="card settings-card settings-card-wide">
            ${cardHead('🧑‍⚕️', 'Doctor profile & voice', 'These choices are applied to every new content prompt.')}
            <div class="settings-form-grid">
              <div class="form-group"><label class="form-label" for="prof-name">Doctor name *</label><input type="text" id="prof-name" class="form-input" value="${escapeHtml(profile.name || '')}" required></div>
              <div class="form-group"><label class="form-label" for="prof-specialty">Medical specialty *</label><input type="text" id="prof-specialty" class="form-input" value="${escapeHtml(profile.specialty || '')}" required></div>
              <div class="form-group"><label class="form-label" for="prof-audience">Target audience</label><select id="prof-audience" class="form-select"><option value="Patients" ${profile.audience === 'Patients' ? 'selected' : ''}>Patients</option><option value="Doctors" ${profile.audience === 'Doctors' ? 'selected' : ''}>Doctors</option><option value="Both" ${profile.audience === 'Both' ? 'selected' : ''}>Both</option></select></div>
              <div class="form-group"><label class="form-label" for="prof-lang">Primary language / dialect</label><select id="prof-lang" class="form-select"><option value="English" ${profile.language === 'English' ? 'selected' : ''}>English</option><option value="Hinglish" ${profile.language === 'Hinglish' ? 'selected' : ''}>Hinglish</option><option value="Hindi" ${profile.language === 'Hindi' ? 'selected' : ''}>Hindi</option><option value="Marathi" ${profile.language === 'Marathi' ? 'selected' : ''}>Marathi</option><option value="Telugu" ${profile.language === 'Telugu' ? 'selected' : ''}>Telugu</option><option value="Kannada" ${profile.language === 'Kannada' ? 'selected' : ''}>Kannada</option><option value="Punjabi" ${profile.language === 'Punjabi' ? 'selected' : ''}>Punjabi</option></select></div>
              <div class="form-group"><label class="form-label" for="prof-tone">Preferred tone</label><select id="prof-tone" class="form-select"><option value="Conversational & Empathetic" ${profile.tone === 'Conversational & Empathetic' ? 'selected' : ''}>Conversational & empathetic</option><option value="Authoritative & Evidence-Based" ${profile.tone === 'Authoritative & Evidence-Based' ? 'selected' : ''}>Authoritative & evidence-based</option><option value="Friendly & Approachable" ${profile.tone === 'Friendly & Approachable' ? 'selected' : ''}>Friendly & approachable</option></select></div>
              <div class="form-group full-width"><label class="form-label" for="prof-clinic">Clinic / hospital name <span class="form-sublabel">optional</span></label><input type="text" id="prof-clinic" class="form-input" value="${escapeHtml(profile.clinicName || '')}" placeholder="e.g. Heart & Vascular Institute"></div>
            </div><div class="settings-card-actions"><button type="submit" class="btn btn-primary">Save profile</button></div>
          </form>

          <section class="card settings-card settings-card-wide">
            ${cardHead('✦', 'AI writing instructions', 'Shape the creative direction without risking the JSON output.')}
            <div class="prompt-safe-guide"><strong>Only these writing instructions are editable.</strong><p>Your doctor details, selected language and length, CTA, and JSON output contract stay protected so imported scripts remain reliable.</p></div>
            <label class="form-label" for="setting-writing-instructions">Writing instructions</label><p class="settings-helper" style="margin-bottom:8px;">Adjust the creative brief, hook style, storytelling, and clinical-depth guidance. The output structure is locked.</p>
            <textarea id="setting-writing-instructions" class="form-textarea prompt-preview" rows="22">${escapeHtml(writingInstructions)}</textarea>
            <div class="settings-card-actions"><button class="btn btn-primary btn-sm" id="btn-save-writing-instructions">Save writing instructions</button><button class="btn btn-secondary btn-sm" id="btn-restore-writing-instructions">Restore default instructions</button></div>
          </section>

          <section class="card settings-card">
            ${cardHead('🗓️', 'Schedule', 'Space approved scripts evenly and avoid overloading a single day.')}
            <div class="form-group"><label class="form-label" for="setting-sprinkle-window">Scheduling window</label><select id="setting-sprinkle-window" class="form-select"><option value="7" ${profile.sprinkleWindowDays === 7 ? 'selected' : ''}>1 week (7 days)</option><option value="14" ${!profile.sprinkleWindowDays || profile.sprinkleWindowDays === 14 ? 'selected' : ''}>2 weeks (14 days)</option><option value="21" ${profile.sprinkleWindowDays === 21 ? 'selected' : ''}>3 weeks (21 days)</option><option value="30" ${profile.sprinkleWindowDays === 30 ? 'selected' : ''}>1 month (30 days)</option></select></div>
            <div class="form-group"><label class="form-label" for="setting-max-posts">Maximum posts per day</label><select id="setting-max-posts" class="form-select"><option value="1" ${!profile.maxPostsPerDay || profile.maxPostsPerDay === 1 ? 'selected' : ''}>1 post</option><option value="2" ${profile.maxPostsPerDay === 2 ? 'selected' : ''}>2 posts</option><option value="3" ${profile.maxPostsPerDay === 3 ? 'selected' : ''}>3 posts</option></select></div>
            <div class="form-group"><label class="form-label" for="setting-sprinkle-strategy">Distribution</label><select id="setting-sprinkle-strategy" class="form-select"><option value="uniform" ${!profile.sprinkleStrategy || profile.sprinkleStrategy === 'uniform' ? 'selected' : ''}>Uniform spacing</option><option value="front_loaded" ${profile.sprinkleStrategy === 'front_loaded' ? 'selected' : ''}>Front-loaded</option></select></div><div class="settings-card-actions"><button class="btn btn-secondary btn-sm" id="btn-resprinkle-now">Re-space schedule</button><button class="btn btn-primary btn-sm" id="btn-save-sprinkle-settings">Save</button></div>
          </section>

          <section class="card settings-card">
            ${cardHead('🎬', 'Workflow', 'Keep only the steps that match how you work.')}
            <div class="settings-choice"><input type="checkbox" id="setting-enable-filming" ${profile.enableFilmingWorkflow ? 'checked' : ''}><div><label for="setting-enable-filming">Enable filming status workflow</label><p>Show filming queues and “Mark filmed” actions before posting.</p></div></div>
            <div class="form-group" style="margin-top:16px; margin-bottom:0;"><label class="form-label" for="setting-missed-post-mode">When a post is missed</label><select id="setting-missed-post-mode" class="form-select"><option value="manual" ${(profile.missedPostRescheduleMode || 'manual') === 'manual' ? 'selected' : ''}>Ask me first</option><option value="auto" ${profile.missedPostRescheduleMode === 'auto' ? 'selected' : ''}>Automatically reschedule</option></select><p class="settings-helper">Automatic mode moves only missed posts and leaves filmed reels in place.</p></div>
          </section>

          <section class="card settings-card">${cardHead('↥', 'Backup & restore', 'Your workspace stays in this browser. Save a JSON backup before changing devices or resetting data.')}<div class="settings-card-actions"><button class="btn btn-secondary btn-sm" id="btn-export-json">Export backup</button><button class="btn btn-secondary btn-sm" id="btn-import-json-trigger">Restore backup</button><input type="file" id="input-file-backup" accept=".json,application/json" class="hidden"></div></section>

          <section class="card settings-card settings-support-card">
            ${cardHead('💬', 'Support & feedback', "We're here to help — reach out any time.")}
            <div class="support-beta-banner">
              <span class="support-beta-badge">Beta</span>
              <p class="support-beta-text">Thank you for trying out the beta version of ContentMate! Your feedback helps us build something truly great for doctors.</p>
            </div>
            <p class="settings-helper" style="margin-top:12px;">For support, feedback, or bug reports, WhatsApp us directly:</p>
            <a href="https://wa.me/852183292" target="_blank" rel="noopener noreferrer" class="support-contact-btn" id="btn-support-whatsapp" aria-label="WhatsApp support at 852183292">
              <span class="support-contact-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.18-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.22-3.48-8.52zM12 21.94a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.67.96.98-3.57-.24-.37A9.9 9.9 0 0 1 2.06 12C2.06 6.49 6.49 2.06 12 2.06c2.67 0 5.18 1.04 7.07 2.93A9.94 9.94 0 0 1 21.94 12c0 5.51-4.43 9.94-9.94 9.94zm5.44-7.44c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07a8.17 8.17 0 0 1-2.4-1.48 9.01 9.01 0 0 1-1.66-2.07c-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.19-.57-.34z" fill="currentColor"/></svg>
              </span>
              <div class="support-contact-info">
                <span class="support-contact-number">852 183 292</span>
                <span class="support-contact-hint">Open in WhatsApp</span>
              </div>
            </a>
          </section>

          <section class="card settings-card developer-card">
            ${cardHead('⌘', 'Developer options', 'Testing tools are hidden by default so the regular workspace stays clean.')}
            <div class="settings-choice"><input type="checkbox" id="setting-dev-tools" ${devToolsEnabled ? 'checked' : ''}><div><label for="setting-dev-tools">Enable developer options for this session</label><p>Includes 3-day time travel and the Cardiology demo workspace.</p></div></div>
            ${!devToolsEnabled ? `<form class="dev-access-panel hidden" id="dev-access-form"><label class="form-label" for="dev-access-key">Developer access key</label><input id="dev-access-key" type="password" class="form-input" autocomplete="off" autocapitalize="none" spellcheck="false"><div class="settings-card-actions"><button class="btn btn-primary btn-sm" type="submit">Unlock developer options</button></div></form>` : `<div class="dev-tools-panel"><h4>Developer tools are active</h4><p>These testing controls are available only for this browser session.</p><div class="settings-card-actions"><button class="btn btn-accent btn-sm" id="btn-test-time-travel">⏩ Add 3 days</button>${timeShift !== 0 ? '<button class="btn btn-secondary btn-sm" id="btn-reset-time-travel">Reset to today</button>' : ''}<button class="btn btn-secondary btn-sm" id="btn-load-demo-settings">Load Cardiology demo</button></div><p style="margin-top:10px; margin-bottom:0; color:${timeShift ? 'var(--accent-purple)' : 'var(--text-tertiary)'};">${timeShift ? `Time shift active: +${timeShift} days` : 'System date: actual today'}</p></div>`}
          </section>

          <section class="card settings-card settings-card-wide settings-danger">${cardHead('⚠️', 'Reset workspace', 'Permanently delete insights, notes, scripts, and scheduled reels from this browser.')}<div class="settings-card-actions"><button class="btn btn-danger" id="btn-reset-all-data">Delete all data & reset workspace</button></div></section>
        </div>
      </div>`;

    const saveProfile = async (changes, message) => { Object.assign(profile, changes); await db.saveProfile(profile); if (message) showToast(message, 'success'); };

    document.getElementById('form-doctor-profile')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      await saveProfile({ name: document.getElementById('prof-name').value.trim(), specialty: document.getElementById('prof-specialty').value.trim(), audience: document.getElementById('prof-audience').value, language: document.getElementById('prof-lang').value, tone: document.getElementById('prof-tone').value, clinicName: document.getElementById('prof-clinic').value.trim(), onboarded: true }, 'Doctor profile saved.');
      const sideName = document.getElementById('sidebar-dr-name'); if (sideName) sideName.textContent = profile.name || 'Doctor Workspace';
    });
    document.getElementById('btn-save-writing-instructions')?.addEventListener('click', async () => {
      const updatedInstructions = document.getElementById('setting-writing-instructions').value.trim();
      if (!updatedInstructions) { showToast('Writing instructions cannot be empty.', 'error'); return; }
      await saveProfile({ writingInstructions: updatedInstructions }, 'Writing instructions saved.');
    });
    document.getElementById('btn-restore-writing-instructions')?.addEventListener('click', async () => {
      if (!confirm('Restore the default writing instructions? Your saved edits will be replaced.')) return;
      delete profile.writingInstructions;
      await db.saveProfile(profile);
      document.getElementById('setting-writing-instructions').value = getDefaultWritingInstructions();
      showToast('Default writing instructions restored.', 'success');
    });

    const saveSchedule = async (andRespace = false) => { await saveProfile({ sprinkleWindowDays: Number(document.getElementById('setting-sprinkle-window').value), maxPostsPerDay: Number(document.getElementById('setting-max-posts').value), sprinkleStrategy: document.getElementById('setting-sprinkle-strategy').value }); const result = await recalculateFutureSchedule(); showToast(andRespace ? `Re-spaced ${result.updatedCount} future reels.` : 'Schedule settings saved and re-spaced.', 'success'); };
    document.getElementById('btn-save-sprinkle-settings')?.addEventListener('click', () => saveSchedule(false));
    document.getElementById('btn-resprinkle-now')?.addEventListener('click', () => saveSchedule(true));
    document.getElementById('setting-enable-filming')?.addEventListener('change', (event) => saveProfile({ enableFilmingWorkflow: event.target.checked }, event.target.checked ? 'Filming workflow enabled.' : 'Filming workflow disabled.'));
    document.getElementById('setting-missed-post-mode')?.addEventListener('change', (event) => saveProfile({ missedPostRescheduleMode: event.target.value }, 'Missed-post preference saved.'));

    document.getElementById('setting-dev-tools')?.addEventListener('change', (event) => {
      if (event.target.checked && !getDevToolsEnabled()) { event.target.checked = false; document.getElementById('dev-access-form')?.classList.remove('hidden'); document.getElementById('dev-access-key')?.focus(); }
      else if (!event.target.checked) { setDevToolsEnabled(false); showToast('Developer options locked.', 'info'); this.render(container, navigateTo); }
    });
    document.getElementById('dev-access-form')?.addEventListener('submit', (event) => {
      event.preventDefault(); const key = document.getElementById('dev-access-key').value.trim();
      if (!DEV_ACCESS_KEYS.has(key.toLowerCase())) { showToast('Incorrect access key.', 'error'); return; }
      setDevToolsEnabled(true); showToast('Developer options unlocked for this session.', 'success'); this.render(container, navigateTo);
    });
    document.getElementById('btn-test-time-travel')?.addEventListener('click', () => { setTimeShiftDays(getTimeShiftDays() + 3); showToast('System date advanced by 3 days.', 'success'); this.render(container, navigateTo); });
    document.getElementById('btn-reset-time-travel')?.addEventListener('click', () => { setTimeShiftDays(0); showToast('System date reset to today.', 'info'); this.render(container, navigateTo); });
    document.getElementById('btn-load-demo-settings')?.addEventListener('click', async () => { await populateSampleDoctorWorkspace(); showToast('Cardiology demo workspace loaded.', 'success'); navigateTo('dashboard'); });

    document.getElementById('btn-export-json')?.addEventListener('click', async () => { const backup = await db.exportFullDatabase(); const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = `doctor-content-os-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); showToast('Backup JSON downloaded.', 'success'); });
    document.getElementById('btn-import-json-trigger')?.addEventListener('click', () => document.getElementById('input-file-backup')?.click());
    document.getElementById('input-file-backup')?.addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; try { await db.importFullDatabase(JSON.parse(await file.text())); showToast('Workspace restored from JSON.', 'success'); navigateTo('dashboard'); } catch (error) { showToast(`Restore failed: ${error.message}`, 'error'); } });
    document.getElementById('btn-reset-all-data')?.addEventListener('click', async () => { if (confirm('Delete all workspace data? This cannot be undone.')) { await db.resetAllData(); showToast('Workspace reset.', 'info'); window.location.reload(); } });
  }
};


/* js/app.js */
/**
 * Content OS for Doctors — Main Application Coordinator & Router
 * Orchestrates local-first database, mobile bottom-nav, modal sheets, and views.
 */


class ContentOSApp {
  constructor() {
    this.currentView = 'dashboard';
    this.modalActive = false;
    this.viewContainer = document.getElementById('view-container');
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalBody = document.getElementById('modal-body');
    this.modalTitle = document.getElementById('modal-title');
    this.modalCard = document.getElementById('modal-card');
    this.headerViewTitle = document.getElementById('header-view-title');
    this.headerDate = document.getElementById('header-today-date');
  }

  async init() {
    // 1. A clean workspace starts with a short, guided setup—not demo data.
    const profile = await db.getProfile();
    if (!profile || !profile.onboarded) {
      await db.saveProfile({
        ...profile,
        name: profile?.name === 'Dr. Sarah Chen' ? '' : (profile?.name || ''),
        specialty: profile?.specialty === 'Cardiologist & Preventative Health' ? '' : (profile?.specialty || ''),
        clinicName: profile?.clinicName === 'Heart & Vascular Institute' ? '' : (profile?.clinicName || ''),
        audience: profile?.audience || 'Patients',
        onboarded: false,
        tutorialSeen: false
      });
    }

    const updatedProfile = await db.getProfile();
    const sideName = document.getElementById('sidebar-dr-name');
    if (sideName) sideName.textContent = updatedProfile.name || 'Doctor Workspace';

    // 2. Set dynamic header date
    if (this.headerDate) {
      this.headerDate.textContent = formatDate(getSystemDate());
    }

    // 3. Setup Navigation & Routing
    this.setupNavigation();
    window.addEventListener('doctor-os-system-date-change', () => {
      if (this.headerDate) this.headerDate.textContent = formatDate(getSystemDate());
      this.updateBadges();
    });

    // 4. Setup Modal listeners
    this.setupModals();

    // 5. Initial View Load
    const hash = window.location.hash.replace(/^#/, '');
    await this.navigateTo(hash || 'dashboard');

    if (!updatedProfile.onboarded) {
      await this.startOnboarding();
    }

    // 6. Update Badge Counts
    this.updateBadges();
  }

  setupNavigation() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace(/^#/, '');
      this.navigateTo(hash || 'dashboard');
    });

    // Mobile FAB capture
    document.getElementById('bnav-fab-capture')?.addEventListener('click', () => {
      this.openModal('insightCreate');
    });

    document.getElementById('header-btn-note')?.addEventListener('click', () => {
      this.openModal('quickNote');
    });

    document.getElementById('header-btn-insight')?.addEventListener('click', () => {
      this.openModal('insightCreate');
    });

  }

  async navigateTo(viewName) {
    this.currentView = viewName;
    window.location.hash = viewName;

    if (viewName === 'dashboard') {
      const profile = await db.getProfile();
      if (profile.missedPostRescheduleMode === 'auto') await rescheduleMissedPosts();
    }

    // Update active nav links (sidebar & mobile bottom nav)
    document.querySelectorAll('.nav-link, .bnav-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.view === viewName);
    });

    // Update header title
    const titles = {
      dashboard: "Today's Workspace",
      review: "Script Review Deck",
      schedule: "Content Schedule",
      feedback: "Feedback Due",
      notes: "Quick Thoughts",
      library: "Content Library",
      settings: "Doctor Profile"
    };

    if (this.headerViewTitle) {
      this.headerViewTitle.textContent = titles[viewName] || "Doctor Workspace";
    }

    // Render corresponding view
    if (viewName === 'dashboard') {
      await DashboardView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
    } else if (viewName === 'review') {
      await ScriptReviewView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
    } else if (viewName === 'schedule') {
      await ScheduleView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
    } else if (viewName === 'feedback') {
      await FeedbackView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
    } else if (viewName === 'notes') {
      await NotesView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
    } else if (viewName === 'library') {
      await LibraryView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
    } else if (viewName === 'settings') {
      await SettingsView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
    }

    this.updateBadges();
  }

  setupModals() {
    document.getElementById('modal-close-btn')?.addEventListener('click', () => this.closeModal());
    this.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalActive) this.closeModal();
    });
  }

  openModal(modalType, options = {}) {
    this.modalActive = true;
    this.modalOverlay.classList.remove('hidden');
    this.modalCard?.classList.toggle('onboarding-card', modalType === 'onboarding');

    const titles = {
      insightCreate: 'Record New Clinical Insight',
      quickNote: 'Quick Thought / Scratchpad',
      aiImport: 'Import AI Script Pack',
      manualScript: 'Add Your Own Script',
      trialFeedback: '3-Day Trial Reel Feedback',
      scriptDetail: 'Reel Script',
      onboarding: 'Welcome to Content Mate'
    };

    this.modalTitle.textContent = titles[modalType] || 'Action Sheet';

    if (modalType === 'insightCreate') {
      InsightCreateModal.render(this.modalBody, options, this.closeModal.bind(this), this.openModal.bind(this));
    } else if (modalType === 'quickNote') {
      this.modalBody.innerHTML = `
        <form id="modal-form-quick-note" class="flex flex-col gap-3">
          <p style="font-size: 13px; color: var(--text-secondary);">Capture an incomplete clinical spark. Convert it into a prompt whenever ready.</p>
          <textarea id="modal-input-note" class="form-textarea" rows="3" placeholder="e.g. I should explain Vitamin D deficiency..." required></textarea>
          <div class="flex justify-between items-center" style="margin-top: 6px;">
            <button type="button" class="btn btn-ghost btn-sm" id="btn-modal-cancel-note">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Save Thought</button>
          </div>
        </form>
      `;

      document.getElementById('btn-modal-cancel-note')?.addEventListener('click', () => this.closeModal());
      document.getElementById('modal-form-quick-note')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = document.getElementById('modal-input-note').value.trim();
        if (text) {
          await db.addNote({
            id: 'note-' + Date.now(),
            text,
            created_at: new Date().toISOString(),
            is_archived: false
          });
          this.closeModal();
          this.navigateTo(this.currentView);
        }
      });
    } else if (modalType === 'aiImport') {
      AIImportModal.render(this.modalBody, options, this.closeModal.bind(this), this.openModal.bind(this), this.navigateTo.bind(this));
    } else if (modalType === 'trialFeedback') {
      TrialFeedbackModal.render(this.modalBody, options, this.closeModal.bind(this), this.openModal.bind(this), this.navigateTo.bind(this));
    } else if (modalType === 'manualScript') {
      ManualScriptModal.render(this.modalBody, options, this.closeModal.bind(this), this.navigateTo.bind(this));
    } else if (modalType === 'scriptDetail') {
      const reel = options.reel || {};
      const fullScript = [
        reel.title && `TITLE: ${reel.title}`,
        reel.format && `FORMAT: ${reel.format}`,
        reel.hook && `HOOK: ${reel.hook}`,
        reel.script && `SCRIPT:\n${reel.script}`,
        reel.cta && `CTA: ${reel.cta}`
      ].filter(Boolean).join('\n\n');

      this.modalBody.innerHTML = `
        <div class="reel-script-detail">
          <div class="reel-script-detail-meta">
            <span>${escapeHtml(reel.format || 'Reel')}</span>
            ${reel.estimated_duration ? `<span>• ${escapeHtml(reel.estimated_duration)}</span>` : ''}
          </div>
          <h4 class="reel-script-detail-title">${escapeHtml(reel.title || 'Untitled script')}</h4>
          <div class="reel-script-detail-box">${escapeHtml(fullScript)}</div>
          <div class="flex justify-between items-center" style="margin-top: 16px;">
            <button type="button" class="btn btn-ghost" id="btn-close-script-detail">Close</button>
            <button type="button" class="btn btn-primary" id="btn-copy-full-script">Copy Whole Script</button>
          </div>
        </div>
      `;

      document.getElementById('btn-close-script-detail')?.addEventListener('click', () => this.closeModal());
      document.getElementById('btn-copy-full-script')?.addEventListener('click', () => copyToClipboard(fullScript));
    } else if (modalType === 'onboarding') {
      this.renderOnboarding(options.profile);
    }
  }

  async startOnboarding() {
    const profile = await db.getProfile();
    this.openModal('onboarding', { profile });
  }

  renderOnboarding(profile) {
    let step = 0;
    let draft = {
      name: profile?.name || '',
      specialty: profile?.specialty || '',
      audience: profile?.audience || 'Patients'
    };

    const updateSidebarName = (name) => {
      const sideName = document.getElementById('sidebar-dr-name');
      if (sideName) sideName.textContent = name || 'Doctor Workspace';
    };

    const finish = async (skipped = false) => {
      const currentProfile = await db.getProfile();
      await db.saveProfile({
        ...currentProfile,
        ...draft,
        onboarded: true,
        tutorialSeen: true,
        tutorialSkipped: skipped
      });
      updateSidebarName(draft.name);
      this.closeModal();
      await this.navigateTo('dashboard');
      showToast(skipped ? 'You can complete your profile anytime in Settings.' : 'Your Content Mate workspace is ready.', 'success');
    };

    const steps = [
      () => `
        <div class="onboarding-intro">
          <div class="onboarding-mark">✦</div>
          <p class="onboarding-eyebrow">Your social media intern, on call</p>
          <h2>Turn your clinical insights into content that learns what works.</h2>
          <p>Content Mate helps you package one strong idea in several video formats, test them as trial reels, and post the winner with confidence.</p>
        </div>
        <form id="onboarding-profile-form" class="onboarding-form">
          <div class="form-group"><label class="form-label" for="onboarding-name">Your name</label><input id="onboarding-name" class="form-input" value="${escapeHtml(draft.name)}" placeholder="e.g. Dr. Ananya Shah" required autofocus></div>
          <div class="form-group"><label class="form-label" for="onboarding-specialty">Your specialty</label><input id="onboarding-specialty" class="form-input" value="${escapeHtml(draft.specialty)}" placeholder="e.g. Dermatology" required></div>
          <div class="form-group"><label class="form-label" for="onboarding-audience">Who do you want to reach?</label><select id="onboarding-audience" class="form-select"><option value="Patients" ${draft.audience === 'Patients' ? 'selected' : ''}>Patients</option><option value="Doctors" ${draft.audience === 'Doctors' ? 'selected' : ''}>Other doctors</option><option value="Both" ${draft.audience === 'Both' ? 'selected' : ''}>Both</option></select></div>
          <div class="onboarding-actions"><button type="button" class="btn btn-ghost" id="onboarding-skip">Skip tutorial</button><button class="btn btn-primary btn-lg" type="submit">Build my workflow <span aria-hidden="true">→</span></button></div>
        </form>`,
      () => `
        <div class="onboarding-intro onboarding-centered">
          <div class="onboarding-mark">⌁</div>
          <p class="onboarding-eyebrow">A better way to grow</p>
          <h2>One great insight deserves more than one reel.</h2>
          <p>Even excellent clinical advice can miss because of the hook, format, or timing—not because the idea was weak. Your intern turns one insight into multiple angles so the audience can tell you what lands.</p>
        </div>
        <div class="onboarding-highlight"><span>Trial reels</span><strong>Different packaging, same trusted insight</strong></div>
        <div class="onboarding-actions"><button class="btn btn-ghost" id="onboarding-back">Back</button><button class="btn btn-primary btn-lg" id="onboarding-next">Show me the day-to-day <span aria-hidden="true">→</span></button></div>`,
      () => `
        <div class="onboarding-intro">
          <p class="onboarding-eyebrow">The clinic-to-content routine</p>
          <h2>Your idea can begin in the middle of a busy clinic day.</h2>
          <p>Use this light routine whenever a patient question, pattern, or clinical insight stays with you.</p>
        </div>
        <ol class="onboarding-timeline">
          <li><span>1</span><div><strong>Capture it in Quick Notes</strong><p>Jot down the raw thought in seconds while you are busy.</p></div></li>
          <li><span>2</span><div><strong>Build it out when you are free</strong><p>Add the clinical context and key points that make the insight yours.</p></div></li>
          <li><span>3</span><div><strong>Copy the tailored prompt</strong><p>Paste it into your preferred AI, then bring the script pack back here.</p></div></li>
          <li><span>4</span><div><strong>Review the scripts</strong><p>Accept the strongest, edit a few, and reject anything that is not you.</p></div></li>
        </ol>
        <div class="onboarding-actions"><button class="btn btn-ghost" id="onboarding-back">Back</button><button class="btn btn-primary btn-lg" id="onboarding-next">See how it learns <span aria-hidden="true">→</span></button></div>`,
      () => `
        <div class="onboarding-intro onboarding-centered">
          <div class="onboarding-mark">↗</div>
          <p class="onboarding-eyebrow">Test, learn, repeat</p>
          <h2>Your approved scripts are sprinkled into your calendar as trial reels.</h2>
          <p>Three days after posting, log each reel’s performance. The best-performing version becomes a main reel and is scheduled on your profile—so good ideas get the reach they deserve.</p>
        </div>
        <div class="onboarding-loop"><div>Clinical insight</div><i>→</i><div>Several trial reels</div><i>→</i><div>3-day performance</div><i>→</i><div class="onboarding-loop-winner">Main reel</div></div>
        <p class="onboarding-closing">Keep sharing your clinical perspective. Content Mate keeps the system organized while you build your audience, one tested insight at a time.</p>
        <div class="onboarding-actions"><button class="btn btn-ghost" id="onboarding-back">Back</button><button class="btn btn-primary btn-lg" id="onboarding-finish">Open my workspace <span aria-hidden="true">→</span></button></div>`
    ];

    const renderStep = () => {
      this.modalBody.innerHTML = `<div class="onboarding-flow"><div class="onboarding-progress" aria-label="Step ${step + 1} of ${steps.length}">${steps.map((_, index) => `<span class="${index <= step ? 'active' : ''}"></span>`).join('')}</div>${steps[step]()}`;
      document.getElementById('onboarding-profile-form')?.addEventListener('submit', (event) => {
        event.preventDefault();
        draft = { name: document.getElementById('onboarding-name').value.trim(), specialty: document.getElementById('onboarding-specialty').value.trim(), audience: document.getElementById('onboarding-audience').value };
        step = 1;
        renderStep();
      });
      document.getElementById('onboarding-skip')?.addEventListener('click', () => finish(true));
      document.getElementById('onboarding-back')?.addEventListener('click', () => { step -= 1; renderStep(); });
      document.getElementById('onboarding-next')?.addEventListener('click', () => { step += 1; renderStep(); });
      document.getElementById('onboarding-finish')?.addEventListener('click', () => finish(false));
    };

    renderStep();
  }

  closeModal() {
    this.modalActive = false;
    this.modalOverlay.classList.add('hidden');
    this.modalCard?.classList.remove('onboarding-card');
    this.modalBody.innerHTML = '';
    this.updateBadges();
  }

  async updateBadges() {
    const pendingScripts = await db.getPendingReviewScripts();
    const allReels = await db.getScheduledReels();
    const allNotes = await db.getNotes();

    // Review badge
    const reviewCount = pendingScripts.length;
    const badgeReviewD = document.getElementById('badge-review-count');
    const badgeReviewM = document.getElementById('bnav-badge-review');
    if (badgeReviewD && badgeReviewM) {
      badgeReviewD.textContent = reviewCount;
      badgeReviewM.textContent = reviewCount;
      badgeReviewD.classList.toggle('hidden', reviewCount === 0);
      badgeReviewM.classList.toggle('hidden', reviewCount === 0);
    }

    // Feedback badge (posted >= 3 days ago)
    const systemDate = getSystemDate();
    const feedbackDueCount = allReels.filter((r) => {
      if (r.status !== 'posted' || r.feedback_logged) return false;
      const diff = Math.floor((systemDate - new Date(r.posted_date || r.scheduled_date)) / (1000 * 60 * 60 * 24));
      return diff >= 3;
    }).length;

    const badgeFeedD = document.getElementById('badge-feedback-count');
    const badgeFeedM = document.getElementById('bnav-badge-feedback');
    if (badgeFeedD && badgeFeedM) {
      badgeFeedD.textContent = feedbackDueCount;
      badgeFeedM.textContent = feedbackDueCount;
      badgeFeedD.classList.toggle('hidden', feedbackDueCount === 0);
      badgeFeedM.classList.toggle('hidden', feedbackDueCount === 0);
    }

    // Notes badge
    const activeNotesCount = allNotes.filter((n) => !n.is_archived).length;
    const badgeNotesD = document.getElementById('badge-notes-count');
    const badgeNotesM = document.getElementById('bnav-badge-notes');
    if (badgeNotesD && badgeNotesM) {
      badgeNotesD.textContent = activeNotesCount;
      badgeNotesM.textContent = activeNotesCount;
      badgeNotesD.classList.toggle('hidden', activeNotesCount === 0);
      badgeNotesM.classList.toggle('hidden', activeNotesCount === 0);
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const app = new ContentOSApp();
  app.init();
});


})();
