/**
 * Content OS for Doctors — Curiosity & Retention Prompt Generator Engine
 * Compiles doctor specialty, tone, language, CTAs, and clinical notes into a deep, high-retention AI prompt.
 */

import { scriptFormats } from './formats.js';

export function buildDoctorPrompt(profile, insight) {
  const doctorName = profile.name || 'Doctor';
  const specialty = profile.specialty || 'General Medicine & Preventative Care';
  const audience = profile.audience || 'Patients';
  const language = profile.language || 'English';
  const tone = profile.tone || 'Conversational & Empathetic';
  
  // Custom CTA from insight or fallback to doctor profile preference or default
  const defaultCtaText = insight.custom_cta || profile.cta || 'Check caption for more';
  const ctaInstruction = profile.cta === 'both' && !insight.custom_cta
    ? 'Generate BOTH versions (1. "Read caption for full clinical details" and 2. "Comment keyword for DM guide")'
    : defaultCtaText;
    
  const reelLength = profile.reelLength || '45-60s';

  // Format list instructions
  const formatsList = scriptFormats.map((f, i) => {
    return `${i + 1}. **${f.name}** (${f.category}): ${f.promptInstruction}`;
  }).join('\n');

  const customInstructions = profile.customPromptInstructions
    ? `\n=======================================================\nCUSTOM DOCTOR INSTRUCTIONS (FOLLOW THESE IN ADDITION TO THE RULES BELOW)\n=======================================================\n${profile.customPromptInstructions.trim()}\n`
    : '';

  return `You are an elite medical copywriter and clinical retention strategist for world-class doctor creators.
Your mission is to transform a doctor's raw clinical insight into a high-retention social media content pack that STOP SKIPPING, TRIGGERS IMMENSE CURIOSITY, and GOES DEEP into medical reality.
${customInstructions}

=======================================================
1. DOCTOR PROFILE & COMMUNICATION PREFERENCES
=======================================================
- Doctor: ${doctorName}
- Specialty: ${specialty}
- Target Audience: ${audience} (Speak directly to their unstated anxieties, body signals, and clinical realities)
- Primary Language / Dialect: ${language} (Write naturally as an articulate clinician speaks. No dry textbook jargon, but NEVER dumb it down into fluff)
- Tone: ${tone}
- Reel Duration Target: ${reelLength}
- Target Call-To-Action (CTA): ${ctaInstruction}

=======================================================
2. CORE CLINICAL INSIGHT
=======================================================
- Title / Core Idea: ${insight.title}
- Clinical Details & Supporting Notes:
${insight.supporting_points || insight.description || 'Explain the underlying mechanism with clinical clarity.'}
${insight.references ? `- References / Patient Context: ${insight.references}` : ''}
- Selected Video CTA: ${insight.custom_cta || 'Check caption for more'}

=======================================================
3. REQUESTED SCRIPT FORMATS
=======================================================
Generate one high-retention script for each of the following formats:
${formatsList}

=======================================================
4. HIGH-RETENTION CURIOSITY ARCHITECTURE (STRICT RULES)
=======================================================
Rule 1: ZERO SURFACE-LEVEL FLUFF OR GENERIC ADVICE
- BANNED: "eat healthy", "sleep 8 hours", "drink water", "listen to your body", "consult your doctor".
- REQUIRED: Explain the DEEP physiological mechanism (e.g. endothelial shear stress, ApoB lipid oxidation, calcium channel excitability, receptor down-regulation) using vivid, physical metaphors (plumbing pressure, electrical wiring, rust in pipes).

Rule 2: SCROLL-STOPPING CURIOSITY HOOKS (0-3s)
- Hooks MUST create a powerful curiosity gap or challenge a deeply held myth.
- Examples: "The 1 symptom of heart disease most 35-year-olds ignore because their blood pressure cuff reads 120/80...", "Why taking standard magnesium for night palpitations backfires unless you check this 1 chelate...", "What actually happens to your arteries 10 years before your labs turn red..."

Rule 3: CONTINUOUS CURIOSITY LOOPS & SUSPENSE
- Do NOT reveal the core takeaway in sentence 1. Build tension line-by-line.
- Use pattern-break transitions: "Here is why that happens...", "And this is where 90% of patients make a critical mistake...", "Notice what your body is actually doing here..."

Rule 4: VISUAL & PACING STAGE DIRECTIONS
- Include explicit visual cues in brackets throughout every script: `[Visual Cue: Points to neck / holds up model]`, `[Pacing: Pause 1 sec for gravity]`, `[On-Screen Text: Key Mechanism Blueprint]`.

Rule 5: ACTIONABLE PAYOFF & CLEAN CTA
- End with a precise, empowering takeaway followed by the requested CTA: "${insight.custom_cta || 'Check caption for more'}".

=======================================================
5. OUTPUT INSTRUCTIONS (CRITICAL: JSON ONLY)
=======================================================
Respond ONLY with a valid JSON object matching the exact schema below.
DO NOT include markdown outside the json, no conversational preamble, no extra text.

{
  "version": 1,
  "insight_title": "${insight.title.replace(/"/g, '\\"')}",
  "doctor_specialty": "${specialty.replace(/"/g, '\\"')}",
  "scripts": [
    {
      "format": "Talking Head",
      "title": "Clear curiosity-driven title",
      "hook": "Scroll-stopping curiosity hook sentence...",
      "script": "Complete spoken script with [Visual Cues], [Pacing Notes], deep physiological explanations, and tension loops...",
      "cta": "${(insight.custom_cta || 'Check caption for more').replace(/"/g, '\\"')}",
      "estimated_duration": "45s",
      "confidence": 9.6
    },
    {
      "format": "Patient Story",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "${(insight.custom_cta || 'Check caption for more').replace(/"/g, '\\"')}",
      "estimated_duration": "60s",
      "confidence": 9.4
    },
    {
      "format": "Myth vs Fact",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "${(insight.custom_cta || 'Check caption for more').replace(/"/g, '\\"')}",
      "estimated_duration": "45s",
      "confidence": 9.5
    },
    {
      "format": "Q&A Consultation",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "${(insight.custom_cta || 'Check caption for more').replace(/"/g, '\\"')}",
      "estimated_duration": "40s",
      "confidence": 9.2
    },
    {
      "format": "Whiteboard / Concept Breakdown",
      "title": "...",
      "hook": "...",
      "script": "...",
      "cta": "${(insight.custom_cta || 'Check caption for more').replace(/"/g, '\\"')}",
      "estimated_duration": "60s",
      "confidence": 9.3
    },
    {
      "format": "Step-by-Step Carousel",
      "title": "...",
      "hook": "...",
      "script": "Slide 1 (Hook): ...\\nSlide 2 (Deep Mechanism): ...\\nSlide 3 (Clinical Reality): ...\\nSlide 4 (Action Step): ...\\nSlide 5 (Summary & CTA): ...",
      "cta": "${(insight.custom_cta || 'Check caption for more').replace(/"/g, '\\"')}",
      "estimated_duration": "Slide-deck",
      "confidence": 9.0
    }
  ]
}`;
}
