/**
 * Content OS for Doctors — Main Application Coordinator & Router
 * Orchestrates local-first database, mobile bottom-nav, modal sheets, and views.
 */

import { db } from './db.js';
import { populateSampleDoctorWorkspace } from './sampleData.js';
import { DashboardView } from './components/dashboard.js';
import { NotesView } from './components/notes.js';
import { InsightCreateModal } from './components/insightCreate.js';
import { AIImportModal } from './components/aiImport.js';
import { ScriptReviewView } from './components/scriptReview.js';
import { ScheduleView } from './components/scheduleView.js';
import { TrialFeedbackModal } from './components/trialFeedback.js';
import { FeedbackView } from './components/feedbackView.js';
import { LibraryView } from './components/library.js';
import { SettingsView } from './components/settings.js';
import { rescheduleMissedPosts } from './scheduler.js';
import { formatDate, getSystemDate, showToast, getTimeShiftDays, setTimeShiftDays } from './utils.js';

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
    // 1. Check if database is initialized; if clean, load sample cardiologist data
    const profile = await db.getProfile();
    if (!profile || !profile.onboarded) {
      await populateSampleDoctorWorkspace();
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

    // 4. Setup Modal listeners
    this.setupModals();

    // 5. Initial View Load
    const hash = window.location.hash.replace(/^#/, '');
    this.navigateTo(hash || 'dashboard');

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

    // Header Quick Actions
    document.getElementById('header-btn-timetravel')?.addEventListener('click', async () => {
      const current = getTimeShiftDays();
      setTimeShiftDays(current + 3);
      const profile = await db.getProfile();
      if (profile.missedPostRescheduleMode === 'auto') await rescheduleMissedPosts();
      showToast('Fast-forwarded +3 days in system date! Check Feedback Due.', 'success');
      if (this.headerDate) {
        this.headerDate.textContent = formatDate(getSystemDate());
      }
      this.navigateTo(this.currentView);
      this.updateBadges();
    });

    document.getElementById('header-btn-note')?.addEventListener('click', () => {
      this.openModal('quickNote');
    });

    document.getElementById('header-btn-insight')?.addEventListener('click', () => {
      this.openModal('insightCreate');
    });

    // Sidebar Load Demo
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
    if (badgeFeedD) {
      badgeFeedD.textContent = feedbackDueCount;
      badgeFeedD.classList.toggle('hidden', feedbackDueCount === 0);
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
