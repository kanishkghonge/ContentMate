/** Doctor profile, workflow settings, data controls, and gated developer tools. */

import { db } from '../db.js';
import { recalculateFutureSchedule } from '../scheduler.js';
import { populateSampleDoctorWorkspace } from '../sampleData.js';
import { showToast, escapeHtml, getTimeShiftDays, setTimeShiftDays, getDevToolsEnabled, setDevToolsEnabled } from '../utils.js';
import { getDefaultWritingInstructions } from '../prompt.js';

const DEV_ACCESS_KEYS = new Set(['kg-01', 'sm-01', 'tj-01']);

function cardHead(icon, title, description) {
  return `<div class="settings-card-head"><div class="settings-card-icon" aria-hidden="true">${icon}</div><div><h3 class="settings-card-title">${title}</h3><p class="settings-card-description">${description}</p></div></div>`;
}

export const SettingsView = {
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
              <div class="form-group"><label class="form-label" for="prof-top-scripts">Include context from best performing scripts</label><select id="prof-top-scripts" class="form-select"><option value="none" ${!profile.topScriptsContext || profile.topScriptsContext === 'none' ? 'selected' : ''}>None - Don't include examples</option><option value="3" ${profile.topScriptsContext === '3' ? 'selected' : ''}>Top 3 performing scripts</option><option value="5" ${profile.topScriptsContext === '5' ? 'selected' : ''}>Top 5 performing scripts</option><option value="10" ${profile.topScriptsContext === '10' ? 'selected' : ''}>Top 10 performing scripts</option></select><p class="settings-helper" style="margin-top:3px;">AI will use your best scripts as style references when generating new prompts (requires logged feedback).</p></div>
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
            <div class="settings-choice" style="margin-top:16px;"><input type="checkbox" id="setting-enable-trial-reels" ${profile.enableTrialReelWorkflow !== false ? 'checked' : ''}><div><label for="setting-enable-trial-reels">Enable trial reels and performance evaluation</label><p>Test accepted scripts as trial reels, then request a 3-day performance check and main-reel decision. Turn this off for a simpler publishing workflow.</p></div></div>
            <div class="settings-choice" style="margin-top:16px;"><input type="checkbox" id="setting-enable-mirrored-trials" ${profile.enableMirroredTrialWorkflow === true ? 'checked' : ''}><div><label for="setting-enable-mirrored-trials">Create mirrored trial reels</label><p>Also schedule an editable second version of each trial. Versions are sprinkled apart so one script can become a trial, mirrored trial, and (if it wins) a main reel.</p></div></div>
            <div class="form-group" style="margin-top:16px; margin-bottom:0;"><label class="form-label" for="setting-missed-post-mode">When a post is missed</label><select id="setting-missed-post-mode" class="form-select"><option value="manual" ${(profile.missedPostRescheduleMode || 'manual') === 'manual' ? 'selected' : ''}>Ask me first</option><option value="auto" ${profile.missedPostRescheduleMode === 'auto' ? 'selected' : ''}>Automatically reschedule</option></select><p class="settings-helper">Automatic mode moves only missed posts and leaves filmed reels in place.</p></div><div class="settings-card-actions"><button class="btn btn-secondary btn-sm" id="btn-replay-tutorial">Replay guided tutorial</button></div>
          </section>

          <section class="card settings-card">${cardHead('↥', 'Backup & restore', 'Your workspace stays in this browser. Save a JSON backup before changing devices or resetting data.')}<div class="settings-card-actions"><button class="btn btn-secondary btn-sm" id="btn-export-json">Export backup</button><button class="btn btn-secondary btn-sm" id="btn-import-json-trigger">Restore backup</button><input type="file" id="input-file-backup" accept=".json,application/json" class="hidden"></div></section>

          <section class="card settings-card settings-support-card">
            ${cardHead('📞', 'Call/Text the Founder', 'Need to shout at the person who made this stupid app? Or want to thank them for helping you script your reels? I\'m all ears, any feature request feedback is welcome.')}
            <p class="settings-helper" style="margin-top:12px;">Call, text, or WhatsApp me:</p>
            <a href="https://wa.me/852183292" target="_blank" rel="noopener noreferrer" class="support-contact-btn" id="btn-support-whatsapp" aria-label="WhatsApp founder at 852183292">
              <span class="support-contact-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.18-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.22-3.48-8.52zM12 21.94a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.67.96.98-3.57-.24-.37A9.9 9.9 0 0 1 2.06 12C2.06 6.49 6.49 2.06 12 2.06c2.67 0 5.18 1.04 7.07 2.93A9.94 9.94 0 0 1 21.94 12c0 5.51-4.43 9.94-9.94 9.94zm5.44-7.44c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07a8.17 8.17 0 0 1-2.4-1.48 9.01 9.01 0 0 1-1.66-2.07c-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.19-.57-.34z" fill="currentColor"/>
                </svg>
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
      await saveProfile({ name: document.getElementById('prof-name').value.trim(), specialty: document.getElementById('prof-specialty').value.trim(), audience: document.getElementById('prof-audience').value, language: document.getElementById('prof-lang').value, tone: document.getElementById('prof-tone').value, topScriptsContext: document.getElementById('prof-top-scripts').value, clinicName: document.getElementById('prof-clinic').value.trim(), onboarded: true }, 'Doctor profile saved.');
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
    document.getElementById('setting-enable-trial-reels')?.addEventListener('change', (event) => saveProfile({ enableTrialReelWorkflow: event.target.checked }, event.target.checked ? 'Trial reels and performance evaluation enabled.' : 'Simple publishing workflow enabled.'));
    document.getElementById('setting-enable-mirrored-trials')?.addEventListener('change', async (event) => { await saveProfile({ enableMirroredTrialWorkflow: event.target.checked }, event.target.checked ? 'Mirrored trial reels enabled.' : 'Mirrored trial reels disabled.'); if (event.target.checked) { await recalculateFutureSchedule(); } });
    document.getElementById('setting-missed-post-mode')?.addEventListener('change', (event) => saveProfile({ missedPostRescheduleMode: event.target.value }, 'Missed-post preference saved.'));
    document.getElementById('btn-replay-tutorial')?.addEventListener('click', () => window.dispatchEvent(new Event('contentmate-replay-tutorial')));

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
