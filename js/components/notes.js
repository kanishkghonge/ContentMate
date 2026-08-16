/**
 * Content OS for Doctors — Quick Notes System
 * Instant, lightweight thoughts with 1-tap conversion to full clinical Insights.
 */

import { db } from '../db.js';
import { uuidv4, formatRelativeDate, showToast, escapeHtml } from '../utils.js';

export const NotesView = {
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
