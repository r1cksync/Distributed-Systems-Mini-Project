# Logical Clock Visualization - PowerShell Management Script
# This script helps you run, manage, and interact with the Logical Clock Visualization project

param(
    [string]$Action = "menu",
    [string]$Browser = "default",
    [int]$Port = 8080
)

# Colors for console output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Info = "Cyan"
    Warning = "Yellow"
    Header = "Magenta"
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Banner {
    Write-ColorOutput "================================================================" -Color $Colors.Header
    Write-ColorOutput "              Logical Clock Visualization Manager             " -Color $Colors.Header
    Write-ColorOutput "          Enhanced with All Premium Features                  " -Color $Colors.Header
    Write-ColorOutput "================================================================" -Color $Colors.Header
    Write-Host ""
}

function Show-ProjectStatus {
    Write-ColorOutput "PROJECT STATUS:" -Color $Colors.Info
    
    $files = @("index.html", "styles.css", "script.js", "README.md", "task.txt")
    foreach ($file in $files) {
        if (Test-Path $file) {
            $size = [math]::Round((Get-Item $file).Length / 1KB, 2)
            Write-ColorOutput "  [OK] $file ($size KB)" -Color $Colors.Success
        } else {
            Write-ColorOutput "  [MISSING] $file" -Color $Colors.Error
        }
    }
    Write-Host ""
}

function Start-LocalServer {
    param([int]$ServerPort = 8080)
    
    Write-ColorOutput "🚀 Starting local development server on port $ServerPort..." -Color $Colors.Info
    
    try {
        # Check if Python is available
        $pythonCmd = $null
        foreach ($py in @("python", "python3", "py")) {
            try {
                $version = & $py --version 2>$null
                if ($LASTEXITCODE -eq 0) {
                    $pythonCmd = $py
                    Write-ColorOutput "  Found Python: $version" -Color $Colors.Success
                    break
                }
            } catch { }
        }
        
        if ($pythonCmd) {
            Write-ColorOutput "  Server URL: http://localhost:$ServerPort" -Color $Colors.Success
            Write-ColorOutput "  Press Ctrl+C to stop the server" -Color $Colors.Warning
            Write-Host ""
            
            # Start Python HTTP server
            & $pythonCmd -m http.server $ServerPort
        } else {
            # Fallback to Node.js if available
            try {
                $nodeVersion = & node --version 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput "  Found Node.js: $nodeVersion" -Color $Colors.Success
                    Write-ColorOutput "  Server URL: http://localhost:$ServerPort" -Color $Colors.Success
                    
                    # Create simple Node.js server
                    $serverScript = @"
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json'
    };
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
            res.end(content);
        }
    });
});

server.listen($ServerPort, () => {
    console.log('Server running at http://localhost:$ServerPort');
});
"@
                    $serverScript | Out-File -FilePath "temp_server.js" -Encoding UTF8
                    & node "temp_server.js"
                } else {
                    throw "Node.js not found"
                }
            } catch {
                Write-ColorOutput "  Neither Python nor Node.js found for local server" -Color $Colors.Error
                Write-ColorOutput "  You can open index.html directly in your browser" -Color $Colors.Info
                return $false
            }
        }
    } catch {
        Write-ColorOutput "  Failed to start server: $_" -Color $Colors.Error
        return $false
    }
    return $true
}

function Open-InBrowser {
    param([string]$BrowserType = "default", [string]$Url = "index.html")
    
    Write-ColorOutput "Opening in browser..." -Color $Colors.Info
    
    if ($Url -notmatch "^https?://") {
        $Url = "file:///$((Get-Location).Path)/$Url" -replace "\\", "/"
    }
    
    try {
        switch ($BrowserType.ToLower()) {
            "chrome" {
                Start-Process "chrome.exe" $Url
                Write-ColorOutput "  [OK] Opened in Google Chrome" -Color $Colors.Success
            }
            "firefox" {
                Start-Process "firefox.exe" $Url
                Write-ColorOutput "  [OK] Opened in Firefox" -Color $Colors.Success
            }
            "edge" {
                Start-Process "msedge.exe" $Url
                Write-ColorOutput "  [OK] Opened in Microsoft Edge" -Color $Colors.Success
            }
            default {
                Start-Process $Url
                Write-ColorOutput "  [OK] Opened in default browser" -Color $Colors.Success
            }
        }
    } catch {
        Write-ColorOutput "  [ERROR] Failed to open browser: $_" -Color $Colors.Error
        Write-ColorOutput "  Please manually open: $Url" -Color $Colors.Info
    }
}

