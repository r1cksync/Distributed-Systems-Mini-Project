# Logical Clock Visualization (Lamport and Vector Clocks)

A web-based interactive visualization that demonstrates logical clocks, event ordering, and causality concepts for distributed systems. The application supports Lamport timestamps, vector clocks, physical-clock simulation (with drift), configurable network delays, a causality graph, dynamic process management, export/import features, and real-time performance metrics.

This repository contains a self-contained client-side application implemented with HTML, CSS and JavaScript intended for educational use and demonstration.

## Table of contents

- Project overview
- Features
- Getting started
- Usage
- Implementation details
- Console API & debugging
- File structure
- Development notes
- Testing and verification
- Troubleshooting
- License
- Contact

## Project overview

This project models multiple processes that generate local events and exchange messages. It visualizes:

- Lamport logical timestamps (happened-before ordering)
- Vector clocks (causality and concurrency detection)
- Simulated physical clocks with configurable drift
- Network delays and message-in-transit visualization
- An interactive causality graph that draws happened-before edges
- Export/import of system state and CSV export for events
- Real-time performance metrics (total events, messages, concurrency, clock drift, average network delay, uptime)

## Features

- Dynamic process management: add or remove processes (up to 8 supported by the UI)
- Internal events: generate local events per process
- Message send/receive: simulate communication with configurable delay
- Lamport timestamps and vector clocks updated according to standard algorithms
- Physical clock simulation with drift per process
- Canvas-based causality graph showing send→receive edges
- Export/import: save full system state as JSON and export events as CSV
- Performance metrics dashboard with live updates
- Demo utilities exposed on the browser console for scripted demonstrations

## Getting started

### Prerequisites

- A modern web browser (Chrome, Edge, Firefox, or similar) with JavaScript enabled
- Optional: Python 3 installed for a simple local HTTP server, or Node.js for an alternative server.
- Optional (Windows): PowerShell to use the included `run.ps1` helper script.

### Running locally

**Option 1 — Open directly (quick, no server)**

1. Open `index.html` in your browser by double-clicking or using the browser's "Open File" feature.

**Note:** Some browsers restrict file-based access for certain APIs; if you see issues, run a local server using one of the options below.

**Option 2 — Python HTTP server (recommended)**

Open a PowerShell terminal in the project root and run:

```powershell
# start a simple file server on port 8080
python -m http.server 8080
# then open http://localhost:8080 in your browser
```

**Option 3 — Node.js (if available)**

```powershell
# from project root, run a simple static server (example using http-server if installed)
# npm install -g http-server
http-server -p 8080
# then open http://localhost:8080 in your browser
```

**Option 4 — Helper script (Windows / PowerShell)**

The repository includes `run.ps1`, an interactive PowerShell helper that can start a local server, open the project in a browser, run basic checks and show usage hints.

```powershell
# From the repository root
.\run.ps1
# Or run non-interactively
.\run.ps1 -Action server -Port 8080
```

## Usage

Primary controls are available in the web UI.

- Generate Event (per process): create an internal event (increments Lamport and vector clocks)
- Send Message: choose sender and receiver and click "Send Message" (increments sender's clocks; receive event processed after the configured network delay)
- Add Process / Remove Process: dynamically add or remove processes; vector clocks resize automatically
- Toggle Vector Clocks / Physical Clocks: show or hide vector/physical clock displays
- Network Delay Slider: adjust simulated message delay (milliseconds)
- Show Event Ordering: order the global timeline by Lamport timestamps
- Show Causality Graph: display an interactive canvas drawing send→receive arrows between events
- Export System State: download a JSON snapshot of processes, events and metrics
- Import System State: load a previously exported JSON snapshot
- Export Events (CSV): download events as a CSV for analysis
- Reset: clear all events and clocks

## Implementation details

### Lamport timestamps

- Each process maintains an integer Lamport clock.
- On a local event: increment the local Lamport clock by 1.
- On send: increment sender's Lamport clock and attach it to the message.
- On receive: set receiver's Lamport clock to `max(local, message) + 1`.

### Vector clocks

- Each process maintains a vector of length N (N = number of processes).
- On a local event: increment the component corresponding to the process.
- On send: attach the sender's vector clock to the message.
- On receive: take component-wise maximum of local and received vectors, then increment the receiver's component.
- Concurrency is detected when neither vector is component-wise less-than-or-equal to the other.

### Physical clocks and drift

- Each process simulates a physical clock derived from system time plus a small randomized drift factor.
- Physical timestamps are included with events to illustrate divergence between real and logical time.

### Network delay simulation

- Messages are delivered after a configurable delay (slider in UI).
- A transient visual element represents messages in transit when network delay visualization is enabled.

### Causality graph

- Events are placed along per-process horizontal lines and ordered temporally.
- Send→receive edges are drawn as arrows to show happened-before relationships.

## Console API and debugging

The application exposes a global object `clockSystem` (for debugging and scripted demonstrations) with the following useful members and methods:

- `clockSystem.processes` — array of process objects and their current state
- `clockSystem.globalEvents` — array of all recorded events in the system
- `clockSystem.metrics` — current performance metrics
- `clockSystem.generateEvent(processId)` — programmatically create an internal event
- `clockSystem.sendMessage(senderId, receiverId)` — programmatically send a message
- `clockSystem.addProcess()` / `clockSystem.removeProcess()` — manage processes programmatically
- `clockSystem.exportSystemState()` — download JSON snapshot of the system
- `clockSystem.importSystemState(fileEvent)` — import a system state (file input handler)
- `clockSystem.exportEventsCSV()` — download events as CSV
- `clockSystem.areConcurrent(event1, event2)` — test whether two events are concurrent (vector clock comparison)
- `clockSystem.happenedBefore(event1, event2)` — test happened-before relation using vector clocks

Example (browser console):

```javascript
// Run the included demo sequence
runAdvancedDemo()

// Inspect metrics
console.log(clockSystem.metrics)

// Export state
clockSystem.exportSystemState()
```

## File structure

```
├── index.html          # Main HTML user interface
├── styles.css          # Styles and layout
├── script.js           # Application logic (Lamport/vector clocks, UI wiring)
├── run.ps1             # PowerShell helper for running and testing
├── task.txt            # Original task description
└── README.md           # Project documentation (this file)
```

## Development notes

- The application is client-side and requires no server to function; a local static server is recommended to avoid file-protocol restrictions.
- Vector clock arrays are resized when processes are added or removed; when importing state, ensure vector lengths are consistent.
- The demo and scripting APIs are available for experimentation — use the browser console for quick automation.

## Testing and verification

Basic functionality can be validated by:

1. Creating internal events in multiple processes
2. Sending messages and verifying Lamport and vector clock updates
3. Enabling the causality graph and confirming send→receive edges
4. Exporting and re-importing JSON state and checking consistency

## Troubleshooting

- If the UI does not load correctly when opened as a file, run a local HTTP server (Python or Node) as described in "Getting started".
- If vector clock sizes appear inconsistent after importing a state, remove processes and re-add them or reset the system to reinitialize clocks.
- If the PowerShell helper `run.ps1` fails to start a server, ensure Python or Node is installed and available on `PATH`.

## License

This project is provided for educational use. No license is specified in the repository; add a `LICENSE` file if you intend to apply a particular open-source license.

## Acknowledgements

This visualization was created to support learning and teaching of distributed systems concepts such as logical time, causality, and concurrent event analysis.

## Contact

For questions or collaboration, open an issue in the repository or contact the repository owner.
