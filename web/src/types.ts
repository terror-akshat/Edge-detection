/**
 * Type definitions for OpenCV Web Viewer
 * Defines interfaces for frame data, statistics, and configuration
 */

/**
 * Processing mode for frames
 */
export enum ProcessingMode {
    RAW = 'raw',
    EDGE = 'edge',
    GRAY = 'gray'
}

/**
 * Connection status for WebSocket
 */
export enum ConnectionStatus {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    ERROR = 'error'
}

/**
 * Application status
 */
export enum AppStatus {
    IDLE = 'idle',
    ACTIVE = 'active',
    PAUSED = 'paused',
    ERROR = 'error'
}

/**
 * Frame data structure containing image and metadata
 */
export interface FrameData {
    /** Base64 encoded image data */
    imageData: string;
    /** Width of the frame in pixels */
    width: number;
    /** Height of the frame in pixels */
    height: number;
    /** Processing mode applied to this frame */
    mode: ProcessingMode;
    /** Timestamp when frame was captured (milliseconds) */
    timestamp: number;
    /** Processing time in milliseconds */
    processingTime: number;
}

/**
 * Real-time statistics for display
 */
export interface ProcessingStats {
    /** Current frames per second */
    fps: number;
    /** Frame resolution (e.g., "640x480") */
    resolution: string;
    /** Last processing time in milliseconds */
    processingTime: number;
    /** Total number of frames processed */
    frameCount: number;
    /** Current application status */
    status: AppStatus;
    /** WebSocket connection status */
    connectionStatus: ConnectionStatus;
}

/**
 * Configuration for the viewer application
 */
export interface ViewerConfig {
    /** Target FPS for demo playback */
    targetFps: number;
    /** WebSocket server URL */
    wsUrl: string;
    /** Default processing mode */
    defaultMode: ProcessingMode;
    /** Auto-start demo on load */
    autoStart: boolean;
    /** Canvas dimensions */
    canvasWidth: number;
    canvasHeight: number;
}

/**
 * WebSocket message format
 */
export interface WebSocketMessage {
    /** Message type */
    type: 'frame' | 'stats' | 'config' | 'error';
    /** Message payload */
    payload: FrameData | ProcessingStats | ViewerConfig | string;
    /** Message timestamp */
    timestamp: number;
}

/**
 * DOM element references
 */
export interface DOMElements {
    // Canvas
    frameCanvas: HTMLCanvasElement;
    frameLabel: HTMLElement;
    
    // Stats
    fps: HTMLElement;
    resolution: HTMLElement;
    processingTime: HTMLElement;
    frameCount: HTMLElement;
    status: HTMLElement;
    connection: HTMLElement;
    
    // Controls
    rawBtn: HTMLButtonElement;
    edgeBtn: HTMLButtonElement;
    grayBtn: HTMLButtonElement;
    playBtn: HTMLButtonElement;
    pauseBtn: HTMLButtonElement;
    resetBtn: HTMLButtonElement;
    
    // WebSocket
    wsUrl: HTMLInputElement;
    connectBtn: HTMLButtonElement;
    
    // Settings
    fpsSlider: HTMLInputElement;
    fpsValue: HTMLElement;
}

/**
 * Demo frame collection
 */
export interface DemoFrames {
    raw: string;
    edge: string;
    gray: string;
}
