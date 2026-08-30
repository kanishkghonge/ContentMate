$files = @(
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

$output = "/**`n * Content Mate - generated bundle`n */`n(function () {`n`"use strict`";`n"

foreach ($file in $files) {
  $content = Get-Content $file -Raw -Encoding UTF8
  $content = $content -replace '(?m)^import\s+.*$', ''
  $content = $content -replace '(?m)^export\s+', ''
  $output += "`n/* $file */`n$content`n"
}

$output += "`n})();`n"

[System.IO.File]::WriteAllText("$PWD\js\app.bundle.js", $output, [System.Text.UTF8Encoding]::new($false))
Write-Host "Bundle created successfully!" -ForegroundColor Green
