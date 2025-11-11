import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Welcome } from './features/welcome/welcome';
import { Timesheet } from './features/timesheet/timesheet';
import { StorageService } from './core/services/storage.service';

/**
 * Root App Component
 * Migrated from React PWA (App.tsx)
 */
@Component({
  selector: 'app-root',
  imports: [CommonModule, TranslateModule, Welcome, Timesheet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('mitarbeiterapp');

  isOnboarded = signal(false);
  loading = signal(true);

  constructor(
    private storage: StorageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
      // Unterstützte Sprachen initialisieren
      this.translate.addLangs(['de', 'en', 'bg', 'ar', 'fa', 'fr', 'pl', 'ro', 'ru', 'uk']);
      const language = this.storage.getLanguage();
      this.translate.setDefaultLang(language);
      this.translate.use(language);

    // Check onboarding status
    this.checkOnboardingStatus();

    // Set first use date
    this.storage.setFirstUseDate();
  }

  private checkOnboardingStatus(): void {
    const hasConsent = this.storage.getConsent();
    const hasName = this.storage.getEmployeeName();

    // User is onboarded when both conditions are met
    this.isOnboarded.set(hasConsent && hasName.length > 0);
    this.loading.set(false);
  }

  onOnboardingComplete(): void {
    this.isOnboarded.set(true);
  }

  onLogout(): void {
    this.storage.clearAllData();
    this.isOnboarded.set(false);
  }
}
