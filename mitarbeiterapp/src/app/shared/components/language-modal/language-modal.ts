import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SUPPORTED_LANGUAGES } from '../../../core/models/timesheet.model';

/**
 * Language Modal - Language selection
 */
@Component({
  selector: 'app-language-modal',
  imports: [CommonModule, TranslateModule],
  templateUrl: './language-modal.html',
  styleUrl: './language-modal.scss',
})
export class LanguageModal {
  close = output<void>();
  languageChange = output<string>();

  languages = SUPPORTED_LANGUAGES;
  currentLanguage: string;

  constructor(private translate: TranslateService) {
    this.currentLanguage = this.translate.currentLang || 'de';
  }

  onSelectLanguage(languageCode: string): void {
    this.languageChange.emit(languageCode);
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
