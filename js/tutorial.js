/** Guided first-use tour. It points at, and waits for, the real application controls. */

import { db } from './db.js';
import { showToast } from './utils.js';

const FATIGUE_TITLE = 'Many people complain of fatigue but keep ignoring it. When should you actually see a doctor for fatigue?';
const FATIGUE_DETAILS = "Not every fatigue needs a doctor, but persistent or unexplained fatigue can sometimes point to problems like anemia, thyroid disease, poor sleep, or nutritional deficiencies. Explain when fatigue becomes concerning, what warning signs people should look out for, and when they should get evaluated. Mention simple things they can notice themselves, like pallor, while making it clear that self-checks don't replace a medical evaluation.";
const FATIGUE_RESPONSE = {
  version: 1,
  insight_title: FATIGUE_TITLE,
  scripts: [
    { format: 'Talking Head', title: 'When tiredness needs a doctor', hook: 'Feeling tired all the time is not always something to push through.', script: 'A busy week can make anyone tired. But fatigue that lasts, feels unexplained, or comes with breathlessness, weight change, fever, or looking unusually pale deserves a medical review. Conditions such as anemia, thyroid problems, poor sleep, and nutritional deficiencies can all play a part. Notice the pattern, but do not rely on self-checks alone.', cta: 'Save this for the next time fatigue feels different.', estimated_duration: '40s', confidence: 9.2 },
    { format: 'Myth vs Fact', title: 'Myth: fatigue is always normal', hook: 'Myth: if you can get through the day, fatigue is nothing to worry about.', script: 'Fact: ongoing fatigue can be your body asking for attention. Look for changes that persist despite rest, or fatigue alongside paleness, shortness of breath, dizziness, or changes in weight. A doctor can help work out what is behind it.', cta: 'Share this with someone who keeps saying they are just tired.', estimated_duration: '30s', confidence: 8.9 },
    { format: 'Patient Question', title: 'When should I see a doctor for fatigue?', hook: 'A question I hear often: when is tiredness more than just tiredness?', script: 'Start with how long it has been going on and whether it is changing your normal routine. If it is persistent, unexplained, or comes with warning signs, please get evaluated. The answer may be simple, but it is worth checking.', cta: 'Comment with a health question you want explained simply.', estimated_duration: '30s', confidence: 8.7 }
  ]
};

export class WorkflowTutorial {
  constructor(app) {
    this.app = app;
    this.step = 0;
    this.completed = false;
    this.handlers = [];
  }

  start() {
    this.cleanup();
    this.step = 0;
    this.completed = false;
    this.root = document.createElement('div');
    this.root.className = 'workflow-tutorial';
    this.root.innerHTML = '<div class="workflow-tutorial-shade"></div><div class="workflow-tutorial-ring"></div><section class="workflow-tutorial-card" role="dialog" aria-live="polite"></section>';
    document.body.appendChild(this.root);
    this.card = this.root.querySelector('.workflow-tutorial-card');
    this.makeCardMovable();
    this.next();
  }

  cleanup() {
    this.handlers.forEach(([target, type, fn, options]) => target.removeEventListener(type, fn, options));
    this.handlers = [];
    document.querySelectorAll('.workflow-tutorial-target').forEach((node) => node.classList.remove('workflow-tutorial-target'));
    this.root?.remove();
    this.root = null;
  }

  listen(target, type, fn, options) {
    target.addEventListener(type, fn, options);
    this.handlers.push([target, type, fn, options]);
  }

  makeCardMovable() {
    let drag = null;
    this.card.addEventListener('pointerdown', (event) => {
      if (!event.target.closest('.workflow-tutorial-grab')) return;
      const rect = this.card.getBoundingClientRect();
      drag = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      this.card.setPointerCapture(event.pointerId);
      this.card.classList.add('is-dragging');
      event.preventDefault();
    });
    this.card.addEventListener('pointermove', (event) => {
      if (!drag) return;
      const maxX = window.innerWidth - this.card.offsetWidth - 8;
      const maxY = window.innerHeight - this.card.offsetHeight - 8;
      this.card.style.left = `${Math.max(8, Math.min(maxX, event.clientX - drag.x))}px`;
      this.card.style.top = `${Math.max(8, Math.min(maxY, event.clientY - drag.y))}px`;
      this.card.style.right = 'auto';
      this.card.style.bottom = 'auto';
    });
    const stopDragging = () => { drag = null; this.card.classList.remove('is-dragging'); };
    this.card.addEventListener('pointerup', stopDragging);
    this.card.addEventListener('pointercancel', stopDragging);
  }

  async finish(skipped = false) {
    const profile = await db.getProfile();
    await db.saveProfile({ ...profile, tutorialSeen: true, tutorialSkipped: skipped, onboarded: true });
    this.completed = true;
    this.cleanup();
    showToast(skipped ? 'Tutorial closed. You can replay it from Doctor Profile.' : 'You are ready to use Content Mate.', 'success');
  }

