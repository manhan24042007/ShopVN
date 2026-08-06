# Migrate footer in all HTML files (except index.html) to use shared js/footer.js
$ErrorActionPreference = 'Stop'
$ecommerceDir = 'C:\Users\DMX\OneDrive\May tinh\ShopVN\ecommerce'
$files = Get-ChildItem -Path $ecommerceDir -Filter '*.html' | Where-Object { $_.Name -ne 'index.html' }

$replacement = @'
  <div id="shopvn-footer"></div>
  <div id="shopvn-chat"></div>
  <script src="js/footer.js"></script>
'@

$count = 0
foreach ($file in $files) {
    $content = Get-Content -Raw -Path $file.FullName
    if ($content -notmatch 'js/footer\.js') {
        $regex = [regex]'(?s)<footer\b[^>]*>.*?</footer>'
        if ($regex.IsMatch($content)) {
            $newContent = $regex.Replace($content, $replacement, 1)
            if ($newContent -ne $content) {
                Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
                Write-Host "Updated: $($file.Name)"
                $count++
            }
        } else {
            Write-Host "No footer found: $($file.Name)"
        }
    }
}
Write-Host "`nTotal updated: $count files"