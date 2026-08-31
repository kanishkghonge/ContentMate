/**
 * Content OS for Doctors — Main Application Coordinator & Router
 * Orchestrates local-first database, mobile bottom-nav, modal sheets, and views.
 */

import { db } from './db.js';
import { DashboardView } from './components/dashboard.js';
import { NotesView } from './components/notes.js';
import { InsightCreateModal } from './components/insightCreate.js';
import { AIImportModal } from './components/aiImport.js';
import { ScriptReviewView } from './components/scriptReview.js';
import { ScheduleView } from './components/scheduleView.js';
import { TrialFeedbackModal } from './components/trialFeedback.js';
import { ManualScriptModal } from './components/manualScript.js';
import { FeedbackView } from './components/feedbackView.js';
import { LibraryView } from './components/library.js';
import { SettingsView } from './components/settings.js';
import { WorkflowTutorial } from './tutorial.js';
import { rescheduleMissedPosts } from './scheduler.js';
import { formatDate, getSystemDate, escapeHtml, showToast, copyToClipboard } from './utils.js';

class ContentOSApp {
  constructor() {
    this.currentView = 'dashboard';
    this.modalActive = false;
    this.onboardingActive = false;
    this.viewContainer = document.getElementById('view-container');
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalBody = document.getElementById('modal-body');
    this.modalTitle = document.getElementById('modal-title');
    this.modalCard = document.getElementById('modal-card');
    this.headerViewTitle = document.getElementById('header-view-title');
    this.headerDate = document.getElementById('header-today-date');
    this.tutorial = new WorkflowTutorial(this);
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
    window.addEventListener('contentmate-replay-tutorial', () => this.tutorial.start());
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
    this.onboardingActive = modalType === 'onboarding';
    this.modalOverlay.classList.remove('hidden');
    this.modalCard?.classList.toggle('onboarding-card', modalType === 'onboarding');

    const titles = {
      insightCreate: 'Record New Idea',
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
      
      // Combine hook, script body, and CTA into one script
      const scriptContent = [reel.hook, reel.script, reel.cta].filter(Boolean).join('\n\n');
      const displayScript = `Title: ${reel.title || 'Untitled script'}\n\nScript:\n${scriptContent}`;

      this.modalBody.innerHTML = `
        <div class="reel-script-detail">
          <div class="reel-script-detail-meta">
            <span>${escapeHtml(reel.format || 'Reel')}</span>
            ${reel.estimated_duration ? `<span>• ${escapeHtml(reel.estimated_duration)}</span>` : ''}
          </div>
          <div id="script-view-mode">
            <div class="reel-script-detail-box" style="white-space: pre-wrap;">${escapeHtml(displayScript)}</div>
            <div class="flex justify-between items-center" style="margin-top: 16px; gap: 8px;">
              <button type="button" class="btn btn-danger btn-sm" id="btn-delete-script-detail" data-id="${reel.id}">
                🗑️ Delete Script
              </button>
              <div class="flex gap-2">
                <button type="button" class="btn btn-secondary" id="btn-edit-script">Edit Script</button>
                <button type="button" class="btn btn-ghost" id="btn-close-script-detail">Close</button>
                <button type="button" class="btn btn-primary" id="btn-copy-full-script">Copy Script</button>
              </div>
            </div>
          </div>
          <div id="script-edit-mode" class="hidden">
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" for="edit-script-title">Title</label>
              <input type="text" id="edit-script-title" class="form-input" value="${escapeHtml(reel.title || '')}" />
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
              <label class="form-label" for="edit-script-content">Script</label>
              <textarea id="edit-script-content" class="form-textarea" rows="12" style="font-family: var(--font-body); font-size: 14px; line-height: 1.6;">${escapeHtml(scriptContent)}</textarea>
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" class="btn btn-ghost" id="btn-cancel-edit">Cancel</button>
              <button type="button" class="btn btn-primary" id="btn-save-edit">Save Changes</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-close-script-detail')?.addEventListener('click', () => this.closeModal());
      
      // Copy only the script content (not the title)
      document.getElementById('btn-copy-full-script')?.addEventListener('click', () => {
        copyToClipboard(scriptContent);
        showToast('Script copied (without title)', 'success');
      });
      
      document.getElementById('btn-delete-script-detail')?.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('Are you sure you want to delete this script? This cannot be undone.')) {
          await db.deleteScheduledReel(id);
          showToast('Script deleted successfully', 'success');
          this.closeModal();
          await this.navigateTo(this.currentView);
        }
      });

      // Edit functionality
      document.getElementById('btn-edit-script')?.addEventListener('click', () => {
        document.getElementById('script-view-mode').classList.add('hidden');
        document.getElementById('script-edit-mode').classList.remove('hidden');
      });

      document.getElementById('btn-cancel-edit')?.addEventListener('click', () => {
        document.getElementById('script-edit-mode').classList.add('hidden');
        document.getElementById('script-view-mode').classList.remove('hidden');
      });

      document.getElementById('btn-save-edit')?.addEventListener('click', async () => {
        const newTitle = document.getElementById('edit-script-title').value.trim();
        const newScriptContent = document.getElementById('edit-script-content').value.trim();
        
        if (!newTitle || !newScriptContent) {
          showToast('Title and script cannot be empty', 'error');
          return;
        }

        // Parse the script content back into hook, body, and CTA
        // For simplicity, we'll store the entire content in the script field
        // and extract the first paragraph as hook if it exists
        const paragraphs = newScriptContent.split('\n\n').filter(p => p.trim());
        const newHook = paragraphs[0] || '';
        const newBody = paragraphs.slice(1, -1).join('\n\n') || newScriptContent;
        const newCta = paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : '';

        reel.title = newTitle;
        reel.hook = newHook;
        reel.script = newBody;
        reel.cta = newCta;
        reel.updated_at = new Date().toISOString();

        await db.saveScheduledReel(reel);
        showToast('Script updated successfully', 'success');
        this.closeModal();
        await this.navigateTo(this.currentView);
      });
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
      phone: profile?.phone || '',
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
        tutorialSeen: false,
        tutorialSkipped: skipped
      });
      
      // Send data to Split Forms if not skipped
      if (!skipped && draft.name && draft.specialty && draft.phone) {
        try {
          const formData = new FormData();
          formData.append('access_key', '5fc5fab47e2d48d7aa239e04af579c3b');
          formData.append('name', draft.name);
          formData.append('specialty', draft.specialty);
          formData.append('phone', draft.phone);
          formData.append('audience', draft.audience);
          formData.append('timestamp', new Date().toISOString());
          
          const response = await fetch('https://splitforms.com/api/submit', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          console.log('Split Forms submission:', result.success ? 'success' : 'failed');
        } catch (error) {
          console.error('Split Forms error:', error);
        }
      }
      
      updateSidebarName(draft.name);
      this.onboardingActive = false;
      this.closeModal();
      await this.navigateTo('dashboard');
      
      if (skipped) {
        showToast('You can complete your profile anytime in Settings.', 'success');
      } else {
        // Ask if user wants to start tutorial after onboarding
        setTimeout(() => {
          this.showTutorialPrompt();
        }, 300);
      }
    };

    const steps = [
      () => `
        <div class="onboarding-intro">
          <div class="onboarding-mark">✦</div>
          <p class="onboarding-eyebrow">Let's get started</p>
          <h2>Turn clinical insights into content that works.</h2>
          <p>Package ideas in multiple formats, test them as trial reels, and post the winners.</p>
        </div>
        <form id="onboarding-profile-form" class="onboarding-form">
          <div class="form-group"><label class="form-label" for="onboarding-name">Your name</label><input id="onboarding-name" class="form-input" value="${escapeHtml(draft.name)}" placeholder="e.g. Dr. Ananya Shah" required autofocus></div>
          <div class="form-group"><label class="form-label" for="onboarding-specialty">Your specialty</label><input id="onboarding-specialty" class="form-input" value="${escapeHtml(draft.specialty)}" placeholder="e.g. Dermatology" required></div>
          <div class="form-group"><label class="form-label" for="onboarding-phone">Phone number</label><input id="onboarding-phone" type="tel" class="form-input" value="${escapeHtml(draft.phone)}" placeholder="e.g. +91 98765 43210" required></div>
          <div class="form-group"><label class="form-label" for="onboarding-audience">Who do you want to reach?</label><select id="onboarding-audience" class="form-select"><option value="Patients" ${draft.audience === 'Patients' ? 'selected' : ''}>Patients</option><option value="Doctors" ${draft.audience === 'Doctors' ? 'selected' : ''}>Other doctors</option><option value="Both" ${draft.audience === 'Both' ? 'selected' : ''}>Both</option></select></div>
          <div class="onboarding-actions"><button class="btn btn-primary btn-lg" type="submit">Build my workflow <span aria-hidden="true">→</span></button></div>
        </form>`,
      () => `
        <div class="onboarding-intro onboarding-centered">
          <div class="onboarding-mark">⌁</div>
          <p class="onboarding-eyebrow">One insight, multiple angles</p>
          <h2>Test different formats. Post what works.</h2>
          <p>Your intern packages one idea into multiple video formats so your audience can tell you what lands.</p>
        </div>
        <div class="onboarding-highlight"><span>Trial reels</span><strong>Different packaging, same trusted insight</strong></div>
        <div class="onboarding-actions"><button class="btn btn-ghost" id="onboarding-back">Back</button><button class="btn btn-primary btn-lg" id="onboarding-next">Show me the workflow <span aria-hidden="true">→</span></button></div>`,
      () => `
        <div class="onboarding-intro">
          <p class="onboarding-eyebrow">Quick routine</p>
          <h2>From clinic thought to scheduled content.</h2>
          <p>Capture ideas fast, develop them when you're free.</p>
        </div>
        <ol class="onboarding-timeline">
          <li><span>1</span><div><strong>Quick Note</strong><p>Jot down the thought in seconds.</p></div></li>
          <li><span>2</span><div><strong>Add details</strong><p>Develop the insight when you have time.</p></div></li>
          <li><span>3</span><div><strong>Generate scripts</strong><p>Copy prompt, paste in AI, bring back results.</p></div></li>
          <li><span>4</span><div><strong>Review & accept</strong><p>Keep the strongest, reject the rest.</p></div></li>
        </ol>
        <div class="onboarding-actions"><button class="btn btn-ghost" id="onboarding-back">Back</button><button class="btn btn-primary btn-lg" id="onboarding-next">See how it learns <span aria-hidden="true">→</span></button></div>`,
      () => `
        <div class="onboarding-intro onboarding-centered">
          <div class="onboarding-mark">↗</div>
          <p class="onboarding-eyebrow">Test and learn</p>
          <h2>Post trial reels. Promote the winners.</h2>
          <p>Three days after posting, log each reel’s performance. The best-performing version becomes a main reel and is scheduled on your profile—so good ideas get the reach they deserve.</p>
        </div>
        <div class="onboarding-loop"><div>Clinical insight</div><i>→</i><div>Trial reels</div><i>→</i><div>3-day results</div><i>→</i><div class="onboarding-loop-winner">Main reel</div></div>
        <p class="onboarding-closing">Content Mate organizes the system. You focus on clinical insights.</p>
        <div class="onboarding-actions"><button class="btn btn-ghost" id="onboarding-back">Back</button><button class="btn btn-primary btn-lg" id="onboarding-finish">Open my workspace <span aria-hidden="true">→</span></button></div>`
    ];

    const renderStep = () => {
      this.modalBody.innerHTML = `<div class="onboarding-flow"><div class="onboarding-progress" aria-label="Step ${step + 1} of ${steps.length}">${steps.map((_, index) => `<span class="${index <= step ? 'active' : ''}"></span>`).join('')}</div>${steps[step]()}`;
      document.getElementById('onboarding-profile-form')?.addEventListener('submit', (event) => {
        event.preventDefault();
        draft = { name: document.getElementById('onboarding-name').value.trim(), specialty: document.getElementById('onboarding-specialty').value.trim(), phone: document.getElementById('onboarding-phone').value.trim(), audience: document.getElementById('onboarding-audience').value };
        finish(false);
      });
      document.getElementById('onboarding-back')?.addEventListener('click', () => { step -= 1; renderStep(); });
      document.getElementById('onboarding-next')?.addEventListener('click', () => { step += 1; renderStep(); });
      document.getElementById('onboarding-finish')?.addEventListener('click', () => finish(false));
    };

    renderStep();
  }

  showTutorialPrompt() {
    const promptOverlay = document.createElement('div');
    promptOverlay.className = 'tutorial-prompt-overlay';
    promptOverlay.innerHTML = `
      <div class="tutorial-prompt-card">
        <h3>Start Tutorial?</h3>
        <p>Get a quick walkthrough of Content Mate's workflow (estimated time: 2 min)</p>
        <div class="tutorial-prompt-actions">
          <button class="btn btn-ghost" id="tutorial-prompt-skip">Start using</button>
          <button class="btn btn-primary" id="tutorial-prompt-start">Start tutorial</button>
        </div>
        <p class="tutorial-prompt-hint">You can do it anytime from Settings</p>
      </div>
    `;
    document.body.appendChild(promptOverlay);

    document.getElementById('tutorial-prompt-start')?.addEventListener('click', () => {
      promptOverlay.remove();
      this.tutorial.start();
    });

    document.getElementById('tutorial-prompt-skip')?.addEventListener('click', async () => {
      promptOverlay.remove();
      const profile = await db.getProfile();
      await db.saveProfile({ ...profile, tutorialSeen: true, tutorialSkipped: true });
      showToast('You can start the tutorial anytime from Settings.', 'success');
    });
  }

  closeModal() {
    if (this.onboardingActive) return;
    this.modalActive = false;
    this.modalOverlay.classList.add('hidden');
    this.modalCard?.classList.remove('onboarding-card');
    this.modalBody.innerHTML = '';
    this.updateBadges();
  }

  async updateBadges() {
    const pendingScripts = await db.getPendingReviewScripts();
    const profile = await db.getProfile();
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
      if (profile.enableTrialReelWorkflow === false || r.status !== 'posted' || r.feedback_logged) return false;
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