  show({ eyebrow = 'Your first workflow', title, body, target, primary, onPrimary, back = true, diagram = '' }) {
    this.handlers.forEach(([node, type, fn, options]) => node.removeEventListener(type, fn, options));
    this.handlers = [];
    document.querySelectorAll('.workflow-tutorial-target').forEach((node) => node.classList.remove('workflow-tutorial-target'));
    const targetNode = target ? document.querySelector(target) : null;
    this.root.classList.toggle('has-target', !!targetNode);
    if (targetNode) {
      targetNode.classList.add('workflow-tutorial-target');
      targetNode.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center', inline: 'center' });
      requestAnimationFrame(() => this.positionTarget(targetNode));
    }
    this.card.innerHTML = `
      <div class="workflow-tutorial-top workflow-tutorial-grab"><span>${eyebrow}</span><span>${Math.min(this.step + 1, 15)} / 15</span><button class="btn btn-ghost btn-sm" data-tutorial-exit>Exit tutorial</button></div>
      <h2>${title}</h2><p>${body}</p>${diagram}
      <div class="workflow-tutorial-actions">${back && this.step > 0 ? '<button class="btn btn-ghost btn-sm" data-tutorial-back>Back</button>' : '<span></span>'}<div>${primary ? `<button class="btn btn-primary btn-sm" data-tutorial-next>${primary}</button>` : ''}</div></div>`;
    this.card.querySelector('[data-tutorial-exit]').addEventListener('click', () => this.finish(true));
    this.card.querySelector('[data-tutorial-back]')?.addEventListener('click', () => { this.step = Math.max(0, this.step - 1); this.next(); });
    this.card.querySelector('[data-tutorial-next]')?.addEventListener('click', onPrimary || (() => { this.step++; this.next(); }));
  }

  positionTarget(node) {
    if (!this.root || !node.isConnected) return;
    const rect = node.getBoundingClientRect();
    const ring = this.root.querySelector('.workflow-tutorial-ring');
    ring.style.cssText = `left:${Math.max(6, rect.left - 7)}px;top:${Math.max(6, rect.top - 7)}px;width:${rect.width + 14}px;height:${rect.height + 14}px;`;
  }

