/**
 * Main Application Entry Point
 * Initializes all modules and coordinates interactions
 */

import { FrameRenderer } from './frameRenderer.js';
import { StatsDisplay } from './statsDisplay.js';
import { WebSocketClient } from './websocketClient.js';
import { ProcessingMode, AppStatus, ConnectionStatus, DOMElements } from './types.js';
import { getDemoFrame } from './demoData.js';

class OpenCVViewer {
    private renderer: FrameRenderer;
    private stats: StatsDisplay;
    private wsClient: WebSocketClient;
    private elements: DOMElements;
    
    private currentMode: ProcessingMode = ProcessingMode.RAW;
    private isPlaying = false;
    private demoInterval: number | null = null;
    private targetFps = 15;

    constructor() {
        this.elements = this.initializeElements();
        this.renderer = new FrameRenderer(
            this.elements.frameCanvas,
            this.elements.frameLabel
        );
        this.stats = new StatsDisplay({
            fps: this.elements.fps,
            resolution: this.elements.resolution,
            processingTime: this.elements.processingTime,
            frameCount: this.elements.frameCount,
            status: this.elements.status,
            connection: this.elements.connection
        });
        this.wsClient = new WebSocketClient(this.elements.wsUrl.value);
        
        this.setupEventListeners();
        this.setupWebSocket();
        this.initialize();
    }

    /**
     * Get all required DOM elements
     */
    private initializeElements(): DOMElements {
        return {
            frameCanvas: document.getElementById('frameCanvas') as HTMLCanvasElement,
            frameLabel: document.getElementById('frameLabel') as HTMLElement,
            fps: document.getElementById('fps') as HTMLElement,
            resolution: document.getElementById('resolution') as HTMLElement,
            processingTime: document.getElementById('processingTime') as HTMLElement,
            frameCount: document.getElementById('frameCount') as HTMLElement,
            status: document.getElementById('status') as HTMLElement,
            connection: document.getElementById('connection') as HTMLElement,
            rawBtn: document.getElementById('rawBtn') as HTMLButtonElement,
            edgeBtn: document.getElementById('edgeBtn') as HTMLButtonElement,
            grayBtn: document.getElementById('grayBtn') as HTMLButtonElement,
            playBtn: document.getElementById('playBtn') as HTMLButtonElement,
            pauseBtn: document.getElementById('pauseBtn') as HTMLButtonElement,
            resetBtn: document.getElementById('resetBtn') as HTMLButtonElement,
            wsUrl: document.getElementById('wsUrl') as HTMLInputElement,
            connectBtn: document.getElementById('connectBtn') as HTMLButtonElement,
            fpsSlider: document.getElementById('fpsSlider') as HTMLInputElement,
            fpsValue: document.getElementById('fpsValue') as HTMLElement
        };
    }

    /**
     * Setup event listeners for all controls
     */
    private setupEventListeners(): void {
        // Mode buttons
        this.elements.rawBtn.addEventListener('click', () => this.switchMode(ProcessingMode.RAW));
        this.elements.edgeBtn.addEventListener('click', () => this.switchMode(ProcessingMode.EDGE));
        this.elements.grayBtn.addEventListener('click', () => this.switchMode(ProcessingMode.GRAY));
        
        // Playback controls
        this.elements.playBtn.addEventListener('click', () => this.startDemo());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseDemo());
        this.elements.resetBtn.addEventListener('click', () => this.resetDemo());
        
        // WebSocket controls
        this.elements.connectBtn.addEventListener('click', () => this.toggleConnection());
        this.elements.wsUrl.addEventListener('change', (e) => {
            this.wsClient.updateUrl((e.target as HTMLInputElement).value);
        });
        
        // FPS slider
        this.elements.fpsSlider.addEventListener('input', (e) => {
            const fps = parseInt((e.target as HTMLInputElement).value);
            this.targetFps = fps;
            this.elements.fpsValue.textContent = fps.toString();
            
            // Restart demo if playing
            if (this.isPlaying) {
                this.stopDemo();
                this.startDemo();
            }
        });
    }

    /**
     * Setup WebSocket handlers
     */
    private setupWebSocket(): void {
        this.wsClient.onStatusChange((status) => {
            this.stats.updateConnectionStatus(status);
            
            if (status === ConnectionStatus.CONNECTED) {
                this.elements.connectBtn.textContent = 'Disconnect';
            } else {
                this.elements.connectBtn.textContent = 'Connect';
            }
        });
        
        this.wsClient.onMessage((message) => {
            if (message.type === 'frame' && typeof message.payload === 'object') {
                const frameData = message.payload as any;
                this.renderFrame(frameData.imageData, frameData.processingTime || 0);
            }
        });
    }

    /**
     * Initialize the application
     */
    private initialize(): void {
        console.log('OpenCV Viewer initialized');
        this.stats.updateStatus(AppStatus.IDLE);
        
        // Load initial frame
        this.renderFrame(getDemoFrame(this.currentMode), 0);
    }

    /**
     * Switch processing mode
     */
    private switchMode(mode: ProcessingMode): void {
        this.currentMode = mode;
        
        // Update button states
        this.elements.rawBtn.classList.remove('active');
        this.elements.edgeBtn.classList.remove('active');
        this.elements.grayBtn.classList.remove('active');
        
        switch (mode) {
            case ProcessingMode.RAW:
                this.elements.rawBtn.classList.add('active');
                break;
            case ProcessingMode.EDGE:
                this.elements.edgeBtn.classList.add('active');
                break;
            case ProcessingMode.GRAY:
                this.elements.grayBtn.classList.add('active');
                break;
        }
        
        // Render frame for new mode
        this.renderFrame(getDemoFrame(mode), Math.random() * 20 + 10);
    }

    /**
     * Render a frame
     */
    private async renderFrame(imageData: string, processingTime: number): Promise<void> {
        const startTime = Date.now();
        
        await this.renderer.renderBase64(imageData, this.currentMode);
        
        const renderTime = Date.now() - startTime;
        this.stats.recordFrame(Math.round(processingTime + renderTime));
    }

    /**
     * Start demo playback
     */
    private startDemo(): void {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.stats.updateStatus(AppStatus.ACTIVE);
        this.elements.playBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        
        const interval = 1000 / this.targetFps;
        
        this.demoInterval = window.setInterval(() => {
            // Simulate processing time variation
            const processingTime = Math.random() * 20 + 10;
            this.renderFrame(getDemoFrame(this.currentMode), processingTime);
        }, interval);
    }

    /**
     * Pause demo playback
     */
    private pauseDemo(): void {
        this.stopDemo();
        this.stats.updateStatus(AppStatus.PAUSED);
        this.elements.playBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
    }

    /**
     * Stop demo (internal)
     */
    private stopDemo(): void {
        if (this.demoInterval !== null) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
        this.isPlaying = false;
    }

    /**
     * Reset demo
     */
    private resetDemo(): void {
        this.stopDemo();
        this.stats.reset();
        this.stats.updateStatus(AppStatus.IDLE);
        this.elements.playBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.renderer.clear();
    }

    /**
     * Toggle WebSocket connection
     */
    private toggleConnection(): void {
        if (this.wsClient.isConnected()) {
            this.wsClient.disconnect();
        } else {
            this.wsClient.connect();
        }
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new OpenCVViewer();
    });
} else {
    new OpenCVViewer();
}