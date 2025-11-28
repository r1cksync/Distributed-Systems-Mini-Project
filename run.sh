#!/bin/bash

# Logical Clock Visualization - Bash Management Script
# This script helps you run, manage, and interact with the Logical Clock Visualization project

# Default values
ACTION="menu"
BROWSER="default"
PORT=8080

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--action)
            ACTION="$2"
            shift 2
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -a, --action ACTION    Action to perform (menu|server|open|test|status|features|demo|quick)"
            echo "  -b, --browser BROWSER  Browser to use (default|chrome|firefox|safari)"
            echo "  -p, --port PORT        Port for local server (default: 8080)"
            echo "  -h, --help             Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

function print_colored() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

function show_banner() {
    print_colored $MAGENTA "================================================================"
    print_colored $MAGENTA "              Logical Clock Visualization Manager             "
    print_colored $MAGENTA "          Enhanced with All Premium Features                  "
    print_colored $MAGENTA "================================================================"
    echo
}

function show_project_status() {
    print_colored $CYAN "PROJECT STATUS:"
    
    local files=("index.html" "styles.css" "script.js" "README.md" "task.txt")
    
    for file in "${files[@]}"; do
        if [[ -f "$file" ]]; then
            local size=$(du -h "$file" | cut -f1)
            print_colored $GREEN "  [OK] $file ($size)"
        else
            print_colored $RED "  [MISSING] $file"
        fi
    done
    echo
}

function start_local_server() {
    local server_port=${1:-8080}
    
    print_colored $CYAN "Starting local development server on port $server_port..."
    
    # Check if Python is available
    if command -v python3 &> /dev/null; then
        local version=$(python3 --version)
        print_colored $GREEN "  Found Python: $version"
        print_colored $GREEN "  Server URL: http://localhost:$server_port"
        print_colored $YELLOW "  Press Ctrl+C to stop the server"
        echo
        
        # Start Python HTTP server
        python3 -m http.server $server_port
    elif command -v python &> /dev/null; then
        local version=$(python --version)
        print_colored $GREEN "  Found Python: $version"
        print_colored $GREEN "  Server URL: http://localhost:$server_port"
        print_colored $YELLOW "  Press Ctrl+C to stop the server"
        echo
        
        # Start Python HTTP server
        python -m http.server $server_port
    elif command -v node &> /dev/null; then
        local node_version=$(node --version)
        print_colored $GREEN "  Found Node.js: $node_version"
        print_colored $GREEN "  Server URL: http://localhost:$server_port"
        print_colored $YELLOW "  Press Ctrl+C to stop the server"
        echo
        
        # Create simple Node.js server
        cat > temp_server.js << EOF
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

server.listen($server_port, () => {
    console.log('Server running at http://localhost:$server_port');
});
EOF
        
        node temp_server.js
    else
        print_colored $RED "  Neither Python nor Node.js found for local server"
        print_colored $CYAN "  You can open index.html directly in your browser"
        return 1
    fi
    
    return 0
}

function open_in_browser() {
    local browser_type=${1:-default}
    local url=${2:-index.html}
    
    print_colored $CYAN "Opening in browser..."
    
    if [[ ! $url =~ ^https?:// ]]; then
        url="file://$(pwd)/$url"
    fi
    
    case $browser_type in
        chrome)
            if command -v google-chrome &> /dev/null; then
                google-chrome "$url" &
                print_colored $GREEN "  [OK] Opened in Google Chrome"
            elif command -v chromium-browser &> /dev/null; then
                chromium-browser "$url" &
                print_colored $GREEN "  [OK] Opened in Chromium"
            else
                print_colored $RED "  [ERROR] Chrome/Chromium not found"
                return 1
            fi
            ;;
        firefox)
            if command -v firefox &> /dev/null; then
                firefox "$url" &
                print_colored $GREEN "  [OK] Opened in Firefox"
            else
                print_colored $RED "  [ERROR] Firefox not found"
                return 1
            fi
            ;;
        safari)
            if command -v safari &> /dev/null; then
                safari "$url" &
                print_colored $GREEN "  [OK] Opened in Safari"
            else
                print_colored $RED "  [ERROR] Safari not found"
                return 1
            fi
            ;;
        *)
            if command -v xdg-open &> /dev/null; then
                xdg-open "$url" &
                print_colored $GREEN "  [OK] Opened in default browser"
            elif command -v open &> /dev/null; then
                open "$url" &
                print_colored $GREEN "  [OK] Opened in default browser"
            else
                print_colored $RED "  [ERROR] No suitable browser opener found"
                print_colored $CYAN "  Please manually open: $url"
                return 1
            fi
            ;;
    esac
}

