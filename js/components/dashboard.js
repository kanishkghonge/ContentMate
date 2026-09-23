/**
 * Content OS for Doctors — Home Dashboard (The Doctor's Daily Action Center)
 * Zero analytics clutter. Shows only what requires immediate action today.
 */

import { db } from '../db.js';
import { formatDate, formatRelativeDate, formatDateForInput, showToast, getSystemDate } from '../utils.js';
import { rescheduleMissedPosts } from '../scheduler.js';

const greetingBank = {
  morning: [
    'Good morning, Dr. {{name}}. Let\'s set a calm, focused pace for the day.',
    'Good morning, Dr. {{name}}. Your content plan is ready when you are.',
    'Good morning, Dr. {{name}}. A clear start makes today\'s work lighter.',
    'Good morning, Dr. {{name}}. Let\'s turn today\'s expertise into useful content.',
    'Good morning, Dr. {{name}}. Your next helpful post starts here.'
  ],
  afternoon: [
    'Good afternoon, Dr. {{name}}. Let\'s make a little progress between appointments.',
    'Good afternoon, Dr. {{name}}. Your content workspace is ready for the next step.',
    'Good afternoon, Dr. {{name}}. A few focused minutes can move the plan forward.',
    'Good afternoon, Dr. {{name}}. Let\'s keep today\'s content moving.',
    'Good afternoon, Dr. {{name}}. Pick up exactly where you left off.'
  ],
  evening: [
    'Good evening, Dr. {{name}}. Let\'s make today\'s final content decisions easy.',
    'Good evening, Dr. {{name}}. A quick review now keeps tomorrow clear.',
    'Good evening, Dr. {{name}}. Your day\'s content priorities are right here.',
    'Good evening, Dr. {{name}}. Let\'s wrap up today with one useful step.',
    'Good evening, Dr. {{name}}. Your plan is ready whenever clinic slows down.'
  ],
  night: [
    'Good night, Dr. {{name}}. Take one last look at tomorrow\'s content plan.',
    'Good night, Dr. {{name}}. A small step now can make tomorrow smoother.',
    'Good night, Dr. {{name}}. Your workspace has tomorrow\'s priorities waiting.',
    'Good night, Dr. {{name}}. Close the day with a clear content plan.',
    'Good night, Dr. {{name}}. Everything important for tomorrow is in one place.'
  ]
};

function getDashboardGreeting(date, name) {
  const hour = date.getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 22 ? 'evening' : 'night';
  const messages = greetingBank[timeOfDay];
  const greeting = messages[(date.getDate() + date.getMonth() * 3 + hour) % messages.length];
  return greeting.replace('{{name}}', name || 'Doctor');
}

function scriptViewerButton(reelId) {
  return `<button class="btn btn-sm btn-secondary btn-view-script" data-id="${reelId}">View Script</button>`;
}

function helpButton(text) {
  return `<button class="btn btn-ghost btn-sm dash-help" data-help="${text}" aria-label="What is this?">?</button>`;
}

