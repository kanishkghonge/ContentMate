/**
 * Content OS for Doctors — Prompt Generator Engine
 * Keeps the JSON contract locked while allowing doctors to tune writing direction.
 */

function escapeJsonString(value) {
  return JSON.stringify(String(value ?? '')).slice(1, -1);
}

// This is the only prompt section exposed in Settings. The surrounding prompt
// owns data injection and JSON safety, so user edits cannot break importing.
const DEFAULT_WRITING_INSTRUCTIONS = String.raw`1. Start with the clinical insight, but do not just explain it. Find the most interesting way to frame it so the viewer sees it differently. Look for a misconception, surprising consequence, hidden detail, contradiction, diagnostic mystery, patient misunderstanding, something the doctor notices that the patient does not, or a mechanism that can be made visual. Find the best angle, not a summary.

2. Create 3–4 genuinely different script ideas when the topic supports them. They must not be the same script with different wording. Change the angle, opening, story structure, curiosity mechanism, reveal, and viewer perspective. If there are only 2 strong ideas, return 2. Do not force a fourth script.

3. Make the viewer curious before giving them the answer. Start with a question, tension, observation, or clinical moment that makes the viewer wonder what happened or what the doctor means. Do not give away the whole point immediately. Never open with generic lines such as Today we are going to talk about.

4. Keep creating small information gaps throughout the script. The viewer should understand what is happening without being able to predict exactly what comes next. A useful flow is: interesting statement, question, partial explanation, complication, deeper question, reveal, payoff. Every beat should answer a question, create a new one, introduce a contradiction, or raise the stakes.

5. Think like the viewer. At every major beat, ask what the viewer expects to happen next, then make the next beat slightly more interesting or unexpected without becoming confusing. Gently disrupt their prediction through real clinical reasoning.

6. Make the hook sound like a real doctor, not a social-media marketer. Do not use manufactured drama such as This will shock you, You will not believe this, Doctors do not want you to know, or This changes everything. Curiosity must come from the actual clinical situation.

7. Prioritise real clinical detail over generic health advice. Explain what the body is doing, what a test measures and misses, why a symptom occurs, why a treatment works or fails, why a doctor makes a decision, or what changes the diagnosis. Medical depth should make the story more interesting, not merely technical. Do not invent facts, statistics, outcomes, diagnoses, or certainty not supported by the supplied insight.

8. Use concrete examples sparingly. One vivid clinical situation is usually stronger than several weak examples.

9. Choose or invent the format that best fits the idea; do not default to talking head. A patient story, case breakdown, report or scan breakdown, Q&A, demonstration, whiteboard, doctor-patient conversation, myth-versus-reality, reframe, or another format may be best. The format serves the angle. Put the format name you choose in the format field.

10. Internally build each script as: hook, curiosity, context, complication, clinical reveal, payoff, CTA. Do not label these sections in the final spoken script.

11. Add [Visual Cue], [Pacing], or [On-Screen Text] only when it improves filming or understanding. Do not add a direction to every sentence.

12. End by resolving the curiosity created at the beginning, then move naturally into the required CTA. Keep the spoken content tight enough to fit the selected duration and write naturally in the selected language.`;

