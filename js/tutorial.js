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

  async start() {
    // Snapshot the workspace before any tutorial actions so every script
    // created during this session can be removed reliably, even if it becomes
    // orphaned or is linked differently by a future workflow change.
    const [initialScripts, initialInsights] = await Promise.all([db.getScripts(), db.getInsights()]);
    this.tutorialInitialScriptIds = new Set(initialScripts.map((script) => script.id));
    this.tutorialInitialInsightIds = new Set(initialInsights.map((insight) => insight.id));
    this.cleanup();
    this.step = 0;
    this.completed = false;
    this.root = document.createElement('div');
    this.root.className = 'workflow-tutorial';
    this.root.innerHTML = '<div class="workflow-tutorial-shade"></div><div class="workflow-tutorial-ring"></div><section class="workflow-tutorial-card tutorial-centered" role="dialog" aria-live="polite"></section>';
    document.body.appendChild(this.root);
    this.card = this.root.querySelector('.workflow-tutorial-card');
    this.makeCardMovable();
    
    // Add resize listener to reposition card
    this.resizeHandler = () => {
      const target = document.querySelector('.workflow-tutorial-target');
      if (target && target.isConnected && !this.card.classList.contains('tutorial-centered')) {
        const rect = target.getBoundingClientRect();
        this.positionCardAwayFromTarget(rect);
      }
    };
    this.listen(window, 'resize', this.resizeHandler);
    
    this.next();
  }

  cleanup() {
    this.handlers.forEach(([target, type, fn, options]) => target.removeEventListener(type, fn, options));
    this.handlers = [];
    document.querySelectorAll('.workflow-tutorial-target').forEach((node) => node.classList.remove('workflow-tutorial-target'));
    document.querySelectorAll('.workflow-tutorial-host').forEach((node) => node.classList.remove('workflow-tutorial-host'));
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
      // Don't start dragging if clicking on a button
      if (event.target.closest('button')) return;
      const rect = this.card.getBoundingClientRect();
      drag = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      this.card.setPointerCapture(event.pointerId);
      this.card.classList.add('is-dragging');
      this.card.style.transition = 'none';
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
    const stopDragging = () => {
      drag = null;
      this.card.classList.remove('is-dragging');
      this.card.style.transition = 'none';
    };
    this.card.addEventListener('pointerup', stopDragging);
    this.card.addEventListener('pointercancel', stopDragging);
    
    // Add global click handler for exit button
    this.card.addEventListener('click', (event) => {
      if (event.target.classList.contains('tutorial-exit-btn') || event.target.closest('.tutorial-exit-btn')) {
        event.preventDefault();
        event.stopPropagation();
        if (confirm('Are you sure you want to exit the tutorial? You can restart it anytime from Settings.')) {
          this.finish(true);
        }
      }
    });
  }

  async finish(skipped = false) {
    const profile = await db.getProfile();
    const initialScriptIds = this.tutorialInitialScriptIds || new Set();
    const sessionScripts = (await db.getScripts()).filter((script) => !initialScriptIds.has(script.id));
    for (const script of sessionScripts) await db.deleteScript(script.id);
    // Remove tutorial-created practice insights and any associated reels.
    const initialInsightIds = this.tutorialInitialInsightIds || new Set();
    const tutorialInsights = (await db.getInsights()).filter((insight) => !initialInsightIds.has(insight.id) && insight.title === FATIGUE_TITLE);
    for (const insight of tutorialInsights) {
      const reels = (await db.getScheduledReels()).filter((reel) => reel.insight_id === insight.id);
      for (const reel of reels) await db.deleteScheduledReel(reel.id);
      await db.deleteInsight(insight.id);
    }
    await db.saveProfile({ ...profile, tutorialSeen: true, tutorialSkipped: skipped, onboarded: true });
    this.completed = true;
    this.cleanup();
    showToast(skipped ? 'Tutorial closed. You can replay it from Doctor Profile.' : 'You are ready to use Content Mate.', 'success');
  }

  show({ eyebrow = 'Your first workflow', title, body, target, additionalTargets = [], primary, onPrimary, back = true, diagram = '', centered = false, showBlackScreen = true }) {
    this.handlers.forEach(([node, type, fn, options]) => node.removeEventListener(type, fn, options));
    this.handlers = [];
    document.querySelectorAll('.workflow-tutorial-target').forEach((node) => node.classList.remove('workflow-tutorial-target'));
    document.querySelectorAll('.workflow-tutorial-host').forEach((node) => node.classList.remove('workflow-tutorial-host'));
    
    // Support multiple targets (for desktop + mobile highlighting)
    const allTargets = target ? [target, ...additionalTargets] : additionalTargets;
    let mainTargetNode = null;
    
    if (allTargets.length > 0) {
      this.root.classList.add('has-target');
      this.root.querySelector('.workflow-tutorial-ring')?.style.removeProperty('display');
      
      // Add highlight class to all targets
      allTargets.forEach(selector => {
        const nodes = document.querySelectorAll(selector);
        nodes.forEach(node => {
          if (node && node.isConnected) {
            node.classList.add('workflow-tutorial-target');
            node.closest('.flashcard')?.classList.add('workflow-tutorial-host');
            if (!mainTargetNode) mainTargetNode = node;
          }
        });
      });
      
      // Scroll to first visible target
      if (mainTargetNode) {
        // Measure the target after its final device-specific layout, rather than
        // while smooth scrolling is still moving it.
        mainTargetNode.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
        requestAnimationFrame(() => this.positionTarget(mainTargetNode));
      }
    } else {
      this.root.classList.remove('has-target');
      this.root.querySelector('.workflow-tutorial-ring')?.style.setProperty('display', 'none');
      // Set default position when no target
      if (!centered) {
        const bottomNavHeight = window.innerWidth < 860 ? 68 : 0;
        this.card.style.right = window.innerWidth < 640 ? '16px' : 'clamp(16px, 5vw, 64px)';
        this.card.style.bottom = window.innerWidth < 640 ? `${bottomNavHeight + 16}px` : '24px';
        this.card.style.left = 'auto';
        this.card.style.top = 'auto';
      }
    }
    
    // Handle centering
    this.card.classList.toggle('tutorial-centered', centered);
    
    // Reset positioning for centered cards
    if (centered) {
      this.card.style.left = '';
      this.card.style.right = '';
      this.card.style.top = '';
      this.card.style.bottom = '';
      this.card.style.transform = '';
    }
    
    // Show an instruction when there's a target but no primary button
    const showLookButton = allTargets.length > 0 && !primary;
    
    // Control black screen visibility
    const shade = this.root.querySelector('.workflow-tutorial-shade');
    if (shade) {
      if (showBlackScreen && !showLookButton && !primary?.includes('Use example') && !primary?.includes('Got it')) {
        shade.classList.add('active');
      } else {
        shade.classList.remove('active');
      }
    }
    
    this.card.innerHTML = `
      <div class="workflow-tutorial-top workflow-tutorial-grab">
        <span>${eyebrow}</span>
        <button class="btn btn-ghost btn-sm tutorial-exit-btn" type="button">Exit tutorial</button>
        <span>${Math.min(this.step + 1, 18)} / 18</span>
      </div>
      <h2>${title}</h2><p>${body}</p>${diagram}
      <div class="workflow-tutorial-actions">${back && this.step > 0 ? '<button class="btn btn-ghost btn-sm" data-tutorial-back>Back</button>' : '<span></span>'}<div>${primary ? `<button class="btn btn-primary btn-sm" data-tutorial-next>${primary}</button>` : showLookButton ? `<button class="btn btn-primary btn-sm tutorial-no-animation" data-tutorial-look disabled>Press blue highlighted button</button><button class="btn btn-ghost btn-sm tutorial-failsafe-next" data-tutorial-failsafe>Next</button>` : ''}</div></div>`;
    
    // Attach event listeners using direct DOM references
    const exitBtn = this.card.querySelector('.tutorial-exit-btn');
    if (exitBtn) {
      const exitHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Are you sure you want to exit the tutorial? You can restart it anytime from Settings.')) {
          this.finish(true);
        }
      };
      this.listen(exitBtn, 'click', exitHandler);
    }
    
    const backBtn = this.card.querySelector('[data-tutorial-back]');
    if (backBtn) {
      const backHandler = () => { this.step = Math.max(0, this.step - 1); this.next(); };
      this.listen(backBtn, 'click', backHandler);
    }
    
    const nextBtn = this.card.querySelector('[data-tutorial-next]');
    if (nextBtn) {
      const nextHandler = onPrimary || (() => { this.step++; this.next(); });
      this.listen(nextBtn, 'click', nextHandler);
    }
    
    const failsafeBtn = this.card.querySelector('[data-tutorial-failsafe]');
    if (failsafeBtn) {
      const failsafeHandler = () => { this.step++; this.next(); };
      this.listen(failsafeBtn, 'click', failsafeHandler);
    }
  }

  positionTarget(node) {
    if (!this.root || !node.isConnected) return;
    const rect = node.getBoundingClientRect();
    const ring = this.root.querySelector('.workflow-tutorial-ring');
    ring.style.cssText = `left:${Math.max(6, rect.left - 7)}px;top:${Math.max(6, rect.top - 7)}px;width:${rect.width + 14}px;height:${rect.height + 14}px;`;
    
    // Position tutorial card to avoid covering the target
    this.positionCardAwayFromTarget(rect);
  }

  positionCardAwayFromTarget(targetRect) {
    if (!this.card || this.card.classList.contains('tutorial-centered')) return;
    
    // Get fresh measurements
    const cardRect = this.card.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;
    const bottomNavHeight = window.innerWidth < 860 ? 68 : 0;
    
    // Calculate available space in each direction
    const spaceLeft = targetRect.left;
    const spaceRight = viewportWidth - targetRect.right;
    const spaceTop = targetRect.top;
    const spaceBottom = viewportHeight - targetRect.bottom - bottomNavHeight;
    
    // Determine best position
    let newLeft, newTop, newRight, newBottom;
    
    // On mobile, prefer top/bottom positioning
    const isMobile = viewportWidth < 640;
    
    if (isMobile) {
      // Mobile: position above or below, spanning most of the width
      if (spaceBottom > cardRect.height + padding * 2) {
        // Position below
        newTop = Math.max(padding, Math.min(targetRect.bottom + padding, viewportHeight - cardRect.height - padding - bottomNavHeight));
        newBottom = 'auto';
        newLeft = padding;
        newRight = 'auto';
      } else if (spaceTop > cardRect.height + padding * 2) {
        // Position above
        newTop = Math.max(padding, targetRect.top - cardRect.height - padding);
        newBottom = 'auto';
        newLeft = padding;
        newRight = 'auto';
      } else {
        // Default mobile position if no good space
        newLeft = padding;
        newRight = 'auto';
        newTop = Math.max(padding, Math.min(padding, viewportHeight - cardRect.height - padding - bottomNavHeight));
        newBottom = 'auto';
      }
    } else {
      // Desktop: try horizontal first, then vertical
      if (spaceRight > cardRect.width + padding * 2) {
        // Position to the right
        newLeft = Math.min(targetRect.right + padding, viewportWidth - cardRect.width - padding);
        newRight = 'auto';
        // Center vertically relative to target
        newTop = Math.max(padding, Math.min(
          targetRect.top + (targetRect.height / 2) - (cardRect.height / 2),
          viewportHeight - cardRect.height - padding - bottomNavHeight
        ));
        newBottom = 'auto';
      } else if (spaceLeft > cardRect.width + padding * 2) {
        // Position to the left
        newLeft = Math.max(padding, targetRect.left - cardRect.width - padding);
        newRight = 'auto';
        // Center vertically relative to target
        newTop = Math.max(padding, Math.min(
          targetRect.top + (targetRect.height / 2) - (cardRect.height / 2),
          viewportHeight - cardRect.height - padding - bottomNavHeight
        ));
        newBottom = 'auto';
      } else {
        // Position vertically (above or below target)
        if (spaceBottom > spaceTop && spaceBottom > cardRect.height + padding) {
          // Position below
          newTop = Math.max(padding, Math.min(targetRect.bottom + padding, viewportHeight - cardRect.height - padding - bottomNavHeight));
          newBottom = 'auto';
        } else if (spaceTop > cardRect.height + padding) {
          // Position above
          newTop = Math.max(padding, Math.min(targetRect.top - cardRect.height - padding, viewportHeight - cardRect.height - padding - bottomNavHeight));
          newBottom = 'auto';
        } else {
          // Default position if no good space (bottom right but constrained)
          newRight = padding;
          newLeft = 'auto';
          newBottom = bottomNavHeight + padding;
          newTop = 'auto';
        }
        
        // For vertical positioning, try to align horizontally
        if (newTop !== undefined || newBottom !== undefined) {
          if (spaceRight > spaceLeft) {
            newLeft = Math.max(padding, Math.min(targetRect.left, viewportWidth - cardRect.width - padding));
            newRight = 'auto';
          } else {
            newLeft = Math.max(padding, Math.min(targetRect.right - cardRect.width, viewportWidth - cardRect.width - padding));
            newRight = 'auto';
          }
        }
      }
    }
    
    // Final boundary checks to ensure the card stays within viewport
    if (newLeft !== 'auto' && newLeft !== undefined) {
      newLeft = Math.max(padding, Math.min(newLeft, viewportWidth - cardRect.width - padding));
    }
    if (newTop !== 'auto' && newTop !== undefined) {
      newTop = Math.max(padding, Math.min(newTop, viewportHeight - cardRect.height - padding - bottomNavHeight));
    }
    
    // Apply positioning with smooth transition
    if (!this.card.classList.contains('is-dragging')) this.card.style.transition = 'all 0.3s ease';
    this.card.style.left = newLeft === 'auto' ? 'auto' : `${newLeft}px`;
    this.card.style.right = newRight === 'auto' ? 'auto' : `${newRight}px`;
    this.card.style.top = newTop === 'auto' ? 'auto' : `${newTop}px`;
    this.card.style.bottom = newBottom === 'auto' ? 'auto' : `${newBottom}px`;
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
          body: 'I will help you script, schedule, and evaluate your content.', 
          primary: 'Show me how', 
          onPrimary: () => { 
            this.card.classList.remove('tutorial-centered');
            this.step++; 
            this.next(); 
          }, 
          back: false,
          centered: true,
          showBlackScreen: true
        });
        break;
      case 1:
        this.show({ 
          title: 'I am draggable!', 
          body: 'You can drag this box around if I come in between. Grab anywhere on the box (except a button).',
          primary: 'Got it',
          showBlackScreen: true
        });
        break;
      case 2:
        this.show({ 
          title: 'You have a clinical insight', 
          body: 'Scripting it as one video? Risky. Instagram is a numbers game.', 
          primary: 'So what do we do?'
        });
        break;
      case 3:
        this.show({ 
          title: 'I package it in different formats', 
          body: 'You review scripts - accept a few, reject others. Accepted ones become trial reels on your calendar.', 
          primary: 'Then what?' 
        });
        break;
      case 4:
        this.show({ 
          title: 'After 3 days, we see what worked', 
          body: 'I turn the best performer into your main reel. I script, schedule, and evaluate for you.', 
          primary: 'Lets get started' 
        });
        break;
      case 5:
        this.show({ 
          title: 'Tap Record Idea when you have an idea',
          body: 'Try it now - for patient questions, observations, or any video idea.', 
          target: '#header-btn-insight',
          showBlackScreen: false
        });
        this.waitForClick('#header-btn-insight', () => { this.step++; this.next(); }, '#insight-title');
        break;
      case 6:
        this.show({ 
          title: 'Add your insight - not a full script', 
          body: 'Just the core idea.', 
          target: '#insight-title', 
          primary: 'Use example', 
          onPrimary: () => { 
            const input = document.getElementById('insight-title'); 
            input.value = FATIGUE_TITLE; 
            input.dispatchEvent(new Event('input', { bubbles: true })); 
            this.step++; 
            this.next(); 
          },
          showBlackScreen: false
        });
        break;
      case 7:
        this.show({ 
          title: 'Add key points you want covered', 
          body: 'This keeps every script accurate.', 
          target: '#insight-details', 
          primary: 'Use example', 
          onPrimary: () => { 
            const input = document.getElementById('insight-details'); 
            input.value = FATIGUE_DETAILS; 
            input.dispatchEvent(new Event('input', { bubbles: true })); 
            this.step++; 
            this.next(); 
          },
          showBlackScreen: false
        });
        break;
      case 8:
        this.show({ 
          title: 'Now I create a prompt for the AI', 
          body: 'Tap the button and I turn your insight into instructions.', 
          target: '#btn-generate-prompt',
          showBlackScreen: false
        });
        this.waitForClick('#btn-generate-prompt', () => { this.step++; this.next(); }, '#generated-prompt-box');
        break;
      case 9:
        this.show({ 
          title: 'Copy, paste in AI, bring response', 
          body: 'Copy prompt → Paste in ChatGPT/Claude → Copy response → Paste here.', 
          target: '#btn-copy-prompt-hero',
          diagram: `<div class="ai-workflow-compact">
            <div class="ai-compact-step">Copy</div>
            <div class="ai-compact-arrow">→</div>
            <div class="ai-compact-step">Paste AI</div>
            <div class="ai-compact-arrow">→</div>
            <div class="ai-compact-step">Get response</div>
            <div class="ai-compact-arrow">→</div>
            <div class="ai-compact-step">Paste here</div>
          </div>`,
          showBlackScreen: false
        });
        this.waitForClick('#btn-copy-prompt-hero', () => { this.step++; this.next(); });
        break;
      case 10:
        this.show({ 
          title: 'Paste prompt in ChatGPT', 
          body: 'Copy AI response and come back. For this walkthrough, we will use a practice response.', 
          primary: 'Lets use an example'
        });
        break;
      case 11:
        this.show({ 
          title: 'Paste the complete AI response here', 
          body: 'Dont edit it - I will convert it into scripts.', 
          target: '#btn-proceed-to-import',
          showBlackScreen: false
        });
        this.waitForClick('#btn-proceed-to-import', () => { this.step++; this.next(); }, '#ai-pasted-text');
        break;
      case 12:
        this.show({ 
          title: 'Paste in this box', 
          body: 'Lets use a practice response for now.', 
          target: '#ai-pasted-text', 
          primary: 'Use example', 
          onPrimary: () => { 
            const input = document.getElementById('ai-pasted-text'); 
            input.value = JSON.stringify(FATIGUE_RESPONSE, null, 2); 
            input.dispatchEvent(new Event('input', { bubbles: true })); 
            this.step++; 
            this.next(); 
          },
          showBlackScreen: false
        });
        break;
      case 13:
        this.show({ 
          title: 'Now I create your script options', 
          body: 'Tap the button and I separate the response into scripts.', 
          target: '#btn-submit-import',
          showBlackScreen: false
        });
        this.waitForClick('#btn-submit-import', () => { this.step++; this.next(); }, '#btn-card-accept');
        break;
      case 14:
        // Wait for accept button, then show tutorial
        this.waitForElement('#btn-card-accept').then(() => {
          this.show({ 
            title: 'Different video formats from one insight', 
            body: 'Accept the format you want to keep. Press Accept on this card to continue.',
            showBlackScreen: false
          });
          this.waitForClick('#btn-card-accept', () => {
            // Wait for next card's reject button
            this.waitForElement('#btn-card-reject').then(() => {
              this.show({ 
                title: 'Great! Now reject one', 
                body: 'Not every format fits your style. Press Reject on this card to continue.',
                showBlackScreen: false
              });
              this.waitForClick('#btn-card-reject', () => {
                // Wait for last card's later button
                this.waitForElement('#btn-card-later').then(() => {
                  this.show({ 
                    title: 'Save the last one for later', 
                    body: 'Keep this one for later. Press Later on this card to continue.',
                    showBlackScreen: false
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
          title: 'Accepted scripts become trial reels', 
          body: 'I schedule them. After 3 days, you add performance data and I help pick the winner.', 
          target: '#nav-d-schedule',
          additionalTargets: ['#bnav-schedule'],
          showBlackScreen: false
        });
        this.waitForClick('#nav-d-schedule', async () => { await this.app.navigateTo('schedule'); this.step++; this.next(); });
        this.waitForClick('#bnav-schedule', async () => { await this.app.navigateTo('schedule'); this.step++; this.next(); });
        break;
      case 16:
        this.show({ 
          title: 'Your trial reels are planned here', 
          body: 'After posting, enter results yourself after 3 days.', 
          target: '#nav-d-dashboard',
          additionalTargets: ['#bnav-dashboard'],
          showBlackScreen: false
        });
        this.waitForClick('#nav-d-dashboard', () => this.showDashboardAndNotes());
        this.waitForClick('#bnav-dashboard', () => this.showDashboardAndNotes());
        break;
      case 17:
        this.show({ 
          title: 'Quick Notes for busy moments', 
          body: 'Tap here to add a quick note. Later, access from Notes and convert it to scripts.', 
          target: '#header-btn-note',
          showBlackScreen: false
        });
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
        this.show({ 
          title: 'Lets get started!', 
          body: 'Ready to script your first few scripts?', 
          primary: 'Lets go', 
          onPrimary: () => this.finish(false), 
          back: false, 
          centered: true,
          showBlackScreen: false
        });
        break;
      default:
        this.showDashboardAndNotes();
    }
  }

  async showDashboardAndNotes() {
    await this.app.navigateTo('dashboard');
    this.show({ 
      title: 'No need to feel overwhelmed!', 
      body: 'I will tell you daily what needs attention. This is your control center.', 
      primary: 'Got it', 
      onPrimary: () => { this.step = 17; this.next(); },
      showBlackScreen: false
    });
  }
}
