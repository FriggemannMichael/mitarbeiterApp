import { Component, OnInit, ElementRef, ViewChild, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Signature Pad Component - Canvas-based signature capture
 * Migrated from React PWA (SignaturePad.tsx)
 */
@Component({
  selector: 'app-signature-pad',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './signature-pad.html',
  styleUrl: './signature-pad.scss',
})
export class SignaturePad implements OnInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Input properties
  title = input.required<string>();
  signatureData = input<string>();
  disabled = input<boolean>(false);
  locked = input<boolean>(false);
  requireName = input<boolean>(false);
  nameValue = input<string>();
  namePlaceholder = input<string>('Name');

  // Output events
  sign = output<{ signature: string; name?: string }>();
  clear = output<void>();

  // Internal state
  isDrawing = false;
  showModal = false;
  name = '';
  private ctx: CanvasRenderingContext2D | null = null;
  private lastX = 0;
  private lastY = 0;

  ngOnInit(): void {
    if (this.nameValue()) {
      this.name = this.nameValue()!;
    }
  }

  /**
   * Open signature modal
   */
  openModal(): void {
    if (this.disabled() || this.locked()) return;
    this.showModal = true;

    // Initialize canvas after modal is shown
    setTimeout(() => this.initCanvas(), 100);
  }

  /**
   * Close signature modal
   */
  closeModal(): void {
    this.showModal = false;
    this.clearCanvas();
  }

  /**
   * Initialize canvas
   */
  private initCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    // Set canvas size
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 200;
    }

    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }
  }

  /**
   * Start drawing
   */
  startDrawing(event: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    const coords = this.getCoordinates(event);
    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  /**
   * Draw on canvas
   */
  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing || !this.ctx) return;

    event.preventDefault();
    const coords = this.getCoordinates(event);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();

    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  /**
   * Stop drawing
   */
  stopDrawing(): void {
    this.isDrawing = false;
  }

  /**
   * Get coordinates from mouse or touch event
   */
  private getCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    if (event instanceof MouseEvent) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    } else {
      const touch = event.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
  }

  /**
   * Clear canvas
   */
  clearCanvas(): void {
    if (!this.ctx || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Save signature
   */
  saveSignature(): void {
    if (!this.canvasRef) return;

    // Validate name if required
    if (this.requireName() && !this.name.trim()) {
      alert('Bitte geben Sie Ihren Namen ein.');
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const signatureDataUrl = canvas.toDataURL('image/png');

    this.sign.emit({
      signature: signatureDataUrl,
      name: this.requireName() ? this.name.trim() : undefined,
    });

    this.closeModal();
  }

  /**
   * Clear signature
   */
  clearSignature(): void {
    if (confirm('Möchten Sie die Unterschrift wirklich löschen?')) {
      this.clear.emit();
    }
  }
}