const LOCKED_PROMPT_TEMPLATE = String.raw`You are a medical copywriter and clinical storyteller for doctor-created short videos.

Create an accurate, high-retention script pack from the clinical insight below.

DOCTOR AND VIDEO SETTINGS
- Doctor: {{doctor_name}}
- Specialty: {{specialty}}
- Audience: {{audience}}
- Write the spoken content in: {{language}}
- Tone: {{tone}}
- Target duration for every video: {{reel_length}}
- Required CTA: {{selected_cta}}

CLINICAL INSIGHT
- Title: {{insight_title}}
- Details: {{insight_details}}
- Extra context: {{additional_context}}

WRITING INSTRUCTIONS
{{writing_instructions}}

JSON OUTPUT CONTRACT — LOCKED
Return only one complete JSON object. No markdown fence, preface, explanation, comments, or trailing comma.

The response is pasted directly into JSON.parse(). Before sending, silently validate the entire response as JSON.
- Use double quotes for every key and every string value.
- Keep every field value on one JSON string line. Represent any needed line break as \n, not as a literal line break.
- Use apostrophes for dialogue where possible. If a double quote is needed inside a string, escape it as \".
- Escape backslashes as \\.
- Do not add, remove, or rename fields.
- confidence must be a number. estimated_duration must be exactly "{{reel_length}}" for every script.

Return this exact shape:
{
  "version": 1,
  "insight_title": "{{insight_title_json}}",
  "doctor_specialty": "{{specialty_json}}",
  "scripts": [
    {
      "format": "The format chosen for this specific angle",
      "angle": "The distinct framing used for this script",
      "title": "A concise curiosity-driven title",
      "hook": "The first spoken line",
      "script": "The complete spoken script with optional square-bracket filming directions",
      "cta": "{{selected_cta_json}}",
      "estimated_duration": "{{reel_length}}",
      "confidence": 9.2
    }
  ]
}`;

export function getDefaultWritingInstructions() {
  return DEFAULT_WRITING_INSTRUCTIONS;
}

export async function getTopPerformingScriptsContext(count) {
  if (!count || count === 'none' || count === 0) return '';
  
  // Import db dynamically to avoid circular dependencies
  const { db } = await import('./db.js');
  
  const allReels = await db.getScheduledReels();
  
  // Filter reels that have feedback logged and performance score
  const reelsWithFeedback = allReels.filter(r => 
    r.feedback_logged && 
    r.performance_score !== undefined && 
    r.performance_score !== null
  );
  
  // Sort by performance score descending
  reelsWithFeedback.sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0));
  
  // Take top N
  const topReels = reelsWithFeedback.slice(0, parseInt(count));
  
  if (topReels.length === 0) return '';
  
  // Build context string
  let contextText = `CONTEXT FROM TOP ${topReels.length} PERFORMING SCRIPTS (Use these as style and structure references):\n\n`;
  
  topReels.forEach((reel, index) => {
    const fullScript = [reel.hook, reel.script, reel.cta].filter(Boolean).join('\n\n');
    contextText += `Example ${index + 1} (Performance Score: ${reel.performance_score}):\n`;
    contextText += `Title: ${reel.title}\n`;
    contextText += `Format: ${reel.format}\n`;
    contextText += `Script: ${fullScript}\n\n`;
  });
  
  return contextText;
}

export async function buildDoctorPrompt(profile = {}, insight = {}, topScriptsContext = '') {
  const selectedDuration = insight.reel_length || profile.reelLength || '40s';
  const selectedLanguage = insight.language || profile.language || 'English';
  const specialty = profile.specialty || 'General Medicine & Preventative Care';
  const selectedCta = insight.custom_cta || 'Check caption for more';
  
  // Build additional context with top performing scripts if provided
  let additionalContext = insight.references || 'None provided.';
  if (topScriptsContext) {
    additionalContext = topScriptsContext + '\n\n' + additionalContext;
  }
  
  const values = {
    doctor_name: profile.name || 'Doctor',
    specialty,
    audience: profile.audience || 'Patients',
    language: selectedLanguage,
    tone: profile.tone || 'Conversational & Empathetic',
    reel_length: selectedDuration,
    insight_title: insight.title || '',
    insight_title_json: escapeJsonString(insight.title),
    specialty_json: escapeJsonString(specialty),
    insight_details: insight.supporting_points || insight.description || 'Explain the underlying mechanism with clinical clarity.',
    additional_context: additionalContext,
    selected_cta: selectedCta,
    selected_cta_json: escapeJsonString(selectedCta),
    writing_instructions: profile.writingInstructions || DEFAULT_WRITING_INSTRUCTIONS
  };

  return LOCKED_PROMPT_TEMPLATE.replace(/\{\{([a-z_]+)\}\}/g, (token, key) => (
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : token
  ));
}
