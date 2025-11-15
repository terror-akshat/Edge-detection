/**
 * WebSocketClient - Handles WebSocket communication with Android app
 * Manages connection, reconnection, and message handling
 */

import { WebSocketMessage, ConnectionStatus } from './types.js';

type MessageHandler = (message: WebSocketMessage) => void;
type StatusHandler = (status: ConnectionStatus) => void;

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 5;
    private readonly RECONNECT_DELAY = 3000;
    private reconnectTimer: number | null = null;
    
    private messageHandlers: MessageHandler[] = [];
    private statusHandlers: StatusHandler[] = [];

    constructor(url: string) {
        this.url = url;
    }

    /**
     * Connect to WebSocket server
     */
    public connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('Already connected');
            return;
        }

        this.updateStatus(ConnectionStatus.CONNECTING);
        
        try {
            this.ws = new WebSocket(this.url);
            this.setupEventHandlers();
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            this.updateStatus(ConnectionStatus.ERROR);
            this.scheduleReconnect();
        }
    }

    /**
     * Disconnect from WebSocket server
     */
    public disconnect(): void {
        this.cancelReconnect();
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        this.reconnectAttempts = 0;
        this.updateStatus(ConnectionStatus.DISCONNECTED);
    }

    /**
     * Send message to server
     */
    public send(message: WebSocketMessage): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected. Message not sent.');
        }
    }

    /**
     * Register message handler
     */
    public onMessage(handler: MessageHandler): void {
        this.messageHandlers.push(handler);
    }

    /**
     * Register status change handler
     */
    public onStatusChange(handler: StatusHandler): void {
        this.statusHandlers.push(handler);
    }

    /**
     * Update server URL
     */
    public updateUrl(url: string): void {
        const wasConnected = this.isConnected();
        
        if (wasConnected) {
            this.disconnect();
        }
        
        this.url = url;
        
        if (wasConnected) {
            this.connect();
        }
    }

    /**
     * Check if connected
     */
    public isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    /**
     * Setup WebSocket event handlers
     */
    private setupEventHandlers(): void {
        if (!this.ws) return;

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.updateStatus(ConnectionStatus.CONNECTED);
        };

        this.ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateStatus(ConnectionStatus.ERROR);
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.updateStatus(ConnectionStatus.DISCONNECTED);
            this.scheduleReconnect();
        };
    }

    /**
     * Handle incoming message
     */
    private handleMessage(message: WebSocketMessage): void {
        this.messageHandlers.forEach(handler => {
            try {
                handler(message);
            } catch (error) {
                console.error('Error in message handler:', error);
            }
        });
    }

    /**
     * Update connection status
     */
    private updateStatus(status: ConnectionStatus): void {
        this.statusHandlers.forEach(handler => {
            try {
                handler(status);
            } catch (error) {
                console.error('Error in status handler:', error);
            }
        });
    }

    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.log('Max reconnection attempts reached');
            return;
        }

        this.cancelReconnect();
        
        console.log(
            `Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${this.MAX_RECONNECT_ATTEMPTS}`
        );
        
        this.reconnectTimer = window.setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, this.RECONNECT_DELAY);
    }

    /**
     * Cancel scheduled reconnection
     */
    private cancelReconnect(): void {
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    /**
     * Get current URL
     */
    public getUrl(): string {
        return this.url;
    }

    /**
     * Get reconnect attempts
     */
    public getReconnectAttempts(): number {
        return this.reconnectAttempts;
    }
}
