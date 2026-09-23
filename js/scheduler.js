/**
 * Content OS for Doctors — Intelligent Auto-Scheduler
 * Balances content formats and medical topics across calendar days.
 * Randomly orders an incoming queue and evenly fills the next calendar days.
 */

import { db } from './db.js';
import { scriptFormats, getFormatById } from './formats.js';
import { uuidv4, addDays, formatDateForInput, getSystemDate } from './utils.js';

/**
 * Returns an array of target posting dates starting from startDate,
 * matching the doctor's posting schedule (e.g. Mon/Wed/Fri or Daily).
 */
export function getNextPostingDates(startDate, count, postingDays = ['Mon', 'Wed', 'Fri']) {
  const dates = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const allowAllDays = !postingDays || postingDays.length === 0 || postingDays.includes('Daily');

  let safetyCount = 0;
  while (dates.length < count && safetyCount < 365) {
    const dayName = dayNames[current.getDay()];

    if (allowAllDays || postingDays.includes(dayName)) {
      dates.push(formatDateForInput(current));
    }
    current.setDate(current.getDate() + 1);
    safetyCount++;
  }

  return dates;
}

/**
 * Returns every available posting slot inside a real calendar-day window.
 * This differs from getNextPostingDates(): a 14-day window means 14 calendar
 * days, not 14 Mon/Wed/Fri occurrences.
 */
function getPostingSlotsInWindow(startDate, windowDays, postingDays, maxPostsPerDay, existingCounts = {}) {
  const slots = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(addDays(current, Math.max(0, windowDays - 1)));
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const allowAllDays = !postingDays || postingDays.length === 0 || postingDays.includes('Daily');

  while (current <= end) {
    const dateStr = formatDateForInput(current);
    if (allowAllDays || postingDays.includes(dayNames[current.getDay()])) {
      const available = Math.max(0, maxPostsPerDay - (existingCounts[dateStr] || 0));
      for (let slot = 0; slot < available; slot++) slots.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }
  return slots;
}

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[i]];
  }
  return shuffled;
}

/**
 * Builds consecutive eligible-day slots for a batch. It uses the fewest days
 * allowed by the daily cap, then spreads the batch as evenly as possible. For
 * example, seven reels with a cap of three becomes 2 / 3 / 2.
 */
function getBalancedBatchSlots(startDate, itemCount, postingDays, maxPostsPerDay, existingCounts = {}) {
  if (itemCount <= 0) return [];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const allowAllDays = !postingDays || postingDays.length === 0 || postingDays.includes('Daily');
  const candidateDays = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  // Gather eligible days until their remaining capacity can hold the batch.
  let capacity = 0;
  for (let safety = 0; capacity < itemCount && safety < 365; safety++) {
    const date = formatDateForInput(current);
    if (allowAllDays || postingDays.includes(dayNames[current.getDay()])) {
      const available = Math.max(0, maxPostsPerDay - (existingCounts[date] || 0));
      if (available > 0) {
        candidateDays.push({ date, available });
        capacity += available;
      }
    }
    current.setDate(current.getDate() + 1);
  }

  const dayCount = candidateDays.length;
  const plannedCounts = Array(dayCount).fill(Math.floor(itemCount / dayCount));
  let extras = itemCount % dayCount;
  // Add extras from the centre outwards so a seven-reel batch is 2 / 3 / 2.
  const centre = Math.floor(dayCount / 2);
  const extraOrder = [centre];
  for (let offset = 1; extraOrder.length < dayCount; offset++) {
    if (centre - offset >= 0) extraOrder.push(centre - offset);
    if (centre + offset < dayCount) extraOrder.push(centre + offset);
  }
  for (const index of extraOrder) {
    if (extras-- <= 0) break;
    plannedCounts[index]++;
  }

  let remaining = itemCount;
  const assignedCounts = plannedCounts.map((planned, index) => {
    const count = Math.min(planned, candidateDays[index].available);
    remaining -= count;
    return count;
  });
  // A pinned/filmed item can leave fewer open spaces on a particular day;
  // place any overflow in the nearest later available calendar slots.
  for (let index = 0; remaining > 0 && index < candidateDays.length; index++) {
    const extraCapacity = candidateDays[index].available - assignedCounts[index];
    const count = Math.min(extraCapacity, remaining);
    assignedCounts[index] += count;
    remaining -= count;
  }

  const slots = [];
  candidateDays.forEach(({ date }, index) => {
    for (let slot = 0; slot < assignedCounts[index]; slot++) slots.push(date);
  });

  return slots;
}