function Show-DemoCommands {
    Write-ColorOutput "DEMO COMMANDS (Run in browser console):" -Color $Colors.Info
    Write-Host ""
    Write-ColorOutput "Basic Demos:" -Color $Colors.Header
    Write-Host "  runAdvancedDemo()                    - Full feature demonstration"
    Write-Host "  runDemo()                           - Legacy demo (alias)"
    Write-Host ""
    Write-ColorOutput "System Management:" -Color $Colors.Header
    Write-Host "  clockSystem.addProcess()            - Add a new process"
    Write-Host "  clockSystem.removeProcess()         - Remove last process"
    Write-Host "  clockSystem.reset()                 - Reset entire system"
    Write-Host ""
    Write-ColorOutput "Data Management:" -Color $Colors.Header
    Write-Host "  clockSystem.exportSystemState()    - Export system to JSON"
    Write-Host "  clockSystem.exportEventsCSV()      - Export events to CSV"
    Write-Host ""
    Write-ColorOutput "Analysis Tools:" -Color $Colors.Header
    Write-Host "  clockSystem.metrics                 - View performance metrics"
    Write-Host "  clockSystem.globalEvents           - Access all events"
    Write-Host "  clockSystem.processes              - Access all processes"
    Write-Host ""
    Write-ColorOutput "Event Analysis:" -Color $Colors.Header
    Write-Host "  clockSystem.areConcurrent(e1, e2)  - Check if events are concurrent"
    Write-Host "  clockSystem.happenedBefore(e1, e2) - Check causality relationship"
    Write-Host ""
}

function Show-Features {
    Write-ColorOutput "ENHANCED FEATURES:" -Color $Colors.Info
    Write-Host ""
    Write-ColorOutput "Core Features:" -Color $Colors.Header
    Write-Host "  [*] Lamport & Vector Clocks         - Complete logical clock implementation"
    Write-Host "  [*] Physical Clock Simulation       - Real-time clocks with drift"
    Write-Host "  [*] Dynamic Process Management      - Add/remove processes (up to 8)"
    Write-Host "  [*] Network Delay Visualization     - Configurable message delays"
    Write-Host ""
    Write-ColorOutput "Advanced Features:" -Color $Colors.Header
    Write-Host "  [*] Interactive Causality Graph     - Canvas-based relationship visualization"
    Write-Host "  [*] Performance Metrics Dashboard   - Real-time system statistics"
    Write-Host "  [*] Export/Import Functionality     - Save/load system states (JSON/CSV)"
    Write-Host "  [*] Event Ordering Visualization    - Happened-before relationships"
    Write-Host ""
    Write-ColorOutput "Educational Tools:" -Color $Colors.Header
    Write-Host "  [*] Console Debugging Tools         - Advanced system introspection"
    Write-Host "  [*] Toast Notifications            - User feedback system"
    Write-Host "  [*] Comprehensive Logging          - Detailed event tracking"
    Write-Host ""
}

function Test-ProjectFiles {
    Write-ColorOutput "RUNNING PROJECT TESTS..." -Color $Colors.Info
    
    $errors = @()
    
    # Check HTML structure
    if (Test-Path "index.html") {
        $html = Get-Content "index.html" -Raw
        if ($html -notmatch "causality-canvas") {
            $errors += "HTML: Missing causality graph canvas element"
        }
        if ($html -notmatch "performance-metrics") {
            $errors += "HTML: Missing performance metrics section"
        }
        if ($html -notmatch "data-controls") {
            $errors += "HTML: Missing export/import controls"
        }
        Write-ColorOutput "  [OK] HTML structure check passed" -Color $Colors.Success
    } else {
        $errors += "HTML: index.html file missing"
    }
    
    # Check CSS features
    if (Test-Path "styles.css") {
        $css = Get-Content "styles.css" -Raw
        if ($css -notmatch "causality-graph") {
            $errors += "CSS: Missing causality graph styles"
        }
        if ($css -notmatch "performance-metrics") {
            $errors += "CSS: Missing performance metrics styles"
        }
        if ($css -notmatch "message-in-transit") {
            $errors += "CSS: Missing network delay animation styles"
        }
        Write-ColorOutput "  [OK] CSS feature check passed" -Color $Colors.Success
    } else {
        $errors += "CSS: styles.css file missing"
    }
    
    # Check JavaScript functionality
    if (Test-Path "script.js") {
        $js = Get-Content "script.js" -Raw
        if ($js -notmatch "EnhancedLogicalClockSystem") {
            $errors += "JS: Missing enhanced clock system class"
        }
        if ($js -notmatch "drawCausalityGraph") {
            $errors += "JS: Missing causality graph implementation"
        }
        if ($js -notmatch "exportSystemState") {
            $errors += "JS: Missing export functionality"
        }
        if ($js -notmatch "addProcess") {
            $errors += "JS: Missing dynamic process management"
        }
        Write-ColorOutput "  [OK] JavaScript feature check passed" -Color $Colors.Success
    } else {
        $errors += "JS: script.js file missing"
    }
    
    Write-Host ""
    if ($errors.Count -eq 0) {
        Write-ColorOutput "All tests passed! Project is ready to run." -Color $Colors.Success
    } else {
        Write-ColorOutput "Found $($errors.Count) issue(s):" -Color $Colors.Error
        foreach ($error in $errors) {
            Write-ColorOutput "  - $error" -Color $Colors.Error
        }
    }
    Write-Host ""
}

