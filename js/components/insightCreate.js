/**
 * Content OS for Doctors — Insight Capture & Custom Prompt Generator Modal
 */

import { db } from '../db.js';
import { buildDoctorPrompt } from '../prompt.js';
import { uuidv4, copyToClipboard, showToast, escapeHtml } from '../utils.js';

export const InsightCreateModal = {
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
            <label class="form-label" for="insight-references">Optional References / Real Patient Context</label>
            <input 
              type="text" 
              id="insight-references" 
              class="form-input" 
              placeholder="e.g. 42-year-old marathon runner case study or JACC 2024 review" 
            />
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
      const profile = await db.getProfile();
      const promptText = buildDoctorPrompt(profile, newInsight);

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
