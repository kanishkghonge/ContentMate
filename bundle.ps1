# PowerShell bundler script for Content Mate

$FILES_TO_BUNDLE = @(
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
)

$ROOT_DIR = $PSScriptRoot

$bundledCode = @"
/**
 * Content Mate — generated standalone bundle.
 * Generated from the ES module sources; supports direct file:// use.
 */

(function () {
  "use strict";
"@

foreach ($fileRelPath in $FILES_TO_BUNDLE) {
  $fullPath = Join-Path $ROOT_DIR $fileRelPath
  $content = Get-Content $fullPath -Raw -Encoding UTF8
  
  # Strip all lines starting with import
  $content = $content -replace '(?m)^import\s+.*$', ''
  
  # Strip export keywords
  $content = $content -replace '(?m)^export\s+', ''
  
  $bundledCode += "`n/* $fileRelPath */`n$($content.Trim())`n"
}

$bundledCode += "`n})();`n"

$outputPath = Join-Path $ROOT_DIR 'js/app.bundle.js'
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($outputPath, $bundledCode, $utf8NoBom)
Write-Host "Successfully bundled into js/app.bundle.js" -ForegroundColor Green
