/**
 * Content OS for Doctors — Standalone Bundle
 * Allows index.html to be double-clicked directly in any browser (file://) or served via Python/HTTP.
 */

(function () {
  'use strict';

  // 1. FORMATS
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

  // 2. UTILS
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
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function formatFullDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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

  function formatRelativeDate(isoDate) {
    if (!isoDate) return '';
    const now = getSystemDate();
    const d = new Date(isoDate);
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 14) return formatDate(isoDate);
    if (diffDay >= 2) return `${diffDay} days ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffHour >= 1) return `${diffHour}h ago`;
    if (diffMin >= 1) return `${diffMin}m ago`;
    return 'Just now';
  }

  async function copyToClipboard(text) {
    if (!navigator.clipboard) {
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
        showToast('Copy failed.', 'error');
        return false;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard! Ready to paste into ChatGPT/Claude', 'success');
      return true;
    } catch (err) {
      showToast('Failed to copy.', 'error');
      return false;
    }
  }

  function showToast(message, type = 'success', duration = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = type === 'success' 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
      : type === 'error'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    if (navigator.vibrate) navigator.vibrate(20);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 200);
    }, duration);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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
  }

  // 3. DATABASE (IndexedDB)
  const DB_NAME = 'DoctorContentOS_DB';
  const DB_VERSION = 1;
  let dbInstance = null;

  function openDatabase() {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = (e) => reject(e.target.error);
      req.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile');
        if (!db.objectStoreNames.contains('notes')) {
          const s = db.createObjectStore('notes', { keyPath: 'id' });
          s.createIndex('by_created', 'created_at', { unique: false });
        }
        if (!db.objectStoreNames.contains('insights')) {
          const s = db.createObjectStore('insights', { keyPath: 'id' });
          s.createIndex('by_status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('scripts')) {
          const s = db.createObjectStore('scripts', { keyPath: 'id' });
          s.createIndex('by_insight', 'insight_id', { unique: false });
          s.createIndex('by_status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('scheduled_reels')) {
          const s = db.createObjectStore('scheduled_reels', { keyPath: 'id' });
          s.createIndex('by_insight', 'insight_id', { unique: false });
          s.createIndex('by_date', 'scheduled_date', { unique: false });
          s.createIndex('by_status', 'status', { unique: false });
        }
      };
    });
  }

  async function performTx(storeName, mode, callback) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let res = null;
      tx.oncomplete = () => resolve(res);
      tx.onerror = (e) => reject(e.target.error);
      try { res = callback(store); } catch (err) { reject(err); }
    });
  }

  const defaultDoctorProfile = {
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiologist & Preventative Health',
    audience: 'Patients',
    language: 'English',
    tone: 'Conversational & Empathetic',
    cta: 'both',
    reelLength: '45-60s',
    postingDays: ['Mon', 'Wed', 'Fri'],
    sprinkleWindowDays: 14,
    maxPostsPerDay: 1,
    sprinkleStrategy: 'uniform',
    enableFilmingWorkflow: false,
    missedPostRescheduleMode: 'manual',
    clinicName: 'Heart & Vascular Institute',
    website: 'drsarahchen.com',
    instagram: '@drsarahchen_md',
    onboarded: true
  };

  const db = {
    async getProfile() {
      return performTx('profile', 'readonly', (store) => {
        return new Promise((resolve) => {
          const req = store.get('doctor_profile');
          req.onsuccess = () => resolve(req.result || { ...defaultDoctorProfile, onboarded: false });
        });
      });
    },
    async saveProfile(profile) {
      return performTx('profile', 'readwrite', (store) => { store.put(profile, 'doctor_profile'); });
    },
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
    async addNote(note) { return performTx('notes', 'readwrite', (store) => { store.put(note); }); },
    async updateNote(note) { return performTx('notes', 'readwrite', (store) => { store.put(note); }); },
    async deleteNote(id) { return performTx('notes', 'readwrite', (store) => { store.delete(id); }); },

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
    async saveInsight(insight) { return performTx('insights', 'readwrite', (store) => { store.put(insight); }); },
    async deleteInsight(id) {
      await performTx('insights', 'readwrite', (store) => { store.delete(id); });
      const scripts = await this.getScripts();
      const insScripts = scripts.filter((s) => s.insight_id === id);
      for (const s of insScripts) await this.deleteScript(s.id);
    },

    async getScripts() {
      return performTx('scripts', 'readonly', (store) => {
        return new Promise((resolve) => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
        });
      });
    },
    async getPendingReviewScripts() {
      return performTx('scripts', 'readonly', (store) => {
        return new Promise((resolve) => {
          const idx = store.index('by_status');
          const req = idx.getAll('pending_review');
          req.onsuccess = () => resolve(req.result || []);
        });
      });
    },
    async saveScript(script) { return performTx('scripts', 'readwrite', (store) => { store.put(script); }); },
    async saveScripts(arr) {
      const database = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = database.transaction('scripts', 'readwrite');
        const store = tx.objectStore('scripts');
        arr.forEach((s) => store.put(s));
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    },
    async updateScript(script) { return performTx('scripts', 'readwrite', (store) => { store.put(script); }); },
    async deleteScript(id) { return performTx('scripts', 'readwrite', (store) => { store.delete(id); }); },

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
    async saveScheduledReel(reel) { return performTx('scheduled_reels', 'readwrite', (store) => { store.put(reel); }); },
    async saveScheduledReels(arr) {
      const database = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = database.transaction('scheduled_reels', 'readwrite');
        const store = tx.objectStore('scheduled_reels');
        arr.forEach((r) => store.put(r));
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    },
    async exportFullDatabase() {
      return {
        appName: 'Content Mate',
        exportedAt: new Date().toISOString(),
        version: 1,
        profile: await this.getProfile(),
        notes: await this.getNotes(),
        insights: await this.getInsights(),
        scripts: await this.getScripts(),
        scheduledReels: await this.getScheduledReels()
      };
    },
    async importFullDatabase(data) {
      if (!data || !data.version) throw new Error('Invalid backup file format');
      if (data.profile) await this.saveProfile(data.profile);
      if (Array.isArray(data.notes)) for (const n of data.notes) await this.addNote(n);
      if (Array.isArray(data.insights)) for (const i of data.insights) await this.saveInsight(i);
      if (Array.isArray(data.scripts)) await this.saveScripts(data.scripts);
      if (Array.isArray(data.scheduledReels)) await this.saveScheduledReels(data.scheduledReels);
      return true;
    },
    async resetAllData() {
      const database = await openDatabase();
      const stores = ['profile', 'notes', 'insights', 'scripts', 'scheduled_reels'];
      for (const s of stores) {
        await new Promise((resolve, reject) => {
          const tx = database.transaction(s, 'readwrite');
          tx.objectStore(s).clear();
          tx.oncomplete = () => resolve();
          tx.onerror = (e) => reject(e.target.error);
        });
      }
      localStorage.clear();

      await this.saveProfile({
        name: 'Doctor Workspace',
        specialty: 'Clinical Specialist',
        audience: 'Patients',
        language: 'English',
        tone: 'Conversational & Empathetic',
        cta: 'both',
        postingDays: ['Mon', 'Wed', 'Fri'],
        sprinkleWindowDays: 14,
        maxPostsPerDay: 1,
        sprinkleStrategy: 'uniform',
        enableFilmingWorkflow: false,
        missedPostRescheduleMode: 'manual',
        onboarded: true
      });
    },
    async clearAll() {
      return this.resetAllData();
    }
  };

  // 4. CURIOSITY & RETENTION PROMPT GENERATOR
  function buildDoctorPrompt(profile, insight) {
    const doctorName = profile.name || 'Doctor';
    const specialty = profile.specialty || 'General Medicine & Preventative Care';
    const audience = profile.audience || 'Patients';
    const language = profile.language || 'English';
    const tone = profile.tone || 'Conversational & Empathetic';
    const defaultCtaText = insight.custom_cta || profile.cta || 'Check caption for more';
    const ctaInstruction = profile.cta === 'both' && !insight.custom_cta
      ? 'Generate BOTH versions (1. "Read caption for full clinical details" and 2. "Comment keyword for DM guide")'
      : defaultCtaText;
    const reelLength = profile.reelLength || '45-60s';

    const formatsList = scriptFormats.map((f, i) => `${i + 1}. **${f.name}** (${f.category}): ${f.promptInstruction}`).join('\n');
    const customInstructions = profile.customPromptInstructions
      ? `\n=======================================================\nCUSTOM DOCTOR INSTRUCTIONS (FOLLOW THESE IN ADDITION TO THE RULES BELOW)\n=======================================================\n${profile.customPromptInstructions.trim()}\n`
      : '';

    return `You are an elite medical copywriter and clinical retention strategist for world-class doctor creators.
Your mission is to transform a doctor's raw clinical insight into a high-retention social media content pack that STOP SKIPPING, TRIGGERS IMMENSE CURIOSITY, and GOES DEEP into medical reality.
${customInstructions}

=======================================================
1. DOCTOR PROFILE & COMMUNICATION PREFERENCES
=======================================================
- Doctor: ${doctorName}
- Specialty: ${specialty}
- Target Audience: ${audience} (Speak directly to their unstated anxieties, body signals, and clinical realities)
- Primary Language / Dialect: ${language} (Write naturally as an articulate clinician speaks. No dry textbook jargon, but NEVER dumb it down into fluff)
- Tone: ${tone}
- Reel Duration Target: ${reelLength}
- Target Call-To-Action (CTA): ${ctaInstruction}

=======================================================
2. CORE CLINICAL INSIGHT
=======================================================
- Title / Core Idea: ${insight.title}
- Clinical Details & Supporting Notes:
${insight.supporting_points || insight.description || 'Explain the underlying mechanism with clinical clarity.'}
${insight.references ? `- References / Patient Context: ${insight.references}` : ''}
- Selected Video CTA: ${insight.custom_cta || 'Check caption for more'}

=======================================================
3. REQUESTED SCRIPT FORMATS
=======================================================
Generate one high-retention script for each of the following formats:
${formatsList}

=======================================================
4. HIGH-RETENTION CURIOSITY ARCHITECTURE (STRICT RULES)
=======================================================
Rule 1: ZERO SURFACE-LEVEL FLUFF OR GENERIC ADVICE
- BANNED: "eat healthy", "sleep 8 hours", "drink water", "listen to your body", "consult your doctor".
- REQUIRED: Explain the DEEP physiological mechanism (e.g. endothelial shear stress, ApoB lipid oxidation, calcium channel excitability, receptor down-regulation) using vivid, physical metaphors (plumbing pressure, electrical wiring, rust in pipes).

Rule 2: SCROLL-STOPPING CURIOSITY HOOKS (0-3s)
- Hooks MUST create a powerful curiosity gap or challenge a deeply held myth.
- Examples: "The 1 symptom of heart disease most 35-year-olds ignore because their blood pressure cuff reads 120/80...", "Why taking standard magnesium for night palpitations backfires unless you check this 1 chelate...", "What actually happens to your arteries 10 years before your labs turn red..."

Rule 3: CONTINUOUS CURIOSITY LOOPS & SUSPENSE
- Do NOT reveal the core takeaway in sentence 1. Build tension line-by-line.
- Use pattern-break transitions: "Here is why that happens...", "And this is where 90% of patients make a critical mistake...", "Notice what your body is actually doing here..."

Rule 4: VISUAL & PACING STAGE DIRECTIONS
- Include explicit visual cues in brackets throughout every script: \`[Visual Cue: Points to neck / holds up model]\`, \`[Pacing: Pause 1 sec for gravity]\`, \`[On-Screen Text: Key Mechanism Blueprint]\`.

Rule 5: ACTIONABLE PAYOFF & CLEAN CTA
- End with a precise, empowering takeaway followed by the requested CTA: "${insight.custom_cta || 'Check caption for more'}".

=======================================================
5. OUTPUT INSTRUCTIONS (CRITICAL: JSON ONLY)
=======================================================
Respond ONLY with a valid JSON object matching the exact schema below.
DO NOT include markdown outside the json.

{
  "version": 1,
  "insight_title": "${insight.title.replace(/"/g, '\\"')}",
  "doctor_specialty": "${specialty.replace(/"/g, '\\"')}",
  "scripts": [
    {
      "format": "Talking Head",
      "title": "Clear curiosity-driven title",
      "hook": "Scroll-stopping curiosity hook sentence...",
      "script": "Complete spoken script with [Visual Cues], [Pacing Notes], deep physiological explanations, and tension loops...",
      "cta": "${(insight.custom_cta || 'Check caption for more').replace(/"/g, '\\"')}",
      "estimated_duration": "45s",
      "confidence": 9.6
    },
    {
      "format": "Patient Story",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "${(insight.custom_cta || 'Check caption for more').replace(/"/g, '\\"')}",
      "estimated_duration": "60s",
      "confidence": 9.4
    },
    {
      "format": "Myth vs Fact",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "${(insight.custom_cta || 'Check caption for more').replace(/"/g, '\\"')}",
      "estimated_duration": "45s",
      "confidence": 9.5
    }
  ]
}`;
  }

  // 5. AI IMPORTER
  function parseAndValidateAIResponse(rawText, insightId) {
    if (!rawText || typeof rawText !== 'string') throw new Error('Pasted content is empty.');
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
    cleaned = cleaned.trim();

    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) throw new Error('Could not find a valid JSON object.');

    const data = JSON.parse(cleaned.substring(startIdx, endIdx + 1));
    if (!Array.isArray(data.scripts) || data.scripts.length === 0) throw new Error('No "scripts" array found.');

    const normalized = data.scripts.map((item, idx) => ({
      id: uuidv4(),
      insight_id: insightId,
      format: (item.format || 'Talking Head').trim(),
      title: (item.title || `Clinical Script #${idx + 1}`).trim(),
      hook: (item.hook || 'Attention hook...').trim(),
      script: (item.script || 'Clinical explanation...').trim(),
      cta: (item.cta || 'Check caption for more').trim(),
      estimated_duration: item.estimated_duration || '45s',
      confidence: typeof item.confidence === 'number' ? item.confidence : 9.0,
      status: 'pending_review',
      review_order: idx,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    return { version: data.version || 1, scripts: normalized };
  }

  // 6. SCHEDULER
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

  function balanceContentQueue(items) {
    if (!items || items.length <= 1) return items;
    const remaining = [...items];
    const balanced = [remaining.shift()];

    while (remaining.length > 0) {
      const lastItem = balanced[balanced.length - 1];
      const lastFormat = lastItem.format;
      const lastCategory = getFormatById(lastFormat).category;
      const lastInsight = lastItem.insight_id;

      let bestIdx = remaining.findIndex(
        (item) => item.insight_id !== lastInsight && item.format !== lastFormat && getFormatById(item.format).category !== lastCategory
      );
      if (bestIdx === -1) bestIdx = remaining.findIndex((item) => item.format !== lastFormat);
      if (bestIdx === -1) bestIdx = remaining.findIndex((item) => item.insight_id !== lastInsight);
      if (bestIdx === -1) bestIdx = 0;

      const [chosen] = remaining.splice(bestIdx, 1);
      balanced.push(chosen);
    }

    return balanced;
  }

  async function recalculateFutureSchedule() {
    const profile = await db.getProfile();
    const allReels = await db.getScheduledReels();
    const todayStr = formatDateForInput(getSystemDate());

    const sprinkleWindowDays = profile.sprinkleWindowDays || 14;
    const maxPostsPerDay = profile.maxPostsPerDay || 1;
    const postingDays = profile.postingDays || ['Mon', 'Wed', 'Fri'];
    const strategy = profile.sprinkleStrategy || 'uniform';
    const enableFilming = profile.enableFilmingWorkflow === true;

    // Frozen reels: past, posted, locked, or filmed (if enabled)
    const frozenReels = allReels.filter((reel) => {
      const isPast = reel.scheduled_date < todayStr;
      const isPosted = reel.status === 'posted';
      const isFilmed = enableFilming && (reel.status === 'filmed' || reel.is_filmed);
      const isLocked = reel.is_locked === true;
      const isMainReel = reel.is_main_reel === true;

      return isPast || isPosted || isFilmed || isLocked || isMainReel;
    });

    const postsCountByDate = {};
    frozenReels.forEach((r) => {
      if (r.scheduled_date) {
        postsCountByDate[r.scheduled_date] = (postsCountByDate[r.scheduled_date] || 0) + 1;
      }
    });

    const mutableReels = allReels.filter((reel) => !frozenReels.some((f) => f.id === reel.id));

    if (mutableReels.length === 0) return { updatedCount: 0, totalReels: allReels.length };

    const balancedQueue = balanceContentQueue(mutableReels);

    // Each free daily capacity is an individual candidate slot.
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

    const assignedDates = [];
    const totalPosts = balancedQueue.length;

    if (strategy === 'front_loaded' || totalPosts === 1 || candidateDates.length <= totalPosts) {
      for (let i = 0; i < totalPosts; i++) {
        assignedDates.push(candidateDates[i] || candidateDates[candidateDates.length - 1]);
      }
    } else {
      const maxIndex = candidateDates.length - 1;
      const step = maxIndex / Math.max(1, totalPosts - 1 || 1);

      for (let i = 0; i < totalPosts; i++) {
        let targetIdx = Math.round(i * step);
        if (targetIdx > maxIndex) targetIdx = maxIndex;
        assignedDates.push(candidateDates[targetIdx]);
      }
    }

    const updatedReels = balancedQueue.map((reel, idx) => ({
      ...reel,
      scheduled_date: assignedDates[idx] || reel.scheduled_date || todayStr,
      updated_at: new Date().toISOString()
    }));

    await db.saveScheduledReels([...frozenReels, ...updatedReels]);
    return { updatedCount: updatedReels.length, totalReels: frozenReels.length + updatedReels.length };
  }

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
    if (missedReels.length === 0) return { rescheduledCount: 0, totalMissed: 0 };

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

  async function scheduleAcceptedScript(script) {
    const existing = await db.getScheduledReels();
    const dup = existing.find((r) => r.script_id === script.id);
    if (dup) return dup;

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
      scheduled_date: todayStr,
      status: 'scheduled',
      is_locked: false,
      is_main_reel: false,
      created_at: new Date().toISOString()
    };

    await db.saveScheduledReel(newReel);
    await recalculateFutureSchedule();
    return newReel;
  }

  async function promoteToMainReel(trialReelId) {
    const reel = await db.getScheduledReel(trialReelId);
    if (!reel) throw new Error('Reel not found');
    const profile = await db.getProfile();
    const nextDates = getNextPostingDates(getSystemDate(), 8, profile.postingDays || ['Mon', 'Wed', 'Fri']);

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
      scheduled_date: nextDates[2] || nextDates[0],
      status: 'scheduled',
      is_locked: true,
      is_main_reel: true,
      created_at: new Date().toISOString()
    };

    reel.status = 'winner';
    reel.is_main_reel_winner = true;
    await db.saveScheduledReel(reel);
    await db.saveScheduledReel(mainReel);
    await recalculateFutureSchedule();
    return mainReel;
  }

  // 7. SAMPLE DATA DEMO
  async function populateSampleDoctorWorkspace() {
    await db.resetAllData();
    const systemDate = getSystemDate();
    const todayStr = formatDateForInput(systemDate);

    await db.saveProfile({
      ...defaultDoctorProfile,
      name: 'Dr. Sarah Chen',
      specialty: 'Cardiologist & Preventative Health',
      audience: 'Patients',
      language: 'English',
      tone: 'Conversational & Empathetic',
      onboarded: true
    });

    await db.addNote({ id: 'note-1', text: 'I should explain why high calcium score in younger patients is an opportunity, not a life sentence.', created_at: new Date().toISOString(), is_archived: false });
    await db.addNote({ id: 'note-2', text: 'Had a 42-year-old marathon runner with hidden coronary plaque today.', created_at: new Date().toISOString(), is_archived: false });

    const insight1 = {
      id: 'insight-101',
      title: 'Why Normal Blood Pressure at 25 Does Not Guarantee Clean Arteries at 45',
      description: 'Vascular stiffness and ApoB cholesterol accumulation start decades before blood pressure monitors turn red.',
      supporting_points: '1. Standard cuff BP only measures macro vessel resistance.\n2. Endothelial micro-inflammation happens silently.\n3. Early ApoB testing matters.',
      custom_cta: 'Check caption for more',
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      status: 'active'
    };

    const insight2 = {
      id: 'insight-102',
      title: 'Magnesium Taurate vs Glycinate for Heart Palpitations',
      description: 'Patients are constantly confused by different magnesium chelates for cardiac rhythm stability.',
      supporting_points: '1. Taurine acts on calcium channels in myocardial cells.\n2. Glycinate is superior for sleep and anxiety.',
      custom_cta: 'Check caption for more',
      created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
      status: 'active'
    };

    await db.saveInsight(insight1);
    await db.saveInsight(insight2);

    const reviewScripts = [
      {
        id: 'script-201',
        insight_id: 'insight-102',
        format: 'Talking Head',
        title: 'If Your Heart Skips a Beat at Night, Watch This',
        hook: 'If your heart ever does that weird flutter or flip-flop the second your head hits the pillow, stop scrolling.',
        script: '[Visual Cue: Point to chest with index finger] In my cardiology clinic, 8 out of 10 patients with night palpitations are taking the wrong form of magnesium. Magnesium Taurate specifically calms myocardial excitability...',
        cta: 'Check caption for more',
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
        script: 'Their Holter monitor showed 4,000 PVCs. 4 weeks after switching to targeted cardiac electrolytes, their PVCs dropped by 85%.',
        cta: 'Check caption for more',
        estimated_duration: '60s',
        confidence: 9.3,
        status: 'pending_review',
        review_order: 1,
        created_at: new Date().toISOString()
      }
    ];

    await db.saveScripts(reviewScripts);

    const scheduledReels = [
      {
        id: 'reel-301',
        script_id: 'script-101-a',
        insight_id: 'insight-101',
        title: 'Why Normal Blood Pressure at 25 is Deceptive',
        format: 'Talking Head',
        hook: 'Your blood pressure cuff can read 120/80 while your coronary arteries are quietly filling with plaque.',
        script: 'Blood pressure is a measure of vessel resistance today, not plaque accumulation over 20 years.',
        cta: 'Check caption for more',
        estimated_duration: '45s',
        scheduled_date: todayStr,
        status: 'scheduled',
        is_locked: false,
        is_main_reel: false,
        created_at: new Date().toISOString()
      }
    ];

    await db.saveScheduledReels(scheduledReels);
  }

  // 8. UI COMPONENTS & MODALS
  const InsightCreateModal = {
    render(container, options = {}, onDone, openModal) {
      const prefillTitle = options.prefillTitle || '';
      const noteId = options.noteId || null;

      container.innerHTML = `
        <div class="modal-view-step" id="step-insight-form">
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 16px;">
            Turn a clinical experience, patient question, or medical concept into a tailored AI prompt pack.
          </p>

          <form id="form-create-insight">
            <div class="form-group">
              <label class="form-label" for="insight-title">Topic / Core Idea *</label>
              <input type="text" id="insight-title" class="form-input" placeholder="e.g. Why normal blood pressure doesn't guarantee clean arteries..." value="${escapeHtml(prefillTitle)}" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="insight-details">Clinical Explanation & Key Points *</label>
              <textarea id="insight-details" class="form-textarea" rows="4" placeholder="1. Endothelial micro-damage happens decades before hypertension.&#10;2. High ApoB and Lp(a) drive plaque formation.&#10;3. Early screening recommendation..." required></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="insight-cta">What CTA do you want to have in the video?</label>
              <input type="text" id="insight-cta" class="form-input" placeholder="Leave empty for default: Check caption for more" />
              <p style="font-size: 11.5px; color: var(--text-tertiary); margin-top: 3px;">If left blank, automatically defaults to "Check caption for more"</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="insight-references">Optional References / Real Patient Context</label>
              <input type="text" id="insight-references" class="form-input" placeholder="e.g. 42-year-old marathon runner case study" />
            </div>

            <div class="flex justify-between items-center" style="margin-top: 20px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
              <button type="button" class="btn btn-ghost" id="btn-cancel-insight">Cancel</button>
              <button type="submit" class="btn btn-primary btn-lg" id="btn-generate-prompt">Save & Generate Prompt →</button>
            </div>
          </form>
        </div>

        <div class="modal-view-step hidden" id="step-prompt-ready">
          <div style="text-align: center; margin-bottom: 18px;">
            <h3 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: var(--text-primary);">Bespoke Curiosity Prompt Ready</h3>
            <p style="font-size: 13px; color: var(--text-secondary); max-width: 420px; margin: 4px auto 0;">Copy prompt into ChatGPT / Claude, then paste the AI JSON response back.</p>
          </div>

          <div class="form-group">
            <textarea id="generated-prompt-box" class="form-textarea" rows="7" readonly style="font-family: var(--font-mono); font-size: 12px; background: var(--bg-subtle); color: var(--text-primary);"></textarea>
          </div>

          <button class="btn btn-accent btn-lg w-full" id="btn-copy-prompt-hero" style="margin-bottom: 12px;">Copy Prompt (1-Tap)</button>

          <div class="flex gap-2 justify-between items-center">
            <a href="https://chatgpt.com" target="_blank" rel="noopener" class="btn btn-secondary btn-sm flex-1" style="text-decoration: none;">Open ChatGPT ↗</a>
            <a href="https://claude.ai" target="_blank" rel="noopener" class="btn btn-secondary btn-sm flex-1" style="text-decoration: none;">Open Claude ↗</a>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; margin-top: 18px; text-align: center;">
            <button class="btn btn-primary btn-lg w-full" id="btn-proceed-to-import">I Have the AI Response → Paste JSON</button>
          </div>
        </div>
      `;

      let activeInsightId = null;

      document.getElementById('form-create-insight')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('insight-title').value.trim();
        const details = document.getElementById('insight-details').value.trim();
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
          custom_cta,
          references,
          status: 'active',
          created_at: new Date().toISOString()
        };

        await db.saveInsight(newInsight);

        if (noteId) {
          const note = await db.getNotes().then((notes) => notes.find((n) => n.id === noteId));
          if (note) {
            note.is_archived = true;
            note.converted_to_insight_id = activeInsightId;
            await db.updateNote(note);
          }
        }

        const profile = await db.getProfile();
        const promptText = buildDoctorPrompt(profile, newInsight);

        document.getElementById('generated-prompt-box').value = promptText;
        document.getElementById('step-insight-form').classList.add('hidden');
        document.getElementById('step-prompt-ready').classList.remove('hidden');

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

  const AIImportModal = {
    render(container, options = {}, onDone, openModal, navigateTo) {
      const insightId = options.insightId || null;

      container.innerHTML = `
        <div class="modal-view-step">
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 12px;">Paste the raw JSON response from ChatGPT or Claude below.</p>
          <textarea id="ai-json-input" class="form-textarea" rows="8" placeholder='{\n  "version": 1,\n  "scripts": [...]\n}' style="font-family: var(--font-mono); font-size: 12px;"></textarea>
          <div class="flex justify-between items-center" style="margin-top: 16px;">
            <button type="button" class="btn btn-ghost" id="btn-cancel-import">Cancel</button>
            <button type="button" class="btn btn-primary btn-lg" id="btn-submit-import">Import & Review Deck →</button>
          </div>
        </div>
      `;

      document.getElementById('btn-cancel-import')?.addEventListener('click', onDone);
      document.getElementById('btn-submit-import')?.addEventListener('click', async () => {
        const text = document.getElementById('ai-json-input').value;
        try {
          const parsed = parseAndValidateAIResponse(text, insightId);
          await db.saveScripts(parsed.scripts);
          showToast(`Successfully imported ${parsed.scripts.length} scripts!`, 'success');
          onDone();
          if (navigateTo) navigateTo('review');
        } catch (err) {
          showToast(`Import Error: ${err.message}`, 'error');
        }
      });
    }
  };

  const TrialFeedbackModal = {
    render(container, options = {}, onDone, openModal, navigateTo) {
      const reelId = options.reelId;
      if (!reelId) return;

      db.getScheduledReel(reelId).then((reel) => {
        if (!reel) {
          onDone();
          return;
        }

        container.innerHTML = `
          <form id="form-trial-feedback" class="flex flex-col gap-3">
            <h4 style="font-size: 15px; font-weight: 700;">3-Day Performance Check</h4>
            <p style="font-size: 13px; color: var(--text-secondary);">"${escapeHtml(reel.title)}"</p>
            <div class="form-group">
              <label class="form-label">Views Count *</label>
              <input type="number" id="fb-views" class="form-input" placeholder="e.g. 1500" required />
            </div>
            <div class="form-group">
              <label class="form-label">Shares / Saves *</label>
              <input type="number" id="fb-shares" class="form-input" placeholder="e.g. 45" required />
            </div>
            <div class="flex justify-between items-center" style="margin-top: 10px;">
              <button type="button" class="btn btn-ghost" id="btn-cancel-fb">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Metrics & Decide</button>
            </div>
          </form>
        `;

        document.getElementById('btn-cancel-fb')?.addEventListener('click', onDone);
        document.getElementById('form-trial-feedback')?.addEventListener('submit', async (e) => {
          e.preventDefault();
          const views = parseInt(document.getElementById('fb-views').value, 10) || 0;
          const shares = parseInt(document.getElementById('fb-shares').value, 10) || 0;

          reel.feedback_logged = true;
          reel.views_3day = views;
          reel.shares_3day = shares;
          await db.saveScheduledReel(reel);

          if (views >= 1000 || shares >= 20) {
            await promoteToMainReel(reel.id);
            showToast('⭐ Promoted to permanent Main Reel!', 'success');
          } else {
            showToast('Feedback logged!', 'info');
          }

          onDone();
          if (navigateTo) navigateTo('schedule');
        });
      });
    }
  };

  // DASHBOARD VIEW
  const DashboardView = {
    async render(container, navigateTo, openModal) {
      const profile = await db.getProfile();
      const systemDate = getSystemDate();
      const todayStr = formatDateForInput(systemDate);
      const enableFilming = profile.enableFilmingWorkflow === true;

      const allReels = await db.getScheduledReels();
      const pendingScripts = await db.getPendingReviewScripts();
      const allNotes = await db.getNotes();

      const todayPosts = allReels.filter((r) => r.scheduled_date === todayStr && r.status !== 'posted' && r.status !== 'archived');
      const filmingQueue = enableFilming ? allReels.filter((r) => r.status === 'scheduled' && !r.is_filmed).slice(0, 3) : [];
      const missedPosts = allReels.filter((r) => r.scheduled_date < todayStr && r.status !== 'posted' && r.status !== 'archived' && r.status !== 'winner');
      const feedbackDuePosts = allReels.filter((r) => {
        if (r.status !== 'posted' || r.is_main_reel_winner || r.feedback_logged) return false;
        const postDate = new Date(r.posted_date || r.scheduled_date);
        const diffDays = Math.floor((systemDate - postDate) / (1000 * 60 * 60 * 24));
        return diffDays >= 3;
      });

      const activeNotes = allNotes.filter((n) => !n.is_archived).slice(0, 2);

      let html = `
        <div class="action-deck">
          <div class="card card-hero">
            <h2>Good day, ${profile.name || 'Doctor'}</h2>
            <p>You have <strong>${todayPosts.length}</strong> post scheduled today, <strong>${pendingScripts.length}</strong> scripts waiting for review, and <strong>${feedbackDuePosts.length}</strong> performance checks due.</p>
            <div class="flex gap-3" style="flex-wrap: wrap;">
              <button class="btn btn-accent btn-lg" id="dash-hero-record-insight"><span>Record a New Insight</span></button>
              <button class="btn btn-secondary btn-lg" id="dash-hero-quick-note" style="background: rgba(255,255,255,0.15); color: #FFF;"><span>Quick Thought / Note</span></button>
            </div>
          </div>
      `;

      if (todayPosts.length > 0) {
        html += `
          <div class="action-card" style="border-left: 4px solid var(--accent-blue);">
            <div class="action-card-header"><span class="action-card-badge badge-blue">⚡ Scheduled For Today</span><span style="font-size: 12px; color: var(--text-tertiary);">${formatDate(todayStr)}</span></div>
            <h3 class="action-card-title">${todayPosts.length === 1 ? '1 Post to Publish Today' : `${todayPosts.length} Posts to Publish Today`}</h3>
            <p class="action-card-desc">Review your hook and mark as posted once published to social media.</p>
            <div class="today-item-list">
              ${todayPosts.map((post) => `
                <div class="today-item">
                  <div class="today-item-info">
                    <div class="today-item-title">${post.is_main_reel ? '⭐ ' : ''}${post.title}</div>
                    <div class="today-item-meta"><span>${post.format}</span> • <span>${post.estimated_duration}</span></div>
                  </div>
                  <div class="flex gap-2">
                    ${enableFilming ? `<button class="btn btn-sm btn-secondary btn-mark-filmed" data-id="${post.id}">${post.status === 'filmed' ? '✓ Filmed' : 'Mark Filmed'}</button>` : ''}
                    <button class="btn btn-sm btn-primary btn-mark-posted" data-id="${post.id}">Mark as Posted</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (pendingScripts.length > 0) {
        html += `
          <div class="action-card" style="border-left: 4px solid var(--accent-amber);">
            <div class="action-card-header"><span class="action-card-badge badge-amber">🃏 Review Queue</span><span style="font-size: 12px; font-weight: 600; color: var(--accent-amber);">${pendingScripts.length} Pending</span></div>
            <h3 class="action-card-title">Scripts Waiting for Review</h3>
            <p class="action-card-desc">Swipe through scripts one card at a time. Accept, edit inline, or reject in under 30 seconds.</p>
            <div class="action-card-footer">
              <span style="font-size: 12.5px; color: var(--text-secondary);">Cards ready from recent AI imports</span>
              <button class="btn btn-primary btn-sm" id="dash-btn-start-review"><span>Start Review (${pendingScripts.length} left) →</span></button>
            </div>
          </div>
        `;
      }

      if (feedbackDuePosts.length > 0) {
        html += `
          <div class="action-card" style="border-left: 4px solid var(--accent-purple);">
            <div class="action-card-header"><span class="action-card-badge badge-purple">📊 3-Day Performance Check</span><span style="font-size: 12px; color: var(--accent-purple); font-weight: 600;">${feedbackDuePosts.length} Due</span></div>
            <h3 class="action-card-title">Trial Reel Feedback Due</h3>
            <p class="action-card-desc">Enter basic engagement metrics to decide if this should become a permanent Main Reel.</p>
            <div class="today-item-list">
              ${feedbackDuePosts.map((post) => `
                <div class="today-item">
                  <div class="today-item-info">
                    <div class="today-item-title">${post.title}</div>
                    <div class="today-item-meta"><span>Posted ${formatRelativeDate(post.posted_date || post.scheduled_date)}</span> • <span>${post.format}</span></div>
                  </div>
                  <button class="btn btn-sm btn-primary btn-log-feedback" data-id="${post.id}">Log Feedback & Decide</button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (missedPosts.length > 0) {
        html += `
          <div class="action-card" style="border-left: 4px solid var(--accent-red);">
            <div class="action-card-header"><span class="action-card-badge badge-red">⚠️ Past Due</span><span style="font-size: 12px; color: var(--accent-red); font-weight: 600;">${missedPosts.length} Missed</span></div>
            <h3 class="action-card-title">Posts That Were Missed</h3>
            <p class="action-card-desc">Reschedule these into open upcoming slots, or skip any post you no longer want to publish.</p>
            <div class="today-item-list">
              ${missedPosts.map((post) => `
                <div class="today-item">
                  <div class="today-item-info">
                    <div class="today-item-title">${post.title}</div>
                    <div class="today-item-meta">Was due ${formatDate(post.scheduled_date)}</div>
                  </div>
                  <div class="flex gap-2" style="flex-wrap: wrap; justify-content: flex-end;">
                    <input class="form-input missed-date-input" data-id="${post.id}" type="date" min="${todayStr}" value="${todayStr}" aria-label="New post date" style="width: 142px; padding: 6px 8px; font-size: 12px;" />
                    <button class="btn btn-sm btn-primary btn-reschedule-missed-date" data-id="${post.id}">Reschedule</button>
                    <button class="btn btn-sm btn-secondary btn-skip-missed" data-id="${post.id}">Skip</button>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="action-card-footer">
              <span style="font-size: 12.5px; color: var(--text-secondary);">${missedPosts.length} posts can be rescheduled</span>
              <button class="btn btn-danger btn-sm" id="dash-btn-auto-reshuffle"><span>Auto-Sprinkle All</span></button>
            </div>
          </div>
        `;
      }

      if (enableFilming && filmingQueue.length > 0) {
        html += `
          <div class="action-card">
            <div class="action-card-header"><span class="action-card-badge badge-gray">🎥 Filming Queue</span><span style="font-size: 12px; color: var(--text-tertiary);">Next Up</span></div>
            <h3 class="action-card-title">Trial Reels Not Yet Shot</h3>
            <div class="today-item-list">
              ${filmingQueue.map((post) => `
                <div class="today-item">
                  <div class="today-item-info"><div class="today-item-title">${post.title}</div></div>
                  <div class="flex gap-2"><button class="btn btn-sm btn-secondary btn-mark-filmed" data-id="${post.id}">Mark Shot</button><button class="btn btn-sm btn-ghost btn-copy-script" data-id="${post.id}">Copy Script</button></div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (todayPosts.length === 0 && pendingScripts.length === 0 && feedbackDuePosts.length === 0 && missedPosts.length === 0) {
        html += `
          <div class="action-card text-center" style="padding: 32px 20px; align-items: center;">
            <h3 style="font-size: 17px; font-weight: 700;">All Caught Up for Today!</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">Your calendar is uniformly sprinkled across 2 weeks.</p>
            <button class="btn btn-primary btn-sm" id="dash-zen-record-insight" style="margin-top: 16px;">Record a New Insight</button>
          </div>
        `;
      }

      html += `</div>`;
      container.innerHTML = html;

      document.getElementById('dash-hero-record-insight')?.addEventListener('click', () => openModal('insightCreate'));
      document.getElementById('dash-zen-record-insight')?.addEventListener('click', () => openModal('insightCreate'));
      document.getElementById('dash-hero-quick-note')?.addEventListener('click', () => openModal('quickNote'));
      document.getElementById('dash-btn-start-review')?.addEventListener('click', () => navigateTo('review'));
      document.getElementById('dash-btn-auto-reshuffle')?.addEventListener('click', async () => {
        const result = await rescheduleMissedPosts();
        showToast(result.rescheduledCount > 0 ? `${result.rescheduledCount} missed post${result.rescheduledCount === 1 ? '' : 's'} rescheduled.` : 'No missed posts could be rescheduled.', result.rescheduledCount > 0 ? 'success' : 'info');
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
          const newDate = container.querySelector(`.missed-date-input[data-id="${id}"]`)?.value;
          if (!newDate || newDate < todayStr) return showToast('Choose today or a future date.', 'error');
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

      container.querySelectorAll('.btn-copy-script').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const reel = await db.getScheduledReel(e.currentTarget.dataset.id);
          if (!reel?.script) return showToast('There is no script to copy for this post.', 'info');
          try {
            await navigator.clipboard.writeText(reel.script);
          } catch {
            const textarea = document.createElement('textarea');
            textarea.value = reel.script;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
          }
          showToast('Script copied to clipboard.', 'success');
        });
      });

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

      container.querySelectorAll('.btn-mark-posted').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          const reel = await db.getScheduledReel(id);
          if (reel) {
            reel.status = 'posted';
            reel.posted_date = formatDateForInput(getSystemDate());
            await db.saveScheduledReel(reel);
            showToast('Marked as Posted! 3-day feedback timer started.', 'success');
            DashboardView.render(container, navigateTo, openModal);
          }
        });
      });

      container.querySelectorAll('.btn-log-feedback').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          openModal('trialFeedback', { reelId: id });
        });
      });
    }
  };

  // SCRIPT REVIEW VIEW
  const ScriptReviewView = {
    currentIndex: 0,
    async render(container, navigateTo, openModal) {
      const scripts = await db.getPendingReviewScripts();
      if (!scripts || scripts.length === 0) {
        container.innerHTML = `
          <div class="action-card text-center" style="padding: 40px 20px; align-items: center;">
            <h3>All Scripts Reviewed!</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">Record a new clinical insight to generate your next curiosity script pack.</p>
            <button class="btn btn-primary btn-sm" id="btn-review-new-insight" style="margin-top: 16px;">Record New Insight</button>
          </div>
        `;
        document.getElementById('btn-review-new-insight')?.addEventListener('click', () => openModal('insightCreate'));
        return;
      }

      if (this.currentIndex >= scripts.length) this.currentIndex = 0;
      const script = scripts[this.currentIndex];

      let html = `
        <div class="review-lane" style="max-width: 680px; margin: 0 auto;">
          <div class="flex items-center justify-between" style="margin-bottom: 12px;">
            <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">Card ${this.currentIndex + 1} of ${scripts.length}</span>
            <span class="action-card-badge badge-amber">Pending Review</span>
          </div>

          <div class="card" style="padding: 22px;">
            <div style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: var(--text-tertiary); margin-bottom: 4px;">Format: ${escapeHtml(script.format)}</div>
            <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; margin-bottom: 12px;">${escapeHtml(script.title)}</h3>
            
            <div style="background: var(--bg-subtle); padding: 12px 14px; border-radius: var(--radius-md); margin-bottom: 12px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 4px;">Curiosity Hook</div>
              <p style="font-size: 14px; font-weight: 600; color: var(--text-primary); cursor: pointer;" id="text-hook-display">"${escapeHtml(script.hook)}"</p>
            </div>

            <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--radius-md); margin-bottom: 12px; line-height: 1.5; font-size: 13.5px;" id="text-script-display">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 6px;">Script Body & Stage Directions</div>
              ${escapeHtml(script.script)}
            </div>

            <div style="font-size: 13px; font-weight: 600; color: var(--accent-blue); margin-bottom: 16px;">
              CTA: ${escapeHtml(script.cta)}
            </div>

            <div class="flex gap-2 justify-between items-center" style="border-top: 1px solid var(--border-subtle); padding-top: 14px;">
              <button class="btn btn-danger btn-sm" id="btn-reject-script">✕ Reject</button>
              <div class="flex gap-2">
                <button class="btn btn-secondary btn-sm" id="btn-edit-script">✎ Quick Edit</button>
                <button class="btn btn-success btn-lg" id="btn-accept-script">✓ Approve & Uniformly Sprinkle →</button>
              </div>
            </div>
          </div>
        </div>
      `;

      container.innerHTML = html;

      document.getElementById('btn-accept-script')?.addEventListener('click', async () => {
        script.status = 'accepted';
        await db.saveScript(script);
        await scheduleAcceptedScript(script);
        showToast('Approved & uniformly sprinkled across 2-week schedule!', 'success');
        ScriptReviewView.render(container, navigateTo, openModal);
      });

      document.getElementById('btn-reject-script')?.addEventListener('click', async () => {
        script.status = 'rejected';
        await db.saveScript(script);
        showToast('Script rejected', 'info');
        ScriptReviewView.render(container, navigateTo, openModal);
      });
    }
  };

  // SCHEDULE VIEW
  const ScheduleView = {
    currentMonthDate: getSystemDate(),
    async render(container, navigateTo, openModal) {
      const profile = await db.getProfile();
      const enableFilming = profile.enableFilmingWorkflow === true;
      const allReels = await db.getScheduledReels();
      const todayStr = formatDateForInput(getSystemDate());

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

      const firstDayIndex = new Date(year, month, 1).getDay();
      const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

      let html = `
        <div class="calendar-lane" style="max-width: 900px;">
          <div class="schedule-header">
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">Publishing Calendar</h2>
              <p style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">Uniformly sprinkled across ${profile.sprinkleWindowDays || 14} days. Click any cell to view post details.</p>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-secondary btn-sm" id="btn-recalculate-schedule"><span>Re-Sprinkle Schedule</span></button>
            </div>
          </div>

          <div class="card" style="padding: 12px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <button class="btn btn-ghost btn-sm" id="btn-prev-month">← Previous</button>
            <h3 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700;">${monthName}</h3>
            <button class="btn btn-ghost btn-sm" id="btn-next-month">Next →</button>
          </div>

          <div class="card" style="padding: 12px; overflow-x: auto;">
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; font-size: 12px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 8px;">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
      `;

      for (let i = 0; i < firstDayIndex; i++) {
        html += `<div style="background: var(--bg-subtle); border-radius: var(--radius-sm); min-height: 78px; opacity: 0.3;"></div>`;
      }

      for (let day = 1; day <= totalDaysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dateStr = formatDateForInput(dateObj);
        const isToday = dateStr === todayStr;
        const reelsOnDay = reelsByDate[dateStr] || [];

        let dayStyle = 'background: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 6px; min-height: 84px; display: flex; flex-direction: column; cursor: pointer;';
        if (isToday) {
          dayStyle = 'background: #FFFFFF; border: 2px solid var(--accent-blue); border-radius: var(--radius-md); padding: 6px; min-height: 84px; display: flex; flex-direction: column; cursor: pointer; box-shadow: var(--shadow-xs);';
        }

        html += `
          <div class="cal-day-cell" data-date="${dateStr}" style="${dayStyle}">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 13px; font-weight: ${isToday ? '800' : '600'}; color: ${isToday ? 'var(--accent-blue)' : 'var(--text-primary)'};">${day} ${isToday ? '📍' : ''}</span>
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

      html += `</div></div></div>`;
      container.innerHTML = html;

      document.getElementById('btn-prev-month')?.addEventListener('click', () => {
        this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() - 1);
        ScheduleView.render(container, navigateTo, openModal);
      });

      document.getElementById('btn-next-month')?.addEventListener('click', () => {
        this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() + 1);
        ScheduleView.render(container, navigateTo, openModal);
      });

      document.getElementById('btn-recalculate-schedule')?.addEventListener('click', async () => {
        const res = await recalculateFutureSchedule();
        showToast(`Uniformly re-sprinkled ${res.updatedCount} future trial reels over 2 weeks!`, 'success');
        ScheduleView.render(container, navigateTo, openModal);
      });

      container.querySelectorAll('.cal-day-cell').forEach((cell) => {
        cell.addEventListener('click', (e) => {
          const dateStr = e.currentTarget.dataset.date;
          const reelsOnDate = reelsByDate[dateStr] || [];
          this.openDayDetailModal(dateStr, reelsOnDate, navigateTo, openModal, enableFilming);
        });
      });

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
          if (newDate < todayStr) return showToast('Posts can only be moved to today or a future date.', 'error');
          if (reel.status === 'posted' || reel.is_locked) return showToast(reel.is_locked ? 'Unpin this date before moving the post.' : 'Posted items cannot be rescheduled.', 'info');
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
            <p style="font-size: 14px; color: var(--text-tertiary);">No content scheduled for this date.</p>
            <button class="btn btn-primary btn-sm" id="btn-modal-capture-for-day">+ Record New Insight</button>
          </div>
        `;
        modalOverlay.classList.remove('hidden');
        document.getElementById('btn-modal-capture-for-day')?.addEventListener('click', () => {
          modalOverlay.classList.add('hidden');
          openModal('insightCreate');
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
                    <span class="action-card-badge ${isMain ? 'badge-purple' : 'badge-gray'}">${isMain ? '⭐ Main Reel' : 'Trial Reel'}</span>
                    <span style="font-size: 13px; font-weight: 600;">${escapeHtml(reel.format)}</span>
                  </div>
                  <span class="action-card-badge ${isPosted ? 'badge-green' : isFilmed ? 'badge-blue' : 'badge-amber'}">${isPosted ? '✓ Posted' : isFilmed ? '✓ Filmed' : 'Ready to post'}</span>
                </div>
                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700;">${escapeHtml(reel.title)}</h3>
                <div style="font-size: 13.5px; background: var(--bg-subtle); padding: 10px; border-radius: var(--radius-md); margin-bottom: 10px;">"${escapeHtml(reel.hook)}"</div>
                <div style="font-size: 12.5px; font-weight: 600; color: var(--accent-blue); margin-bottom: 12px;">CTA: ${escapeHtml(reel.cta)}</div>
                ${!isPosted ? `<div class="flex gap-2 items-center" style="margin-bottom: 12px; flex-wrap: wrap;"><label style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">Reschedule <input class="form-input detail-reschedule-date" data-id="${reel.id}" type="date" min="${formatDateForInput(getSystemDate())}" value="${reel.scheduled_date}" style="width: 150px; margin-left: 5px; padding: 6px 8px; font-size: 12px;" /></label><button class="btn btn-secondary btn-sm btn-detail-reschedule" data-id="${reel.id}">Set Date</button></div>` : ''}
                <div class="flex gap-2 justify-between items-center" style="border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                  <button class="btn btn-ghost btn-sm btn-detail-lock" data-id="${reel.id}">${isLocked ? '🔒 Unpin Date' : '📌 Pin Date'}</button>
                  <div class="flex gap-2">
                    ${enableFilming && !isFilmed && !isPosted ? `<button class="btn btn-secondary btn-sm btn-detail-film" data-id="${reel.id}">Mark Filmed</button>` : ''}
                    ${!isPosted ? `<button class="btn btn-primary btn-sm btn-detail-post" data-id="${reel.id}">Mark Posted</button>` : `<button class="btn btn-secondary btn-sm btn-detail-feedback" data-id="${reel.id}">Log 3-Day Feedback</button>`}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      modalBody.innerHTML = html;
      modalOverlay.classList.remove('hidden');

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
            reel.posted_date = formatDateForInput(getSystemDate());
            await db.saveScheduledReel(reel);
            showToast('Marked as Posted! 3-day feedback timer started.', 'success');
            modalOverlay.classList.add('hidden');
            ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal);
          }
        });
      });

      modalBody.querySelectorAll('.btn-detail-feedback').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          modalOverlay.classList.add('hidden');
          openModal('trialFeedback', { reelId: e.currentTarget.dataset.id });
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
          const newDate = modalBody.querySelector(`.detail-reschedule-date[data-id="${id}"]`)?.value;
          const today = formatDateForInput(getSystemDate());
          if (!newDate || newDate < today) return showToast('Choose today or a future date.', 'error');
          const reel = await db.getScheduledReel(id);
          if (!reel || reel.status === 'posted') return;
          if (reel.is_locked) return showToast('Unpin this date before rescheduling.', 'info');
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

  // FEEDBACK VIEW
  const FeedbackView = {
    activeTab: 'due',
    async render(container, navigateTo, openModal) {
      const allReels = await db.getScheduledReels();
      const systemDate = getSystemDate();

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
          <div class="schedule-header" style="margin-bottom: 20px;">
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 22px; font-weight: 700;">📊 3-Day Performance Checks & Feedback</h2>
              <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">
                Trial reels are evaluated 3 days after posting to select the single highest-performing format as a <strong>Main Reel</strong> winner.
              </p>
            </div>
            <div class="flex gap-2 items-center">
              <button class="btn btn-secondary btn-sm" id="btn-feedback-timetravel" style="color: var(--accent-purple); font-weight: 600; background: var(--accent-purple-subtle);">
                ⏩ +3 Days Time Travel
              </button>
            </div>
          </div>

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
                <p style="font-size: 12.5px; color: var(--accent-purple); font-weight: 600;">
                  💡 You have ${awaitingCheck.length} post(s) currently in their 3-day window. Use "+3 Days Time Travel" above to fast-forward system date for testing.
                </p>
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

      document.getElementById('btn-feedback-timetravel')?.addEventListener('click', () => {
        const current = getTimeShiftDays();
        setTimeShiftDays(current + 3);
        showToast('Fast-forwarded +3 days in system date!', 'success');
        this.render(container, navigateTo, openModal);
      });

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

  // NOTES VIEW
  const NotesView = {
    async render(container, navigateTo, openModal) {
      const notes = await db.getNotes();
      const activeNotes = notes.filter((n) => !n.is_archived);

      let html = `
        <div class="notes-lane" style="max-width: 720px; margin: 0 auto;">
          <div class="flex items-center justify-between" style="margin-bottom: 16px;">
            <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">Quick Thoughts Scratchpad</h2>
            <button class="btn btn-primary btn-sm" id="btn-new-thought">+ New Thought</button>
          </div>
          <div class="flex flex-col gap-3">
            ${activeNotes.map((note) => `
              <div class="card" style="padding: 16px;">
                <p style="font-size: 14px; margin-bottom: 10px;">"${escapeHtml(note.text)}"</p>
                <div class="flex justify-between items-center">
                  <span style="font-size: 12px; color: var(--text-tertiary);">${formatRelativeDate(note.created_at)}</span>
                  <button class="btn btn-secondary btn-sm btn-convert-note-main" data-id="${note.id}">Convert to Clinical Insight →</button>
                </div>
              </div>
            `).join('')}
            ${activeNotes.length === 0 ? '<p style="text-align: center; color: var(--text-tertiary); padding: 30px;">No active thoughts.</p>' : ''}
          </div>
        </div>
      `;

      container.innerHTML = html;
      document.getElementById('btn-new-thought')?.addEventListener('click', () => openModal('quickNote'));
      container.querySelectorAll('.btn-convert-note-main').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const note = activeNotes.find((n) => n.id === e.currentTarget.dataset.id);
          if (note) openModal('insightCreate', { prefillTitle: note.text, noteId: note.id });
        });
      });
    }
  };

  // LIBRARY VIEW
  const LibraryView = {
    activeInsightId: null,
    async render(container, navigateTo, openModal) {
      const insights = await db.getInsights();
      const allScripts = await db.getScripts();
      const allReels = await db.getScheduledReels();

      if (this.activeInsightId) {
        await this.renderTimeline(container, this.activeInsightId, navigateTo, openModal);
        return;
      }

      let html = `
        <div class="library-lane" style="max-width: 900px; margin: 0 auto;">
          <div class="flex items-center justify-between" style="margin-bottom: 16px;">
            <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">Clinical Content Library</h2>
            <button class="btn btn-primary btn-sm" id="btn-lib-new-insight">+ Record Insight</button>
          </div>
          <div class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
            ${insights.map((ins) => {
              const insScripts = allScripts.filter((s) => s.insight_id === ins.id);
              const insReels = allReels.filter((r) => r.insight_id === ins.id);
              return `
                <div class="card card-insight-item" data-id="${ins.id}" style="cursor: pointer;">
                  <span class="action-card-badge badge-gray" style="margin-bottom: 8px;">${insScripts.length} Scripts • ${insReels.length} Reels</span>
                  <h3 style="font-family: var(--font-heading); font-size: 15px; font-weight: 700;">${escapeHtml(ins.title)}</h3>
                  <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">${escapeHtml(ins.description || '')}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      container.innerHTML = html;
      document.getElementById('btn-lib-new-insight')?.addEventListener('click', () => openModal('insightCreate'));
      container.querySelectorAll('.card-insight-item').forEach((card) => {
        card.addEventListener('click', (e) => {
          this.activeInsightId = e.currentTarget.dataset.id;
          LibraryView.render(container, navigateTo, openModal);
        });
      });
    },

    async renderTimeline(container, insightId, navigateTo, openModal) {
      const insight = await db.getInsight(insightId);
      const scripts = await db.getScriptsByInsight(insightId);
      const allReels = await db.getScheduledReels();
      const insReels = allReels.filter((r) => r.insight_id === insightId);

      let html = `
        <div class="timeline-lane" style="max-width: 720px; margin: 0 auto;">
          <button class="btn btn-ghost btn-sm" id="btn-back-to-library" style="margin-bottom: 12px;">← Back to Library</button>
          <div class="card" style="padding: 20px; margin-bottom: 16px;">
            <h2 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">${escapeHtml(insight.title)}</h2>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 6px;">${escapeHtml(insight.supporting_points || insight.description || '')}</p>
            <div style="font-size: 12.5px; font-weight: 600; color: var(--accent-blue); margin-top: 8px;">CTA: ${escapeHtml(insight.custom_cta || 'Check caption for more')}</div>
          </div>
          <div class="card" style="padding: 20px;">
            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 12px;">Content Lifecycle</h3>
            <p style="font-size: 13px; color: var(--text-secondary);">${scripts.length} generated scripts, ${insReels.length} scheduled on calendar.</p>
          </div>
        </div>
      `;

      container.innerHTML = html;
      document.getElementById('btn-back-to-library')?.addEventListener('click', () => {
        this.activeInsightId = null;
        LibraryView.render(container, navigateTo, openModal);
      });
    }
  };

  // SETTINGS VIEW
  const SettingsView = {
    async render(container, navigateTo, openModal) {
      const profile = await db.getProfile();
      const timeShift = getTimeShiftDays();

      let html = `
        <div class="action-deck">
          <div class="schedule-header">
            <div>
              <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">Doctor Profile & System Settings</h2>
              <p style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">Customize prompt engine rules, 2-week sprinkle scheduling, and workflow preferences.</p>
            </div>
          </div>

          <form id="form-doctor-profile" class="card">
            <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 12px;">🧑‍⚕️ Doctor Profile & Prompt Persona</h3>
            <div class="form-group">
              <label class="form-label" for="prof-name">Doctor Name *</label>
              <input type="text" id="prof-name" class="form-input" value="${escapeHtml(profile.name || '')}" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="prof-specialty">Medical Specialty *</label>
              <input type="text" id="prof-specialty" class="form-input" value="${escapeHtml(profile.specialty || '')}" required />
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="margin-top: 12px;">Save Doctor Profile</button>
          </form>

          <div class="card" style="margin-top: 16px;">
            <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 4px;">AI Script Generation Prompt</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">Add standing instructions for every generated prompt. They are saved in your profile and included in backups.</p>
            <label class="form-label" for="setting-custom-prompt">Custom prompt instructions</label>
            <textarea id="setting-custom-prompt" class="form-textarea" rows="7" placeholder="e.g. Use Indian clinical context and include a short safety note.">${escapeHtml(profile.customPromptInstructions || '')}</textarea>
            <button class="btn btn-primary btn-sm" id="btn-save-custom-prompt" style="margin-top: 12px;">Save Prompt Instructions</button>
          </div>

          <div class="card" style="margin-top: 16px;">
            <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 4px;">🗓️ Sprinkle & Scheduling Engine Settings</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">Approved scripts are uniformly spaced across your 2-week calendar.</p>
            
            <div class="form-group">
              <label class="form-label" for="setting-sprinkle-window">Scheduling Window Duration</label>
              <select id="setting-sprinkle-window" class="form-select">
                <option value="7" ${profile.sprinkleWindowDays === 7 ? 'selected' : ''}>1 Week (7 Days)</option>
                <option value="14" ${!profile.sprinkleWindowDays || profile.sprinkleWindowDays === 14 ? 'selected' : ''}>2 Weeks (14 Days) — Recommended</option>
                <option value="21" ${profile.sprinkleWindowDays === 21 ? 'selected' : ''}>3 Weeks (21 Days)</option>
                <option value="30" ${profile.sprinkleWindowDays === 30 ? 'selected' : ''}>1 Month (30 Days)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="setting-max-posts">Max Posts Per Day</label>
              <select id="setting-max-posts" class="form-select">
                <option value="1" ${!profile.maxPostsPerDay || profile.maxPostsPerDay === 1 ? 'selected' : ''}>Max 1 Post / Day (Balanced)</option>
                <option value="2" ${profile.maxPostsPerDay === 2 ? 'selected' : ''}>Max 2 Posts / Day</option>
                <option value="3" ${profile.maxPostsPerDay === 3 ? 'selected' : ''}>Max 3 Posts / Day</option>
              </select>
            </div>

            <div class="flex gap-2 justify-between items-center" style="margin-top: 12px;">
              <button class="btn btn-secondary btn-sm" id="btn-resprinkle-now">Re-Sprinkle & Uniformly Space Schedule</button>
              <button class="btn btn-primary btn-sm" id="btn-save-sprinkle-settings">Save Sprinkle Settings</button>
            </div>
          </div>

          <div class="card" style="margin-top: 16px;">
            <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 4px;">🎬 Workflow Preferences</h3>
            <div class="form-group" style="display: flex; align-items: center; gap: 10px; background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-md);">
              <input type="checkbox" id="setting-enable-filming" style="width: 18px; height: 18px; cursor: pointer;" ${profile.enableFilmingWorkflow ? 'checked' : ''} />
              <div>
                <label for="setting-enable-filming" style="font-size: 14px; font-weight: 600; cursor: pointer;">Enable Filming Status Workflow</label>
                <p style="font-size: 12px; color: var(--text-tertiary);">Uncheck to keep workflow lightweight and go straight to posting.</p>
              </div>
            </div>
            <div class="form-group" style="margin-top: 12px;">
              <label class="form-label" for="setting-missed-post-mode">When a post is missed</label>
              <select id="setting-missed-post-mode" class="form-select">
                <option value="manual" ${(profile.missedPostRescheduleMode || 'manual') === 'manual' ? 'selected' : ''}>Ask me — reschedule after I tap</option>
                <option value="auto" ${profile.missedPostRescheduleMode === 'auto' ? 'selected' : ''}>Automatically reschedule when I open Today</option>
              </select>
              <p style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">Automatic mode only moves missed posts; it keeps your future plan and filmed reels in place.</p>
            </div>
          </div>

          <div class="card" style="margin-top: 16px; border-left: 4px solid var(--accent-purple);">
            <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 4px;">🧪 Testing Tool: Time Travel Fast-Forward (+3 Days)</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">Advance simulated date into the future to test Feedback Due page.</p>
            <div class="flex items-center gap-3" style="flex-wrap: wrap;">
              <button class="btn btn-accent btn-sm" id="btn-test-time-travel">⏩ Fast-Forward +3 Days</button>
              ${timeShift !== 0 ? `<button class="btn btn-secondary btn-sm" id="btn-reset-time-travel">↺ Reset Date (+0)</button>` : ''}
              <span style="font-size: 12px; font-weight: 600; color: ${timeShift > 0 ? 'var(--accent-purple)' : 'var(--text-tertiary)'};">
                ${timeShift > 0 ? `📍 Active Shift: +${timeShift} days in future` : '📍 System Date: Actual Today'}
              </span>
            </div>
          </div>

          <div class="card" style="margin-top: 16px;">
            <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 6px;">Local-First Backup</h3>
            <div class="flex gap-2" style="flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" id="btn-export-json">Export Backup</button>
              <button class="btn btn-secondary btn-sm" id="btn-import-json-trigger">Import Backup</button>
              <input type="file" id="input-file-backup" accept=".json,application/json" class="hidden" />
              <button class="btn btn-secondary btn-sm" id="btn-load-demo-settings">Load Cardiology Demo</button>
            </div>
          </div>

          <div class="card" style="margin-top: 16px; border: 1.5px dashed var(--accent-red); background: var(--accent-red-subtle);">
            <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--accent-red);">⚠️ Reset All Data</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">Permanently delete all workspace data.</p>
            <button class="btn btn-danger btn-lg" id="btn-reset-all-data">Delete All Data & Reset Workspace</button>
          </div>
        </div>
      `;

      container.innerHTML = html;

      document.getElementById('form-doctor-profile')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        profile.name = document.getElementById('prof-name').value.trim();
        profile.specialty = document.getElementById('prof-specialty').value.trim();
        await db.saveProfile(profile);
        showToast('Profile updated!', 'success');
      });

      document.getElementById('btn-save-sprinkle-settings')?.addEventListener('click', async () => {
        profile.sprinkleWindowDays = parseInt(document.getElementById('setting-sprinkle-window').value, 10);
        profile.maxPostsPerDay = parseInt(document.getElementById('setting-max-posts').value, 10);
        await db.saveProfile(profile);
        await recalculateFutureSchedule();
        showToast('Sprinkle settings saved & schedule re-spaced!', 'success');
      });

      document.getElementById('btn-save-custom-prompt')?.addEventListener('click', async () => {
        profile.customPromptInstructions = document.getElementById('setting-custom-prompt').value.trim();
        await db.saveProfile(profile);
        showToast('Prompt instructions saved and will be included in backups.', 'success');
      });

      document.getElementById('btn-resprinkle-now')?.addEventListener('click', async () => {
        profile.sprinkleWindowDays = parseInt(document.getElementById('setting-sprinkle-window').value, 10);
        profile.maxPostsPerDay = parseInt(document.getElementById('setting-max-posts').value, 10);
        await db.saveProfile(profile);
        const res = await recalculateFutureSchedule();
        showToast(`Uniformly re-sprinkled ${res.updatedCount} future reels across ${profile.sprinkleWindowDays || 14} days!`, 'success');
      });

      document.getElementById('setting-enable-filming')?.addEventListener('change', async (e) => {
        profile.enableFilmingWorkflow = e.target.checked;
        await db.saveProfile(profile);
        showToast(e.target.checked ? 'Filming workflow enabled' : 'Filming workflow disabled', 'info');
      });

      document.getElementById('setting-missed-post-mode')?.addEventListener('change', async (e) => {
        profile.missedPostRescheduleMode = e.target.value;
        await db.saveProfile(profile);
        showToast(e.target.value === 'auto' ? 'Missed posts will reschedule when you open Today.' : 'Missed posts will wait for your approval.', 'info');
      });

      document.getElementById('btn-test-time-travel')?.addEventListener('click', async () => {
        const current = getTimeShiftDays();
        setTimeShiftDays(current + 3);
        showToast('Fast-forwarded +3 days in system date! Check Feedback Due.', 'success');
        window.location.reload();
      });

      document.getElementById('btn-reset-time-travel')?.addEventListener('click', async () => {
        setTimeShiftDays(0);
        showToast('System date reset to actual today!', 'info');
        window.location.reload();
      });

      document.getElementById('btn-export-json')?.addEventListener('click', async () => {
        const backup = await db.exportFullDatabase();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doctor-content-os-backup.json`;
        a.click();
        URL.revokeObjectURL(url);
      });

      document.getElementById('btn-import-json-trigger')?.addEventListener('click', () => {
        document.getElementById('input-file-backup')?.click();
      });

      document.getElementById('input-file-backup')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          await db.importFullDatabase(JSON.parse(await file.text()));
          showToast('Workspace restored from backup.', 'success');
          navigateTo('dashboard');
        } catch (err) {
          showToast(`Restore failed: ${err.message}`, 'error');
        }
      });

      document.getElementById('btn-load-demo-settings')?.addEventListener('click', async () => {
        await populateSampleDoctorWorkspace();
        showToast('Demo workspace loaded!', 'success');
        navigateTo('dashboard');
      });

      document.getElementById('btn-reset-all-data')?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete ALL data?')) {
          await db.resetAllData();
          showToast('Workspace reset!', 'info');
          window.location.reload();
        }
      });
    }
  };

  // 9. APP COORDINATOR & ROUTER
  class ContentOSApp {
    constructor() {
      this.currentView = 'dashboard';
      this.modalActive = false;
      this.viewContainer = document.getElementById('view-container');
      this.modalOverlay = document.getElementById('modal-overlay');
      this.modalBody = document.getElementById('modal-body');
      this.modalTitle = document.getElementById('modal-title');
      this.headerViewTitle = document.getElementById('header-view-title');
      this.headerDate = document.getElementById('header-today-date');
    }

    async init() {
      const profile = await db.getProfile();
      if (!profile || !profile.onboarded) {
        await populateSampleDoctorWorkspace();
      }

      const updatedProfile = await db.getProfile();
      const sideName = document.getElementById('sidebar-dr-name');
      if (sideName) sideName.textContent = updatedProfile.name || 'Doctor Workspace';

      if (this.headerDate) this.headerDate.textContent = formatDate(getSystemDate());

      this.setupNavigation();
      this.setupModals();

      const hash = window.location.hash.replace(/^#/, '');
      this.navigateTo(hash || 'dashboard');
      this.updateBadges();
    }

    setupNavigation() {
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace(/^#/, '');
        this.navigateTo(hash || 'dashboard');
      });

      document.getElementById('bnav-fab-capture')?.addEventListener('click', () => this.openModal('insightCreate'));
      document.getElementById('header-btn-timetravel')?.addEventListener('click', async () => {
        const current = getTimeShiftDays();
        setTimeShiftDays(current + 3);
        const profile = await db.getProfile();
        if (profile.missedPostRescheduleMode === 'auto') await rescheduleMissedPosts();
        showToast('Fast-forwarded +3 days in system date! Check Feedback Due.', 'success');
        if (this.headerDate) this.headerDate.textContent = formatDate(getSystemDate());
        this.navigateTo(this.currentView);
        this.updateBadges();
      });
      document.getElementById('header-btn-note')?.addEventListener('click', () => this.openModal('quickNote'));
      document.getElementById('header-btn-insight')?.addEventListener('click', () => this.openModal('insightCreate'));
      document.getElementById('btn-load-demo-sidebar')?.addEventListener('click', async () => {
        await populateSampleDoctorWorkspace();
        this.navigateTo('dashboard');
        this.updateBadges();
      });
    }

    async navigateTo(viewName) {
      this.currentView = viewName;
      window.location.hash = viewName;

      if (viewName === 'dashboard') {
        const profile = await db.getProfile();
        if (profile.missedPostRescheduleMode === 'auto') await rescheduleMissedPosts();
      }

      document.querySelectorAll('.nav-link, .bnav-item').forEach((el) => {
        el.classList.toggle('active', el.dataset.view === viewName);
      });

      const titles = {
        dashboard: "Today's Workspace",
        review: "Script Review Deck",
        schedule: "Content Schedule",
        feedback: "Feedback Due",
        notes: "Quick Thoughts",
        library: "Content Library",
        settings: "Doctor Profile"
      };

      if (this.headerViewTitle) this.headerViewTitle.textContent = titles[viewName] || "Doctor Workspace";

      if (viewName === 'dashboard') await DashboardView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
      else if (viewName === 'review') await ScriptReviewView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
      else if (viewName === 'schedule') await ScheduleView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
      else if (viewName === 'feedback') await FeedbackView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
      else if (viewName === 'notes') await NotesView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
      else if (viewName === 'library') await LibraryView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));
      else if (viewName === 'settings') await SettingsView.render(this.viewContainer, this.navigateTo.bind(this), this.openModal.bind(this));

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

      const titles = {
        insightCreate: 'Record New Clinical Insight',
        quickNote: 'Quick Thought / Scratchpad',
        aiImport: 'Import AI Script Pack',
        trialFeedback: '3-Day Trial Reel Feedback'
      };

      this.modalTitle.textContent = titles[modalType] || 'Action Sheet';

      if (modalType === 'insightCreate') {
        InsightCreateModal.render(this.modalBody, options, this.closeModal.bind(this), this.openModal.bind(this));
      } else if (modalType === 'quickNote') {
        this.modalBody.innerHTML = `
          <form id="modal-form-quick-note" class="flex flex-col gap-3">
            <p style="font-size: 13px; color: var(--text-secondary);">Capture an incomplete clinical spark.</p>
            <textarea id="modal-input-note" class="form-textarea" rows="3" placeholder="e.g. I should explain Vitamin D..." required></textarea>
            <div class="flex justify-between items-center">
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
            await db.addNote({ id: uuidv4(), text, created_at: new Date().toISOString(), is_archived: false });
            this.closeModal();
            this.navigateTo(this.currentView);
          }
        });
      } else if (modalType === 'aiImport') {
        AIImportModal.render(this.modalBody, options, this.closeModal.bind(this), this.openModal.bind(this), this.navigateTo.bind(this));
      } else if (modalType === 'trialFeedback') {
        TrialFeedbackModal.render(this.modalBody, options, this.closeModal.bind(this), this.openModal.bind(this), this.navigateTo.bind(this));
      }
    }

    closeModal() {
      this.modalActive = false;
      this.modalOverlay.classList.add('hidden');
      this.modalBody.innerHTML = '';
      this.updateBadges();
    }

    async updateBadges() {
      const pendingScripts = await db.getPendingReviewScripts();
      const allReels = await db.getScheduledReels();
      const allNotes = await db.getNotes();

      const reviewCount = pendingScripts.length;
      const badgeReviewD = document.getElementById('badge-review-count');
      const badgeReviewM = document.getElementById('bnav-badge-review');
      if (badgeReviewD && badgeReviewM) {
        badgeReviewD.textContent = reviewCount;
        badgeReviewM.textContent = reviewCount;
        badgeReviewD.classList.toggle('hidden', reviewCount === 0);
        badgeReviewM.classList.toggle('hidden', reviewCount === 0);
      }

      const systemDate = getSystemDate();
      const feedbackDueCount = allReels.filter((r) => {
        if (r.status !== 'posted' || r.feedback_logged) return false;
        const diff = Math.floor((systemDate - new Date(r.posted_date || r.scheduled_date)) / (1000 * 60 * 60 * 24));
        return diff >= 3;
      }).length;

      const badgeFeedD = document.getElementById('badge-feedback-count');
      if (badgeFeedD) {
        badgeFeedD.textContent = feedbackDueCount;
        badgeFeedD.classList.toggle('hidden', feedbackDueCount === 0);
      }

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

  document.addEventListener('DOMContentLoaded', () => {
    const app = new ContentOSApp();
    app.init();
  });
})();
