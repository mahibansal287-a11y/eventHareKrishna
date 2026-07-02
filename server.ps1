# server.ps1 - Native PowerShell HTTP Server for local hosting
# Serves the static workspace files on http://localhost:8000

$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

# Prevent crash if already running
try {
    $listener.Start()
} catch {
    Write-Error "Failed to start server. Port $port might be in use."
    exit 1
}

Write-Host "--------------------------------------------------"
Write-Host "  Eternal Elegance Local Server is now running!"
Write-Host "  Access the website at: http://localhost:$port/"
Write-Host "  Press Ctrl+C in this terminal to stop the server."
Write-Host "--------------------------------------------------"

$workspace = $PSScriptRoot
if (-not $workspace) { $workspace = "." }

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq "/" -or $path -eq "") { 
            $path = "/index.html" 
        }
        
        # Clean query strings if any
        if ($path.Contains("?")) {
            $path = $path.Substring(0, $path.IndexOf("?"))
        }
        
        # Decode URL path (handles spaces as %20 etc)
        $path = [System.Uri]::UnescapeDataString($path)
        $filePath = Join-Path $workspace $path
        
        if (Test-Path $filePath -PathType Leaf) {
            try {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                
                # Content Type mapping
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = "text/html"
                if ($ext -eq ".css") { $contentType = "text/css" }
                elseif ($ext -eq ".js") { $contentType = "application/javascript" }
                elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
                elseif ($ext -eq ".png") { $contentType = "image/png" }
                elseif ($ext -eq ".gif") { $contentType = "image/gif" }
                elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
                elseif ($ext -eq ".ico") { $contentType = "image/x-icon" }
                
                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } catch {
                $response.StatusCode = 500
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("500 Internal Server Error: $_")
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found: $path")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Server shutting down..."
} finally {
    $listener.Stop()
    $listener.Close()
}
