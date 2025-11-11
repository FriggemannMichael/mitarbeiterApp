import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { APP_CONFIG } from '../../../core/config/app.config.model';

@Component({
  selector: 'app-share-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './share-modal.html',
  styleUrl: './share-modal.scss',
})
export class ShareModal {
  isOpen = input<boolean>(false);
  fileName = input.required<string>();
  fileUrl = input.required<string>();
  employeeName = input.required<string>();
  weekNumber = input.required<number>();
  weekYear = input.required<number>();
  customerEmail = input<string>();
  pdfBlob = input<Blob>();

  close = output<void>();
  shareComplete = output<void>();

  selectedEmail = APP_CONFIG.export.defaultEmail;
  isSending = false;
  success = false;

  get allowedEmails() {
    return APP_CONFIG.allowedEmails;
  }

  onClose(): void {
    this.close.emit();
  }

  async handleEmailShare(): Promise<void> {
    this.isSending = true;
    const subject = `Stundennachweis - ${this.employeeName()} - KW ${this.weekNumber()}/${this.weekYear()}`;
    const message = [
      'Hallo,',
      '',
      'anbei der Stundennachweis für:',
      `- Mitarbeiter: ${this.employeeName()}`,
      `- Kalenderwoche: ${this.weekNumber()}/${this.weekYear()}`,
      `- Datei: ${this.fileName()}`,
      '',
      'Mit freundlichen Grüßen',
      this.employeeName(),
      '---',
      'Gesendet mit WPDL Stundennachweis App',
    ].join('\n');

    try {
      // Web Share API mit Datei
      if (navigator.share && navigator.canShare) {
        const response = await fetch(this.fileUrl());
        const blob = await response.blob();
        const file = new File([blob], this.fileName(), { type: 'application/pdf' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: subject,
            text: message,
            files: [file],
          });

          this.success = true;
          setTimeout(() => {
            this.success = false;
            this.onClose();
            this.shareComplete.emit();
          }, 2000);
          this.isSending = false;
          return;
        }
      }

      // Fallback: Download + mailto
      const link = document.createElement('a');
      link.href = this.fileUrl();
      link.download = this.fileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        const mailtoLink = `mailto:${this.selectedEmail}?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(
          message + '\n\n⚠️ Bitte hängen Sie die heruntergeladene PDF-Datei manuell an.'
        )}`;
        window.open(mailtoLink, '_blank');
      }, 500);

      this.success = true;
      setTimeout(() => {
        this.success = false;
        this.onClose();
        this.shareComplete.emit();
      }, 2000);
    } catch (error) {
      console.error('Share failed:', error);
      alert('Versenden fehlgeschlagen');
    } finally {
      this.isSending = false;
    }
  }
}