function show_demo_commands() {
    print_colored $CYAN "DEMO COMMANDS (Run in browser console):"
    echo
    print_colored $MAGENTA "Basic Demos:"
    echo "  runAdvancedDemo()                    - Full feature demonstration"
    echo "  runDemo()                           - Legacy demo (alias)"
    echo
    print_colored $MAGENTA "System Management:"
    echo "  clockSystem.addProcess()            - Add a new process"
    echo "  clockSystem.removeProcess()         - Remove last process"
    echo "  clockSystem.reset()                 - Reset entire system"
    echo
    print_colored $MAGENTA "Data Management:"
    echo "  clockSystem.exportSystemState()    - Export system to JSON"
    echo "  clockSystem.exportEventsCSV()      - Export events to CSV"
    echo
    print_colored $MAGENTA "Analysis Tools:"
    echo "  clockSystem.metrics                 - View performance metrics"
    echo "  clockSystem.globalEvents           - Access all events"
    echo "  clockSystem.processes              - Access all processes"
    echo
    print_colored $MAGENTA "Event Analysis:"
    echo "  clockSystem.areConcurrent(e1, e2)  - Check if events are concurrent"
    echo "  clockSystem.happenedBefore(e1, e2) - Check causality relationship"
    echo
}

function show_features() {
    print_colored $CYAN "ENHANCED FEATURES:"
    echo
    print_colored $MAGENTA "Core Features:"
    echo "  [*] Lamport & Vector Clocks         - Complete logical clock implementation"
    echo "  [*] Physical Clock Simulation       - Real-time clocks with drift"
    echo "  [*] Dynamic Process Management      - Add/remove processes (up to 8)"
    echo "  [*] Network Delay Visualization     - Configurable message delays"
    echo
    print_colored $MAGENTA "Advanced Features:"
    echo "  [*] Interactive Causality Graph     - Canvas-based relationship visualization"
    echo "  [*] Performance Metrics Dashboard   - Real-time system statistics"
    echo "  [*] Export/Import Functionality     - Save/load system states (JSON/CSV)"
    echo "  [*] Event Ordering Visualization    - Happened-before relationships"
    echo
    print_colored $MAGENTA "Educational Tools:"
    echo "  [*] Console Debugging Tools         - Advanced system introspection"
    echo "  [*] Toast Notifications            - User feedback system"
    echo "  [*] Comprehensive Logging          - Detailed event tracking"
    echo
}