/**
 * Intelligently interleaves scripts so adjacent dates have distinct formats and topics.
 */
export function balanceContentQueue(items) {
  if (!items || items.length <= 1) return items;

  const remaining = [...items];
  const balanced = [];

  // Pick first item
  balanced.push(remaining.shift());

  while (remaining.length > 0) {
    const lastItem = balanced[balanced.length - 1];
    const lastFormat = lastItem.format;
    const lastCategory = getFormatById(lastFormat).category;
    const lastInsight = lastItem.insight_id;

    // Find best candidate: different topic, different format, different category
    let bestIdx = remaining.findIndex(
      (item) => item.insight_id !== lastInsight && item.format !== lastFormat && getFormatById(item.format).category !== lastCategory
    );

    // Fallback 1: different format
    if (bestIdx === -1) {
      bestIdx = remaining.findIndex((item) => item.format !== lastFormat);
    }

    // Fallback 2: different insight
    if (bestIdx === -1) {
      bestIdx = remaining.findIndex((item) => item.insight_id !== lastInsight);
    }

    // Fallback 3: take next available
    if (bestIdx === -1) {
      bestIdx = 0;
    }

    const [chosen] = remaining.splice(bestIdx, 1);
    balanced.push(chosen);
  }

  return balanced;
}

/**
 * Core batch auto-scheduler.
 * - Preserves posted, filmed, pinned, and main reels.
 * - Reorders every other reel into an even, compact run beginning today.
 * - Enforces max posts per day limit.
 */
export async function recalculateFutureSchedule() {
  const profile = await db.getProfile();
  const allReels = await db.getScheduledReels();
  const todayStr = formatDateForInput(getSystemDate());

  const maxPostsPerDay = Math.min(3, Math.max(1, Number(profile.maxPostsPerDay) || 3));
  const postingDays = profile.postingDays || ['Daily'];

  // 1. Separate FROZEN reels from MUTABLE reels
  // Frozen: already posted, filmed, pinned, or a main reel. Past scheduled
  // items remain mutable so a new batch also catches up missed work.
  const frozenReels = allReels.filter((reel) => {
    const isPosted = ['posted', 'archived', 'winner'].includes(reel.status);
    const isFilmed = reel.status === 'filmed' || reel.is_filmed;
    const isLocked = reel.is_locked === true;
    const isMainReel = reel.is_main_reel === true;

    return isPosted || isFilmed || isLocked || isMainReel;
  });

  // Count how many frozen posts exist on each date
  const postsCountByDate = {};
  frozenReels.forEach((r) => {
    if (r.scheduled_date) {
      postsCountByDate[r.scheduled_date] = (postsCountByDate[r.scheduled_date] || 0) + 1;
    }
  });

  // Mutable reels: every unposted, unpinned, unfilmed non-main reel.
  const mutableReels = allReels.filter((reel) => {
    return !frozenReels.some((f) => f.id === reel.id);
  });

  if (mutableReels.length === 0) {
    return { updatedCount: 0, totalReels: allReels.length };
  }

  // 2. Randomize each new batch, then interleave formats/topics where possible.
  const balancedQueue = balanceContentQueue(shuffle(mutableReels));
  const totalPosts = balancedQueue.length;

  // 3. Fill the next eligible calendar days as evenly as possible.
  const assignedDates = getBalancedBatchSlots(
    getSystemDate(), totalPosts, postingDays, maxPostsPerDay, postsCountByDate
  );

  // Keep variants of the same script apart. A mirrored trial should have time
  // to gather an independent audience, so reserve at least one other posting
  // slot between it and its parent whenever the queue has room.
  const lastVariantSlot = new Map();
  balancedQueue.forEach((reel, idx) => {
    const key = reel.script_id || reel.insight_id;
    if (!key) return;
    const previousIdx = lastVariantSlot.get(key);
    if (previousIdx !== undefined && idx - previousIdx < 2) {
      const swapIdx = Math.min(totalPosts - 1, previousIdx + 2);
      if (swapIdx > idx) {
        [assignedDates[idx], assignedDates[swapIdx]] = [assignedDates[swapIdx], assignedDates[idx]];
      }
    }
    lastVariantSlot.set(key, idx);
  });

  // 4. Assign calculated dates to the balanced queue
  const updatedReels = balancedQueue.map((reel, idx) => {
    return {
      ...reel,
      scheduled_date: assignedDates[idx] || reel.scheduled_date || todayStr,
      updated_at: new Date().toISOString()
    };
  });

  // 5. Save back to IndexedDB
  await db.saveScheduledReels([...frozenReels, ...updatedReels]);

  return {
    updatedCount: updatedReels.length,
    totalReels: frozenReels.length + updatedReels.length
  };
}

