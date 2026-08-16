/**
 * Content OS for Doctors — Intelligent Auto-Scheduler
 * Balances content formats and medical topics across calendar days.
 * Uniformly sprinkles unposted scripts over 14 days (or doctor's configured window).
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
 * Core Uniform Sprinkle Auto-Scheduling Routine
 * - Preserves posted, filmed (if enabled), locked, or past reels.
 * - Uniformly distributes all unposted, unlocked trial reels over the sprinkle window (default 14 days).
 * - Enforces max posts per day limit.
 */
export async function recalculateFutureSchedule() {
  const profile = await db.getProfile();
  const allReels = await db.getScheduledReels();
  const todayStr = formatDateForInput(getSystemDate());

  const sprinkleWindowDays = profile.sprinkleWindowDays || 14;
  const maxPostsPerDay = profile.maxPostsPerDay || 1;
  const postingDays = profile.postingDays || ['Mon', 'Wed', 'Fri'];
  const strategy = profile.sprinkleStrategy || 'uniform';
  const enableFilming = profile.enableFilmingWorkflow === true;

  // 1. Separate FROZEN reels from MUTABLE reels
  // Frozen: already posted, strictly past date (< todayStr), locked, or filmed (if filming enabled)
  const frozenReels = allReels.filter((reel) => {
    const isPast = reel.scheduled_date < todayStr;
    const isPosted = reel.status === 'posted';
    const isFilmed = enableFilming && (reel.status === 'filmed' || reel.is_filmed);
    const isLocked = reel.is_locked === true;
    const isMainReel = reel.is_main_reel === true;

    return isPast || isPosted || isFilmed || isLocked || isMainReel;
  });

  // Count how many frozen posts exist on each date
  const postsCountByDate = {};
  frozenReels.forEach((r) => {
    if (r.scheduled_date) {
      postsCountByDate[r.scheduled_date] = (postsCountByDate[r.scheduled_date] || 0) + 1;
    }
  });

  // Mutable reels: unposted, unlocked, non-filmed reels on or after today
  const mutableReels = allReels.filter((reel) => {
    return !frozenReels.some((f) => f.id === reel.id);
  });

  if (mutableReels.length === 0) {
    return { updatedCount: 0, totalReels: allReels.length };
  }

  // 2. Interleave formats & topics for variety
  const balancedQueue = balanceContentQueue(mutableReels);

  // 3. Generate candidate open dates for the sprinkle window
  // Represent every available post slot, not just every available day. This is
  // essential when the doctor allows more than one post per day.
  const candidateDates = [];
  const rawDates = getNextPostingDates(getSystemDate(), Math.max(sprinkleWindowDays * 3, balancedQueue.length * 2), postingDays);

  for (const dateStr of rawDates) {
    const existingCount = postsCountByDate[dateStr] || 0;
    const openSlots = Math.max(0, maxPostsPerDay - existingCount);
    for (let slot = 0; slot < openSlots; slot++) {
      candidateDates.push(dateStr);
    }
    if (candidateDates.length >= Math.max(sprinkleWindowDays, balancedQueue.length * 3)) {
      break;
    }
  }

  // 4. Uniformly space posts across candidate dates
  const assignedDates = [];
  const totalPosts = balancedQueue.length;

  if (strategy === 'front_loaded' || totalPosts === 1 || candidateDates.length <= totalPosts) {
    // Fill first available open slots
    for (let i = 0; i < totalPosts; i++) {
      assignedDates.push(candidateDates[i] || candidateDates[candidateDates.length - 1]);
    }
  } else {
    // True UNIFORM SPRINKLE: Spreads totalPosts evenly across candidateDates over 2 weeks
    // Repeated dates only occur when that day genuinely has remaining capacity.
    const maxIndex = candidateDates.length - 1;
    const step = maxIndex / Math.max(1, totalPosts - 1 || 1);

    for (let i = 0; i < totalPosts; i++) {
      let targetIdx = Math.round(i * step);
      if (targetIdx > maxIndex) targetIdx = maxIndex;
      assignedDates.push(candidateDates[targetIdx]);
    }
  }

  // 5. Assign calculated dates to the balanced queue
  const updatedReels = balancedQueue.map((reel, idx) => {
    return {
      ...reel,
      scheduled_date: assignedDates[idx] || reel.scheduled_date || todayStr,
      updated_at: new Date().toISOString()
    };
  });

  // 6. Save back to IndexedDB
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
  const maxPostsPerDay = profile.maxPostsPerDay || 1;
  const postingDays = profile.postingDays || ['Mon', 'Wed', 'Fri'];
  const enableFilming = profile.enableFilmingWorkflow === true;

  const missedReels = allReels.filter((reel) => {
    const isMissed = reel.scheduled_date < todayStr && reel.status === 'scheduled';
    const isFilmed = enableFilming && (reel.status === 'filmed' || reel.is_filmed);
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
 * Creates a Trial Reel from an accepted script and triggers uniform sprinkle auto-scheduling.
 */
export async function scheduleAcceptedScript(script) {
  const existingReels = await db.getScheduledReels();
  const duplicate = existingReels.find((r) => r.script_id === script.id);

  if (duplicate) {
    return duplicate;
  }

  const todayStr = formatDateForInput(getSystemDate());

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
    is_locked: true,
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
