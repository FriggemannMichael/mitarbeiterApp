import { Injectable } from '@angular/core';
import { WeekData } from '../models/timesheet.model';
import { STORAGE_KEYS } from '../models/constants';

/**
 * LocalStorage management service
 * Migrated from React PWA (storage.ts)
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // ============ Language ============
  setLanguage(language: string): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }

  getLanguage(): string {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'de';
  }

  // ============ Employee Name ============
  setEmployeeName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEE_NAME, name);
  }

  getEmployeeName(): string {
    return localStorage.getItem(STORAGE_KEYS.EMPLOYEE_NAME) || '';
  }

  // ============ Consent ============
  setConsent(consent: boolean): void {
    localStorage.setItem(STORAGE_KEYS.CONSENT, consent.toString());
  }

  getConsent(): boolean {
    return localStorage.getItem(STORAGE_KEYS.CONSENT) === 'true';
  }

  // ============ Week Data ============
  setWeekData(year: number, week: number, data: WeekData): void {
    const key = `${STORAGE_KEYS.WEEK_PREFIX}${year}_${week}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  getWeekData(year: number, week: number): WeekData | null {
    const key = `${STORAGE_KEYS.WEEK_PREFIX}${year}_${week}`;
    const data = localStorage.getItem(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as WeekData;
    } catch (e) {
      console.error('Failed to parse week data:', e);
      return null;
    }
  }

  deleteWeekData(year: number, week: number): void {
    const key = `${STORAGE_KEYS.WEEK_PREFIX}${year}_${week}`;
    localStorage.removeItem(key);
  }

  /**
   * Get all week keys (for backup/restore)
   */
  getAllWeekKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.WEEK_PREFIX)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Get all week data objects
   */
  getAllWeeks(): WeekData[] {
    const weeks: WeekData[] = [];
    const keys = this.getAllWeekKeys();

    keys.forEach(key => {
      const weekDataStr = localStorage.getItem(key);
      if (weekDataStr) {
        try {
          const weekData = JSON.parse(weekDataStr) as WeekData;
          weeks.push(weekData);
        } catch (error) {
          console.error('Error parsing week data:', error);
        }
      }
    });

    return weeks;
  }

  // ============ Backup & Restore ============
  setLastBackupDate(date: Date): void {
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP_DATE, date.toISOString());
  }

  getLastBackupDate(): Date | null {
    const dateStr = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP_DATE);
    return dateStr ? new Date(dateStr) : null;
  }

  setBackupReminderDismissed(dismissed: boolean): void {
    localStorage.setItem(STORAGE_KEYS.BACKUP_REMINDER_DISMISSED, dismissed.toString());
  }

  getBackupReminderDismissed(): boolean {
    return localStorage.getItem(STORAGE_KEYS.BACKUP_REMINDER_DISMISSED) === 'true';
  }

  setFirstUseDate(date?: Date): void {
    if (!this.getFirstUseDate()) {
      localStorage.setItem(STORAGE_KEYS.FIRST_USE_DATE, (date || new Date()).toISOString());
    }
  }

  getFirstUseDate(): Date | null {
    const dateStr = localStorage.getItem(STORAGE_KEYS.FIRST_USE_DATE);
    return dateStr ? new Date(dateStr) : null;
  }

  /**
   * Export all data as JSON (for backup)
   */
  exportAllData(): string {
    const data: Record<string, string> = {};

    // Export all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          data[key] = value;
        }
      }
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON backup
   */
  importAllData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      // Validate data structure
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid backup data format');
      }

      // Import all keys
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });

      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }

  // ============ PWA Guide ============
  setPWAGuideShown(shown: boolean): void {
    localStorage.setItem(STORAGE_KEYS.PWA_GUIDE_SHOWN, shown.toString());
  }

  getPWAGuideShown(): boolean {
    return localStorage.getItem(STORAGE_KEYS.PWA_GUIDE_SHOWN) === 'true';
  }

  setPWAModalDismissed(dismissed: boolean): void {
    localStorage.setItem(STORAGE_KEYS.PWA_MODAL_DISMISSED, dismissed.toString());
  }

  getPWAModalDismissed(): boolean {
    return localStorage.getItem(STORAGE_KEYS.PWA_MODAL_DISMISSED) === 'true';
  }

  setPWAModalNever(never: boolean): void {
    localStorage.setItem(STORAGE_KEYS.PWA_MODAL_NEVER, never.toString());
  }

  getPWAModalNever(): boolean {
    return localStorage.getItem(STORAGE_KEYS.PWA_MODAL_NEVER) === 'true';
  }

  shouldShowPWAModal(): boolean {
    // Don't show if user said "never"
    if (this.getPWAModalNever()) return false;

    // Don't show if already dismissed recently
    if (this.getPWAModalDismissed()) return false;

    // Don't show if guide was already shown
    if (this.getPWAGuideShown()) return false;

    // Show if app is not installed (not in standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    return !isStandalone;
  }

  // ============ Clear Data ============
  /**
   * Clear all application data (nuclear option)
   */
  clearAllData(): void {
    const keysToRemove: string[] = [];

    // Find all app-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wpdl_')) {
        keysToRemove.push(key);
      }
    }

    // Remove them
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Clear only time data (keep employee name and customer)
   */
  clearTimeData(): void {
    const weekKeys = this.getAllWeekKeys();
    weekKeys.forEach((key) => localStorage.removeItem(key));
  }
}