function test_project_files() {
    print_colored $CYAN "RUNNING PROJECT TESTS..."
    
    local errors=()
    
    # Check HTML structure
    if [[ -f "index.html" ]]; then
        if ! grep -q "causality-canvas" "index.html"; then
            errors+=("HTML: Missing causality graph canvas element")
        fi
        if ! grep -q "performance-metrics" "index.html"; then
            errors+=("HTML: Missing performance metrics section")
        fi
        if ! grep -q "data-controls" "index.html"; then
            errors+=("HTML: Missing export/import controls")
        fi
        print_colored $GREEN "  [OK] HTML structure check passed"
    else
        errors+=("HTML: index.html file missing")
    fi
    
    # Check CSS features
    if [[ -f "styles.css" ]]; then
        if ! grep -q "causality-graph" "styles.css"; then
            errors+=("CSS: Missing causality graph styles")
        fi
        if ! grep -q "performance-metrics" "styles.css"; then
            errors+=("CSS: Missing performance metrics styles")
        fi
        if ! grep -q "message-in-transit" "styles.css"; then
            errors+=("CSS: Missing network delay animation styles")
        fi
        print_colored $GREEN "  [OK] CSS feature check passed"
    else
        errors+=("CSS: styles.css file missing")
    fi
    
    # Check JavaScript functionality
    if [[ -f "script.js" ]]; then
        if ! grep -q "EnhancedLogicalClockSystem" "script.js"; then
            errors+=("JS: Missing enhanced clock system class")
        fi
        if ! grep -q "drawCausalityGraph" "script.js"; then
            errors+=("JS: Missing causality graph implementation")
        fi
        if ! grep -q "exportSystemState" "script.js"; then
            errors+=("JS: Missing export functionality")
        fi
        if ! grep -q "addProcess" "script.js"; then
            errors+=("JS: Missing dynamic process management")
        fi
        print_colored $GREEN "  [OK] JavaScript feature check passed"
    else
        errors+=("JS: script.js file missing")
    fi
    
    echo
    if [[ ${#errors[@]} -eq 0 ]]; then
        print_colored $GREEN "All tests passed! Project is ready to run."
    else
        print_colored $RED "Found ${#errors[@]} issue(s):"
        for error in "${errors[@]}"; do
            print_colored $RED "  - $error"
        done
    fi
    echo
}

function show_quick_start() {
    print_colored $CYAN "QUICK START GUIDE:"
    echo
    print_colored $MAGENTA "1. Basic Usage:"
    echo "   - Open index.html in any modern browser"
    echo "   - Click 'Generate Event' buttons to create events"
    echo "   - Use message sending controls to simulate communication"
    echo
    print_colored $MAGENTA "2. Advanced Features:"
    echo "   - Toggle 'Show Physical Clocks' to see clock drift simulation"
    echo "   - Enable 'Show Causality Graph' for visual relationship analysis"
    echo "   - Adjust network delay slider to see timing effects"
    echo "   - Use 'Add Process' to expand beyond 3 processes"
    echo
    print_colored $MAGENTA "3. Data Management:"
    echo "   - Click 'Export System State' to save your work"
    echo "   - Use 'Export Events (CSV)' for spreadsheet analysis"
    echo "   - Import previously saved states to continue work"
    echo
    print_colored $MAGENTA "4. Console Commands:"
    echo "   - Press F12 to open browser console"
    echo "   - Type 'runAdvancedDemo()' for automated demonstration"
    echo "   - Use 'clockSystem' object for advanced debugging"
    echo
}

function show_menu() {
    echo
    print_colored $CYAN "SELECT AN ACTION:"
    echo
    echo "  1. Show Project Status"
    echo "  2. Start Local Server"
    echo "  3. Open in Browser (Default)"
    echo "  4. Open in Browser (Chrome)"
    echo "  5. Open in Browser (Firefox)"
    echo "  6. Open in Browser (Safari)"
    echo "  7. Test Project Files"
    echo "  8. Show Demo Commands"
    echo "  9. Show Features List"
    echo "  10. Show Quick Start Guide"
    echo "  11. Complete Workflow (Server + Browser)"
    echo "  0. Exit"
    echo
    
    read -p "Enter your choice (0-11): " choice
    
    case $choice in
        1)
            show_project_status
            read -p "Press Enter to continue..."
            show_menu
            ;;
        2)
            start_local_server $PORT
            read -p "Press Enter to continue..."
            show_menu
            ;;
        3)
            open_in_browser "default"
            read -p "Press Enter to continue..."
            show_menu
            ;;
        4)
            open_in_browser "chrome"
            read -p "Press Enter to continue..."
            show_menu
            ;;
        5)
            open_in_browser "firefox"
            read -p "Press Enter to continue..."
            show_menu
            ;;
        6)
            open_in_browser "safari"
            read -p "Press Enter to continue..."
            show_menu
            ;;
        7)
            test_project_files
            read -p "Press Enter to continue..."
            show_menu
            ;;
        8)
            show_demo_commands
            read -p "Press Enter to continue..."
            show_menu
            ;;
        9)
            show_features
            read -p "Press Enter to continue..."
            show_menu
            ;;
        10)
            show_quick_start
            read -p "Press Enter to continue..."
            show_menu
            ;;
        11)
            print_colored $CYAN "Starting complete workflow..."
            # Start server in background
            start_local_server $PORT &
            SERVER_PID=$!
            sleep 2
            open_in_browser "default" "http://localhost:$PORT"
            read -p "Press Enter to stop server and continue..."
            kill $SERVER_PID 2>/dev/null
            show_menu
            ;;
        0)
            print_colored $GREEN "Thanks for using Logical Clock Visualization!"
            print_colored $CYAN "Happy learning about distributed systems!"
            exit 0
            ;;
        *)
            print_colored $RED "Invalid choice. Please try again."
            show_menu
            ;;
    esac
}

# Main script execution
clear
show_banner

# Handle command line arguments
case $ACTION in
    server)
        show_project_status
        start_local_server $PORT
        ;;
    open)
        show_project_status
        open_in_browser $BROWSER
        ;;
    test)
        show_project_status
        test_project_files
        ;;
    status)
        show_project_status
        ;;
    features)
        show_features
        ;;
    demo)
        show_demo_commands
        ;;
    quick)
        show_quick_start
        ;;
    *)
        show_project_status
        show_menu
        ;;
esac

# Cleanup
if [[ -f "temp_server.js" ]]; then
    rm -f "temp_server.js"
fi