/**
 * Moves only missed, ready-to-post trial reels into the next available slots.
 * Existing future plans stay where they are, so catching up never reshuffles
 * content the doctor has already planned or filmed.
 */
export async function rescheduleMissedPosts() {
  const profile = await db.getProfile();
  const allReels = await db.getScheduledReels();
  const todayStr = formatDateForInput(getSystemDate());
  const maxPostsPerDay = Math.min(3, Math.max(1, Number(profile.maxPostsPerDay) || 3));
  const postingDays = profile.postingDays || ['Daily'];

  const missedReels = allReels.filter((reel) => {
    const isMissed = reel.scheduled_date < todayStr && reel.status === 'scheduled';
    const isFilmed = reel.status === 'filmed' || reel.is_filmed;
    return isMissed && !reel.is_locked && !reel.is_main_reel && !isFilmed;
  });

  if (missedReels.length === 0) {
    return { rescheduledCount: 0, totalMissed: 0 };
  }

  const fixedReels = allReels.filter((reel) => !missedReels.some((missed) => missed.id === reel.id));
  const postsCountByDate = {};
  fixedReels.forEach((reel) => {
    if (reel.scheduled_date >= todayStr) {
      postsCountByDate[reel.scheduled_date] = (postsCountByDate[reel.scheduled_date] || 0) + 1;
    }
  });

  const candidateSlots = [];
  const rawDates = getNextPostingDates(getSystemDate(), 365, postingDays);
  for (const dateStr of rawDates) {
    const openSlots = Math.max(0, maxPostsPerDay - (postsCountByDate[dateStr] || 0));
    for (let slot = 0; slot < openSlots; slot++) candidateSlots.push(dateStr);
    if (candidateSlots.length >= missedReels.length) break;
  }

  const rescheduledReels = balanceContentQueue(missedReels).map((reel, index) => {
    const newDate = candidateSlots[index];
    if (!newDate) return reel;
    return {
      ...reel,
      scheduled_date: newDate,
      updated_at: new Date().toISOString(),
      rescheduled_at: new Date().toISOString()
    };
  });

  await db.saveScheduledReels([...fixedReels, ...rescheduledReels]);
  return { rescheduledCount: Math.min(candidateSlots.length, missedReels.length), totalMissed: missedReels.length };
}

/**
 * Creates a Trial Reel from an accepted script and reshuffles the eligible queue.
 */
