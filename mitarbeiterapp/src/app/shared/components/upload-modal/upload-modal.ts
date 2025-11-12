import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Upload Modal - Handle file/image uploads
 */
@Component({
  selector: 'app-upload-modal',
  imports: [CommonModule, TranslateModule],
  templateUrl: './upload-modal.html',
  styleUrl: './upload-modal.scss',
})
export class UploadModal {
  close = output<void>();

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onCamera(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => this.onFileSelect(e);
    input.click();
  }

  onSendEmail(): void {
    const file = this.selectedFile();
    if (!file) return;

    // Create mailto link with file info
    const subject = 'Datei-Upload';
    const body = `Datei: ${file.name}\nGröße: ${(file.size / 1024).toFixed(2)} KB`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  onSendWhatsApp(): void {
    const file = this.selectedFile();
    if (!file) return;

    // WhatsApp doesn't support direct file sharing via URL, so we inform the user
    alert('Bitte teilen Sie die Datei manuell über WhatsApp aus Ihrer Galerie/Dateien.');
  }

  onClear(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }
}
