$lines = [System.IO.File]::ReadAllLines("C:\Users\kuche\Documents\Codex\2026-06-23\ba\outputs\yuer\js\app.js", [System.Text.Encoding]::UTF8)
for ($i=0; $i -lt $lines.Length; $i++) {
  if ($lines[$i] -like '*art.content.replace*') {
    $lines[$i] = '  window._artTheme=theme; h+=genBanner(theme, cat.icon, art.title); h += ''<div class=content>''+parseContent(art.content)+''</div>'';'
    [System.IO.File]::WriteAllLines("C:\Users\kuche\Documents\Codex\2026-06-23\ba\outputs\yuer\js\app.js", $lines, [System.Text.Encoding]::UTF8)
    Write-Output "Line " + $i + " replaced!"
    break
  }
}
