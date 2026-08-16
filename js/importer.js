/**
 * Content OS for Doctors — AI Response Importer & Schema Validator
 * Robust parser that strips preambles, fences, and validates clinical script packs.
 */

import { uuidv4 } from './utils.js';

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

  // 2. Locate outermost JSON object boundaries { ... }
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error('Could not find a valid JSON object. Please verify you copied the entire AI response.');
  }

  const jsonSnippet = cleaned.substring(startIdx, endIdx + 1);

  let data;
  try {
    data = JSON.parse(jsonSnippet);
  } catch (err) {
    throw new Error(`Invalid JSON syntax: ${err.message}. Check if the AI cut off mid-response.`);
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
