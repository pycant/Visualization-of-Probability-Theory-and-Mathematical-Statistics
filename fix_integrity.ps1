# 修复KaTeX本地化后的integrity属性问题
# 移除所有HTML文件中的integrity和crossorigin属性

$templatesDir = "templates"
$htmlFiles = Get-ChildItem -Path $templatesDir -Filter "*.html"

foreach ($file in $htmlFiles) {
    Write-Host "处理文件: $($file.Name)"
    
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # 移除integrity属性
    $content = $content -replace '\s*integrity="[^"]*"', ''
    
    # 移除crossorigin属性
    $content = $content -replace '\s*crossorigin="[^"]*"', ''
    
    # 保存修改后的内容
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    
    Write-Host "已处理: $($file.Name)"
}

Write-Host "所有HTML文件的integrity和crossorigin属性已移除"