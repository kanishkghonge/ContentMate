/**
 * Content OS for Doctors — AI Response Importer & Schema Validator
 * Robust parser that strips preambles, fences, and validates clinical script packs.
 */

import { uuidv4 } from './utils.js';

function extractJSONObject(text) {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed?.scripts)) return parsed;
  } catch {
    // AI tools sometimes add a preamble or code fence. Scan complete JSON
    // objects instead of blindly taking the first "{" and the last "}".
  }

  let fallbackObject = null;

  for (let start = text.indexOf('{'); start !== -1; start = text.indexOf('{', start + 1)) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < text.length; index += 1) {
      const character = text[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') inString = false;
        continue;
      }

      if (character === '"') inString = true;
      else if (character === '{') depth += 1;
      else if (character === '}') {
        depth -= 1;
        if (depth === 0) {
          try {
            const parsed = JSON.parse(text.slice(start, index + 1));
            if (Array.isArray(parsed?.scripts)) return parsed;
            fallbackObject ??= parsed;
          } catch {
            // This opening brace did not start JSON. Keep scanning for the
            // actual response object later in the pasted text.
          }
          break;
        }
      }
    }
  }

  if (fallbackObject) return fallbackObject;
  throw new Error('Invalid JSON syntax. Ask the AI to return only the JSON object, with double quotes escaped inside script text.');
}

export function parseAndValidateAIResponse(rawText, insightId) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Pasted content is empty. Please paste the JSON returned by your AI.');
  }

  let cleaned = rawText.trim();

  // 1. Strip markdown code fences if wrapped in ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  cleaned = cleaned.trim();

  let data;
  try {
    data = extractJSONObject(cleaned);
  } catch (err) {
    throw new Error(`${err.message} Check that the response was not cut off.`);
  }

  // 3. Schema Validation
  if (typeof data !== 'object' || data === null) {
    throw new Error('Parsed response is not a valid JSON object.');
  }

  if (!Array.isArray(data.scripts) || data.scripts.length === 0) {
    throw new Error('No "scripts" array found in JSON. Expected at least 1 script.');
  }

  // 4. Extract and normalize script cards
  const normalizedScripts = data.scripts.map((item, index) => {
    if (!item.format) item.format = 'Talking Head';
    if (!item.title) item.title = `Clinical Script #${index + 1}`;
    if (!item.hook) item.hook = 'Attention-grabbing medical hook...';
    if (!item.script) item.script = 'Clinical explanation...';
    if (!item.cta) item.cta = 'Read caption for more information.';

    return {
      id: uuidv4(),
      insight_id: insightId,
      format: item.format.trim(),
      angle: typeof item.angle === 'string' ? item.angle.trim() : '',
      title: item.title.trim(),
      hook: item.hook.trim(),
      script: item.script.trim(),
      cta: item.cta.trim(),
      estimated_duration: item.estimated_duration || '45s',
      confidence: typeof item.confidence === 'number' ? item.confidence : 9.0,
      status: 'pending_review', // 'pending_review' | 'accepted' | 'edited' | 'rejected' | 'review_later'
      review_order: index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });

  return {
    version: data.version || 1,
    insight_title: data.insight_title || '',
    doctor_specialty: data.doctor_specialty || '',
    scripts: normalizedScripts
  };
}
