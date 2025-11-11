import { Component, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../core/services/storage.service';
import { SUPPORTED_LANGUAGES, Language } from '../../core/models/timesheet.model';
import { APP_VERSION } from '../../core/models/constants';

/**
 * Welcome/Onboarding Component
 * Migrated from React PWA (Welcome.tsx)
 */
@Component({
  selector: 'app-welcome',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class Welcome implements OnInit {
  // Output event when onboarding is complete
  complete = output<void>();

  // Data properties
  languages = SUPPORTED_LANGUAGES;
  selectedLanguage = 'de';
  firstName = '';
  lastName = '';
  consent = false;
  showPrivacy = false;
  showLanguageDropdown = false;
  appVersion = APP_VERSION;

  // Validation errors
  errors: {
    firstName?: string;
    lastName?: string;
    consent?: string;
  } = {};

  constructor(
    private translate: TranslateService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    // Set initial language
    const savedLanguage = this.storage.getLanguage();
    this.selectedLanguage = savedLanguage;
    this.translate.use(savedLanguage);

    // Load existing data if any
    const savedName = this.storage.getEmployeeName();
    if (savedName) {
      const nameParts = savedName.split(' ');
      this.firstName = nameParts[0] || '';
      this.lastName = nameParts.slice(1).join(' ') || '';
    }
    this.consent = this.storage.getConsent();
  }

  /**
   * Handle language selection
   */
  selectLanguage(languageCode: string): void {
    this.selectedLanguage = languageCode;
    this.translate.use(languageCode);
    this.storage.setLanguage(languageCode);
    this.showLanguageDropdown = false;
  }

  /**
   * Get selected language object
   */
  getSelectedLanguage(): Language {
    return this.languages.find((lang) => lang.code === this.selectedLanguage) || this.languages[0];
  }

  /**
   * Toggle privacy section
   */
  togglePrivacy(): void {
    this.showPrivacy = !this.showPrivacy;
  }

  /**
   * Toggle language dropdown
   */
  toggleLanguageDropdown(event: Event): void {
    event.stopPropagation();
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  /**
   * Validate form
   */
  validateForm(): boolean {
    this.errors = {};

    if (!this.firstName.trim()) {
      this.errors.firstName = this.translate.instant('validation.required');
    }

    if (!this.lastName.trim()) {
      this.errors.lastName = this.translate.instant('validation.required');
    }

    if (!this.consent) {
      this.errors.consent = this.translate.instant('validation.required');
    }

    return Object.keys(this.errors).length === 0;
  }

  /**
   * Handle form submission
   */
  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    // Support tests which type a full name into the firstName field
    let finalFirst = this.firstName.trim();
    let finalLast = this.lastName.trim();

    if (!finalLast && finalFirst.includes(' ')) {
      const parts = finalFirst.split(/\s+/);
      finalFirst = parts.shift() || '';
      finalLast = parts.join(' ');
      this.firstName = finalFirst;
      this.lastName = finalLast;
    }

    const fullName = `${finalFirst} ${finalLast}`.trim();
    this.storage.setEmployeeName(fullName);
    this.storage.setConsent(true);

    // Emit completion event
    this.complete.emit();
  }
}
