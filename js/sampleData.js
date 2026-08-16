/**
 * Content OS for Doctors — Realistic Clinical Sample Dataset
 * Enables instant 1-click testing of all workflows without manual typing.
 */

import { db, defaultDoctorProfile } from './db.js';
import { recalculateFutureSchedule } from './scheduler.js';
import { formatDateForInput, addDays } from './utils.js';

export async function populateSampleDoctorWorkspace() {
  await db.clearAll();

  const todayStr = formatDateForInput(new Date());
  const threeDaysAgoStr = formatDateForInput(addDays(new Date(), -3));
  const yesterdayStr = formatDateForInput(addDays(new Date(), -1));
  const tomorrowStr = formatDateForInput(addDays(new Date(), 1));
  const threeDaysLaterStr = formatDateForInput(addDays(new Date(), 3));

  // 1. Doctor Profile
  await db.saveProfile({
    ...defaultDoctorProfile,
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiologist & Preventative Health',
    audience: 'Patients',
    language: 'English',
    tone: 'Conversational & Empathetic',
    cta: 'both',
    reelLength: '45-60s',
    postingDays: ['Mon', 'Wed', 'Fri'],
    clinicName: 'Heart & Vascular Institute',
    website: 'drsarahchen.com',
    instagram: '@drsarahchen_md',
    onboarded: true
  });

  // 2. Quick Clinical Notes
  await db.addNote({
    id: 'note-1',
    text: 'I should explain why high calcium score in younger patients is an opportunity, not a life sentence.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    is_archived: false
  });

  await db.addNote({
    id: 'note-2',
    text: 'Had a 42-year-old marathon runner with hidden coronary plaque today. Need to talk about athletic heart vs vascular risk.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    is_archived: false
  });

  await db.addNote({
    id: 'note-3',
    text: 'Need to make something debunking the myth that coconut oil cleans your arteries.',
    created_at: new Date().toISOString(),
    is_archived: false
  });

  // 3. Clinical Insights
  const insight1 = {
    id: 'insight-101',
    title: 'Why Normal Blood Pressure at 25 Does Not Guarantee Clean Arteries at 45',
    description: 'Vascular stiffness and ApoB cholesterol accumulation start decades before blood pressure monitors turn red.',
    supporting_points: '1. Standard cuff BP only measures macro vessel resistance.\n2. Endothelial micro-inflammation happens silently.\n3. Why early ApoB testing and lifestyle changes matter more than waiting for hypertension.',
    references: 'JACC 2024 preventative cardiology review on cumulative lifetime exposure.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: 'active'
  };

  const insight2 = {
    id: 'insight-102',
    title: 'Magnesium Taurate vs Glycinate for Heart Palpitations and Ectopic Beats',
    description: 'Patients are constantly confused by different magnesium chelates for cardiac rhythm stability.',
    supporting_points: '1. Taurine acts on calcium channels in myocardial cells.\n2. Glycinate is superior for sleep and anxiety-triggered PVCs.\n3. Dosages, timing, and kidney function cautions.',
    references: 'Clinical electrophysiology patient education protocol.',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    status: 'active'
  };

  const insight3 = {
    id: 'insight-103',
    title: 'The "Fit but Clogged" Paradox: Why Exercise Alone Does Not Erase Plaque',
    description: 'High VO2 max does not protect against family history of elevated Lp(a) or dietary inflammation.',
    supporting_points: '1. The heart is a muscle, but arteries are plumbing.\n2. High exercise capacity masks early symptoms.\n3. Coronary CT angiography for asymptomatic athletes.',
    references: 'Sports Cardiology Consensus 2023.',
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    status: 'active'
  };

  await db.saveInsight(insight1);
  await db.saveInsight(insight2);
  await db.saveInsight(insight3);

  // 4. Scripts in Review Queue (Insight 2 — ready to swipe in Flashcard review!)
  const reviewScripts = [
    {
      id: 'script-201',
      insight_id: 'insight-102',
      format: 'Talking Head',
      title: 'If Your Heart Skips a Beat at Night, Watch This',
      hook: 'If your heart ever does that weird flutter or flip-flop the second your head hits the pillow, stop scrolling.',
      script: 'In my cardiology clinic, 8 out of 10 patients with night palpitations are taking the wrong form of magnesium. Magnesium citrate draws water into your bowels, while Magnesium Taurate specifically calms myocardial excitability. Here are 3 signs you need taurate over glycinate...',
      cta: 'Read caption for my clinical breakdown and safe dosage guide.',
      estimated_duration: '45s',
      confidence: 9.6,
      status: 'pending_review',
      review_order: 0,
      created_at: new Date().toISOString()
    },
    {
      id: 'script-202',
      insight_id: 'insight-102',
      format: 'Patient Story',
      title: 'The 34-Year-Old Designer with 4,000 Extra Heartbeats a Day',
      hook: 'A 34-year-old came to my office convinced they were having daily heart attacks.',
      script: 'Their Holter monitor showed 4,000 premature ventricular contractions. Their ECG was normal, but their stress and cellular taurine levels were depleted. 4 weeks after switching to targeted cardiac electrolytes, their PVCs dropped by 85%. Here is the exact clinical lesson...',
      cta: 'Comment "HEART" and I\'ll DM you the patient checklist.',
      estimated_duration: '60s',
      confidence: 9.3,
      status: 'pending_review',
      review_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'script-203',
      insight_id: 'insight-102',
      format: 'Myth vs Fact',
      title: 'Stop Buying Generic Magnesium for Palpitations',
      hook: 'Myth: "All magnesium supplements are the same for your heart." Reality: Absolutely not.',
      script: 'Magnesium Oxide has only 4% absorption. Magnesium Glycinate is for brain and sleep. Magnesium Taurate is the only one bonded with taurine, which stabilizes heart rhythm membranes. Save your money and protect your heart.',
      cta: 'Save this video before your next pharmacy visit.',
      estimated_duration: '40s',
      confidence: 9.5,
      status: 'pending_review',
      review_order: 2,
      created_at: new Date().toISOString()
    }
  ];

  await db.saveScripts(reviewScripts);

  // 5. Scheduled Reels (Trial Reels & Feedback Due)
  const scheduledReels = [
    // Today's Scheduled Post (Ready to film or mark posted)
    {
      id: 'reel-301',
      script_id: 'script-101-a',
      insight_id: 'insight-101',
      title: 'Why Normal Blood Pressure at 25 is Deceptive',
      format: 'Talking Head',
      hook: 'Your blood pressure cuff can read 120/80 while your coronary arteries are quietly filling with plaque.',
      script: 'Blood pressure is a measure of vessel resistance today, not plaque accumulation over 20 years. If your family has early heart disease, ask your doctor for an ApoB and Lp(a) test before age 30.',
      cta: 'Read caption for the 3 tests that catch heart disease 10 years earlier.',
      estimated_duration: '45s',
      scheduled_date: todayStr,
      status: 'scheduled',
      is_locked: false,
      is_main_reel: false,
      created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    // Past Posted Trial Reel (Posted 3 days ago — FEEDBACK DUE!)
    {
      id: 'reel-302',
      script_id: 'script-103-a',
      insight_id: 'insight-103',
      title: 'The "Fit but Clogged" Myth: Marathon Runners & Heart Plaque',
      format: 'Patient Story',
      hook: 'I just reviewed a CT scan of a 45-year-old marathon runner whose arteries looked like a 70-year-old smoker.',
      script: 'Running 20 miles a week gives you incredible lung capacity and muscle tone, but it cannot dissolve genetic cholesterol particles. If you are fit, don\'t skip preventative lipid panels.',
      cta: 'Comment "CHECK" for my preventative screening guide.',
      estimated_duration: '60s',
      scheduled_date: threeDaysAgoStr,
      status: 'posted',
      posted_date: threeDaysAgoStr,
      is_locked: true,
      is_main_reel: false,
      created_at: new Date(Date.now() - 3600000 * 96).toISOString()
    },
    // Upcoming Trial Reel 1
    {
      id: 'reel-303',
      script_id: 'script-101-b',
      insight_id: 'insight-101',
      title: '3 Silent Symptoms of High ApoB Cholesterol',
      format: 'Whiteboard / Concept Breakdown',
      hook: 'Your body rarely gives you warning sirens before vascular events, but watch for these 3 subtle cues.',
      script: 'Arterial walls have no pain sensors. That is why high cholesterol never hurts. Here is how lipid particles penetrate the endothelial wall using a simple plumbing analogy...',
      cta: 'Read caption for safe dietary protocols.',
      estimated_duration: '50s',
      scheduled_date: tomorrowStr,
      status: 'scheduled',
      is_locked: false,
      is_main_reel: false,
      created_at: new Date().toISOString()
    },
    // Upcoming Trial Reel 2
    {
      id: 'reel-304',
      script_id: 'script-101-c',
      insight_id: 'insight-101',
      title: 'Debunking the Top 3 Heart Health Myths',
      format: 'Myth vs Fact',
      hook: 'Myth 1: Eating fat clogs arteries overnight. Fact: Refined sugar and chronic endothelial inflammation do far more damage.',
      script: 'Myth 2: If you feel fine, your heart is fine. 50% of first heart attacks happen with zero prior symptoms. Myth 3: Salt is the only cause of high blood pressure.',
      cta: 'Share this with someone over 40.',
      estimated_duration: '45s',
      scheduled_date: threeDaysLaterStr,
      status: 'scheduled',
      is_locked: false,
      is_main_reel: false,
      created_at: new Date().toISOString()
    }
  ];

  await db.saveScheduledReels(scheduledReels);
  await recalculateFutureSchedule();
}
