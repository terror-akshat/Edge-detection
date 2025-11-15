/**
 * StatsDisplay - Manages real-time statistics display
 * Updates FPS, resolution, processing time, and other metrics
 */

import { ProcessingStats, AppStatus, ConnectionStatus } from './types.js';

export class StatsDisplay {
    private elements: {
        fps: HTMLElement;
        resolution: HTMLElement;
        processingTime: HTMLElement;
        frameCount: HTMLElement;
        status: HTMLElement;
        connection: HTMLElement;
    };

    private stats: ProcessingStats;
    private frameTimestamps: number[] = [];
    private readonly FPS_SAMPLE_SIZE = 10;

    constructor(elements: {
        fps: HTMLElement;
        resolution: HTMLElement;
        processingTime: HTMLElement;
        frameCount: HTMLElement;
        status: HTMLElement;
        connection: HTMLElement;
    }) {
        this.elements = elements;
        this.stats = {
            fps: 0,
            resolution: '640x480',
            processingTime: 0,
            frameCount: 0,
            status: AppStatus.IDLE,
            connectionStatus: ConnectionStatus.DISCONNECTED
        };

        this.initDisplay();
    }

    /**
     * Initialize display with default values
     */
    private initDisplay(): void {
        this.updateDisplay();
    }

    /**
     * Update all statistics
     */
    public updateStats(stats: Partial<ProcessingStats>): void {
        this.stats = { ...this.stats, ...stats };
        this.updateDisplay();
    }

    /**
     * Record a frame for FPS calculation
     */
    public recordFrame(processingTime: number): void {
        const now = Date.now();
        this.frameTimestamps.push(now);

        // Keep only recent frames
        if (this.frameTimestamps.length > this.FPS_SAMPLE_SIZE) {
            this.frameTimestamps.shift();
        }

        // Calculate FPS
        if (this.frameTimestamps.length >= 2) {
            const timeSpan = now - this.frameTimestamps[0];
            const fps = ((this.frameTimestamps.length - 1) / timeSpan) * 1000;
            this.stats.fps = Math.round(fps * 10) / 10; // Round to 1 decimal
        }

        this.stats.processingTime = processingTime;
        this.stats.frameCount++;
        this.updateDisplay();
    }

    /**
     * Update resolution
     */
    public updateResolution(width: number, height: number): void {
        this.stats.resolution = `${width}x${height}`;
        this.updateDisplay();
    }

    /**
     * Update application status
     */
    public updateStatus(status: AppStatus): void {
        this.stats.status = status;
        this.updateStatusElement();
    }

    /**
     * Update connection status
     */
    public updateConnectionStatus(status: ConnectionStatus): void {
        this.stats.connectionStatus = status;
        this.updateConnectionElement();
    }

    /**
     * Reset statistics
     */
    public reset(): void {
        this.frameTimestamps = [];
        this.stats = {
            fps: 0,
            resolution: this.stats.resolution,
            processingTime: 0,
            frameCount: 0,
            status: AppStatus.IDLE,
            connectionStatus: this.stats.connectionStatus
        };
        this.updateDisplay();
    }

    /**
     * Update all display elements
     */
    private updateDisplay(): void {
        this.elements.fps.textContent = this.stats.fps.toFixed(1);
        this.elements.resolution.textContent = this.stats.resolution;
        this.elements.processingTime.textContent = `${this.stats.processingTime} ms`;
        this.elements.frameCount.textContent = this.stats.frameCount.toString();
        this.updateStatusElement();
        this.updateConnectionElement();
    }

    /**
     * Update status element with appropriate styling
     */
    private updateStatusElement(): void {
        const statusMap: Record<AppStatus, { text: string; class: string }> = {
            [AppStatus.IDLE]: { text: 'Idle', class: 'status-idle' },
            [AppStatus.ACTIVE]: { text: 'Active', class: 'status-active' },
            [AppStatus.PAUSED]: { text: 'Paused', class: 'status-idle' },
            [AppStatus.ERROR]: { text: 'Error', class: 'status-disconnected' }
        };

        const status = statusMap[this.stats.status];
        this.elements.status.textContent = status.text;
        
        // Remove all status classes
        this.elements.status.classList.remove(
            'status-idle',
            'status-active',
            'status-disconnected'
        );
        
        // Add current status class
        this.elements.status.classList.add(status.class);
    }

    /**
     * Update connection element with appropriate styling
     */
    private updateConnectionElement(): void {
        const connectionMap: Record<ConnectionStatus, { text: string; class: string }> = {
            [ConnectionStatus.CONNECTED]: { text: 'Connected', class: 'status-connected' },
            [ConnectionStatus.DISCONNECTED]: { text: 'Disconnected', class: 'status-disconnected' },
            [ConnectionStatus.CONNECTING]: { text: 'Connecting...', class: 'status-idle' },
            [ConnectionStatus.ERROR]: { text: 'Error', class: 'status-disconnected' }
        };

        const connection = connectionMap[this.stats.connectionStatus];
        this.elements.connection.textContent = connection.text;
        
        // Remove all connection classes
        this.elements.connection.classList.remove(
            'status-connected',
            'status-disconnected',
            'status-idle'
        );
        
        // Add current connection class
        this.elements.connection.classList.add(connection.class);
        
        // Add pulsing animation if connecting
        if (this.stats.connectionStatus === ConnectionStatus.CONNECTING) {
            this.elements.connection.classList.add('pulsing');
        } else {
            this.elements.connection.classList.remove('pulsing');
        }
    }

    /**
     * Get current statistics
     */
    public getStats(): ProcessingStats {
        return { ...this.stats };
    }

    /**
     * Get current FPS
     */
    public getFPS(): number {
        return this.stats.fps;
    }

    /**
     * Get frame count
     */
    public getFrameCount(): number {
        return this.stats.frameCount;
    }
}
