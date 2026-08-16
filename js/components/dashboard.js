/**
 * Content OS for Doctors — Home Dashboard (The Doctor's Daily Action Center)
 * Zero analytics clutter. Shows only what requires immediate action today.
 */

import { db } from '../db.js';
import { formatDate, formatRelativeDate, formatDateForInput, showToast, getSystemDate } from '../utils.js';
import { rescheduleMissedPosts } from '../scheduler.js';

export const DashboardView = {
  async render(container, navigateTo, openModal) {
    const profile = await db.getProfile();
    const systemDate = getSystemDate();
    const todayStr = formatDateForInput(systemDate);
    const enableFilming = profile.enableFilmingWorkflow === true;

    // 1. Gather actionable items
    const allReels = await db.getScheduledReels();
    const pendingScripts = await db.getPendingReviewScripts();
    const allNotes = await db.getNotes();

    // A. Posts Scheduled for Today
    const todayPosts = allReels.filter(
      (r) => r.scheduled_date === todayStr && r.status !== 'posted' && r.status !== 'archived'
    );

    // B. Trial Reels Not Yet Shot (Filming queue - shown only if filming workflow is enabled)
    const filmingQueue = enableFilming
      ? allReels.filter((r) => r.status === 'scheduled' && !r.is_filmed).slice(0, 3)
      : [];

    // C. Posts That Were Missed (scheduled < today and unposted)
    // Anything scheduled in the past but not published must be surfaced—even
    // if it has been filmed—so it cannot quietly disappear from the workflow.
    const missedPosts = allReels.filter(
      (r) => r.scheduled_date < todayStr && r.status !== 'posted' && r.status !== 'archived' && r.status !== 'winner'
    );

    // D. Feedback Due (posted >= 3 days ago and no metrics logged yet)
    const feedbackDuePosts = allReels.filter((r) => {
      if (r.status !== 'posted' || r.is_main_reel_winner || r.feedback_logged) return false;
      const postDate = new Date(r.posted_date || r.scheduled_date);
      const diffDays = Math.floor((systemDate - postDate) / (1000 * 60 * 60 * 24));
      return diffDays >= 3;
    });

    // E. Promoted Main Reels awaiting scheduling
    const pendingMainReels = allReels.filter(
      (r) => r.is_main_reel && r.status === 'scheduled'
    );

    const activeNotes = allNotes.filter((n) => !n.is_archived).slice(0, 2);

    let html = `
      <div class="action-deck">
        
        <!-- Hero Doctor Greeting & Primary Capture Actions -->
        <div class="card card-hero">
          <h2>Good day, ${profile.name || 'Doctor'}</h2>
          <p>You have <strong>${todayPosts.length}</strong> post scheduled today, <strong>${pendingScripts.length}</strong> scripts waiting for review, and <strong>${feedbackDuePosts.length}</strong> performance checks due.</p>
          
          <div class="flex gap-3" style="flex-wrap: wrap;">
            <button class="btn btn-accent btn-lg" id="dash-hero-record-insight">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Record a New Insight</span>
            </button>

            <button class="btn btn-secondary btn-lg" id="dash-hero-quick-note" style="background: rgba(255,255,255,0.15); color: #FFF; border-color: rgba(255,255,255,0.2);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Quick Thought / Note</span>
            </button>
          </div>
        </div>
    `;

    // 1. Posts Scheduled for Today Card
    if (todayPosts.length > 0) {
      html += `
        <div class="action-card" style="border-left: 4px solid var(--accent-blue);">
          <div class="action-card-header">
            <span class="action-card-badge badge-blue">⚡ Scheduled For Today</span>
            <span style="font-size: 12px; color: var(--text-tertiary);">${formatDate(todayStr)}</span>
          </div>
          <h3 class="action-card-title">${todayPosts.length === 1 ? '1 Post to Publish Today' : `${todayPosts.length} Posts to Publish Today`}</h3>
          <p class="action-card-desc">Review your hook and mark as posted once published to social media.</p>

          <div class="today-item-list">
            ${todayPosts.map((post) => `
              <div class="today-item">
                <div class="today-item-info">
                  <div class="today-item-title">${post.is_main_reel ? '⭐ ' : ''}${post.title}</div>
                  <div class="today-item-meta">
                    <span>${post.format}</span>
                    <span>•</span>
                    <span>${post.estimated_duration}</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  ${
                    enableFilming
                      ? `<button class="btn btn-sm btn-secondary btn-mark-filmed" data-id="${post.id}">
                          ${post.status === 'filmed' ? '✓ Filmed' : 'Mark Filmed'}
                        </button>`
                      : ''
                  }
                  <button class="btn btn-sm btn-primary btn-mark-posted" data-id="${post.id}">
                    Mark as Posted
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2. Scripts Waiting for Review Card (Flashcard swiper trigger)
    if (pendingScripts.length > 0) {
      html += `
        <div class="action-card" style="border-left: 4px solid var(--accent-amber);">
          <div class="action-card-header">
            <span class="action-card-badge badge-amber">🃏 Review Queue</span>
            <span style="font-size: 12px; font-weight: 600; color: var(--accent-amber);">${pendingScripts.length} Pending</span>
          </div>
          <h3 class="action-card-title">Scripts Waiting for Review</h3>
          <p class="action-card-desc">Swipe through scripts one card at a time. Accept, edit inline, or reject in under 30 seconds.</p>
          <div class="action-card-footer">
            <span style="font-size: 12.5px; color: var(--text-secondary);">Cards ready from recent AI imports</span>
            <button class="btn btn-primary btn-sm" id="dash-btn-start-review">
              <span>Start Review (${pendingScripts.length} left) →</span>
            </button>
          </div>
        </div>
      `;
    }

    // 3. Feedback Due Card (3-day post evaluation)
    if (feedbackDuePosts.length > 0) {
      html += `
        <div class="action-card" style="border-left: 4px solid var(--accent-purple);">
          <div class="action-card-header">
            <span class="action-card-badge badge-purple">📊 3-Day Performance Check</span>
            <span style="font-size: 12px; color: var(--accent-purple); font-weight: 600;">${feedbackDuePosts.length} Due</span>
          </div>
          <h3 class="action-card-title">Trial Reel Feedback Due</h3>
          <p class="action-card-desc">It's been 3 days since you posted. Enter your basic engagement to decide if this should become a permanent Main Reel.</p>

          <div class="today-item-list">
            ${feedbackDuePosts.map((post) => `
              <div class="today-item">
                <div class="today-item-info">
                  <div class="today-item-title">${post.title}</div>
                  <div class="today-item-meta">
                    <span>Posted ${formatRelativeDate(post.posted_date || post.scheduled_date)}</span>
                    <span>•</span>
                    <span>${post.format}</span>
                  </div>
                </div>
                <button class="btn btn-sm btn-primary btn-log-feedback" data-id="${post.id}">
                  Log Feedback & Decide
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 4. Posts That Were Missed Card (Auto Reshuffle trigger)
    if (missedPosts.length > 0) {
      html += `
        <div class="action-card" style="border-left: 4px solid var(--accent-red);">
          <div class="action-card-header">
            <span class="action-card-badge badge-red">⚠️ Past Due</span>
            <span style="font-size: 12px; color: var(--accent-red); font-weight: 600;">${missedPosts.length} Missed</span>
          </div>
          <h3 class="action-card-title">Posts That Were Missed</h3>
          <p class="action-card-desc">Life in clinic gets busy. Reschedule these into open upcoming slots, or skip any post you no longer want to publish.</p>
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
            <button class="btn btn-danger btn-sm" id="dash-btn-auto-reshuffle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
              <span>Auto-Sprinkle All</span>
            </button>
          </div>
        </div>
      `;
    }

    // 5. Trial Reels Not Yet Shot (Filming Queue)
    if (filmingQueue.length > 0) {
      html += `
        <div class="action-card">
          <div class="action-card-header">
            <span class="action-card-badge badge-gray">🎥 Filming Queue</span>
            <span style="font-size: 12px; color: var(--text-tertiary);">Next Up</span>
          </div>
          <h3 class="action-card-title">Trial Reels Not Yet Shot</h3>
          <p class="action-card-desc">Ready to record between patient consultations? Keep these 45-second scripts handy.</p>

          <div class="today-item-list">
            ${filmingQueue.map((post) => `
              <div class="today-item">
                <div class="today-item-info">
                  <div class="today-item-title">${post.is_main_reel ? '⭐ ' : ''}${post.title}</div>
                  <div class="today-item-meta">
                    <span>${post.format}</span>
                    <span>•</span>
                    <span>Due ${formatDate(post.scheduled_date)}</span>
                  </div>
                </div>
                <button class="btn btn-sm btn-secondary btn-mark-filmed" data-id="${post.id}">
                  Mark Shot
                </button>
                <button class="btn btn-sm btn-ghost btn-copy-script" data-id="${post.id}">
                  Copy Script
                </button>
              </div>
            `).join('')}
          </div>
          <div class="action-card-footer">
            <span style="font-size: 12.5px; color: var(--text-secondary);">Auto-balanced across formats</span>
            <button class="btn btn-ghost btn-sm" id="dash-btn-view-schedule">View Full Calendar →</button>
          </div>
        </div>
      `;
    }

    // 6. Quick Notes Drawer Preview (if any)
    if (activeNotes.length > 0) {
      html += `
        <div class="action-card">
          <div class="action-card-header">
            <span class="action-card-badge badge-gray">💡 Recent Thoughts</span>
            <button class="btn btn-ghost btn-sm" id="dash-btn-view-notes">All Notes →</button>
          </div>
          <div class="today-item-list" style="margin-bottom: 0;">
            ${activeNotes.map((note) => `
              <div class="today-item">
                <div class="today-item-info">
                  <div class="today-item-title" style="font-weight: 500;">"${note.text}"</div>
                  <div class="today-item-meta">${formatRelativeDate(note.created_at)}</div>
                </div>
                <button class="btn btn-sm btn-secondary btn-convert-note" data-id="${note.id}">
                  Convert to Insight
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Zen state if all caught up
    if (todayPosts.length === 0 && pendingScripts.length === 0 && feedbackDuePosts.length === 0 && missedPosts.length === 0) {
      html += `
        <div class="action-card text-center" style="padding: 32px 20px; align-items: center;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--accent-green-subtle); color: var(--accent-green); display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary);">All Caught Up for Today!</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 380px; margin-top: 4px;">
            Your calendar is naturally balanced. Have a new clinical thought from your clinic rounds? Tap below.
          </p>
          <button class="btn btn-primary btn-sm" id="dash-zen-record-insight" style="margin-top: 16px;">
            Record a New Insight
          </button>
        </div>
      `;
    }

    html += `</div>`; // end action-deck
    container.innerHTML = html;

    // Attach Event Listeners
    document.getElementById('dash-hero-record-insight')?.addEventListener('click', () => openModal('insightCreate'));
    document.getElementById('dash-zen-record-insight')?.addEventListener('click', () => openModal('insightCreate'));
    document.getElementById('dash-hero-quick-note')?.addEventListener('click', () => openModal('quickNote'));
    document.getElementById('dash-btn-start-review')?.addEventListener('click', () => navigateTo('review'));
    document.getElementById('dash-btn-view-schedule')?.addEventListener('click', () => navigateTo('schedule'));
    document.getElementById('dash-btn-view-notes')?.addEventListener('click', () => navigateTo('notes'));

    // Auto Reshuffle button
    document.getElementById('dash-btn-auto-reshuffle')?.addEventListener('click', async () => {
      const result = await rescheduleMissedPosts();
      showToast(
        result.rescheduledCount > 0
          ? `${result.rescheduledCount} missed post${result.rescheduledCount === 1 ? '' : 's'} rescheduled.`
          : 'No missed posts could be rescheduled.',
        result.rescheduledCount > 0 ? 'success' : 'info'
      );
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
        const dateInput = container.querySelector(`.missed-date-input[data-id="${id}"]`);
        const newDate = dateInput?.value;
        if (!newDate || newDate < todayStr) {
          showToast('Choose today or a future date.', 'error');
          return;
        }
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
        if (!reel?.script) {
          showToast('There is no script to copy for this post.', 'info');
          return;
        }
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

    // Mark Filmed buttons
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

    // Mark Posted buttons
    container.querySelectorAll('.btn-mark-posted').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const reel = await db.getScheduledReel(id);
        if (reel) {
          reel.status = 'posted';
          reel.posted_date = formatDateForInput(new Date());
          await db.saveScheduledReel(reel);
          showToast('Marked as Posted! 3-day feedback timer started.', 'success');
          DashboardView.render(container, navigateTo, openModal);
        }
      });
    });

    // Log Feedback buttons
    container.querySelectorAll('.btn-log-feedback').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openModal('trialFeedback', { reelId: id });
      });
    });

    // Convert Note buttons
    container.querySelectorAll('.btn-convert-note').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const notes = await db.getNotes();
        const note = notes.find((n) => n.id === id);
        if (note) {
          openModal('insightCreate', { prefillTitle: note.text, noteId: note.id });
        }
      });
    });
  }
};