export const DashboardView = {
  async render(container, navigateTo, openModal) {
    const profile = await db.getProfile();
    const systemDate = getSystemDate();
    const todayStr = formatDateForInput(systemDate);
    const enableFilming = profile.enableFilmingWorkflow === true;
    const enableTrialReels = profile.enableTrialReelWorkflow !== false;

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
    const filmingToday = enableFilming
      ? allReels.filter((r) => r.scheduled_date === todayStr && r.status !== 'posted' && r.status !== 'archived' && !r.is_filmed).length
      : 0;

    // C. Posts That Were Missed (scheduled < today and unposted)
    // Anything scheduled in the past but not published must be surfaced—even
    // if it has been filmed—so it cannot quietly disappear from the workflow.
    const missedPosts = allReels.filter(
      (r) => r.scheduled_date < todayStr && r.status !== 'posted' && r.status !== 'archived' && r.status !== 'winner'
    );

    // D. Promoted Main Reels awaiting scheduling
    const pendingMainReels = allReels.filter(
      (r) => r.is_main_reel && r.status === 'scheduled'
    );

    const activeNotes = allNotes.filter((n) => !n.is_archived).slice(0, 2);

    let html = `
      <div class="action-deck">
        
        <!-- Time-aware greeting and daily snapshot. Capture actions live in the header. -->
        <div class="card card-hero">
          <p class="dashboard-greeting-eyebrow">Today\'s workspace</p>
          <h2>${getDashboardGreeting(systemDate, profile.name)}</h2>
          <p>Here\'s what needs your attention today.</p>
          <div class="dashboard-daily-summary" aria-label="Today\'s content summary">
            <div class="dashboard-summary-item"><strong>${todayPosts.length}</strong><span>${todayPosts.length === 1 ? 'post scheduled' : 'posts scheduled'}</span></div>
            <div class="dashboard-summary-item"><strong>${pendingScripts.length}</strong><span>${pendingScripts.length === 1 ? 'script to review' : 'scripts to review'}</span></div>
            ${enableFilming ? `<div class="dashboard-summary-item"><strong>${filmingToday}</strong><span>${filmingToday === 1 ? 'post to film today' : 'posts to film today'}</span></div>` : ''}
          </div>
        </div>
    `;

    // 1. Posts Scheduled for Today Card
    if (todayPosts.length > 0) {
      html += `
        <div class="action-card" style="border-left: 4px solid var(--accent-blue);">
          <div class="action-card-header">
            <span class="action-card-badge badge-blue">⚡ Scheduled For Today</span>
            <div class="flex items-center gap-2"><span style="font-size: 12px; color: var(--text-tertiary);">${formatDate(todayStr)}</span>${helpButton('These are the posts planned for today. Open the script, publish it, then mark it posted so your calendar stays accurate.')}</div>
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
                  ${scriptViewerButton(post.id)}
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
            <div class="flex items-center gap-2"><span style="font-size: 12px; font-weight: 600; color: var(--accent-amber);">${pendingScripts.length} Pending</span>${helpButton('Review generated scripts here. Choose Trial when you want to compare variations later, or Main Reel when it is ready to publish directly.')}</div>
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

    // 3. Posts That Were Missed Card (Auto Reshuffle trigger)
    if (missedPosts.length > 0) {
      html += `
        <div class="action-card" style="border-left: 4px solid var(--accent-red);">
          <div class="action-card-header">
            <span class="action-card-badge badge-red">⚠️ Past Due</span>
            <div class="flex items-center gap-2"><span style="font-size: 12px; color: var(--accent-red); font-weight: 600;">${missedPosts.length} Missed</span>${helpButton('These scheduled posts were not marked as published. Pick a new date, mark one posted if it already went live, or skip it.')}</div>
          </div>
          <h3 class="action-card-title">Posts That Were Missed</h3>
          <p class="action-card-desc">Choose a new date, mark an already-published post, or skip a post you no longer want to publish.</p>
          <div class="today-item-list">
            ${missedPosts.map((post) => `
              <div class="today-item">
                <div class="today-item-info">
                  <div class="today-item-title">${post.title}</div>
                  <div class="today-item-meta">Was due ${formatDate(post.scheduled_date)}</div>
                </div>
                <div class="flex gap-2" style="flex-wrap: wrap; justify-content: flex-end;">
                  ${scriptViewerButton(post.id)}
                  <input class="form-input missed-date-input" data-id="${post.id}" type="date" min="${todayStr}" value="${todayStr}" aria-label="New post date" style="width: 142px; padding: 6px 8px; font-size: 12px;" />
                  <button class="btn btn-sm btn-primary btn-reschedule-missed-date" data-id="${post.id}">Reschedule</button>
                  <button class="btn btn-sm btn-secondary btn-mark-missed-posted" data-id="${post.id}">Posted Already</button>
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
            <div class="flex items-center gap-2"><span style="font-size: 12px; color: var(--text-tertiary);">Next Up</span>${helpButton('This is your upcoming recording list. Mark a reel filmed to protect its scheduled date from automatic reshuffles.')}</div>
          </div>
          <h3 class="action-card-title">Trial Reels Not Yet Shot</h3>
          <p class="action-card-desc">Your next scripts ready to record.</p>

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
                ${scriptViewerButton(post.id)}
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
            <div class="flex items-center gap-2">${helpButton('Recent thoughts are quick captures. Convert one into an insight when you are ready to turn it into scripts.')}<button class="btn btn-ghost btn-sm" id="dash-btn-view-notes">All Notes →</button></div>
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
    if (todayPosts.length === 0 && pendingScripts.length === 0 && missedPosts.length === 0) {
      html += `
        <div class="action-card text-center" style="padding: 32px 20px; align-items: center;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--accent-green-subtle); color: var(--accent-green); display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style="font-size: 17px; font-weight: 700; color: var(--text-primary);">All Caught Up for Today!</h3>
          <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 380px; margin-top: 4px;">
            Your calendar is naturally balanced. Capture a new content idea whenever one comes up.
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
    document.getElementById('dash-zen-record-insight')?.addEventListener('click', () => openModal('insightCreate'));
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

    container.querySelectorAll('.btn-mark-missed-posted').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const reel = await db.getScheduledReel(e.currentTarget.dataset.id);
        if (!reel) return;

        const postedOnScheduledDate = confirm(
          `Was “${reel.title}” posted on its scheduled date (${formatDate(reel.scheduled_date)})?\n\nSelect OK for the scheduled date, or Cancel to choose another date.`
        );
        let postedDate = reel.scheduled_date;
        if (!postedOnScheduledDate) {
          postedDate = prompt('Enter the posting date (YYYY-MM-DD):', todayStr);
          if (!postedDate) return;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(postedDate) || Number.isNaN(new Date(`${postedDate}T00:00:00`).getTime())) {
            showToast('Enter a valid posting date in YYYY-MM-DD format.', 'error');
            return;
          }
        }

        reel.status = 'posted';
        reel.posted_date = postedDate;
        reel.updated_at = new Date().toISOString();
        await db.saveScheduledReel(reel);
        showToast(`Marked as posted on ${formatDate(postedDate)}.`, 'success');
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

    container.querySelectorAll('.btn-view-script').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const reel = await db.getScheduledReel(e.currentTarget.dataset.id);
        if (!reel?.script) {
          showToast('There is no script available for this reel.', 'info');
          return;
        }
        openModal('scriptDetail', { reel });
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
          showToast('Marked as posted.', 'success');
          DashboardView.render(container, navigateTo, openModal);
        }
      });
    });

    container.querySelectorAll('.dash-help').forEach((btn) => {
      btn.addEventListener('click', (e) => window.alert(e.currentTarget.dataset.help));
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
