const fs = require('fs');
const path = require('path');

const FILES_TO_BUNDLE = [
  'js/db.js',
  'js/formats.js',
  'js/utils.js',
  'js/scheduler.js',
  'js/sampleData.js',
  'js/components/dashboard.js',
  'js/components/notes.js',
  'js/prompt.js',
  'js/components/insightCreate.js',
  'js/importer.js',
  'js/components/aiImport.js',
  'js/components/scriptReview.js',
  'js/components/scheduleView.js',
  'js/components/manualScript.js',
  'js/components/trialFeedback.js',
  'js/components/feedbackView.js',
  'js/components/library.js',
  'js/components/settings.js',
  'js/tutorial.js',
  'js/app.js'
];

const ROOT_DIR = path.resolve(__dirname, '..');

let bundledCode = `/**
 * Content Mate — generated standalone bundle.
 * Generated from the ES module sources; supports direct file:// use.
 */

(function () {
  "use strict";
`;

for (const fileRelPath of FILES_TO_BUNDLE) {
  const fullPath = path.join(ROOT_DIR, fileRelPath);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Strip all lines starting with import
  content = content.replace(/^import\s+.*$/gm, '');

  // Strip export keywords
  content = content.replace(/^export\s+/gm, '');

  bundledCode += `\n/* ${fileRelPath} */\n${content.trim()}\n`;
}

bundledCode += `\n})();\n`;

fs.writeFileSync(path.join(ROOT_DIR, 'js/app.bundle.js'), bundledCode, 'utf8');
console.log('Successfully bundled into js/app.bundle.js');
