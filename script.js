class EnhancedLogicalClockSystem {
    constructor() {
        this.processes = [
            { id: 0, name: 'A', lamportClock: 0, vectorClock: [0, 0, 0], physicalClock: 0, clockDrift: 0, events: [] },
            { id: 1, name: 'B', lamportClock: 0, vectorClock: [0, 0, 0], physicalClock: 0, clockDrift: 0, events: [] },
            { id: 2, name: 'C', lamportClock: 0, vectorClock: [0, 0, 0], physicalClock: 0, clockDrift: 0, events: [] }
        ];
        this.globalEvents = [];
        this.eventCounter = 0;
        this.showVectorClocks = false;
        this.showPhysicalClocks = false;
        this.showNetworkDelays = false;
        this.showOrdering = false;
        this.showCausalityGraph = false;
        this.networkDelay = 1000;
        this.systemStartTime = Date.now();
        this.metrics = {
            totalEvents: 0,
            messagesSent: 0,
            concurrentEvents: 0,
            networkDelays: [],
            maxClockDrift: 0
        };
        
        this.initializeEventListeners();
        this.updateDisplay();
        this.startPhysicalClocks();
        this.startMetricsUpdater();
    }

    initializeEventListeners() {
        // Event generation buttons (delegated event handling for dynamic processes)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('event-btn')) {
                const processId = parseInt(e.target.dataset.process);
                this.generateEvent(processId);
            }
        });

        // Message sending
        document.getElementById('send-message-btn').addEventListener('click', () => {
            const senderId = parseInt(document.getElementById('sender-process').value);
            const receiverId = parseInt(document.getElementById('receiver-process').value);
            
            if (senderId !== receiverId && this.processes[senderId] && this.processes[receiverId]) {
                this.sendMessage(senderId, receiverId);
            } else {
                this.showToast('Sender and receiver must be different valid processes!', 'error');
            }
        });

        // Network delay slider
        const delaySlider = document.getElementById('network-delay-slider');
        delaySlider.addEventListener('input', (e) => {
            this.networkDelay = parseInt(e.target.value);
            document.getElementById('delay-value').textContent = `${this.networkDelay}ms`;
        });

        // Control buttons
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('toggle-vector-clocks').addEventListener('click', () => this.toggleVectorClocks());
        document.getElementById('toggle-physical-clocks').addEventListener('click', () => this.togglePhysicalClocks());
        document.getElementById('toggle-network-delays').addEventListener('click', () => this.toggleNetworkDelays());
        document.getElementById('add-process-btn').addEventListener('click', () => this.addProcess());
        document.getElementById('remove-process-btn').addEventListener('click', () => this.removeProcess());

        // Checkboxes
        document.getElementById('show-ordering').addEventListener('change', (e) => {
            this.showOrdering = e.target.checked;
            this.updateGlobalTimeline();
        });

        document.getElementById('show-causality-graph').addEventListener('change', (e) => {
            this.showCausalityGraph = e.target.checked;
            this.toggleCausalityGraph();
        });

        // Export/Import functionality
        document.getElementById('export-btn').addEventListener('click', () => this.exportSystemState());
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', (e) => this.importSystemState(e));
        document.getElementById('export-events-csv').addEventListener('click', () => this.exportEventsCSV());
    }

    startPhysicalClocks() {
        setInterval(() => {
            const currentTime = Date.now() - this.systemStartTime;
            this.processes.forEach((process, index) => {
                // Simulate clock drift (each process has slightly different clock speed)
                if (!process.clockDrift) {
                    process.clockDrift = (Math.random() - 0.5) * 0.1; // ±5% drift
                }
                process.physicalClock = Math.floor(currentTime * (1 + process.clockDrift));
            });
            
            if (this.showPhysicalClocks) {
                this.updatePhysicalClockDisplay();
            }
            this.updateMetrics();
        }, 100);
    }

    startMetricsUpdater() {
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 1000);
    }

    generateEvent(processId) {
        if (!this.processes[processId]) return;

        // Increment Lamport clock
        this.processes[processId].lamportClock++;
        
        // Increment vector clock for this process
        this.processes[processId].vectorClock[processId]++;

        // Create event
        const event = {
            id: ++this.eventCounter,
            processId: processId,
            processName: this.processes[processId].name,
            type: 'internal',
            lamportTimestamp: this.processes[processId].lamportClock,
            vectorTimestamp: [...this.processes[processId].vectorClock],
            physicalTimestamp: this.processes[processId].physicalClock,
            timestamp: Date.now(),
            description: `Event ${this.eventCounter}`
        };

        // Add to process events and global events
        this.processes[processId].events.push(event);
        this.globalEvents.push(event);
        this.metrics.totalEvents++;

        this.updateDisplay();
        this.logEvent(event);
    }

    sendMessage(senderId, receiverId) {
        if (!this.processes[senderId] || !this.processes[receiverId]) return;

        // Send event
        this.processes[senderId].lamportClock++;
        this.processes[senderId].vectorClock[senderId]++;

        const sendEvent = {
            id: ++this.eventCounter,
            processId: senderId,
            processName: this.processes[senderId].name,
            type: 'send',
            lamportTimestamp: this.processes[senderId].lamportClock,
            vectorTimestamp: [...this.processes[senderId].vectorClock],
            physicalTimestamp: this.processes[senderId].physicalClock,
            timestamp: Date.now(),
            description: `Send to ${this.processes[receiverId].name}`,
            receiverId: receiverId,
            networkDelay: this.networkDelay
        };

        this.processes[senderId].events.push(sendEvent);
        this.globalEvents.push(sendEvent);
        this.metrics.totalEvents++;
        this.metrics.messagesSent++;
        this.metrics.networkDelays.push(this.networkDelay);

        if (this.showNetworkDelays) {
            this.visualizeNetworkDelay(senderId, receiverId);
        }

        // Simulate network delay before receive event
        setTimeout(() => {
            this.receiveMessage(sendEvent, receiverId);
        }, this.networkDelay);

        this.updateDisplay();
        this.logEvent(sendEvent);
    }

    receiveMessage(sendEvent, receiverId) {
        if (!this.processes[receiverId]) return;

        // Update Lamport clock based on Lamport algorithm
        const maxLamport = Math.max(
            this.processes[receiverId].lamportClock,
            sendEvent.lamportTimestamp
        ) + 1;
        
        this.processes[receiverId].lamportClock = maxLamport;

        // Update vector clock - take max of each component and increment receiver's
        const newVectorClock = [...this.processes[receiverId].vectorClock];
        for (let i = 0; i < newVectorClock.length; i++) {
            if (i < sendEvent.vectorTimestamp.length) {
                newVectorClock[i] = Math.max(newVectorClock[i], sendEvent.vectorTimestamp[i]);
            }
        }
        newVectorClock[receiverId]++;
        this.processes[receiverId].vectorClock = newVectorClock;

        const receiveEvent = {
            id: ++this.eventCounter,
            processId: receiverId,
            processName: this.processes[receiverId].name,
            type: 'receive',
            lamportTimestamp: this.processes[receiverId].lamportClock,
            vectorTimestamp: [...this.processes[receiverId].vectorClock],
            physicalTimestamp: this.processes[receiverId].physicalClock,
            timestamp: Date.now(),
            description: `Receive from ${sendEvent.processName}`,
            senderId: sendEvent.processId,
            originalSendEvent: sendEvent,
            networkDelay: sendEvent.networkDelay
        };

        this.processes[receiverId].events.push(receiveEvent);
        this.globalEvents.push(receiveEvent);
        this.metrics.totalEvents++;

        this.updateDisplay();
        this.logEvent(receiveEvent);
    }

    addProcess() {
        if (this.processes.length >= 8) {
            this.showToast('Maximum 8 processes allowed', 'error');
            return;
        }

        const processId = this.processes.length;
        const processName = String.fromCharCode(65 + processId); // A, B, C, D, ...

        // Create new vector clocks for all processes
        const newVectorSize = this.processes.length + 1;
        this.processes.forEach(process => {
            process.vectorClock.push(0);
        });

        const newProcess = {
            id: processId,
            name: processName,
            lamportClock: 0,
            vectorClock: new Array(newVectorSize).fill(0),
            physicalClock: 0,
            clockDrift: (Math.random() - 0.5) * 0.1,
            events: []
        };

        this.processes.push(newProcess);
        this.createProcessUI(newProcess);
        this.updateProcessSelectors();
        this.updateDisplay();
        this.showToast(`Process ${processName} added`, 'info');
    }

    removeProcess() {
        if (this.processes.length <= 2) {
            this.showToast('Minimum 2 processes required', 'error');
            return;
        }

        const lastProcessId = this.processes.length - 1;
        const processName = this.processes[lastProcessId].name;

        // Remove from vector clocks
        this.processes.forEach(process => {
            process.vectorClock.pop();
        });

        this.processes.pop();
        this.removeProcessUI(lastProcessId);
        this.updateProcessSelectors();
        this.updateDisplay();
        this.showToast(`Process ${processName} removed`, 'info');
    }

    createProcessUI(process) {
        const container = document.querySelector('.processes-container');
        const processDiv = document.createElement('div');
        processDiv.className = 'process dynamic';
        processDiv.id = `process-${process.id}`;
        
        processDiv.innerHTML = `
            <h3>Process ${process.name}</h3>
            <button class="event-btn" data-process="${process.id}">Generate Event</button>
            <div class="clock-info">
                <div class="lamport-clock">Lamport: <span class="lamport-value">0</span></div>
                <div class="vector-clock${this.showVectorClocks ? '' : ' hidden'}">Vector: <span class="vector-value">[${process.vectorClock.join(',')}]</span></div>
                <div class="physical-clock${this.showPhysicalClocks ? '' : ' hidden'}">Physical: <span class="physical-value">0ms</span></div>
            </div>
            <div class="events-timeline"></div>
        `;
        
        container.appendChild(processDiv);
    }

    removeProcessUI(processId) {
        const processElement = document.getElementById(`process-${processId}`);
        if (processElement) {
            processElement.classList.add('removing');
            setTimeout(() => {
                processElement.remove();
            }, 300);
        }
    }

    updateProcessSelectors() {
        const senderSelect = document.getElementById('sender-process');
        const receiverSelect = document.getElementById('receiver-process');
        
        const currentSender = senderSelect.value;
        const currentReceiver = receiverSelect.value;
        
        senderSelect.innerHTML = '';
        receiverSelect.innerHTML = '';
        
        this.processes.forEach(process => {
            const option1 = new Option(`Process ${process.name}`, process.id);
            const option2 = new Option(`Process ${process.name}`, process.id);
            senderSelect.add(option1);
            receiverSelect.add(option2);
        });
        
        // Restore selections if still valid
        if (currentSender < this.processes.length) senderSelect.value = currentSender;
        if (currentReceiver < this.processes.length) receiverSelect.value = currentReceiver;
    }

    visualizeNetworkDelay(senderId, receiverId) {
        const senderElement = document.getElementById(`process-${senderId}`);
        const receiverElement = document.getElementById(`process-${receiverId}`);
        
        if (!senderElement || !receiverElement) return;

        const message = document.createElement('div');
        message.className = 'message-in-transit';
        message.textContent = `Message (${this.networkDelay}ms)`;
        
        const senderRect = senderElement.getBoundingClientRect();
        const receiverRect = receiverElement.getBoundingClientRect();
        
        message.style.left = `${senderRect.right}px`;
        message.style.top = `${senderRect.top + senderRect.height / 2}px`;
        message.style.animationDuration = `${this.networkDelay}ms`;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, this.networkDelay + 100);
    }

    toggleVectorClocks() {
        this.showVectorClocks = !this.showVectorClocks;
        const vectorClocks = document.querySelectorAll('.vector-clock');
        
        vectorClocks.forEach(clock => {
            clock.classList.toggle('hidden', !this.showVectorClocks);
        });
        
        document.getElementById('toggle-vector-clocks').textContent = 
            this.showVectorClocks ? 'Hide Vector Clocks' : 'Show Vector Clocks';
    }

    togglePhysicalClocks() {
        this.showPhysicalClocks = !this.showPhysicalClocks;
        const physicalClocks = document.querySelectorAll('.physical-clock');
        
        physicalClocks.forEach(clock => {
            clock.classList.toggle('hidden', !this.showPhysicalClocks);
        });
        
        document.getElementById('toggle-physical-clocks').textContent = 
            this.showPhysicalClocks ? 'Hide Physical Clocks' : 'Show Physical Clocks';
        
        if (this.showPhysicalClocks) {
            this.updatePhysicalClockDisplay();
        }
    }

    toggleNetworkDelays() {
        this.showNetworkDelays = !this.showNetworkDelays;
        document.getElementById('toggle-network-delays').textContent = 
            this.showNetworkDelays ? 'Hide Network Delays' : 'Show Network Delays';
        
        this.showToast(`Network delay visualization ${this.showNetworkDelays ? 'enabled' : 'disabled'}`, 'info');
    }

    toggleCausalityGraph() {
        const graphElement = document.querySelector('.causality-graph');
        if (this.showCausalityGraph) {
            graphElement.style.display = 'block';
            this.drawCausalityGraph();
        } else {
            graphElement.style.display = 'none';
        }
    }

    drawCausalityGraph() {
        const canvas = document.getElementById('causality-canvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.globalEvents.length === 0) return;
        
        // Sort events by timestamp
        const sortedEvents = [...this.globalEvents].sort((a, b) => a.timestamp - b.timestamp);
        
        const nodeRadius = 8;
        const processHeight = 50;
        const margin = 50;
        const eventSpacing = Math.min(100, (canvas.width - 2 * margin) / Math.max(1, sortedEvents.length - 1));
        
        // Draw process lines
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        for (let i = 0; i < this.processes.length; i++) {
            const y = margin + i * processHeight;
            ctx.beginPath();
            ctx.moveTo(margin, y);
            ctx.lineTo(canvas.width - margin, y);
            ctx.stroke();
            
            // Process labels
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.fillText(`Process ${this.processes[i].name}`, 5, y + 5);
        }
        
        // Draw events
        const eventPositions = {};
        sortedEvents.forEach((event, index) => {
            const x = margin + index * eventSpacing;
            const y = margin + event.processId * processHeight;
            
            eventPositions[event.id] = { x, y };
            
            // Event circle
            ctx.fillStyle = event.type === 'internal' ? '#27ae60' :
                          event.type === 'send' ? '#3498db' : '#e67e22';
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Event label
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${event.id}`, x, y - nodeRadius - 5);
        });
        
        // Draw causality arrows
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#e74c3c';
        
        sortedEvents.forEach(event => {
            if (event.type === 'receive' && event.originalSendEvent) {
                const sendPos = eventPositions[event.originalSendEvent.id];
                const receivePos = eventPositions[event.id];
                
                if (sendPos && receivePos) {
                    // Draw arrow
                    this.drawArrow(ctx, sendPos.x, sendPos.y, receivePos.x, receivePos.y);
                }
            }
        });
        
        ctx.textAlign = 'left';
    }

    drawArrow(ctx, fromX, fromY, toX, toY) {
        const headSize = 8;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headSize * Math.cos(angle - Math.PI / 6),
            toY - headSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headSize * Math.cos(angle + Math.PI / 6),
            toY - headSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }

    exportSystemState() {
        const state = {
            processes: this.processes.map(p => ({...p})),
            globalEvents: this.globalEvents.map(e => ({...e})),
            eventCounter: this.eventCounter,
            metrics: {...this.metrics},
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logical-clock-system-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('System state exported', 'info');
    }

    importSystemState(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const state = JSON.parse(e.target.result);
                
                // Restore system state
                this.processes = state.processes || [];
                this.globalEvents = state.globalEvents || [];
                this.eventCounter = state.eventCounter || 0;
                this.metrics = state.metrics || this.metrics;
                
                // Recreate UI
                this.recreateProcessesUI();
                this.updateProcessSelectors();
                this.updateDisplay();
                
                this.showToast('System state imported', 'info');
            } catch (error) {
                this.showToast('Error importing file: Invalid format', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    exportEventsCSV() {
        if (this.globalEvents.length === 0) {
            this.showToast('No events to export', 'error');
            return;
        }
        
        const headers = ['ID', 'Process', 'Type', 'Description', 'Lamport', 'Vector', 'Physical', 'Timestamp'];
        const rows = this.globalEvents.map(event => [
            event.id,
            event.processName,
            event.type,
            event.description,
            event.lamportTimestamp,
            `"[${event.vectorTimestamp.join(',')}]"`,
            event.physicalTimestamp,
            new Date(event.timestamp).toISOString()
        ]);
        
        const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logical-clock-events-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Events exported to CSV', 'info');
    }

    recreateProcessesUI() {
        const container = document.querySelector('.processes-container');
        container.innerHTML = '';
        
        this.processes.forEach(process => {
            this.createProcessUI(process);
        });
        
        // Apply current visibility settings
        if (!this.showVectorClocks) {
            document.querySelectorAll('.vector-clock').forEach(el => el.classList.add('hidden'));
        }
        if (!this.showPhysicalClocks) {
            document.querySelectorAll('.physical-clock').forEach(el => el.classList.add('hidden'));
        }
    }

    updateDisplay() {
        this.updateProcessDisplays();
        this.updateGlobalTimeline();
        if (this.showCausalityGraph) {
            this.drawCausalityGraph();
        }
    }

    updateProcessDisplays() {
        this.processes.forEach((process, index) => {
            const processElement = document.getElementById(`process-${index}`);
            if (!processElement) return;
            
            // Update clock displays
            processElement.querySelector('.lamport-value').textContent = process.lamportClock;
            processElement.querySelector('.vector-value').textContent = 
                `[${process.vectorClock.join(',')}]`;
            if (processElement.querySelector('.physical-value')) {
                processElement.querySelector('.physical-value').textContent = `${process.physicalClock}ms`;
            }
            
            // Update events timeline
            const timeline = processElement.querySelector('.events-timeline');
            timeline.innerHTML = '';
            
            process.events.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = `event-item ${event.type === 'send' ? 'message-send' : 
                                                     event.type === 'receive' ? 'message-receive' : ''}${
                                                     event.networkDelay && event.networkDelay > 0 ? ' delayed' : ''}`;
                
                eventElement.innerHTML = `
                    <div>
                        <strong>${event.description}</strong>
                        <br>
                        <small>L:${event.lamportTimestamp} | V:[${event.vectorTimestamp.join(',')}]${
                            this.showPhysicalClocks ? ` | P:${event.physicalTimestamp}ms` : ''
                        }${event.networkDelay ? ` | D:${event.networkDelay}ms` : ''}</small>
                    </div>
                    <div class="event-id">#${event.id}</div>
                `;
                
                timeline.appendChild(eventElement);
            });
        });
    }

    updatePhysicalClockDisplay() {
        this.processes.forEach((process, index) => {
            const processElement = document.getElementById(`process-${index}`);
            if (processElement && processElement.querySelector('.physical-value')) {
                processElement.querySelector('.physical-value').textContent = `${process.physicalClock}ms`;
            }
        });
    }

    updateGlobalTimeline() {
        const timeline = document.querySelector('.timeline');
        timeline.innerHTML = '';

        // Sort events for display
        let sortedEvents = [...this.globalEvents];
        
        if (this.showOrdering) {
            // Sort by Lamport timestamp, then by process ID for tie-breaking
            sortedEvents.sort((a, b) => {
                if (a.lamportTimestamp !== b.lamportTimestamp) {
                    return a.lamportTimestamp - b.lamportTimestamp;
                }
                return a.processId - b.processId;
            });
            
            // Add ordering line
            const orderingLine = document.createElement('div');
            orderingLine.className = 'ordering-line';
            timeline.appendChild(orderingLine);
        } else {
            // Sort by actual timestamp (chronological order)
            sortedEvents.sort((a, b) => a.timestamp - b.timestamp);
        }

        sortedEvents.forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.className = `global-event ${this.showOrdering ? 'ordered' : ''}`;
            
            if (this.showOrdering) {
                eventElement.dataset.order = index + 1;
            }
            
            eventElement.innerHTML = `
                <div>
                    <strong>Process ${event.processName}:</strong> ${event.description}
                </div>
                <div>
                    L:${event.lamportTimestamp} | V:[${event.vectorTimestamp.join(',')}]${
                        this.showPhysicalClocks ? ` | P:${event.physicalTimestamp}ms` : ''
                    } | #${event.id}
                </div>
            `;
            
            timeline.appendChild(eventElement);
        });
    }

    updatePerformanceMetrics() {
        // Calculate concurrent events
        let concurrentCount = 0;
        for (let i = 0; i < this.globalEvents.length; i++) {
            for (let j = i + 1; j < this.globalEvents.length; j++) {
                if (this.areConcurrent(this.globalEvents[i], this.globalEvents[j])) {
                    concurrentCount++;
                }
            }
        }
        this.metrics.concurrentEvents = concurrentCount;
        
        // Calculate max clock drift
        if (this.processes.length > 1) {
            const physicalClocks = this.processes.map(p => p.physicalClock);
            this.metrics.maxClockDrift = Math.max(...physicalClocks) - Math.min(...physicalClocks);
        }
        
        // Update display
        document.getElementById('total-events').textContent = this.metrics.totalEvents;
        document.getElementById('messages-sent').textContent = this.metrics.messagesSent;
        document.getElementById('concurrent-events').textContent = this.metrics.concurrentEvents;
        document.getElementById('max-clock-drift').textContent = `${this.metrics.maxClockDrift}ms`;
        
        const avgDelay = this.metrics.networkDelays.length > 0 ? 
            Math.round(this.metrics.networkDelays.reduce((a, b) => a + b, 0) / this.metrics.networkDelays.length) : 0;
        document.getElementById('avg-network-delay').textContent = `${avgDelay}ms`;
        
        const uptime = Math.floor((Date.now() - this.systemStartTime) / 1000);
        document.getElementById('system-uptime').textContent = `${uptime}s`;
    }

    updateMetrics() {
        // This method is called frequently to update real-time metrics
        if (this.showPhysicalClocks) {
            this.updatePhysicalClockDisplay();
        }
    }

    reset() {
        this.processes.forEach(process => {
            process.lamportClock = 0;
            process.vectorClock = new Array(this.processes.length).fill(0);
            process.physicalClock = 0;
            process.events = [];
        });
        
        this.globalEvents = [];
        this.eventCounter = 0;
        this.systemStartTime = Date.now();
        this.metrics = {
            totalEvents: 0,
            messagesSent: 0,
            concurrentEvents: 0,
            networkDelays: [],
            maxClockDrift: 0
        };
        
        this.updateDisplay();
        console.clear();
        console.log('🔄 Enhanced system reset! All clocks, events, and metrics cleared.');
        this.showToast('System reset successfully', 'info');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    logEvent(event) {
        const logStyle = event.type === 'send' ? 'color: #e74c3c; font-weight: bold;' :
                        event.type === 'receive' ? 'color: #3498db; font-weight: bold;' :
                        'color: #27ae60; font-weight: bold;';
        
        console.log(
            `%c[Process ${event.processName}] ${event.description}`,
            logStyle,
            `\n  Lamport: ${event.lamportTimestamp}`,
            `\n  Vector: [${event.vectorTimestamp.join(', ')}]`,
            `\n  Physical: ${event.physicalTimestamp}ms`,
            `\n  Event ID: #${event.id}`,
            event.networkDelay ? `\n  Network Delay: ${event.networkDelay}ms` : ''
        );
    }

    // Utility methods
    areConcurrent(event1, event2) {
        const v1 = event1.vectorTimestamp;
        const v2 = event2.vectorTimestamp;
        
        let v1LessV2 = true;
        let v2LessV1 = true;
        
        const maxLength = Math.max(v1.length, v2.length);
        for (let i = 0; i < maxLength; i++) {
            const val1 = i < v1.length ? v1[i] : 0;
            const val2 = i < v2.length ? v2[i] : 0;
            if (val1 > val2) v1LessV2 = false;
            if (val2 > val1) v2LessV1 = false;
        }
        
        return !v1LessV2 && !v2LessV1;
    }

    happenedBefore(event1, event2) {
        const v1 = event1.vectorTimestamp;
        const v2 = event2.vectorTimestamp;
        
        const maxLength = Math.max(v1.length, v2.length);
        for (let i = 0; i < maxLength; i++) {
            const val1 = i < v1.length ? v1[i] : 0;
            const val2 = i < v2.length ? v2[i] : 0;
            if (val1 > val2) return false;
        }
        
        // Check if at least one component is strictly less
        for (let i = 0; i < maxLength; i++) {
            const val1 = i < v1.length ? v1[i] : 0;
            const val2 = i < v2.length ? v2[i] : 0;
            if (val1 < val2) return true;
        }
        
        return false;
    }
}

// Initialize the enhanced system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const clockSystem = new EnhancedLogicalClockSystem();
    
    // Make it globally accessible for debugging
    window.clockSystem = clockSystem;
    
    console.log('🚀 Enhanced Logical Clock Visualization System Initialized!');
    console.log('🆕 New Features:');
    console.log('  • Physical clock simulation with drift');
    console.log('  • Network delay visualization');
    console.log('  • Dynamic process management (4+ processes)');
    console.log('  • Interactive causality graph');
    console.log('  • Export/import functionality');
    console.log('  • Real-time performance metrics');
    console.log('');
    console.log('💡 Enhanced Tips:');
    console.log('  • Add/remove processes dynamically');
    console.log('  • Adjust network delays with the slider');
    console.log('  • Export system state and events');
    console.log('  • Enable causality graph for visual analysis');
    console.log('  • Monitor performance metrics in real-time');
    console.log('');
    console.log('🔍 Try these enhanced commands:');
    console.log('  runAdvancedDemo() - Enhanced demonstration');
    console.log('  clockSystem.exportSystemState() - Export current state');
    console.log('  clockSystem.metrics - View performance metrics');
});

