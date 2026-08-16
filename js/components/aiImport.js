/**
 * Content OS for Doctors — AI JSON Importer Modal
 * Paste AI response, validate schema, and auto-link scripts to parent Insight.
 */

import { db } from '../db.js';
import { parseAndValidateAIResponse } from '../importer.js';
import { showToast } from '../utils.js';

export const AIImportModal = {
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
