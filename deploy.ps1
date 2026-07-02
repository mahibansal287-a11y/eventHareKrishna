# deploy.ps1 - Quick deploy script for Vercel via GitHub
# Usage: .\deploy.ps1 "Your commit message here"

param (
    [string]$CommitMessage = "Update event showcase catalog"
)

# Ensure Git executable path
$gitPath = "C:\Program Files\Git\cmd\git.exe"
if (-not (Test-Path $gitPath)) {
    $gitPath = "git" # Fallback to path
}

Write-Host "Starting deployment push..." -ForegroundColor Cyan

# Check if there are changes
$status = & $gitPath status --porcelain
if (-not $status) {
    Write-Host "No changes detected. Website is already up to date!" -ForegroundColor Yellow
    exit 0
}

# Add, commit and push
Write-Host "Staging changes..." -ForegroundColor Gray
& $gitPath add .

Write-Host "Committing changes with message: '$CommitMessage'..." -ForegroundColor Gray
& $gitPath commit -m $CommitMessage

Write-Host "Pushing updates to GitHub..." -ForegroundColor Gray
& $gitPath push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "--------------------------------------------------------" -ForegroundColor Green
    Write-Host "  Success! Changes pushed to GitHub." -ForegroundColor Green
    Write-Host "  Vercel is now automatically rebuilding your live site." -ForegroundColor Green
    Write-Host "  It should be updated in 10-15 seconds!" -ForegroundColor Green
    Write-Host "--------------------------------------------------------" -ForegroundColor Green
} else {
    Write-Error "Push failed. Please check your internet connection or git permissions."
}