function Show-QuickStart {
    Write-ColorOutput "QUICK START GUIDE:" -Color $Colors.Info
    Write-Host ""
    Write-ColorOutput "1. Basic Usage:" -Color $Colors.Header
    Write-Host "   - Open index.html in any modern browser"
    Write-Host "   - Click 'Generate Event' buttons to create events"
    Write-Host "   - Use message sending controls to simulate communication"
    Write-Host ""
    Write-ColorOutput "2. Advanced Features:" -Color $Colors.Header
    Write-Host "   - Toggle 'Show Physical Clocks' to see clock drift simulation"
    Write-Host "   - Enable 'Show Causality Graph' for visual relationship analysis"
    Write-Host "   - Adjust network delay slider to see timing effects"
    Write-Host "   - Use 'Add Process' to expand beyond 3 processes"
    Write-Host ""
    Write-ColorOutput "3. Data Management:" -Color $Colors.Header
    Write-Host "   - Click 'Export System State' to save your work"
    Write-Host "   - Use 'Export Events (CSV)' for spreadsheet analysis"
    Write-Host "   - Import previously saved states to continue work"
    Write-Host ""
    Write-ColorOutput "4. Console Commands:" -Color $Colors.Header
    Write-Host "   - Press F12 to open browser console"
    Write-Host "   - Type 'runAdvancedDemo()' for automated demonstration"
    Write-Host "   - Use 'clockSystem' object for advanced debugging"
    Write-Host ""
}

function Show-Menu {
    Write-Host ""
    Write-ColorOutput "SELECT AN ACTION:" -Color $Colors.Info
    Write-Host ""
    Write-Host "  1. Show Project Status"
    Write-Host "  2. Start Local Server"
    Write-Host "  3. Open in Browser (File)"
    Write-Host "  4. Open in Browser (Chrome)"
    Write-Host "  5. Open in Browser (Firefox)"
    Write-Host "  6. Open in Browser (Edge)"
    Write-Host "  7. Test Project Files"
    Write-Host "  8. Show Demo Commands"
    Write-Host "  9. Show Features List"
    Write-Host "  10. Show Quick Start Guide"
    Write-Host "  11. Complete Workflow (Server + Browser)"
    Write-Host "  0. Exit"
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (0-11)"
    
    switch ($choice) {
        "1" { Show-ProjectStatus; Read-Host "Press Enter to continue..."; Show-Menu }
        "2" { Start-LocalServer -ServerPort $Port; Read-Host "Press Enter to continue..."; Show-Menu }
        "3" { Open-InBrowser -BrowserType "default"; Read-Host "Press Enter to continue..."; Show-Menu }
        "4" { Open-InBrowser -BrowserType "chrome"; Read-Host "Press Enter to continue..."; Show-Menu }
        "5" { Open-InBrowser -BrowserType "firefox"; Read-Host "Press Enter to continue..."; Show-Menu }
        "6" { Open-InBrowser -BrowserType "edge"; Read-Host "Press Enter to continue..."; Show-Menu }
        "7" { Test-ProjectFiles; Read-Host "Press Enter to continue..."; Show-Menu }
        "8" { Show-DemoCommands; Read-Host "Press Enter to continue..."; Show-Menu }
        "9" { Show-Features; Read-Host "Press Enter to continue..."; Show-Menu }
        "10" { Show-QuickStart; Read-Host "Press Enter to continue..."; Show-Menu }
        "11" { 
            Write-ColorOutput "Starting complete workflow..." -Color $Colors.Info
            Start-Job -ScriptBlock { param($port) & python -m http.server $port } -ArgumentList $Port | Out-Null
            Start-Sleep 2
            Open-InBrowser -Url "http://localhost:$Port"
            Read-Host "Press Enter to continue..."
            Get-Job | Stop-Job
            Get-Job | Remove-Job
            Show-Menu 
        }
        "0" { 
            Write-ColorOutput "Thanks for using Logical Clock Visualization!" -Color $Colors.Success
            Write-ColorOutput "Happy learning about distributed systems!" -Color $Colors.Info
            exit 0 
        }
        default { 
            Write-ColorOutput "Invalid choice. Please try again." -Color $Colors.Error
            Show-Menu 
        }
    }
}

# Main script execution
Clear-Host
Show-Banner

# Handle command line arguments
switch ($Action.ToLower()) {
    "server" { 
        Show-ProjectStatus
        Start-LocalServer -ServerPort $Port 
    }
    "open" { 
        Show-ProjectStatus
        Open-InBrowser -BrowserType $Browser 
    }
    "test" { 
        Show-ProjectStatus
        Test-ProjectFiles 
    }
    "status" { 
        Show-ProjectStatus 
    }
    "features" { 
        Show-Features 
    }
    "demo" { 
        Show-DemoCommands 
    }
    "quick" { 
        Show-QuickStart 
    }
    default { 
        Show-ProjectStatus
        Show-Menu 
    }
}

# Cleanup
if (Test-Path "temp_server.js") {
    Remove-Item "temp_server.js" -Force -ErrorAction SilentlyContinue
}