  waitForElement(selector, timeout = 8000) {
    return new Promise((resolve) => {
      const existing = document.querySelector(selector);
      if (existing) { resolve(existing); return; }
      const observer = new MutationObserver(() => {
        const found = document.querySelector(selector);
        if (found) { observer.disconnect(); clearTimeout(timer); resolve(found); }
      });
      const timer = setTimeout(() => { observer.disconnect(); resolve(null); }, timeout);
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  waitForClick(selector, advance, nextStateSelector = null) {
    const handler = (event) => {
      if (!event.target.closest(selector)) return;
      if (nextStateSelector) {
        this.waitForElement(nextStateSelector).then((found) => { if (found) advance(); });
      } else {
        setTimeout(() => advance(), 0);
      }
    };
    this.listen(document, 'click', handler, true);
  }

  next() {
    switch (this.step) {
      case 0:
        this.show({ title: 'You have a few minutes before your OPD starts.', body: 'An idea comes to you. You could write it down and forget it — or turn it into a useful video. Let’s follow one idea all the way through. This guide can be moved anytime: drag its top bar if it is covering something.', primary: 'Start the story', onPrimary: () => { this.step++; this.next(); }, back: false });
        break;
      case 1:
        this.show({ title: 'Here is the path we will follow.', body: 'One idea becomes a boundary, clear requirements, scripts, trial reels, a performance check, and eventually a winning reel.', primary: 'Show me', diagram: '<div class="tutorial-flow">Idea <b>→</b> Scripts <b>→</b> Trial reels <b>→</b> Performance <b>→</b> Winning reel</div>' });
        break;
      case 2:
        this.show({ title: 'Start here when you have an idea.', body: 'Record Insight is for an idea you want to develop into content. Tap the real button now.', target: '#header-btn-insight', back: true });
        this.waitForClick('#header-btn-insight', () => { this.step++; this.next(); }, '#insight-title');
        break;
      case 3: {
        const fill = () => {
          document.getElementById('insight-title').value = FATIGUE_TITLE;
          document.getElementById('insight-title').dispatchEvent(new Event('input', { bubbles: true }));
          this.step++; this.next();
        };
        this.show({ title: 'First, capture the core idea.', body: 'It does not need to be a perfect script. It is simply what you want to talk about. Use this example to fill the real field.', target: '#insight-title', primary: 'Use this example', onPrimary: fill });
        break;
      }
      case 4: {
        const fill = () => {
          document.getElementById('insight-details').value = FATIGUE_DETAILS;
          document.getElementById('insight-details').dispatchEvent(new Event('input', { bubbles: true }));
          this.step++; this.next();
        };
        this.show({ title: 'Now set the boundary.', body: 'Say what the video should and should not cover. This keeps the advice focused and safe. Use the example boundary for this fatigue topic.', target: '#insight-details', primary: 'Use example boundary', onPrimary: fill });
        break;
      }
      case 5:
        this.show({ title: 'Choose your video preferences.', body: 'Pick the language your audience understands and the length you want. You can also add a call to action or a direction such as “start with a strong hook and keep the tone reassuring.”', target: '#insight-language', primary: 'Continue' });
        break;
      case 6:
        this.show({ title: 'Ready to turn the idea into instructions?', body: 'Content Mate will prepare instructions that help an AI write engaging scripts. Tap the real button when you are ready.', target: '#btn-generate-prompt' });
        this.waitForClick('#btn-generate-prompt', () => { this.step++; this.next(); }, '#generated-prompt-box');
        break;
      case 7:
        this.show({ title: 'Content Mate has written the instructions for you.', body: 'Just tap Copy. You do not need to understand what is inside this box.', target: '#btn-copy-prompt-hero', primary: 'I copied it' });
        break;
      case 8:
        this.show({ title: 'Now give those instructions to an AI.', body: 'Open ChatGPT (or your preferred AI), paste the instructions, and copy its whole response. It may look like mumbo jumbo — no need to read it. Come back and paste it here.', target: 'a[href="https://chatgpt.com"]', primary: 'I have the AI response' });
        break;
      case 9:
        this.show({ title: 'Bring the AI response back into Content Mate.', body: 'Tap this real button. In this guided practice, we will use a ready-made fatigue response so you can continue through the actual review workflow.', target: '#btn-proceed-to-import' });
        this.waitForClick('#btn-proceed-to-import', () => { this.step++; this.next(); }, '#ai-pasted-text');
        break;
      case 10: {
        const fill = () => { const box = document.getElementById('ai-pasted-text'); box.value = JSON.stringify(FATIGUE_RESPONSE, null, 2); box.dispatchEvent(new Event('input', { bubbles: true })); this.step++; this.next(); };
        this.show({ title: 'Paste the AI response here.', body: 'The AI has organised the idea into scripts. If Content Mate says something is missing, copy that message back to the AI and ask it to fix the response, then paste it again.', target: '#ai-pasted-text', primary: 'Use practice response', onPrimary: fill });
        break;
      }
      case 11:
        this.show({ title: 'Turn the response into your script options.', body: 'Tap the real button. Content Mate will read the response and create individual scripts for review.', target: '#btn-submit-import' });
        this.waitForClick('#btn-submit-import', () => { this.step++; this.next(); }, '#btn-card-accept');
        break;
      case 12:
        this.show({ title: 'Choose what moves forward.', body: 'These are different possible videos from the same fatigue idea. Keep one by accepting it. Then reject one you do not want, and save one for later.', target: '#btn-card-accept' });
        this.waitForClick('#btn-card-accept', () => this.waitRejectLater(), '#btn-card-reject');
        break;
      case 13:
        this.show({ title: 'Test before you commit.', body: 'An accepted script is scheduled as a trial reel. After you post it, Content Mate asks you to enter its performance after three days. Compare trial reels from the same idea, choose the best one, and schedule it as your main reel.', target: '#nav-d-schedule', primary: 'Open my schedule', diagram: '<div class="tutorial-flow">Trial reel <b>→</b> 3-day check <b>→</b> Compare <b>→</b> Main reel</div>' , onPrimary: async () => { await this.app.navigateTo('schedule'); this.step++; this.next(); }});
        break;
      case 14:
        this.show({ title: 'This is where your trial reel is planned.', body: 'All accepted scripts are trials first. When it is posted, enter the performance information yourself after three days — Content Mate does not automatically read Instagram results.', target: '.schedule-header', primary: 'See my daily checklist', onPrimary: () => this.showDashboardAndNotes() });
        break;
      default: this.showDashboardAndNotes();
    }
  }

  waitRejectLater() {
    // The acceptance has rendered the next card. Let the doctor make both remaining decisions.
    this.show({ title: 'Now reject one option.', body: 'Not every script will feel right. Tap Reject on this real card.', target: '#btn-card-reject' });
    this.waitForClick('#btn-card-reject', () => {
      this.show({ title: 'Keep the last one for another day.', body: 'Tap Later. It stays in your Content Library, but leaves today’s review queue.', target: '#btn-card-later' });
      this.waitForClick('#btn-card-later', () => { this.step = 13; this.next(); });
    }, '#btn-card-later');
  }

  async showDashboardAndNotes() {
    await this.app.navigateTo('dashboard');
    this.show({ title: 'That’s Content Mate.', body: 'Your Dashboard is your daily checklist for filming, posting, and feedback. When you only have a quick thought, use Quick Note — the fast lane. Record Insight is for ideas you want to develop now. Capture an idea → shape it → generate scripts → review them → test them → learn what works → repeat.', target: '#header-btn-note', primary: 'Finish', onPrimary: () => this.finish(false), diagram: '<div class="tutorial-flow">Quick Note = save a thought <b>•</b> Record Insight = build content</div>' });
  }
}
