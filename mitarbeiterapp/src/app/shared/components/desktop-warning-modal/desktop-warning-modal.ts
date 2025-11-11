import { Component, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Desktop Warning Modal
 * Shows a warning when the app is opened on a desktop device
 * and suggests using it on a mobile device instead
 */
@Component({
  selector: 'app-desktop-warning-modal',
  imports: [CommonModule, TranslateModule],
  templateUrl: './desktop-warning-modal.html',
  styleUrl: './desktop-warning-modal.scss',
})
export class DesktopWarningModal implements OnInit {
  // Inputs
  isOpen = input<boolean>(false);

  // Outputs
  close = output<void>();
  neverShowAgain = output<void>();

  // State
  qrCodeUrl = '';
  linkCopied = false;

  ngOnInit(): void {
    // Generate QR code URL for current page
    const currentUrl = window.location.href;
    // Using QR Server API for QR code generation
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;
  }

  /**
   * Copy link to clipboard
   */
  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.linkCopied = true;
      setTimeout(() => {
        this.linkCopied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }

  /**
   * Send link via email
   */
  sendEmail(): void {
    const subject = encodeURIComponent('WPDL Stundennachweis - Mobile App');
    const body = encodeURIComponent(`Hier ist der Link zur WPDL Stundennachweis App:\n\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  /**
   * Continue on desktop
   */
  continueDesktop(): void {
    this.close.emit();
  }

  /**
   * Never show again
   */
  onNeverShowAgain(): void {
    this.neverShowAgain.emit();
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
