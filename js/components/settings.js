/** Doctor profile, workflow settings, data controls, and gated developer tools. */

import { db } from '../db.js';
import { recalculateFutureSchedule } from '../scheduler.js';
import { populateSampleDoctorWorkspace } from '../sampleData.js';
import { showToast, escapeHtml, copyToClipboard, getTimeShiftDays, setTimeShiftDays, getDevToolsEnabled, setDevToolsEnabled } from '../utils.js';
import { getDefaultPromptTemplate } from '../prompt.js';

const DEV_ACCESS_KEYS = new Set(['kg-01', 'sm-01', 'tj-01']);

function cardHead(icon, title, description) {
  return `<div class="settings-card-head"><div class="settings-card-icon" aria-hidden="true">${icon}</div><div><h3 class="settings-card-title">${title}</h3><p class="settings-card-description">${description}</p></div></div>`;
}

export const SettingsView = {
  async render(container, navigateTo) {
    const profile = await db.getProfile();
    const timeShift = getTimeShiftDays();
    const devToolsEnabled = getDevToolsEnabled();
    const activePrompt = profile.promptTemplate || getDefaultPromptTemplate();

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
              <div class="form-group"><label class="form-label" for="prof-lang">Primary language / dialect</label><select id="prof-lang" class="form-select"><option value="English" ${profile.language === 'English' ? 'selected' : ''}>English</option><option value="Hinglish" ${profile.language === 'Hinglish' ? 'selected' : ''}>Hinglish</option><option value="Hindi" ${profile.language === 'Hindi' ? 'selected' : ''}>Hindi</option><option value="Spanish" ${profile.language === 'Spanish' ? 'selected' : ''}>Spanish</option></select></div>
              <div class="form-group"><label class="form-label" for="prof-tone">Preferred tone</label><select id="prof-tone" class="form-select"><option value="Conversational & Empathetic" ${profile.tone === 'Conversational & Empathetic' ? 'selected' : ''}>Conversational & empathetic</option><option value="Authoritative & Evidence-Based" ${profile.tone === 'Authoritative & Evidence-Based' ? 'selected' : ''}>Authoritative & evidence-based</option><option value="Friendly & Approachable" ${profile.tone === 'Friendly & Approachable' ? 'selected' : ''}>Friendly & approachable</option></select></div>
              <div class="form-group full-width"><label class="form-label" for="prof-clinic">Clinic / hospital name <span class="form-sublabel">optional</span></label><input type="text" id="prof-clinic" class="form-input" value="${escapeHtml(profile.clinicName || '')}" placeholder="e.g. Heart & Vascular Institute"></div>
            </div><div class="settings-card-actions"><button type="submit" class="btn btn-primary">Save profile</button></div>
          </form>

          <section class="card settings-card settings-card-wide">
            ${cardHead('✦', 'AI script prompt', 'Edit the complete prompt used to generate every new insight.')}
            <div class="prompt-safe-guide"><strong>Please keep the format the same—do not break it, otherwise scripts will not work well.</strong><p>It is better to give this prompt to an AI to make edits, so it does not accidentally change the structure or the JSON output format.</p></div>
            <label class="form-label" for="setting-active-prompt">Working prompt</label><p class="settings-helper" style="margin-bottom:8px;">Text inside {{double braces}} is automatically filled with the doctor and insight details when you generate a prompt.</p>
            <textarea id="setting-active-prompt" class="form-textarea prompt-preview" rows="22">${escapeHtml(activePrompt)}</textarea>
            <div class="settings-card-actions"><button class="btn btn-primary btn-sm" id="btn-save-active-prompt">Save prompt</button><button class="btn btn-secondary btn-sm" id="btn-copy-active-prompt">Copy whole prompt</button><button class="btn btn-secondary btn-sm" id="btn-restore-original-prompt">Restore original prompt</button></div>
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
    document.getElementById('btn-save-active-prompt')?.addEventListener('click', async () => {
      const promptTemplate = document.getElementById('setting-active-prompt').value.trim();
      if (!promptTemplate) { showToast('Prompt cannot be empty.', 'error'); return; }
      await saveProfile({ promptTemplate }, 'Working prompt saved.');
    });
    document.getElementById('btn-copy-active-prompt')?.addEventListener('click', async () => {
      const promptTemplate = document.getElementById('setting-active-prompt').value;
      if (!promptTemplate.trim()) { showToast('Prompt cannot be empty.', 'error'); return; }
      await copyToClipboard(promptTemplate);
    });
    document.getElementById('btn-restore-original-prompt')?.addEventListener('click', async () => {
      if (!confirm('Restore the original working prompt? Your saved edits will be replaced.')) return;
      delete profile.promptTemplate;
      await db.saveProfile(profile);
      document.getElementById('setting-active-prompt').value = getDefaultPromptTemplate();
      showToast('Original prompt restored.', 'success');
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
