# 批量替换HTML文件中的CDN链接为本地路径

# 获取所有HTML文件
$htmlFiles = Get-ChildItem -Path "templates" -Filter "*.html" -Recurse

# 定义替换映射
$replacements = @{
    # KaTeX CSS
    'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css' = '../static/libs/katex/css/katex.min.css'
    
    # KaTeX JS
    'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js' = '../static/libs/katex/js/katex.min.js'
    'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js' = '../static/libs/katex/js/auto-render.min.js'
    
    # Font Awesome
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' = '../static/libs/fontawesome/font-awesome.min.css'
    'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css' = '../static/libs/fontawesome/font-awesome.min.css'
    
    # Chart.js
    'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js' = '../static/libs/chart/chart.umd.min.js'
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js' = '../static/libs/chart/chart.umd.min.js'
    'https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-annotation/1.4.0/chartjs-plugin-annotation.min.js' = '../static/libs/chart/chartjs-plugin-annotation.min.js'
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.0.1/dist/chartjs-plugin-annotation.min.js' = '../static/libs/chart/chartjs-plugin-annotation.min.js'
    
    # Marked.js
    'https://cdn.jsdelivr.net/npm/marked@4.3.0/marked.min.js' = '../static/libs/marked/marked.min.js'
    'https://cdn.jsdelivr.net/npm/marked@9.1.2/marked.min.js' = '../static/libs/marked/marked.min.js'
    
    # Three.js
    'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.min.js' = '../static/libs/three/three.min.js'
    
    # GSAP
    'https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js' = '../static/libs/gsap/gsap.min.js'
    
    # MathJax
    'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js' = '../static/libs/mathjax/tex-mml-chtml.js'
    
    # Polyfill (移除或注释掉，因为下载失败)
    'https://polyfill.io/v3/polyfill.min.js?features=es6' = ''
}

foreach ($file in $htmlFiles) {
    Write-Host "Processing: $($file.FullName)"
    
    # 读取文件内容
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # 执行替换
    $modified = $false
    foreach ($oldUrl in $replacements.Keys) {
        $newUrl = $replacements[$oldUrl]
        if ($content -match [regex]::Escape($oldUrl)) {
            if ($newUrl -eq '') {
                # 如果新URL为空，注释掉整行
                $content = $content -replace ".*$([regex]::Escape($oldUrl)).*", "<!-- $&amp; -->"
            } else {
                $content = $content -replace [regex]::Escape($oldUrl), $newUrl
            }
            $modified = $true
            Write-Host "  Replaced: $oldUrl -> $newUrl"
        }
    }
    
    # 如果有修改，保存文件
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "  File updated successfully"
    } else {
        Write-Host "  No changes needed"
    }
}

Write-Host "All HTML files processed!"