# Migrate index.html footer carefully
$ErrorActionPreference = 'Stop'
$path = Join-Path (Get-Location).Path 'index.html'
$content = Get-Content -Raw -Path $path

$liveChatStart = $content.IndexOf('<!-- Live Chat Widget -->')
if ($liveChatStart -gt 0) {
    $content = $content.Substring(0, $liveChatStart)
}

$regex = [regex]'(?s)<footer\b[^>]*>.*?</footer>'
$replacement = '<div id="shopvn-footer"></div>' + "`n" + '<div id="shopvn-chat"></div>' + "`n" + '<script src="js/footer.js"></script>'

if ($regex.IsMatch($content)) {
    $content = $regex.Replace($content, $replacement, 1)
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "Updated index.html"
}