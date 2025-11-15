/**
 * FrameRenderer - Handles rendering frames to canvas
 * Supports base64 encoded images and direct image data
 */

import { FrameData, ProcessingMode } from './types.js';

export class FrameRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private frameLabel: HTMLElement;
    private currentMode: ProcessingMode = ProcessingMode.RAW;

    constructor(canvas: HTMLCanvasElement, frameLabel: HTMLElement) {
        this.canvas = canvas;
        this.frameLabel = frameLabel;
        
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get 2D context from canvas');
        }
        this.ctx = context;
        
        this.initCanvas();
    }

    /**
     * Initialize canvas with default settings
     */
    private initCanvas(): void {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw placeholder text
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.font = '24px "Segoe UI"';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            '📷 Waiting for frames...',
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }

    /**
     * Render a frame from FrameData
     */
    public async renderFrame(frameData: FrameData): Promise<void> {
        try {
            const image = await this.loadImage(frameData.imageData);
            this.drawImage(image);
            this.updateLabel(frameData.mode);
            this.currentMode = frameData.mode;
        } catch (error) {
            console.error('Error rendering frame:', error);
            this.renderError('Failed to render frame');
        }
    }

    /**
     * Render a frame from base64 string
     */
    public async renderBase64(
        base64Data: string,
        mode: ProcessingMode = ProcessingMode.RAW
    ): Promise<void> {
        try {
            const image = await this.loadImage(base64Data);
            this.drawImage(image);
            this.updateLabel(mode);
            this.currentMode = mode;
        } catch (error) {
            console.error('Error rendering base64 image:', error);
            this.renderError('Invalid image data');
        }
    }

    /**
     * Load image from base64 or URL
     */
    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            
            // Handle base64 data
            if (!src.startsWith('data:')) {
                img.src = `data:image/png;base64,${src}`;
            } else {
                img.src = src;
            }
        });
    }

    /**
     * Draw image to canvas
     */
    private drawImage(image: HTMLImageElement): void {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate scaling to fit canvas while maintaining aspect ratio
        const scale = Math.min(
            this.canvas.width / image.width,
            this.canvas.height / image.height
        );
        
        const x = (this.canvas.width - image.width * scale) / 2;
        const y = (this.canvas.height - image.height * scale) / 2;
        
        this.ctx.drawImage(
            image,
            x,
            y,
            image.width * scale,
            image.height * scale
        );
    }

    /**
     * Update frame label based on processing mode
     */
    private updateLabel(mode: ProcessingMode): void {
        const labels: Record<ProcessingMode, string> = {
            [ProcessingMode.RAW]: '📷 Raw Feed',
            [ProcessingMode.EDGE]: '🔲 Edge Detection',
            [ProcessingMode.GRAY]: '⬜ Grayscale'
        };
        
        this.frameLabel.textContent = labels[mode];
    }

    /**
     * Render error message on canvas
     */
    private renderError(message: string): void {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff4466';
        this.ctx.font = '20px "Segoe UI"';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            `❌ ${message}`,
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }

    /**
     * Clear canvas
     */
    public clear(): void {
        this.initCanvas();
    }

    /**
     * Get current processing mode
     */
    public getCurrentMode(): ProcessingMode {
        return this.currentMode;
    }

    /**
     * Resize canvas
     */
    public resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
        this.clear();
    }
}
