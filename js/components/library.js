/**
 * Content OS for Doctors — Content Library & Unified Insight Timelines
 * Every idea has its own chronological timeline from clinical spark to Main Reel.
 */

import { db } from '../db.js';
import { formatDate, formatRelativeDate, escapeHtml } from '../utils.js';

export const LibraryView = {
  activeInsightId: null,

  async render(container, navigateTo, openModal) {
    const insights = await db.getInsights();
    const scripts = await db.getScripts();
    const reels = await db.getScheduledReels();

    if (this.activeInsightId) {
      this.renderInsightTimeline(container, this.activeInsightId, insights, scripts, reels, navigateTo, openModal);
      return;
    }

    let html = `
      <div class="library-grid">
        <div class="schedule-header">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700;">
              Clinical Content Library
            </h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
              Every insight has a single chronological timeline. Tap any idea to view its full lifecycle.
            </p>
          </div>

          <button class="btn btn-primary btn-sm" id="btn-library-new-insight">
            <span>+ New Insight</span>
          </button>
        </div>
    `;

    if (insights.length === 0) {
      html += `
        <div class="card text-center" style="padding: 40px 20px;">
          <p style="font-size: 14.5px; color: var(--text-tertiary);">No clinical insights yet. Record your first insight to build your library.</p>
        </div>
      `;
    } else {
      html += `
        <div class="flex flex-col gap-3">
          ${insights.map((ins) => {
            const insScripts = scripts.filter((s) => s.insight_id === ins.id);
            const insReels = reels.filter((r) => r.insight_id === ins.id);
            const acceptedCount = insScripts.filter((s) => s.status === 'accepted').length;
            const postedCount = insReels.filter((r) => r.status === 'posted').length;
            const hasMainReel = insReels.some((r) => r.is_main_reel);

            return `
              <div class="card btn-open-insight" data-id="${ins.id}" style="cursor: pointer;">
                <div class="flex items-center justify-between" style="margin-bottom: 6px;">
                  <span style="font-size: 12px; color: var(--text-tertiary);">${formatRelativeDate(ins.created_at)}</span>
                  <div class="flex gap-2">
                    ${hasMainReel ? `<span class="action-card-badge badge-purple">⭐ Main Reel</span>` : ''}
                    <span class="action-card-badge badge-blue">${insScripts.length} Scripts</span>
                  </div>
                </div>

                <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                  ${escapeHtml(ins.title)}
                </h3>

                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 12px;">
                  ${escapeHtml(ins.description || ins.supporting_points || '')}
                </p>

                <div class="flex items-center justify-between" style="border-top: 1px solid var(--border-subtle); padding-top: 10px; font-size: 12.5px; color: var(--text-secondary);">
                  <span>${acceptedCount} Accepted • ${postedCount} Posted</span>
                  <span style="color: var(--accent-blue); font-weight: 600;">View Timeline →</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Open Insight detail timeline
    container.querySelectorAll('.btn-open-insight').forEach((el) => {
      el.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.activeInsightId = id;
        LibraryView.render(container, navigateTo, openModal);
      });
    });

    document.getElementById('btn-library-new-insight')?.addEventListener('click', () => {
      openModal('insightCreate');
    });
  },

  renderInsightTimeline(container, insightId, insights, scripts, reels, navigateTo, openModal) {
    const insight = insights.find((i) => i.id === insightId);
    if (!insight) {
      this.activeInsightId = null;
      LibraryView.render(container, navigateTo, openModal);
      return;
    }

    const insScripts = scripts.filter((s) => s.insight_id === insight.id);
    const insReels = reels.filter((r) => r.insight_id === insight.id);

    let html = `
      <div class="library-grid">
        <button class="btn btn-ghost btn-sm" id="btn-back-to-library" style="margin-bottom: 12px; align-self: flex-start;">
          ← Back to Library
        </button>

        <div class="card" style="margin-bottom: 16px;">
          <div class="flex justify-between items-center">
            <span style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: var(--accent-blue);">
              Clinical Insight Timeline
            </span>
            <button class="btn btn-danger btn-sm" id="btn-delete-insight-timeline" data-id="${insight.id}">
              Delete Insight
            </button>
          </div>
          <h2 style="font-family: var(--font-heading); font-size: 20px; font-weight: 700; margin: 4px 0 8px;">
            ${escapeHtml(insight.title)}
          </h2>
          <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.45;">
            ${escapeHtml(insight.supporting_points || insight.description || '')}
          </p>
          ${
            insight.references
              ? `<div style="margin-top: 10px; font-size: 12px; color: var(--text-tertiary);">References: ${escapeHtml(insight.references)}</div>`
              : ''
          }
        </div>

        <!-- The Chronological Timeline -->
        <div class="insight-timeline">
          
          <!-- Node 1: Clinical Spark Recorded -->
          <div class="timeline-node">
            <div class="timeline-dot done">✓</div>
            <div class="timeline-content">
              <div class="flex justify-between items-center" style="margin-bottom: 4px;">
                <strong style="font-size: 14px;">1. Clinical Idea Captured</strong>
                <span style="font-size: 12px; color: var(--text-tertiary);">${formatDate(insight.created_at)}</span>
              </div>
              <p style="font-size: 13px; color: var(--text-secondary);">Recorded in doctor workspace.</p>
            </div>
          </div>

          <!-- Node 2: Generated Scripts & Review Status -->
          <div class="timeline-node">
            <div class="timeline-dot ${insScripts.length > 0 ? 'done' : ''}">
              ${insScripts.length > 0 ? '✓' : '2'}
            </div>
            <div class="timeline-content">
              <div class="flex justify-between items-center" style="margin-bottom: 4px;">
                <strong style="font-size: 14px;">2. AI Scripts Review (${insScripts.length} Formats)</strong>
              </div>
              
              ${
                insScripts.length === 0
                  ? `<p style="font-size: 13px; color: var(--text-tertiary);">No scripts imported yet.</p>
                     <button class="btn btn-primary btn-sm" id="btn-timeline-import-now" style="margin-top: 6px;">Import AI Pack</button>`
                  : `<div class="flex flex-col gap-2" style="margin-top: 6px;">
                      ${insScripts.map((s) => `
                        <div style="font-size: 12.5px; display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid var(--border-subtle);">
                          <span>${escapeHtml(s.format)}: <strong>${escapeHtml(s.title)}</strong></span>
                          <span class="action-card-badge ${s.status === 'accepted' ? 'badge-green' : s.status === 'rejected' ? 'badge-red' : 'badge-amber'}">
                            ${s.status}
                          </span>
                        </div>
                      `).join('')}
                    </div>`
              }
            </div>
          </div>

          <!-- Node 3: Trial Reel Scheduling -->
          <div class="timeline-node">
            <div class="timeline-dot ${insReels.length > 0 ? 'done' : ''}">
              ${insReels.length > 0 ? '✓' : '3'}
            </div>
            <div class="timeline-content">
              <div class="flex justify-between items-center" style="margin-bottom: 4px;">
                <strong style="font-size: 14px;">3. Trial Reels on Calendar</strong>
              </div>
              ${
                insReels.length === 0
                  ? `<p style="font-size: 13px; color: var(--text-tertiary);">Accept a script in Flashcard Review to automatically schedule a Trial Reel.</p>`
                  : insReels.map((r) => `
                      <div style="font-size: 13px; margin-top: 4px;">
                        • ${r.is_main_reel ? '⭐ ' : ''}${r.format} scheduled for <strong>${formatDate(r.scheduled_date)}</strong> (${r.status})
                      </div>
                    `).join('')
              }
            </div>
          </div>

          <!-- Node 4: 3-Day Feedback & Main Reel Result -->
          <div class="timeline-node">
            <div class="timeline-dot ${insReels.some((r) => r.is_main_reel || r.feedback_logged) ? 'done' : ''}">
              4
            </div>
            <div class="timeline-content">
              <div class="flex justify-between items-center" style="margin-bottom: 4px;">
                <strong style="font-size: 14px;">4. 3-Day Performance & Main Reel Decision</strong>
              </div>
              ${
                insReels.some((r) => r.feedback_logged)
                  ? insReels.filter((r) => r.feedback_logged).map((r) => `
                      <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                        Logged: ${r.metrics?.views || 0} views • ${r.metrics?.likes || 0} likes • Decision: ${r.is_main_reel_winner ? '⭐ Promoted to Main Reel' : 'Archived'}
                      </div>
                    `).join('')
                  : `<p style="font-size: 13px; color: var(--text-tertiary);">Feedback will trigger automatically 3 days after posting.</p>`
              }
            </div>
          </div>

        </div>
      </div>
    `;

    container.innerHTML = html;

    document.getElementById('btn-back-to-library')?.addEventListener('click', () => {
      this.activeInsightId = null;
      LibraryView.render(container, navigateTo, openModal);
    });

    document.getElementById('btn-delete-insight-timeline')?.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (confirm('Delete this insight and all associated scripts & reels?')) {
        await db.deleteInsight(id);
        showToast('Insight deleted!', 'info');
        this.activeInsightId = null;
        LibraryView.render(container, navigateTo, openModal);
      }
    });

    document.getElementById('btn-timeline-import-now')?.addEventListener('click', () => {
      openModal('aiImport', { insightId: insight.id });
    });
  }
};
