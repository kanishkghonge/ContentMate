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
    this.root.innerHTML = '<div class="workflow-tutorial-shade"></div><div class="workflow-tutorial-ring"></div><section class="workflow-tutorial-card tutorial-centered" role="dialog" aria-live="polite"></section>';
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

  show({ eyebrow = 'Your first workflow', title, body, target, additionalTargets = [], primary, onPrimary, back = true, diagram = '', centered = false }) {
    this.handlers.forEach(([node, type, fn, options]) => node.removeEventListener(type, fn, options));
    this.handlers = [];
    document.querySelectorAll('.workflow-tutorial-target').forEach((node) => node.classList.remove('workflow-tutorial-target'));
    
    // Support multiple targets (for desktop + mobile highlighting)
    const allTargets = target ? [target, ...additionalTargets] : additionalTargets;
    let mainTargetNode = null;
    
    if (allTargets.length > 0) {
      this.root.classList.add('has-target');
      
      // Add highlight class to all targets
      allTargets.forEach(selector => {
        const nodes = document.querySelectorAll(selector);
        nodes.forEach(node => {
          if (node && node.isConnected) {
            node.classList.add('workflow-tutorial-target');
            node.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center', inline: 'center' });
            if (!mainTargetNode) mainTargetNode = node;
          }
        });
      });
      
      // Position ring on first visible target
      if (mainTargetNode) {
        requestAnimationFrame(() => this.positionTarget(mainTargetNode));
      }
    } else {
      this.root.classList.remove('has-target');
    }
    
    // Handle centering
    this.card.classList.toggle('tutorial-centered', centered);
    
    // Show "Look blue highlighted button" when there's a target but no primary button
    const showLookButton = allTargets.length > 0 && !primary;
    
    this.card.innerHTML = `
      <div class="workflow-tutorial-top workflow-tutorial-grab">
        <span>${eyebrow}</span>
        <button class="btn btn-ghost btn-sm tutorial-exit-btn" data-tutorial-exit>Exit tutorial</button>
        <span>${Math.min(this.step + 1, 18)} / 18</span>
      </div>
      <h2>${title}</h2><p>${body}</p>${diagram}
      <div class="workflow-tutorial-actions">${back && this.step > 0 ? '<button class="btn btn-ghost btn-sm" data-tutorial-back>Back</button>' : '<span></span>'}<div>${primary ? `<button class="btn btn-primary btn-sm" data-tutorial-next>${primary}</button>` : showLookButton ? `<button class="btn btn-primary btn-sm tutorial-no-animation" data-tutorial-look disabled>Look blue highlighted button</button><button class="btn btn-ghost btn-sm tutorial-failsafe-next" data-tutorial-failsafe>Next</button>` : ''}</div></div>`;
    
    const exitBtn = this.card.querySelector('[data-tutorial-exit]');
    if (exitBtn) {
      this.listen(exitBtn, 'click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.finish(true);
      });
    }
    
    const backBtn = this.card.querySelector('[data-tutorial-back]');
    if (backBtn) {
      this.listen(backBtn, 'click', () => { this.step = Math.max(0, this.step - 1); this.next(); });
    }
    
    const nextBtn = this.card.querySelector('[data-tutorial-next]');
    if (nextBtn) {
      this.listen(nextBtn, 'click', onPrimary || (() => { this.step++; this.next(); }));
    }
    
    const failsafeBtn = this.card.querySelector('[data-tutorial-failsafe]');
    if (failsafeBtn) {
      this.listen(failsafeBtn, 'click', () => { this.step++; this.next(); });
    }
  }

  positionTarget(node) {
    if (!this.root || !node.isConnected) return;
    const rect = node.getBoundingClientRect();
    const ring = this.root.querySelector('.workflow-tutorial-ring');
    ring.style.cssText = `left:${Math.max(6, rect.left - 7)}px;top:${Math.max(6, rect.top - 7)}px;width:${rect.width + 14}px;height:${rect.height + 14}px;`;
  }

  positionMultipleTargets(selectors) {
    // Remove existing highlights
    document.querySelectorAll('.workflow-tutorial-target').forEach((node) => node.classList.remove('workflow-tutorial-target'));
    
    // Add highlights to all matching elements
    selectors.forEach(selector => {
      const nodes = document.querySelectorAll(selector);
      nodes.forEach(node => {
        if (node && node.isConnected) {
          node.classList.add('workflow-tutorial-target');
        }
      });
    });
    
    // Position ring on the first visible element
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (node && node.isConnected && node.offsetParent !== null) {
        this.positionTarget(node);
        break;
      }
    }
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
        this.show({ 
          eyebrow: 'Welcome', 
          title: 'Hi, I am Content Mate - your social media intern', 
          body: 'Let me show you how we are going to be working together. I will help you script, schedule, and evaluate your content.', 
          primary: 'Show me how', 
          onPrimary: () => { 
            this.card.classList.remove('tutorial-centered');
            this.step++; 
            this.next(); 
          }, 
          back: false,
          centered: true 
        });
        break;
      case 1:
        this.show({ 
          title: 'I am draggable!', 
          body: 'You can drag this box around if I come in between. Just grab me from the top bar and move me wherever you like.', 
          primary: 'Got it'
        });
        break;
      case 2:
        this.show({ title: 'Lets say you have a great clinical insight or video idea.', body: 'Scripting that as one video? Thats risky. It might perform, it might not. Instagram is a numbers game now.', primary: 'So what do we do?' });
        break;
      case 3:
        this.show({ title: 'I will take that insight and package it as different video scripts.', body: 'You review those scripts - accept a few, reject a few. Accepted ones get scheduled as trial reels on your calendar.', primary: 'Then what?' });
        break;
      case 4:
        this.show({ title: 'After 3 days, when we know which format performed best...', body: 'I will turn it into your main reel to post again. Basically, I script, schedule, and evaluate your content for you.', primary: 'Lets get started' });
        break;
      case 5:
        this.show({ title: 'Tap Record Insight when you have an idea.', body: 'Try it now. This is for patient questions, clinical observations, or any video idea you want to develop.', target: '#header-btn-insight' });
        this.waitForClick('#header-btn-insight', () => { this.step++; this.next(); }, '#insight-title');
        break;
      case 6:
        this.show({ title: 'Add your insight - not a full script.', body: 'Just the core idea. I will handle the packaging.', target: '#insight-title', primary: 'Use example', onPrimary: () => { const input = document.getElementById('insight-title'); input.value = FATIGUE_TITLE; input.dispatchEvent(new Event('input', { bubbles: true })); this.step++; this.next(); } });
        break;
      case 7:
        this.show({ title: 'Add the key points you want covered.', body: 'This keeps every script accurate and focused.', target: '#insight-details', primary: 'Use example', onPrimary: () => { const input = document.getElementById('insight-details'); input.value = FATIGUE_DETAILS; input.dispatchEvent(new Event('input', { bubbles: true })); this.step++; this.next(); } });
        break;
      case 8:
        this.show({ title: 'Now I will create a prompt for the AI.', body: 'Tap the button and I will turn your insight into instructions an AI can use.', target: '#btn-generate-prompt' });
        this.waitForClick('#btn-generate-prompt', () => { this.step++; this.next(); }, '#generated-prompt-box');
        break;
      case 9:
        this.show({ 
          title: 'Copy prompt, paste in AI, bring back response', 
          body: 'Copy the prompt below, paste it into ChatGPT or Claude, then copy the AI response and bring it back here.', 
          target: '#btn-copy-prompt-hero',
          diagram: `<div class="ai-workflow-compact">
            <div class="ai-compact-step">1. Copy</div>
            <div class="ai-compact-arrow">→</div>
            <div class="ai-compact-step">2. Paste in AI</div>
            <div class="ai-compact-arrow">→</div>
            <div class="ai-compact-step">3. Get response</div>
            <div class="ai-compact-arrow">→</div>
            <div class="ai-compact-step">4. Paste here</div>
          </div>`
        });
        this.waitForClick('#btn-copy-prompt-hero', () => { this.step++; this.next(); });
        break;
      case 10:
        this.show({ title: 'Go paste the prompt into ChatGPT or any AI.', body: 'Copy the AI response and come back here. For this walkthrough, we will use a practice response.', primary: 'I have the AI response' });
        break;
      case 11:
        this.show({ title: 'Paste the complete AI response here.', body: 'Dont edit it - I will convert it into individual scripts for you to review.', target: '#btn-proceed-to-import' });
        this.waitForClick('#btn-proceed-to-import', () => { this.step++; this.next(); }, '#ai-pasted-text');
        break;
      case 12:
        this.show({ title: 'Paste it in this box.', body: 'If something is missing, ask the AI to fix it and paste again. Lets use a practice response for now.', target: '#ai-pasted-text', primary: 'Use practice response', onPrimary: () => { const input = document.getElementById('ai-pasted-text'); input.value = JSON.stringify(FATIGUE_RESPONSE, null, 2); input.dispatchEvent(new Event('input', { bubbles: true })); this.step++; this.next(); } });
        break;
      case 13:
        this.show({ title: 'Now I will create your script options.', body: 'Tap the button and I will separate the response into individual scripts.', target: '#btn-submit-import' });
        this.waitForClick('#btn-submit-import', () => { this.step++; this.next(); }, '#btn-card-accept');
        break;
      case 14:
        // Wait for accept button, then show tutorial
        this.waitForElement('#btn-card-accept').then(() => {
          this.show({ 
            title: 'These are different video formats from the same insight.', 
            body: 'Accept the ones you like, reject the ones you dont. Try accepting this one.', 
            target: '#btn-card-accept' 
          });
          this.waitForClick('#btn-card-accept', () => {
            // Wait for next card's reject button
            this.waitForElement('#btn-card-reject').then(() => {
              this.show({ 
                title: 'Great! Now reject one.', 
                body: 'Not every format will fit your style.', 
                target: '#btn-card-reject' 
              });
              this.waitForClick('#btn-card-reject', () => {
                // Wait for last card's later button
                this.waitForElement('#btn-card-later').then(() => {
                  this.show({ 
                    title: 'Save the last one for later.', 
                    body: 'It stays in your library but leaves todays queue.', 
                    target: '#btn-card-later' 
                  });
                  this.waitForClick('#btn-card-later', () => { this.step = 15; this.next(); });
                });
              }, '#btn-card-later');
            });
          }, '#btn-card-reject');
        });
        break;
      case 15:
        this.show({ 
          title: 'Accepted scripts become trial reels.', 
          body: 'I schedule them on your calendar. After 3 days, you add the performance data and I help you pick the winner.', 
          target: '#nav-d-schedule',
          additionalTargets: ['#bnav-schedule']
        });
        this.waitForClick('#nav-d-schedule', async () => { await this.app.navigateTo('schedule'); this.step++; this.next(); });
        this.waitForClick('#bnav-schedule', async () => { await this.app.navigateTo('schedule'); this.step++; this.next(); });
        break;
      case 16:
        this.show({ 
          title: 'Your trial reels are planned here.', 
          body: 'After posting, enter the results yourself after 3 days - I dont auto-read Instagram, but I make the decision clear once you add the numbers.', 
          target: '#nav-d-dashboard',
          additionalTargets: ['#bnav-dashboard']
        });
        this.waitForClick('#nav-d-dashboard', () => this.showDashboardAndNotes());
        this.waitForClick('#bnav-dashboard', () => this.showDashboardAndNotes());
        break;
      case 17:
        this.show({ title: 'One last thing - Quick Notes for busy moments.', body: 'If you get an idea but dont have time, tap here to add a quick note. Later, access it from Notes and convert it to a full insight and scripts.', target: '#header-btn-note' });
        this.waitForClick('#header-btn-note', async () => { 
          // Wait for modal to open
          await this.waitForElement('#modal-input-note');
          // Close the modal
          this.app.closeModal();
          // Move to final step
          this.step++; 
          this.next(); 
        }, '#modal-input-note');
        break;
      case 18:
        this.show({ title: 'Lets get started!', body: 'Lets try scripting our first few scripts. Ready whenever you are!', primary: 'Lets go', onPrimary: () => this.finish(false), back: false, centered: true });
        break;
      default:
        this.showDashboardAndNotes();
    }
  }

  async showDashboardAndNotes() {
    await this.app.navigateTo('dashboard');
    this.show({ title: 'No need to feel overwhelmed!', body: 'I will tell you daily what needs attention so you can tick things off in a structured way. This is your control center.', target: '.card-hero', primary: 'Got it', onPrimary: () => { this.step = 17; this.next(); } });
  }
}
