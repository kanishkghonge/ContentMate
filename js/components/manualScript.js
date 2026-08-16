/**
 * Hand-written script modal — saves directly to the selected calendar date.
 */

import { scheduleManualScript } from '../scheduler.js';
import { formatDateForInput, getSystemDate, showToast } from '../utils.js';

export const ManualScriptModal = {
  async render(container, options, closeModal, navigateTo) {
    const today = formatDateForInput(getSystemDate());
    const scheduledDate = options.scheduledDate && options.scheduledDate >= today
      ? options.scheduledDate
      : today;

    container.innerHTML = `
      <form id="manual-script-form" class="flex flex-col gap-3">
        <p style="font-size: 13px; color: var(--text-secondary);">
          Write a script yourself and place it directly on your publishing calendar.
        </p>
        <div class="form-group">
          <label class="form-label" for="manual-script-topic">Topic</label>
          <input id="manual-script-topic" class="form-input" type="text" placeholder="e.g. Why high blood pressure is silent" required autofocus />
        </div>
        <div class="form-group">
          <label class="form-label" for="manual-script-body">Script</label>
          <textarea id="manual-script-body" class="form-textarea" rows="8" placeholder="Write your complete script here..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="manual-script-date">Schedule date</label>
          <input id="manual-script-date" class="form-input" type="date" min="${today}" value="${scheduledDate}" required />
        </div>
        <div class="flex justify-between items-center" style="margin-top: 6px;">
          <button type="button" class="btn btn-ghost btn-sm" id="btn-cancel-manual-script">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Add to Calendar</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-cancel-manual-script')?.addEventListener('click', closeModal);
    container.querySelector('#manual-script-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const title = container.querySelector('#manual-script-topic').value.trim();
      const script = container.querySelector('#manual-script-body').value.trim();
      const date = container.querySelector('#manual-script-date').value;

      if (!title || !script || !date) return;
      if (date < today) {
        showToast('Choose today or a future date.', 'error');
        return;
      }

      await scheduleManualScript({ title, script, scheduledDate: date });
      showToast(`Added to ${date}.`, 'success');
      closeModal();
      navigateTo('schedule');
    });
  }
};