export async function scheduleAcceptedScript(script) {
  const profile = await db.getProfile();
  const existingReels = await db.getScheduledReels();
  const duplicate = existingReels.find((r) => r.script_id === script.id);

  if (duplicate) {
    return duplicate;
  }

  const todayStr = formatDateForInput(getSystemDate());

  const now = new Date().toISOString();
  const newReel = {
    id: uuidv4(),
    script_id: script.id,
    insight_id: script.insight_id,
    title: script.title,
    format: script.format,
    hook: script.hook,
    script: script.script,
    cta: script.cta,
    estimated_duration: script.estimated_duration || '45s',
    scheduled_date: todayStr, // Will be uniformly positioned by recalculateFutureSchedule
    status: 'scheduled',
    is_locked: false,
    is_main_reel: false,
    is_trial_reel: profile.enableTrialReelWorkflow !== false,
    created_at: now,
    updated_at: now
  };

  const reelsToSave = [newReel];
  // A mirrored trial is deliberately a separate reel (and remains editable),
  // allowing the same insight to be tested with a different cut/packaging.
  if (profile.enableMirroredTrialWorkflow === true && profile.enableTrialReelWorkflow !== false) {
    reelsToSave.push({
      ...newReel,
      id: uuidv4(),
      title: `🔁 [Mirrored Trial] ${script.title}`,
      variant: 'mirrored_trial',
      is_mirrored_trial: true,
      mirror_edit_required: true,
      parent_trial_reel_id: newReel.id,
      created_at: now,
      updated_at: now
    });
  }

  await db.saveScheduledReels(reelsToSave);
  await recalculateFutureSchedule();

  return newReel;
}

/**
 * Adds a hand-written script straight to the publishing calendar. Manual
 * entries start unpinned, like every other reel, so the schedule remains
 * flexible until the user explicitly pins a date.
 */
export async function scheduleManualScript({ title, script, scheduledDate, cta = '' }) {
  const profile = await db.getProfile();
  const existingReels = await db.getScheduledReels();
  const maxPostsPerDay = Math.min(3, Math.max(1, Number(profile.maxPostsPerDay) || 3));
  const postsOnDate = existingReels.filter((reel) => reel.scheduled_date === scheduledDate);
  if (postsOnDate.length >= maxPostsPerDay) {
    throw new Error(`This day already has the ${maxPostsPerDay}-post limit. Choose another date.`);
  }

  const newReel = {
    id: uuidv4(),
    script_id: null,
    insight_id: null,
    source: 'manual',
    title,
    format: 'Custom Script',
    hook: title,
    script,
    cta,
    estimated_duration: '',
    scheduled_date: scheduledDate,
    status: 'scheduled',
    is_locked: false,
    is_main_reel: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await db.saveScheduledReel(newReel);
  await recalculateFutureSchedule();
  return newReel;
}

/**
 * Promotes a tested Trial Reel to a permanent Main Reel.
 */
export async function promoteToMainReel(trialReelId) {
  const reel = await db.getScheduledReel(trialReelId);
  if (!reel) throw new Error('Reel not found');

  const profile = await db.getProfile();
  const nextDates = getNextPostingDates(getSystemDate(), 8, profile.postingDays || ['Mon', 'Wed', 'Fri']);
  // Place Main Reel 5-7 days out into prime slot
  const mainReelDate = nextDates[2] || nextDates[0];

  const mainReel = {
    id: uuidv4(),
    parent_trial_reel_id: reel.id,
    script_id: reel.script_id,
    insight_id: reel.insight_id,
    title: `⭐ [Main Reel] ${reel.title}`,
    format: reel.format,
    hook: reel.hook,
    script: reel.script,
    cta: reel.cta,
    estimated_duration: reel.estimated_duration,
    scheduled_date: mainReelDate,
    status: 'scheduled',
    is_locked: false,
    is_main_reel: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Mark original trial reel as winner
  reel.status = 'winner';
  reel.promoted_to_main_reel_id = mainReel.id;
  reel.is_main_reel_winner = true;

  await db.saveScheduledReel(reel);
  await db.saveScheduledReel(mainReel);
  await recalculateFutureSchedule();

  return mainReel;
}
