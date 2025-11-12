import { Component, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../core/services/storage.service';
import { WeekService } from '../../core/services/week.service';
import { WeekOverviewModal } from '../../shared/components/week-overview-modal/week-overview-modal';
import { SickLeaveModal } from './sick-leave-modal';
import { VacationModal } from './vacation-modal';
import { MonthOverviewModal } from '../../shared/components/month-overview-modal/month-overview-modal';
import { HistoryModal } from '../../shared/components/history-modal/history-modal';
import { ContactModal } from '../../shared/components/contact-modal/contact-modal';
import { UploadModal } from '../../shared/components/upload-modal/upload-modal';
import { HelpModal } from '../../shared/components/help-modal/help-modal';
import { LanguageModal } from '../../shared/components/language-modal/language-modal';

export interface DashboardTile {
  id: string;
  titleKey: string;
  iconClass: string;
  action: () => void;
  enabled: boolean;
}

/**
 * Dashboard Component - Central management page
 * Displays tiles for navigation to various features
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    TranslateModule,
    WeekOverviewModal,
    MonthOverviewModal,
    HistoryModal,
    ContactModal,
    UploadModal,
    HelpModal,
    LanguageModal,
    SickLeaveModal,
    VacationModal,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  // Output events
  navigateToTimesheet = output<void>();
  logout = output<void>();

  // State
  userName = '';
  currentDate = new Date();
  isOnline = signal(true);

  // Modals
  showWeekOverviewModal = signal(false);
  showMonthOverviewModal = signal(false);
  showHistoryModal = signal(false);
  showContactModal = signal(false);
  showUploadModal = signal(false);
  showHelpModal = signal(false);
  showLanguageModal = signal(false);
  showSickLeaveModal = signal(false);
  showVacationModal = signal(false);

  // Tiles configuration
  tiles: DashboardTile[] = [];

  constructor(
    private storage: StorageService,
    private translate: TranslateService,
    private weekService: WeekService
  ) {}

  ngOnInit(): void {
    // Load user data
    this.userName = this.storage.getEmployeeName();

    // Monitor online status
    this.updateOnlineStatus();
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());

    // Initialize tiles
    this.initializeTiles();
  }

  private updateOnlineStatus(): void {
    this.isOnline.set(navigator.onLine);
  }

  private initializeTiles(): void {
    this.tiles = [
      {
        id: 'timesheet',
        titleKey: 'dashboard.tiles.timesheet',
        iconClass: 'icon-timesheet',
        action: () => this.openTimesheet(),
        enabled: true,
      },
      {
        id: 'weekOverview',
        titleKey: 'dashboard.tiles.weekOverview',
        iconClass: 'icon-week',
        action: () => this.showWeekOverviewModal.set(true),
        enabled: true,
      },
      {
        id: 'monthOverview',
        titleKey: 'dashboard.tiles.monthOverview',
        iconClass: 'icon-month',
        action: () => this.showMonthOverviewModal.set(true),
        enabled: true,
      },
      {
        id: 'history',
        titleKey: 'dashboard.tiles.history',
        iconClass: 'icon-history',
        action: () => this.showHistoryModal.set(true),
        enabled: true,
      },
      {
        id: 'contact',
        titleKey: 'dashboard.tiles.contact',
        iconClass: 'icon-contact',
        action: () => this.showContactModal.set(true),
        enabled: true,
      },
      {
        id: 'upload',
        titleKey: 'dashboard.tiles.upload',
        iconClass: 'icon-upload',
        action: () => this.showUploadModal.set(true),
        enabled: true,
      },
      {
        id: 'help',
        titleKey: 'dashboard.tiles.help',
        iconClass: 'icon-help',
        action: () => this.showHelpModal.set(true),
        enabled: true,
      },
      {
        id: 'language',
        titleKey: 'dashboard.tiles.language',
        iconClass: 'icon-language',
        action: () => this.showLanguageModal.set(true),
        enabled: true,
      },
      // Future tiles (disabled for now)
      {
        id: 'sickLeave',
        titleKey: 'dashboard.tiles.sickLeave',
        iconClass: 'icon-sick',
        action: () => console.log('Sick leave - coming soon'),
        enabled: false,
      },
      {
        id: 'vacation',
        titleKey: 'dashboard.tiles.vacation',
        iconClass: 'icon-vacation',
        action: () => console.log('Vacation - coming soon'),
        enabled: false,
      },
    ];
  }

  /**
   * Handle tile click
   */
  onTileClick(tile: DashboardTile): void {
    if (tile.enabled) {
      tile.action();
    }
  }

  /**
   * Navigate to timesheet
   */
  openTimesheet(): void {
    this.navigateToTimesheet.emit();
  }

  /**
   * Close all modals
   */
  closeModal(modalName: string): void {
    switch (modalName) {
      case 'weekOverview':
        this.showWeekOverviewModal.set(false);
        break;
      case 'monthOverview':
        this.showMonthOverviewModal.set(false);
        break;
      case 'history':
        this.showHistoryModal.set(false);
        break;
      case 'contact':
        this.showContactModal.set(false);
        break;
      case 'upload':
        this.showUploadModal.set(false);
        break;
      case 'help':
        this.showHelpModal.set(false);
        break;
      case 'language':
        this.showLanguageModal.set(false);
        break;
    }
  }

  /**
   * Handle language change
   */
  onLanguageChange(languageCode: string): void {
    this.translate.use(languageCode);
    this.storage.setLanguage(languageCode);
    this.showLanguageModal.set(false);
  }

  /**
   * Handle logout
   */
  onLogout(): void {
    if (confirm(this.translate.instant('actions.confirmLogout'))) {
      this.logout.emit();
    }
  }
}
