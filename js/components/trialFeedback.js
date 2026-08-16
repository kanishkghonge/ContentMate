/**
 * Content OS for Doctors — 3-Day Trial Reel Feedback & Best Format Selection Sheet
 * 3 days after posting, evaluates performance across formats for an Insight, 
 * identifies the single best-performing format, and automatically schedules it as a Main Reel.
 */

import { db } from '../db.js';
import { promoteToMainReel } from '../scheduler.js';
import { showToast, escapeHtml, formatDate } from '../utils.js';

export const TrialFeedbackModal = {
  async render(container, options = {}, onDone, openModal, navigateTo) {
    const reelId = options.reelId;
    if (!reelId) {
      onDone();
      return;
    }

    const currentReel = await db.getScheduledReel(reelId);
    if (!currentReel) {
      onDone();
      return;
    }

    // Fetch all reels for the same parent Insight to compare formats
    const allReels = await db.getScheduledReels();
    const siblingReels = allReels.filter((r) => r.insight_id === currentReel.insight_id);
    const postedSiblings = siblingReels.filter((r) => r.status === 'posted' || r.feedback_logged || r.id === currentReel.id);

    const existingMetrics = currentReel.metrics || {};

    container.innerHTML = `
      <div class="feedback-sheet">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span class="action-card-badge badge-purple">📊 3-Day Post Evaluation</span>
          <span style="font-size: 12px; color: var(--text-tertiary);">Posted ${formatDate(currentReel.posted_date || currentReel.scheduled_date)}</span>
        </div>

        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
          Feedback is recorded <strong>3 days after posting</strong>. Out of all tested trial formats for this insight, the best-performing format will be selected and automatically scheduled as a <strong>Main Reel</strong>.
        </p>

        <!-- Current Reel Card -->
        <div class="card" style="padding: 14px; background: var(--bg-subtle); margin-bottom: 16px; border-left: 4px solid var(--accent-purple);">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-purple); margin-bottom: 2px;">
            Testing Format: ${escapeHtml(currentReel.format)}
          </div>
          <div style="font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
            ${escapeHtml(currentReel.title)}
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
            "${escapeHtml(currentReel.hook)}"
          </div>
        </div>

        <form id="form-reel-feedback">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin-bottom: 8px;">
            1. Enter 3-Day Performance Metrics
          </div>

          <div class="feedback-grid">
            <div class="metric-input-group">
              <label for="metric-views">Views</label>
              <input type="number" id="metric-views" placeholder="e.g. 18500" value="${existingMetrics.views || ''}" required />
            </div>

            <div class="metric-input-group">
              <label for="metric-likes">Likes</label>
              <input type="number" id="metric-likes" placeholder="e.g. 920" value="${existingMetrics.likes || ''}" />
            </div>

            <div class="metric-input-group">
              <label for="metric-comments">Comments</label>
              <input type="number" id="metric-comments" placeholder="e.g. 84" value="${existingMetrics.comments || ''}" />
            </div>

            <div class="metric-input-group">
              <label for="metric-shares">Shares / Saves</label>
              <input type="number" id="metric-shares" placeholder="e.g. 165" value="${existingMetrics.shares || ''}" />
            </div>
          </div>

          <div class="metric-input-group" style="margin-bottom: 16px;">
            <label for="metric-notes">Doctor Observations / Qualitative Feedback</label>
            <input type="text" id="metric-notes" placeholder="e.g. High retention; patients asked about this in clinic." value="${escapeHtml(existingMetrics.notes || '')}" />
          </div>

          <!-- Format Performance Comparison if sibling trial reels exist -->
          ${
            postedSiblings.length > 1
              ? `
                <div style="background: var(--bg-subtle); padding: 12px 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
                  <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                    Tested Formats Comparison for this Insight:
                  </div>
                  ${postedSiblings.map((s) => `
                    <div style="display: flex; justify-content: space-between; font-size: 12.5px; padding: 4px 0; border-bottom: 1px solid var(--border-subtle);">
                      <span>${escapeHtml(s.format)}: <strong>${escapeHtml(s.title)}</strong></span>
                      <span style="font-weight: 600; color: var(--accent-purple);">
                        ${s.metrics?.views ? `${s.metrics.views.toLocaleString()} views` : s.id === currentReel.id ? 'Currently Entering' : 'Pending'}
                      </span>
                    </div>
                  `).join('')}
                </div>
              `
              : ''
          }

          <!-- Core Decision Box -->
          <div class="main-reel-decision-box">
            <div style="font-size: 26px;">⭐</div>
            <div>
              <h3>Is this the Best-Performing Format?</h3>
              <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
                Selecting <strong>Yes</strong> automatically picks this format as the winner for this Insight and schedules it on its own as a Main Reel.
              </p>
            </div>

            <div class="decision-button-group">
              <button type="button" class="btn btn-secondary btn-lg flex-1" id="btn-decision-no">
                <span>No (Archive Trial)</span>
              </button>
              <button type="button" class="btn btn-primary btn-lg flex-1" id="btn-decision-yes" style="background: var(--accent-purple); border-color: var(--accent-purple);">
                <span>⭐ Select Best Format & Schedule Main Reel</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    `;

    const getMetricsFromForm = () => {
      return {
        views: parseInt(document.getElementById('metric-views').value) || 0,
        likes: parseInt(document.getElementById('metric-likes').value) || 0,
        comments: parseInt(document.getElementById('metric-comments').value) || 0,
        shares: parseInt(document.getElementById('metric-shares').value) || 0,
        notes: document.getElementById('metric-notes').value.trim(),
        logged_at: new Date().toISOString()
      };
    };

    // DECISION: YES -> Best Format selected, auto-schedules Main Reel
    document.getElementById('btn-decision-yes')?.addEventListener('click', async () => {
      currentReel.metrics = getMetricsFromForm();
      currentReel.feedback_logged = true;
      await db.saveScheduledReel(currentReel);

      await promoteToMainReel(currentReel.id);
      showToast('⭐ Best format selected! Main Reel automatically scheduled on your calendar.', 'success');
      onDone();
      navigateTo('schedule');
    });

    // DECISION: NO -> Archive Trial Reel with metrics
    document.getElementById('btn-decision-no')?.addEventListener('click', async () => {
      currentReel.metrics = getMetricsFromForm();
      currentReel.feedback_logged = true;
      currentReel.status = 'archived';
      await db.saveScheduledReel(currentReel);

      showToast('3-day performance logged. Trial Reel archived.', 'info');
      onDone();
      navigateTo('dashboard');
    });
  }
};
