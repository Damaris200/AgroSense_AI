# Local-dev launcher for AgroSense AI (no Docker except Kafka).
#
# Opens a new Windows Terminal tab (or new PowerShell window) per service
# so each one's logs stay readable. Prereqs:
#   1. Kafka running on localhost:9092 (run: `docker compose up -d kafka`)
#   2. Bun installed
#   3. Per-service .env files filled in with real Neon + Atlas URIs
#
# Usage from the repo root:
#   .\start-local.ps1
#
# To stop: close each terminal window/tab manually, or Ctrl+C in each.

$ErrorActionPreference = 'Stop'
$repoRoot = $PSScriptRoot

# Order matters: auth must come up before api-gateway, kafka must be reachable.
$services = @(
    @{ name = 'auth-service';         path = 'services\auth-service' },
    @{ name = 'farm-service';         path = 'services\farm-service' },
    @{ name = 'weather-service';      path = 'services\weather-service' },
    @{ name = 'soil-service';         path = 'services\soil-service' },
    @{ name = 'orchestrator-service'; path = 'services\orchestrator-service' },
    @{ name = 'ai-service';           path = 'services\ai-service' },
    @{ name = 'notification-service'; path = 'services\notification-service' },
    @{ name = 'analytics-service';    path = 'services\analytics-service' },
    @{ name = 'api-gateway';          path = 'services\api-gateway' },
    @{ name = 'frontend';             path = 'frontend' }
)

$hasWt = $null -ne (Get-Command wt -ErrorAction SilentlyContinue)

foreach ($svc in $services) {
    $fullPath = Join-Path $repoRoot $svc.path
    $title = $svc.name
    if ($hasWt) {
        # Windows Terminal: one tab per service in the same window
        wt -w 0 nt --title $title -d $fullPath powershell -NoExit -Command "bun run dev"
    } else {
        # Fallback: each service in its own PowerShell window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$fullPath'; bun run dev"
    }
    Start-Sleep -Milliseconds 400
}

Write-Host ""
Write-Host "All services starting..."
Write-Host "Open http://localhost:5173 once you see 'ready' in the frontend tab."
