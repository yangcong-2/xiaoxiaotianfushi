$path = "C:\Users\kuche\Documents\Codex\2026-06-23\ba\outputs\yuer\js\app.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$pat = [regex]::new('window\._artTheme', [System.Text.RegularExpressions.RegexOptions]::Compiled)
if ($pat.IsMatch($content)) { Write-Output "Already fixed!"; exit }
$lines = $content -split "
"
$found = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match 'h \+=.*art\.content\.replace') {
    Write-Output ("Line "+$i+" was replaced")
    $lines[$i] = "  window._artTheme=theme; h+=genBanner(theme, cat.icon, art.title); h += '<div class=content>'+parseContent(art.content)+'</div>';"
    $found = $true
    break
  }
}
if ($found) {
  [System.IO.File]::WriteAllText($path, ($lines -join "
"), [System.Text.Encoding]::UTF8)
  Write-Output "Content line replaced!"
} else { Write-Output "Not found" }