// Enhanced demo functionality
function runAdvancedDemo() {
    const system = window.clockSystem;
    
    console.log('🎭 Running advanced demonstration...');
    
    // Enable all features for demo
    if (!system.showVectorClocks) system.toggleVectorClocks();
    if (!system.showPhysicalClocks) system.togglePhysicalClocks();
    if (!system.showNetworkDelays) system.toggleNetworkDelays();
    
    setTimeout(() => system.addProcess(), 500);
    setTimeout(() => {
        system.generateEvent(0);
        console.log('Generated event in Process A');
    }, 1000);
    
    setTimeout(() => {
        system.generateEvent(1);
        console.log('Generated event in Process B');
    }, 1500);
    
    setTimeout(() => {
        system.sendMessage(0, 1);
        console.log('Process A sent message to Process B');
    }, 2000);
    
    setTimeout(() => {
        system.generateEvent(3);
        console.log('Generated event in Process D');
    }, 2500);
    
    setTimeout(() => {
        system.sendMessage(1, 3);
        console.log('Process B sent message to Process D');
    }, 3000);
    
    setTimeout(() => {
        system.sendMessage(3, 2);
        console.log('Process D sent message to Process C');
    }, 3500);
    
    setTimeout(() => {
        document.getElementById('show-causality-graph').checked = true;
        document.getElementById('show-causality-graph').dispatchEvent(new Event('change'));
        console.log('Enabled causality graph');
    }, 4000);
    
    console.log('🎬 Advanced demo will complete in 4 seconds. Watch all the new features!');
}

// Make enhanced demo available globally
window.runAdvancedDemo = runAdvancedDemo;
window.runDemo = runAdvancedDemo; // Alias for backward compatibility