/**
 * Content OS for Doctors — Feedback Due Workspace View
 * Manages 3-day performance evaluations for trial reels, pending checks, and feedback history.
 */

import { db } from '../db.js';
import { getSystemDate, formatDate, escapeHtml, getTimeShiftDays, setTimeShiftDays, showToast } from '../utils.js';
import { getFormatById } from '../formats.js';

export const FeedbackView = {
  activeTab: 'due', // 'due', 'awaiting', 'history'

  async render(container, navigateTo, openModal) {
    const allReels = await db.getScheduledReels();
    const systemDate = getSystemDate();

    // Categorize reels
    const feedbackDue = [];
    const awaitingCheck = [];
    const historyReels = [];

    allReels.forEach((r) => {
      if (r.status !== 'posted' && !r.feedback_logged) return;

      if (r.feedback_logged) {
        historyReels.push(r);
        return;
      }

      if (r.status === 'posted') {
        const postedTime = new Date(r.posted_date || r.scheduled_date);
        const diffDays = Math.floor((systemDate - postedTime) / (1000 * 60 * 60 * 24));
        if (diffDays >= 3) {
          feedbackDue.push({ reel: r, diffDays });
        } else {
          awaitingCheck.push({ reel: r, diffDays, daysRemaining: 3 - diffDays });
        }
      }
    });

    let html = `
      <div class="feedback-lane" style="max-width: 900px; margin: 0 auto;">
        <!-- Header -->
        <div class="schedule-header" style="margin-bottom: 20px;">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 22px; font-weight: 700;">📊 3-Day Performance Checks & Feedback</h2>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">
              Trial reels are evaluated 3 days after posting to select the single highest-performing format as a <strong>Main Reel</strong> winner.
            </p>
          </div>
          <div class="flex gap-2 items-center">
            <button class="btn btn-secondary btn-sm" id="btn-feedback-timetravel" style="color: var(--accent-purple); font-weight: 600; background: var(--accent-purple-subtle);">
              ⏩ +3 Days Time Travel
            </button>
          </div>
        </div>

        <!-- Metric Summary Cards -->
        <div class="grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 24px;">
          <div class="card" style="padding: 16px; border-left: 4px solid var(--accent-purple);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">Due For Review</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--accent-purple); margin: 4px 0;">${feedbackDue.length}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Posts ready for 3-day metrics</div>
          </div>

          <div class="card" style="padding: 16px; border-left: 4px solid var(--accent-blue);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">In 3-Day Window</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--accent-blue); margin: 4px 0;">${awaitingCheck.length}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Gathering audience data</div>
          </div>

          <div class="card" style="padding: 16px; border-left: 4px solid var(--accent-green);">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">Evaluated / History</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--accent-green); margin: 4px 0;">${historyReels.length}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Completed performance reviews</div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-2" style="border-bottom: 1px solid var(--border-subtle); margin-bottom: 20px; padding-bottom: 8px;">
          <button class="btn btn-ghost btn-sm tab-btn ${this.activeTab === 'due' ? 'active' : ''}" id="tab-btn-due" style="${this.activeTab === 'due' ? 'font-weight: 700; color: var(--accent-purple); border-bottom: 2px solid var(--accent-purple); border-radius: 0;' : ''}">
            🚨 Action Required (${feedbackDue.length})
          </button>
          <button class="btn btn-ghost btn-sm tab-btn ${this.activeTab === 'awaiting' ? 'active' : ''}" id="tab-btn-awaiting" style="${this.activeTab === 'awaiting' ? 'font-weight: 700; color: var(--accent-blue); border-bottom: 2px solid var(--accent-blue); border-radius: 0;' : ''}">
            ⏳ Gathering Data (${awaitingCheck.length})
          </button>
          <button class="btn btn-ghost btn-sm tab-btn ${this.activeTab === 'history' ? 'active' : ''}" id="tab-btn-history" style="${this.activeTab === 'history' ? 'font-weight: 700; color: var(--accent-green); border-bottom: 2px solid var(--accent-green); border-radius: 0;' : ''}">
            🏆 Evaluated History (${historyReels.length})
          </button>
        </div>

        <!-- Tab Contents -->
        <div id="feedback-tab-content">
    `;

    if (this.activeTab === 'due') {
      if (feedbackDue.length === 0) {
        html += `
          <div class="card text-center" style="padding: 40px 20px; align-items: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">✅</div>
            <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">No Performance Checks Due Right Now</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 480px; margin: 8px auto 16px;">
              You're all caught up! When scheduled trial reels reach 3 days after posting, they will automatically land here for performance scoring and winner selection.
            </p>
            ${awaitingCheck.length > 0 ? `
              <p style="font-size: 12.5px; color: var(--accent-purple); font-weight: 600;">
                💡 You have ${awaitingCheck.length} post(s) currently in their 3-day window. Use "+3 Days Time Travel" above to fast-forward system date for testing.
              </p>
            ` : `
              <button class="btn btn-primary btn-sm" id="btn-feedback-goto-schedule">Go to Publishing Calendar →</button>
            `}
          </div>
        `;
      } else {
        html += `
          <div class="flex flex-col gap-3">
            ${feedbackDue.map(({ reel, diffDays }) => {
              const formatMeta = getFormatById(reel.format);
              return `
                <div class="card" style="padding: 18px; border-left: 4px solid var(--accent-purple);">
                  <div class="flex items-center justify-between" style="margin-bottom: 8px;">
                    <div class="flex items-center gap-2">
                      <span style="font-size: 18px;">${formatMeta.icon || '💡'}</span>
                      <span class="action-card-badge badge-purple">📊 3-Day Check Due (${diffDays} days ago)</span>
                      <span style="font-size: 13px; font-weight: 600;">${escapeHtml(reel.format)}</span>
                    </div>
                    <span style="font-size: 12px; color: var(--text-tertiary);">Posted ${formatDate(reel.posted_date || reel.scheduled_date)}</span>
                  </div>

                  <h3 style="font-family: var(--font-heading); font-size: 16.5px; font-weight: 700; margin-bottom: 6px;">${escapeHtml(reel.title)}</h3>
                  <div style="background: var(--bg-subtle); padding: 10px 12px; border-radius: var(--radius-md); font-size: 13.5px; margin-bottom: 12px;">
                    "${escapeHtml(reel.hook)}"
                  </div>

                  <div class="flex gap-2 justify-between items-center" style="border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                    <span style="font-size: 12.5px; font-weight: 600; color: var(--accent-blue);">CTA: ${escapeHtml(reel.cta)}</span>
                    <button class="btn btn-primary btn-sm btn-feedback-log" data-id="${reel.id}">
                      Log 3-Day Feedback & Pick Winner →
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    } else if (this.activeTab === 'awaiting') {
      if (awaitingCheck.length === 0) {
        html += `
          <div class="card text-center" style="padding: 40px 20px; align-items: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">📱</div>
            <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">No Posts Currently Gathering Data</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 480px; margin: 8px auto 16px;">
              Mark your scheduled reels as "Posted" on the Publishing Calendar or Today's Dashboard to start their 3-day performance clock.
            </p>
            <button class="btn btn-primary btn-sm" id="btn-feedback-goto-schedule-2">View Publishing Schedule →</button>
          </div>
        `;
      } else {
        html += `
          <div class="flex flex-col gap-3">
            ${awaitingCheck.map(({ reel, diffDays, daysRemaining }) => {
              const formatMeta = getFormatById(reel.format);
              return `
                <div class="card" style="padding: 18px; border-left: 4px solid var(--accent-blue);">
                  <div class="flex items-center justify-between" style="margin-bottom: 8px;">
                    <div class="flex items-center gap-2">
                      <span style="font-size: 18px;">${formatMeta.icon || '💡'}</span>
                      <span class="action-card-badge badge-blue">⏳ ${daysRemaining} Day${daysRemaining === 1 ? '' : 's'} Remaining</span>
                      <span style="font-size: 13px; font-weight: 600;">${escapeHtml(reel.format)}</span>
                    </div>
                    <span style="font-size: 12px; color: var(--text-tertiary);">Posted ${formatDate(reel.posted_date || reel.scheduled_date)}</span>
                  </div>

                  <h3 style="font-family: var(--font-heading); font-size: 16.5px; font-weight: 700; margin-bottom: 6px;">${escapeHtml(reel.title)}</h3>
                  <div style="background: var(--bg-subtle); padding: 10px 12px; border-radius: var(--radius-md); font-size: 13.5px; margin-bottom: 12px;">
                    "${escapeHtml(reel.hook)}"
                  </div>

                  <div class="flex gap-2 justify-between items-center" style="border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                    <span style="font-size: 12px; color: var(--text-secondary);">3-day performance timer active (${diffDays} day${diffDays === 1 ? '' : 's'} elapsed)</span>
                    <button class="btn btn-secondary btn-sm btn-feedback-log" data-id="${reel.id}">
                      Log Feedback Early
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    } else if (this.activeTab === 'history') {
      if (historyReels.length === 0) {
        html += `
          <div class="card text-center" style="padding: 40px 20px; align-items: center;">
            <div style="font-size: 40px; margin-bottom: 12px;">📜</div>
            <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700;">No Evaluated Reels Yet</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 480px; margin: 8px auto;">
              Once you log performance feedback on trial reels, they will appear here along with their view counts and winning Main Reel statuses.
            </p>
          </div>
        `;
      } else {
        html += `
          <div class="flex flex-col gap-3">
            ${historyReels.map((reel) => {
              const formatMeta = getFormatById(reel.format);
              const m = reel.metrics || {};
              const isWinner = reel.is_main_reel_winner || reel.is_main_reel;

              return `
                <div class="card" style="padding: 18px; border-left: 4px solid ${isWinner ? 'var(--accent-purple)' : 'var(--accent-green)'};">
                  <div class="flex items-center justify-between" style="margin-bottom: 8px;">
                    <div class="flex items-center gap-2">
                      <span style="font-size: 18px;">${formatMeta.icon || '💡'}</span>
                      <span class="action-card-badge ${isWinner ? 'badge-purple' : 'badge-green'}">
                        ${isWinner ? '⭐ Main Reel Winner' : '✓ Trial Evaluated'}
                      </span>
                      <span style="font-size: 13px; font-weight: 600;">${escapeHtml(reel.format)}</span>
                    </div>
                    <span style="font-size: 12px; color: var(--text-tertiary);">Logged ${m.logged_at ? formatDate(m.logged_at) : 'Completed'}</span>
                  </div>

                  <h3 style="font-family: var(--font-heading); font-size: 16.5px; font-weight: 700; margin-bottom: 8px;">${escapeHtml(reel.title)}</h3>

                  <!-- Metric Pill Badges -->
                  <div class="flex gap-3" style="margin-bottom: 10px; background: var(--bg-subtle); padding: 8px 12px; border-radius: var(--radius-md); font-size: 12.5px; flex-wrap: wrap;">
                    <span>👀 <strong>${(m.views || 0).toLocaleString()}</strong> views</span>
                    <span>❤️ <strong>${(m.likes || 0).toLocaleString()}</strong> likes</span>
                    <span>💬 <strong>${(m.comments || 0).toLocaleString()}</strong> comments</span>
                    <span>🔖 <strong>${(m.shares || 0).toLocaleString()}</strong> shares/saves</span>
                  </div>

                  ${m.notes ? `
                    <p style="font-size: 12.5px; color: var(--text-secondary); font-style: italic; margin-bottom: 8px;">
                      Doctor notes: "${escapeHtml(m.notes)}"
                    </p>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    }

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Attach Event Listeners
    document.getElementById('btn-feedback-timetravel')?.addEventListener('click', () => {
      const current = getTimeShiftDays();
      setTimeShiftDays(current + 3);
      showToast('Fast-forwarded +3 days in system date!', 'success');
      this.render(container, navigateTo, openModal);
    });

    document.getElementById('tab-btn-due')?.addEventListener('click', () => {
      this.activeTab = 'due';
      this.render(container, navigateTo, openModal);
    });

    document.getElementById('tab-btn-awaiting')?.addEventListener('click', () => {
      this.activeTab = 'awaiting';
      this.render(container, navigateTo, openModal);
    });

    document.getElementById('tab-btn-history')?.addEventListener('click', () => {
      this.activeTab = 'history';
      this.render(container, navigateTo, openModal);
    });

    document.getElementById('btn-feedback-goto-schedule')?.addEventListener('click', () => {
      navigateTo('schedule');
    });

    document.getElementById('btn-feedback-goto-schedule-2')?.addEventListener('click', () => {
      navigateTo('schedule');
    });

    container.querySelectorAll('.btn-feedback-log').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openModal('trialFeedback', { reelId: id });
      });
    });
  }
};
