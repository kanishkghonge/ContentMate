/**
 * Content OS for Doctors — AI Response Importer & Schema Validator
 * Robust parser that strips preambles, fences, and validates clinical script packs.
 */

import { uuidv4 } from './utils.js';

/**
 * Strips JavaScript-style single-line (//) and block (/* *​/) comments from a
 * string while preserving all content that is inside quoted strings.
 *
 * This makes AI-generated JSON with trailing comments or explanatory notes
 * parseable by the strict JSON.parse built-in.
 */
function stripComments(src) {
  let result = '';
  let i = 0;
  const len = src.length;

  while (i < len) {
    const ch = src[i];

    // Inside a double-quoted string — copy verbatim, respecting escape sequences.
    if (ch === '"') {
      result += ch;
      i++;
      while (i < len) {
        const sc = src[i];
        result += sc;
        i++;
        if (sc === '\\') {
          // Consume the escaped character so it is never misread.
          if (i < len) { result += src[i]; i++; }
        } else if (sc === '"') {
          break; // End of string literal.
        }
      }
      continue;
    }

    // Block comment: /* ... */
    if (ch === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < len) {
        if (src[i] === '*' && src[i + 1] === '/') { i += 2; break; }
        i++;
      }
      result += ' '; // Preserve whitespace so token positions stay valid.
      continue;
    }

    // Line comment: // ...
    if (ch === '/' && src[i + 1] === '/') {
      i += 2;
      while (i < len && src[i] !== '\n') i++;
      // Leave the newline so line numbers are not disturbed.
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

/**
 * Scan `src` for the character-index of the closing `}` that matches the
 * opening `{` at `startIndex`, correctly tracking:
 *   - Nested braces and brackets
 *   - Double-quoted strings (with all escape sequences)
 *   - Single-line and block comments (already stripped, but belt-and-suspenders)
 *
 * Returns the index of the matching `}`, or -1 if not found.
 */
function findMatchingBrace(src, startIndex) {
  let depth = 0;
  let i = startIndex;
  const len = src.length;

  while (i < len) {
    const ch = src[i];

    if (ch === '"') {
      // Skip over the entire string literal.
      i++;
      while (i < len) {
        const sc = src[i];
        i++;
        if (sc === '\\') {
          i++; // Skip one escaped character (handles \", \\, \uXXXX, etc.)
        } else if (sc === '"') {
          break;
        }
      }
      continue;
    }

    if (ch === '{') { depth++; i++; continue; }
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
      i++;
      continue;
    }

    i++;
  }

  return -1;
}

/**
 * Attempt to recover valid JSON when the AI wrapped content string values in
 * literal (unescaped) newlines.  JSON.parse forbids real newlines inside
 * string literals; this replaces them with the two-character escape sequence.
 *
 * The replacement is done only inside string literals so structural newlines
 * (between keys/values) are untouched.
 */
function fixRawNewlinesInStrings(src) {
  let result = '';
  let i = 0;
  const len = src.length;

  while (i < len) {
    const ch = src[i];

    if (ch === '"') {
      result += ch;
      i++;
      while (i < len) {
        const sc = src[i];
        if (sc === '\\') {
          // Pass through the escape sequence intact.
          result += sc;
          i++;
          if (i < len) { result += src[i]; i++; }
        } else if (sc === '"') {
          result += sc;
          i++;
          break;
        } else if (sc === '\n') {
          result += '\\n'; // Replace literal newline with JSON escape.
          i++;
        } else if (sc === '\r') {
          result += '\\r';
          i++;
        } else if (sc === '\t') {
          result += '\\t';
          i++;
        } else {
          result += sc;
          i++;
        }
      }
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

/**
 * Normalizes typographic ("smart") punctuation to their ASCII equivalents.
 *
 * AI responses pasted from Google Docs, Microsoft Word, or email clients often
 * have straight quotes and apostrophes auto-converted to curly/typographic
 * variants, and plain hyphens replaced with en/em dashes.  All of these break
 * JSON.parse, so we normalize them first before any other repair is attempted.
 *
 *   "…"  →  "   (U+201C / U+201D  →  U+0022)
 *   '…'  →  '   (U+2018 / U+2019  →  U+0027)
 *   –    →  -   (U+2013 en dash  →  U+002D)
 *   —    →  -   (U+2014 em dash  →  U+002D)
 */
function normalizeSmartQuotes(src) {
  return src
    .replace(/[\u201C\u201D\u201E\u201F\u2033\uFF02]/g, '"')  // curly double quotes / double primes → straight "
    .replace(/[\u2018\u2019\u201A\u201B\u2032\uFF07]/g, "'")  // curly single quotes / apostrophes / single primes → straight '
    .replace(/[\u2013\u2014]/g, '-'); // en dash / em dash → hyphen
}

/**
 * Tries to parse `candidate` as JSON, applying progressive repair steps:
 *   1. Raw attempt (smart quotes already normalized by extractJSONObject)
 *   2. Strip comments, then retry
 *   3. Strip comments + fix raw newlines inside strings, then retry
 *
 * NOTE: Smart quote normalization is intentionally done upstream in
 * extractJSONObject so that stripComments and findMatchingBrace also receive
 * clean ASCII text.  Do not re-add it here.
 *
 * Returns the parsed object on success, or null on failure.
 */
function tryParseJSON(candidate) {
  // Step 1: Direct parse (fast path for well-formed JSON).
  try { return JSON.parse(candidate); } catch { /* continue */ }

  // Step 2: Strip JS comments (handles ChatGPT/Claude annotations).
  const noComments = stripComments(candidate);
  try { return JSON.parse(noComments); } catch { /* continue */ }

  // Step 3: Also fix unescaped newlines inside string values.
  const fixed = fixRawNewlinesInStrings(noComments);
  try { return JSON.parse(fixed); } catch { /* continue */ }

  return null;
}

/**
 * Extracts the first valid JSON object from `text` that contains a `scripts`
 * array.  Falls back to the first parseable JSON object if none has `scripts`.
 *
 * This replaces the old fragile character scanner with a correct implementation
 * that handles escaped quotes, Unicode escapes, multi-line strings, and JS
 * comments in AI responses.
 */
function extractJSONObject(text) {
  // Normalize smart/typographic punctuation FIRST so that every downstream
  // helper — stripComments, findMatchingBrace, and tryParseJSON — always
  // operates on ASCII-clean text.  Both stripComments and findMatchingBrace
  // track string boundaries by looking for the literal `"` character; curly
  // quotes would fool them into misreading the JSON structure.
  text = normalizeSmartQuotes(text);

  // Fast path: the entire text (after comment/newline repair) is valid JSON.
  const direct = tryParseJSON(text);
  if (direct !== null && typeof direct === 'object') {
    if (Array.isArray(direct?.scripts)) return direct;
  }

  // Slow path: scan for every `{` and attempt to extract a complete object.
  let fallbackObject = null;

  // Work on the comment-stripped version to avoid comment text confusing the
  // brace scanner (e.g., `// }` should not decrement depth).
  const cleaned = stripComments(text);

  for (let start = cleaned.indexOf('{'); start !== -1; start = cleaned.indexOf('{', start + 1)) {
    const end = findMatchingBrace(cleaned, start);
    if (end === -1) continue;

    const candidate = cleaned.slice(start, end + 1);
    const parsed = tryParseJSON(candidate);
    if (parsed !== null && typeof parsed === 'object') {
      if (Array.isArray(parsed?.scripts)) return parsed;
      fallbackObject ??= parsed;
    }
    // Move past this `{` to continue scanning for a better candidate.
    start = end;
  }

  if (fallbackObject) return fallbackObject;
  throw new Error(
    'No valid JSON object found. Ask the AI to return only the JSON object.' +
    ' If the script text contains double-quotes, they must be escaped as \\".'
  );
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
