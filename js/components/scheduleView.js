/**
 * Content OS for Doctors — Visual Interactive Calendar View
 * Displays a full visual calendar grid showing scheduled posts on every day.
 * Clicking any day cell opens a clean modal sheet with full details and action controls.
 */

import { db } from '../db.js';
import { getFormatById } from '../formats.js';
import { recalculateFutureSchedule } from '../scheduler.js';
import { formatDate, formatFullDate, formatDateForInput, showToast, escapeHtml, getSystemDate } from '../utils.js';

export const ScheduleView = {
  currentMonthDate: getSystemDate(), // Active calendar month

  async render(container, navigateTo, openModal) {
    const profile = await db.getProfile();
    const enableFilming = profile.enableFilmingWorkflow === true;
    const allReels = await db.getScheduledReels();
    const todayStr = formatDateForInput(getSystemDate());

    // Map scheduled reels by date
    const reelsByDate = {};
    allReels.forEach((reel) => {
      const d = reel.scheduled_date;
      if (!d) return;
      if (!reelsByDate[d]) reelsByDate[d] = [];
      reelsByDate[d].push(reel);
    });

    const year = this.currentMonthDate.getFullYear();
    const month = this.currentMonthDate.getMonth();
    const monthName = this.currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Calendar grid calculations
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `
      <div class="calendar-lane" style="max-width: 900px;">
        
        <!-- Header & View Mode Switcher -->
        <div class="schedule-header">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">
              Publishing Calendar
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
              Uniformly sprinkled across ${profile.sprinkleWindowDays || 14} days. Click any cell to view post details.
            </p>
          </div>

          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" id="btn-recalculate-schedule">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
              <span>Re-Sprinkle Schedule</span>
            </button>
          </div>
        </div>

        <!-- Month Navigation Bar -->
        <div class="card" style="padding: 12px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
          <button class="btn btn-ghost btn-sm" id="btn-prev-month">
            ← Previous
          </button>
          
          <h3 style="font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: var(--text-primary);">
            ${monthName}
          </h3>

          <button class="btn btn-ghost btn-sm" id="btn-next-month">
            Next →
          </button>
        </div>

        <!-- Visual Grid Calendar -->
        <div class="card" style="padding: 12px; overflow-x: auto;">
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; font-size: 12px; font-weight: 700; color: var(--text-tertiary); margin-bottom: 8px;">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
    `;

    // Blank cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div style="background: var(--bg-subtle); border-radius: var(--radius-sm); min-height: 78px; opacity: 0.3;"></div>`;
    }

    // Days of the month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = formatDateForInput(dateObj);
      const isToday = dateStr === todayStr;
      const reelsOnDay = reelsByDate[dateStr] || [];

      let dayStyle = 'background: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 6px; min-height: 84px; display: flex; flex-direction: column; cursor: pointer; transition: all var(--transition-fast);';
      if (isToday) {
        dayStyle = 'background: #FFFFFF; border: 2px solid var(--accent-blue); border-radius: var(--radius-md); padding: 6px; min-height: 84px; display: flex; flex-direction: column; cursor: pointer; box-shadow: var(--shadow-xs);';
      }

      html += `
        <div class="cal-day-cell" data-date="${dateStr}" style="${dayStyle}">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 13px; font-weight: ${isToday ? '800' : '600'}; color: ${isToday ? 'var(--accent-blue)' : 'var(--text-primary)'};">
              ${day} ${isToday ? '📍' : ''}
            </span>
            ${reelsOnDay.length > 0 ? `<span class="nav-badge" style="font-size: 10px; padding: 1px 5px;">${reelsOnDay.length}</span>` : ''}
          </div>

          <div style="display: flex; flex-direction: column; gap: 3px; flex: 1; overflow: hidden;">
            ${reelsOnDay.slice(0, 3).map((r) => {
              const formatMeta = getFormatById(r.format);
              const isMain = r.is_main_reel;
              const isPosted = r.status === 'posted';
              const isFilmed = enableFilming && (r.status === 'filmed' || r.is_filmed);

              let badgeBg = 'background: var(--bg-subtle); color: var(--text-primary);';
              if (isMain) badgeBg = 'background: var(--accent-purple-subtle); color: var(--accent-purple); border: 1px solid var(--accent-purple);';
              else if (isPosted) badgeBg = 'background: var(--accent-green-subtle); color: var(--accent-green);';
              else if (isFilmed) badgeBg = 'background: var(--accent-blue-subtle); color: var(--accent-blue);';

              return `
                <div class="cal-reel-card" draggable="true" data-reel-id="${r.id}" style="font-size: 10.5px; font-weight: 600; padding: 2px 4px; border-radius: var(--radius-xs); ${badgeBg} white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; items-center; gap: 3px; cursor: grab;" title="Drag to another date: ${escapeHtml(r.title)}">
                  <span>${formatMeta.icon || '💡'}</span>
                  <span>${isMain ? '⭐ ' : ''}${escapeHtml(r.title)}</span>
                </div>
              `;
            }).join('')}

            ${reelsOnDay.length > 3 ? `<span style="font-size: 10px; color: var(--text-tertiary);">+${reelsOnDay.length - 3} more</span>` : ''}
          </div>
        </div>
      `;
    }

    html += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Month Navigation
    document.getElementById('btn-prev-month')?.addEventListener('click', () => {
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() - 1);
      ScheduleView.render(container, navigateTo, openModal);
    });

    document.getElementById('btn-next-month')?.addEventListener('click', () => {
      this.currentMonthDate.setMonth(this.currentMonthDate.getMonth() + 1);
      ScheduleView.render(container, navigateTo, openModal);
    });

    // Auto Reshuffle Future
    document.getElementById('btn-recalculate-schedule')?.addEventListener('click', async () => {
      const res = await recalculateFutureSchedule();
      showToast(`Uniformly re-sprinkled ${res.updatedCount} future trial reels over 2 weeks!`, 'success');
      ScheduleView.render(container, navigateTo, openModal);
    });

    // CLICK DAY CELL -> OPEN DAY DETAIL MODAL
    container.querySelectorAll('.cal-day-cell').forEach((cell) => {
      cell.addEventListener('click', async (e) => {
        const dateStr = e.currentTarget.dataset.date;
        const reelsOnDate = reelsByDate[dateStr] || [];
        this.openDayDetailModal(dateStr, reelsOnDate, navigateTo, openModal, enableFilming);
      });
    });

    // Drag a scheduled item directly to another calendar day.
    container.querySelectorAll('.cal-reel-card').forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.currentTarget.dataset.reelId);
      });
    });

    container.querySelectorAll('.cal-day-cell').forEach((cell) => {
      cell.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      cell.addEventListener('drop', async (e) => {
        e.preventDefault();
        const reelId = e.dataTransfer.getData('text/plain');
        const newDate = e.currentTarget.dataset.date;
        const reel = await db.getScheduledReel(reelId);
        if (!reel || reel.scheduled_date === newDate) return;
        if (newDate < todayStr) {
          showToast('Posts can only be moved to today or a future date.', 'error');
          return;
        }
        if (reel.status === 'posted' || reel.is_locked) {
          showToast(reel.is_locked ? 'Unpin this date before moving the post.' : 'Posted items cannot be rescheduled.', 'info');
          return;
        }
        reel.scheduled_date = newDate;
        reel.rescheduled_at = new Date().toISOString();
        reel.updated_at = new Date().toISOString();
        await db.saveScheduledReel(reel);
        showToast(`Moved to ${formatDate(newDate)}.`, 'success');
        ScheduleView.render(container, navigateTo, openModal);
      });
    });
  },

  openDayDetailModal(dateStr, reels, navigateTo, openModal, enableFilming = false) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');

    modalTitle.textContent = `Scheduled Posts for ${formatFullDate(dateStr)}`;

    if (!reels || reels.length === 0) {
      modalBody.innerHTML = `
        <div class="text-center" style="padding: 30px 16px;">
          <p style="font-size: 14px; color: var(--text-tertiary); margin-bottom: 14px;">
            No content scheduled for this date.
          </p>
          <button class="btn btn-primary btn-sm" id="btn-modal-capture-for-day">
            + Record New Insight for this Date
          </button>
        </div>
      `;
      modalOverlay.classList.remove('hidden');

      document.getElementById('btn-modal-capture-for-day')?.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        openModal('insightCreate');
      });
      return;
    }

    let html = `
      <div class="flex flex-col gap-3">
        ${reels.map((reel) => {
          const formatMeta = getFormatById(reel.format);
          const isFilmed = enableFilming && (reel.status === 'filmed' || reel.is_filmed);
          const isPosted = reel.status === 'posted';
          const isMain = reel.is_main_reel;
          const isLocked = reel.is_locked;

          return `
            <div class="card" style="padding: 16px; border-left: 4px solid ${isMain ? 'var(--accent-purple)' : isPosted ? 'var(--accent-green)' : isFilmed ? 'var(--accent-blue)' : 'var(--border-strong)'}">
              <div class="flex items-center justify-between" style="margin-bottom: 6px;">
                <div class="flex items-center gap-2">
                  <span style="font-size: 18px;">${formatMeta.icon || '💡'}</span>
                  <span class="action-card-badge ${isMain ? 'badge-purple' : 'badge-gray'}">
                    ${isMain ? '⭐ Main Reel' : 'Trial Reel'}
                  </span>
                  <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">
                    ${escapeHtml(reel.format)}
                  </span>
                </div>
                
                <span class="action-card-badge ${isPosted ? 'badge-green' : isFilmed ? 'badge-blue' : 'badge-amber'}">
                  ${isPosted ? '✓ Posted' : isFilmed ? '✓ Filmed' : 'Ready to post'}
                </span>
              </div>

              <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                ${escapeHtml(reel.title)}
              </h3>

              <div style="font-size: 13.5px; color: var(--text-primary); background: var(--bg-subtle); padding: 10px 12px; border-radius: var(--radius-md); margin-bottom: 10px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 2px;">Hook</div>
                "${escapeHtml(reel.hook)}"
              </div>

              ${
                reel.script
                  ? `<div style="font-size: 13px; color: var(--text-secondary); line-height: 1.45; background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 10px 12px; border-radius: var(--radius-md); max-height: 140px; overflow-y: auto; margin-bottom: 10px;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 2px;">Script Body</div>
                      ${escapeHtml(reel.script)}
                    </div>`
                  : ''
              }

              <div style="font-size: 12.5px; font-weight: 600; color: var(--accent-blue); margin-bottom: 12px;">
                CTA: ${escapeHtml(reel.cta)}
              </div>

              ${
                !isPosted
                  ? `<div class="flex gap-2 items-center" style="margin-bottom: 12px; flex-wrap: wrap;">
                      <label style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">Reschedule
                        <input class="form-input detail-reschedule-date" data-id="${reel.id}" type="date" min="${formatDateForInput(getSystemDate())}" value="${reel.scheduled_date}" style="width: 150px; margin-left: 5px; padding: 6px 8px; font-size: 12px;" />
                      </label>
                      <button class="btn btn-secondary btn-sm btn-detail-reschedule" data-id="${reel.id}">Set Date</button>
                    </div>`
                  : ''
              }

              <!-- Quick Action Controls -->
              <div class="flex gap-2 justify-between items-center" style="border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                <button class="btn btn-ghost btn-sm btn-detail-lock" data-id="${reel.id}">
                  ${isLocked ? '🔒 Unpin Date' : '📌 Pin Date'}
                </button>

                <div class="flex gap-2">
                  ${
                    enableFilming && !isFilmed && !isPosted
                      ? `<button class="btn btn-secondary btn-sm btn-detail-film" data-id="${reel.id}">Mark Filmed</button>`
                      : ''
                  }
                  ${
                    !isPosted
                      ? `<button class="btn btn-primary btn-sm btn-detail-post" data-id="${reel.id}">Mark Posted</button>`
                      : `<button class="btn btn-secondary btn-sm btn-detail-feedback" data-id="${reel.id}">Log 3-Day Feedback</button>`
                  }
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    modalBody.innerHTML = html;
    modalOverlay.classList.remove('hidden');

    // Handle detail modal buttons
    modalBody.querySelectorAll('.btn-detail-film').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const reel = await db.getScheduledReel(id);
        if (reel) {
          reel.status = 'filmed';
          reel.is_filmed = true;
          await db.saveScheduledReel(reel);
          showToast('Marked as Filmed!', 'success');
          modalOverlay.classList.add('hidden');
          ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal);
        }
      });
    });

    modalBody.querySelectorAll('.btn-detail-post').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const reel = await db.getScheduledReel(id);
        if (reel) {
          reel.status = 'posted';
          reel.posted_date = formatDateForInput(new Date());
          await db.saveScheduledReel(reel);
          showToast('Marked as Posted! 3-day feedback timer started.', 'success');
          modalOverlay.classList.add('hidden');
          ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal);
        }
      });
    });

    modalBody.querySelectorAll('.btn-detail-feedback').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        modalOverlay.classList.add('hidden');
        openModal('trialFeedback', { reelId: id });
      });
    });

    modalBody.querySelectorAll('.btn-detail-lock').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const reel = await db.getScheduledReel(id);
        if (reel) {
          reel.is_locked = !reel.is_locked;
          await db.saveScheduledReel(reel);
          showToast(reel.is_locked ? 'Locked date' : 'Unlocked date', 'info');
          modalOverlay.classList.add('hidden');
          ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal);
        }
      });
    });

    modalBody.querySelectorAll('.btn-detail-reschedule').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const dateInput = modalBody.querySelector(`.detail-reschedule-date[data-id="${id}"]`);
        const newDate = dateInput?.value;
        const today = formatDateForInput(getSystemDate());
        if (!newDate || newDate < today) {
          showToast('Choose today or a future date.', 'error');
          return;
        }
        const reel = await db.getScheduledReel(id);
        if (!reel || reel.status === 'posted') return;
        if (reel.is_locked) {
          showToast('Unpin this date before rescheduling.', 'info');
          return;
        }
        reel.scheduled_date = newDate;
        reel.rescheduled_at = new Date().toISOString();
        reel.updated_at = new Date().toISOString();
        await db.saveScheduledReel(reel);
        showToast(`Rescheduled for ${formatDate(newDate)}.`, 'success');
        modalOverlay.classList.add('hidden');
        ScheduleView.render(document.getElementById('view-container'), navigateTo, openModal);
      });
    });
  }
};
