# Tiny static file server for previewing this site locally.
# No Node or Python needed - PowerShell only.
#   powershell -ExecutionPolicy Bypass -File serve.ps1
# Then open http://localhost:8123
#
# Service workers and ES modules need a real http:// origin — opening
# index.html with file:// will not work.

param([int]$Port = 8123)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.mjs'  = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.ico'  = 'image/x-icon'
  '.wasm' = 'application/wasm'
  '.woff2'= 'font/woff2'
  '.txt'  = 'text/plain; charset=utf-8'
  '.md'   = 'text/markdown; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
  $listener.Start()
} catch {
  Write-Host "Could not bind port $Port. Is it already in use?" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "  portfolio dev server" -ForegroundColor Green
Write-Host "  http://localhost:$Port" -ForegroundColor Cyan
Write-Host "  serving $root"
Write-Host "  Ctrl+C to stop"
Write-Host ""

while ($listener.IsListening) {
  try {
    $context  = $listener.GetContext()
    $request  = $context.Request
    $response = $context.Response

    $rel = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
    $rel = $rel -replace '/', '\'

    $full = Join-Path $root $rel

    # keep requests inside the project folder
    $safe = $false
    try {
      $resolved = [System.IO.Path]::GetFullPath($full)
      $safe = $resolved.StartsWith([System.IO.Path]::GetFullPath($root), [StringComparison]::OrdinalIgnoreCase)
    } catch { $safe = $false }

    if ($safe -and (Test-Path $full -PathType Leaf)) {
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $type = $mime[$ext]
      if (-not $type) { $type = 'application/octet-stream' }

      $response.StatusCode = 200
      $response.ContentType = $type
      $response.Headers.Add('Cache-Control', 'no-cache')
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host ("  200  " + $request.Url.AbsolutePath) -ForegroundColor DarkGray
    } else {
      $body = [System.Text.Encoding]::UTF8.GetBytes("404 - $rel")
      $response.StatusCode = 404
      $response.ContentType = 'text/plain; charset=utf-8'
      $response.ContentLength64 = $body.Length
      $response.OutputStream.Write($body, 0, $body.Length)
      Write-Host ("  404  " + $request.Url.AbsolutePath) -ForegroundColor Yellow
    }

    $response.OutputStream.Close()
  } catch {
    # a browser hanging up mid-response is normal; keep serving
  }
}
