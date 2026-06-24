$js = [System.IO.File]::ReadAllText("C:\Users\kuche\Documents\Codex\2026-06-23\ba\outputs\yuer\js\app.js", [System.Text.Encoding]::UTF8)
$js = $js -replace "function setContent\(html\) \{[^}]*document\.getElementById\('content'\)\.innerHTML = html;[^}]*\}", "function setContent(html) { document.getElementById('loading').style.display='none'; document.getElementById('content').innerHTML=html; }
function getArtTheme(id) { if(/preg|recipe|diet/.test(id)) return 'recipe'; if(/health|ill|doc/.test(id)) return 'health'; if(/edu|school|learn/.test(id)) return 'education'; if(/safety/.test(id)) return 'safety'; if(/game|play/.test(id)) return 'game'; if(/finance/.test(id)) return 'finance'; if(/newborn|month/.test(id)) return 'newborn'; if(/infant|day/.test(id)) return 'infant'; if(/tod|toddler/.test(id)) return 'toddler'; if(/preschool/.test(id)) return 'preschool'; if(/school/.test(id)) return 'schoolage'; if(/teen/.test(id)) return 'teen'; return 'default'; }
function genBanner(t,i,ti) { return '<div class=art-header-img art-theme-'+t+'><div class=bg-icon>'+i+'</div><div class=sub-icon>'+i+'</div><h3>'+ti+'</h3></div>'; }
function parseContent(c) { return '<p>'+c.replace(/\n/g,'</p><p>')+'</p>'; }"
$js = $js -replace "function navArt\(ageId, catId, artId\) \{", "function navArt(ageId, catId, artId) { var theme=getArtTheme(catId+'_'+artId);"
$js = $js -replace 'h \+= ''<div class="content"><p>'' \+ art\.content\.replace\(/\\n/g,''</p><p>''\) \+ ''</p></div>'';', "h += genBanner(theme, cat.icon, art.title); h += '<div class=content>'+parseContent(art.content)+'</div>';"
[System.IO.File]::WriteAllText("C:\Users\kuche\Documents\Codex\2026-06-23\ba\outputs\yuer\js\app.js", $js, [System.Text.Encoding]::UTF8)
Write-Output "Updated app.js"
