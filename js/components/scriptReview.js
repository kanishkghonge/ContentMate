/**
 * Content OS for Doctors — Flashcard Script Review Deck
 * 1 card at a time. Zero spreadsheets. Accept, in-place Edit, Reject, Review Later.
 */

import { db } from '../db.js';
import { getFormatById } from '../formats.js';
import { scheduleAcceptedScript } from '../scheduler.js';
import { showToast, escapeHtml } from '../utils.js';

export const ScriptReviewView = {
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
