/**
 * Content OS for Doctors — Doctor Profile & System Settings
 * Customizes prompt engine rules, sprinkle scheduling parameters, workflow toggles, and time travel testing.
 */

import { db } from '../db.js';
import { recalculateFutureSchedule } from '../scheduler.js';
import { populateSampleDoctorWorkspace } from '../sampleData.js';
import { showToast, escapeHtml, getTimeShiftDays, setTimeShiftDays } from '../utils.js';

export const SettingsView = {
  async render(container, navigateTo, openModal) {
    const profile = await db.getProfile();
    const timeShift = getTimeShiftDays();

    let html = `
      <div class="action-deck">
        <div class="schedule-header">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">
              Doctor Profile & System Settings
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
              Customize prompt engine rules, 2-week sprinkle scheduling, and workflow preferences.
            </p>
          </div>
        </div>

        <form id="form-doctor-profile" class="card">
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">
            🧑‍⚕️ Doctor Profile & Prompt Persona
          </h3>

          <div class="form-group">
            <label class="form-label" for="prof-name">Doctor Name *</label>
            <input type="text" id="prof-name" class="form-input" value="${escapeHtml(profile.name || '')}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="prof-specialty">Medical Specialty *</label>
            <input type="text" id="prof-specialty" class="form-input" value="${escapeHtml(profile.specialty || '')}" required />
          </div>

          <div class="form-group">
            <label class="form-label">Target Audience *</label>
            <div class="segmented-control" id="ctrl-audience">
              <button type="button" class="segmented-btn ${profile.audience === 'Patients' ? 'active' : ''}" data-val="Patients">Patients</button>
              <button type="button" class="segmented-btn ${profile.audience === 'Doctors' ? 'active' : ''}" data-val="Doctors">Doctors</button>
              <button type="button" class="segmented-btn ${profile.audience === 'Both' ? 'active' : ''}" data-val="Both">Both</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Primary Language / Dialect *</label>
            <select id="prof-lang" class="form-select">
              <option value="English" ${profile.language === 'English' ? 'selected' : ''}>English (Natural & Clear)</option>
              <option value="Hinglish" ${profile.language === 'Hinglish' ? 'selected' : ''}>Hinglish (Hindi + English conversational)</option>
              <option value="Hindi" ${profile.language === 'Hindi' ? 'selected' : ''}>Hindi (Formal clinical Hindi)</option>
              <option value="Spanish" ${profile.language === 'Spanish' ? 'selected' : ''}>Spanish (Español)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Preferred Tone *</label>
            <select id="prof-tone" class="form-select">
              <option value="Conversational & Empathetic" ${profile.tone === 'Conversational & Empathetic' ? 'selected' : ''}>Conversational & Empathetic (Reassuring clinician)</option>
              <option value="Authoritative & Evidence-Based" ${profile.tone === 'Authoritative & Evidence-Based' ? 'selected' : ''}>Authoritative & Evidence-Based (Senior consultant)</option>
              <option value="Friendly & Approachable" ${profile.tone === 'Friendly & Approachable' ? 'selected' : ''}>Friendly & Approachable (Community health)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Default Call-To-Action (Fallback) *</label>
            <select id="prof-cta" class="form-select">
              <option value="both" ${profile.cta === 'both' ? 'selected' : ''}>Generate Both Versions (Read caption + Comment keyword)</option>
              <option value="Read caption for full medical details" ${profile.cta === 'Read caption for full medical details' ? 'selected' : ''}>Read Caption Only</option>
              <option value="Comment for guide" ${profile.cta === 'Comment for guide' ? 'selected' : ''}>Comment Keyword ("HEART", "TEST")</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="prof-clinic">Clinic / Hospital Name (Optional)</label>
            <input type="text" id="prof-clinic" class="form-input" value="${escapeHtml(profile.clinicName || '')}" placeholder="e.g. Heart & Vascular Institute" />
          </div>

          <div class="flex justify-between items-center" style="margin-top: 16px; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
            <button type="submit" class="btn btn-primary btn-lg">
              <span>Save Doctor Profile</span>
            </button>
          </div>
        </form>

        <div class="card" style="margin-top: 16px;">
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 4px; color: var(--text-primary);">
            AI Script Generation Prompt
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
            Add standing instructions for every generated prompt—for example, required disclaimers, a writing style, or formats to avoid. These are saved in your profile and included in backups.
          </p>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="setting-custom-prompt">Custom prompt instructions</label>
            <textarea id="setting-custom-prompt" class="form-textarea" rows="7" placeholder="e.g. Keep the language simple, use Indian clinical context, and always include a short safety note.">${escapeHtml(profile.customPromptInstructions || '')}</textarea>
          </div>
          <div style="margin-top: 12px;">
            <button class="btn btn-primary btn-sm" id="btn-save-custom-prompt">Save Prompt Instructions</button>
          </div>
        </div>

        <!-- Sprinkle Mechanics Customization Card -->
        <div class="card" style="margin-top: 16px;">
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 4px; color: var(--text-primary);">
            🗓️ Sprinkle & Scheduling Engine Settings
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
            Control how approved scripts are uniformly distributed over time. Approved scripts are spaced evenly across your window rather than clumping today.
          </p>

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

          <div class="form-group">
            <label class="form-label" for="setting-sprinkle-strategy">Distribution Strategy</label>
            <select id="setting-sprinkle-strategy" class="form-select">
              <option value="uniform" ${!profile.sprinkleStrategy || profile.sprinkleStrategy === 'uniform' ? 'selected' : ''}>Uniform Spacing (Equal gaps over 2 weeks)</option>
              <option value="front_loaded" ${profile.sprinkleStrategy === 'front_loaded' ? 'selected' : ''}>Front-Loaded (Fill upcoming slots sequentially)</option>
            </select>
          </div>

          <div class="flex gap-2 justify-between items-center" style="border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-top: 12px;">
            <button class="btn btn-secondary btn-sm" id="btn-resprinkle-now">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
              <span>Re-Sprinkle & Uniformly Space Schedule</span>
            </button>
            <button class="btn btn-primary btn-sm" id="btn-save-sprinkle-settings">Save Sprinkle Settings</button>
          </div>
        </div>

        <!-- Workflow Preferences Card (Filming workflow optional toggle) -->
        <div class="card" style="margin-top: 16px;">
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 4px; color: var(--text-primary);">
            🎬 Workflow Preferences
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
            Keep your workflow clean and un-overwhelming.
          </p>

          <div class="form-group" style="display: flex; align-items: center; gap: 10px; background: var(--bg-subtle); padding: 12px 14px; border-radius: var(--radius-md);">
            <input type="checkbox" id="setting-enable-filming" style="width: 18px; height: 18px; cursor: pointer;" ${profile.enableFilmingWorkflow ? 'checked' : ''} />
            <div>
              <label for="setting-enable-filming" style="font-size: 14px; font-weight: 600; cursor: pointer;">Enable Filming Status Workflow</label>
              <p style="font-size: 12px; color: var(--text-tertiary); margin-top: 2px;">
                Uncheck to hide "Mark Filmed" buttons and filming queues so you can go straight from script to posting.
              </p>
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

        <!-- Time Travel Testing Card -->
        <div class="card" style="margin-top: 16px; border-left: 4px solid var(--accent-purple);">
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 4px; color: var(--text-primary);">
            🧪 Testing Tool: Time Travel Fast-Forward (+3 Days)
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
            Artificially advance simulated system time into the future so you can test out the <strong>Feedback Due</strong> page and 3-day performance evaluation workflow immediately.
          </p>

          <div class="flex items-center gap-3" style="flex-wrap: wrap;">
            <button class="btn btn-accent btn-sm" id="btn-test-time-travel">
              <span>⏩ Fast-Forward +3 Days</span>
            </button>

            ${
              timeShift !== 0
                ? `<button class="btn btn-secondary btn-sm" id="btn-reset-time-travel">
                    <span>↺ Reset to Actual Today (+0)</span>
                  </button>`
                : ''
            }

            <span style="font-size: 12px; font-weight: 600; color: ${timeShift > 0 ? 'var(--accent-purple)' : 'var(--text-tertiary)'};">
              ${timeShift > 0 ? `📍 Active Shift: +${timeShift} days in future` : '📍 System Date: Actual Today'}
            </span>
          </div>
        </div>

        <!-- Backup & Demo Reset -->
        <div class="card" style="margin-top: 16px;">
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 6px;">
            Local-First Backup & Data Management
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
            All your data is stored locally in your browser. Export a zero-loss JSON backup at any time.
          </p>

          <div class="flex gap-2" style="flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-export-json">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Export Backup JSON</span>
            </button>

            <button class="btn btn-secondary btn-sm" id="btn-import-json-trigger">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Restore from JSON</span>
            </button>

            <input type="file" id="input-file-backup" accept=".json" class="hidden" />

            <button class="btn btn-secondary btn-sm" id="btn-load-demo-settings">
              <span>Load Cardiology Demo</span>
            </button>
          </div>
        </div>

        <!-- Danger Zone: Reset All Data -->
        <div class="card" style="margin-top: 16px; border: 1.5px dashed var(--accent-red); background: var(--accent-red-subtle);">
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--accent-red); margin-bottom: 4px;">
            ⚠️ Reset All Data & Start Fresh
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
            Permanently delete all insights, quick notes, generated scripts, and scheduled reels.
          </p>

          <button class="btn btn-danger btn-lg" id="btn-reset-all-data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Delete All Data & Reset Workspace</span>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Segmented Audience Control
    let selectedAudience = profile.audience || 'Patients';
    container.querySelectorAll('#ctrl-audience .segmented-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('#ctrl-audience .segmented-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAudience = btn.dataset.val;
      });
    });

    // Save Profile
    document.getElementById('form-doctor-profile')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updated = {
        ...profile,
        name: document.getElementById('prof-name').value.trim(),
        specialty: document.getElementById('prof-specialty').value.trim(),
        audience: selectedAudience,
        language: document.getElementById('prof-lang').value,
        tone: document.getElementById('prof-tone').value,
        cta: document.getElementById('prof-cta').value,
        clinicName: document.getElementById('prof-clinic').value.trim(),
        onboarded: true
      };

      await db.saveProfile(updated);
      showToast('Doctor Profile updated successfully!', 'success');
      
      const sideName = document.getElementById('sidebar-dr-name');
      if (sideName) sideName.textContent = updated.name;
    });

    // Save Sprinkle Settings
    document.getElementById('btn-save-sprinkle-settings')?.addEventListener('click', async () => {
      const windowDays = parseInt(document.getElementById('setting-sprinkle-window').value, 10);
      const maxPosts = parseInt(document.getElementById('setting-max-posts').value, 10);
      const strategy = document.getElementById('setting-sprinkle-strategy').value;

      const updated = {
        ...profile,
        sprinkleWindowDays: windowDays,
        maxPostsPerDay: maxPosts,
        sprinkleStrategy: strategy
      };

      await db.saveProfile(updated);
      await recalculateFutureSchedule();
      showToast('Sprinkle settings saved & schedule re-spaced!', 'success');
    });

    document.getElementById('btn-save-custom-prompt')?.addEventListener('click', async () => {
      const customPromptInstructions = document.getElementById('setting-custom-prompt').value.trim();
      await db.saveProfile({ ...profile, customPromptInstructions });
      showToast('Prompt instructions saved and will be included in backups.', 'success');
    });

    // Re-Sprinkle Now Button
    document.getElementById('btn-resprinkle-now')?.addEventListener('click', async () => {
      // Save visible settings before recalculating so this action never uses
      // stale profile values.
      const updatedProfile = {
        ...profile,
        sprinkleWindowDays: parseInt(document.getElementById('setting-sprinkle-window').value, 10),
        maxPostsPerDay: parseInt(document.getElementById('setting-max-posts').value, 10),
        sprinkleStrategy: document.getElementById('setting-sprinkle-strategy').value
      };
      await db.saveProfile(updatedProfile);
      const res = await recalculateFutureSchedule();
      showToast(`Uniformly re-sprinkled ${res.updatedCount} future reels across ${updatedProfile.sprinkleWindowDays || 14} days!`, 'success');
    });

    // Toggle Filming Workflow Checkbox
    document.getElementById('setting-enable-filming')?.addEventListener('change', async (e) => {
      const enabled = e.target.checked;
      const updated = {
        ...profile,
        enableFilmingWorkflow: enabled
      };
      await db.saveProfile(updated);
      showToast(enabled ? 'Filming status workflow enabled' : 'Filming workflow disabled (simplified mode)', 'info');
    });

    document.getElementById('setting-missed-post-mode')?.addEventListener('change', async (e) => {
      await db.saveProfile({ ...profile, missedPostRescheduleMode: e.target.value });
      showToast(e.target.value === 'auto' ? 'Missed posts will reschedule when you open Today.' : 'Missed posts will wait for your approval.', 'info');
    });

    // Time Travel +3 Days Button
    document.getElementById('btn-test-time-travel')?.addEventListener('click', async () => {
      const current = getTimeShiftDays();
      setTimeShiftDays(current + 3);
      showToast(`System time fast-forwarded +3 days! Check Feedback Due page.`, 'success');
      window.location.reload();
    });

    // Reset Time Travel Button
    document.getElementById('btn-reset-time-travel')?.addEventListener('click', async () => {
      setTimeShiftDays(0);
      showToast(`System time reset to actual today!`, 'info');
      window.location.reload();
    });

    // Export JSON Backup
    document.getElementById('btn-export-json')?.addEventListener('click', async () => {
      const backup = await db.exportFullDatabase();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doctor-content-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup JSON downloaded!', 'success');
    });

    // Trigger file input
    document.getElementById('btn-import-json-trigger')?.addEventListener('click', () => {
      document.getElementById('input-file-backup')?.click();
    });

    // Handle JSON file restore
    document.getElementById('input-file-backup')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        await db.importFullDatabase(parsed);
        showToast('Workspace restored from JSON!', 'success');
        navigateTo('dashboard');
      } catch (err) {
        showToast(`Restore failed: ${err.message}`, 'error');
      }
    });

    // Load Demo Data
    document.getElementById('btn-load-demo-settings')?.addEventListener('click', async () => {
      await populateSampleDoctorWorkspace();
      showToast('Demo workspace loaded!', 'success');
      navigateTo('dashboard');
    });

    // Reset All Data
    document.getElementById('btn-reset-all-data')?.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete ALL data (insights, notes, scripts, scheduled reels) and reset your workspace?')) {
        await db.resetAllData();
        showToast('All workspace data deleted!', 'info');
        window.location.reload();
      }
    });
  }
};
