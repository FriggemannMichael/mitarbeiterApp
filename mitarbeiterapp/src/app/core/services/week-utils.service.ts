import { Injectable } from '@angular/core';
import { DayData, ShiftModel } from '../models/timesheet.model';

/**
 * Week calculation utilities
 * Migrated from React PWA (storage.ts - weekUtils)
 */
@Injectable({
  providedIn: 'root',
})
export class WeekUtilsService {
  /**
   * Get ISO week number for a date
   * ISO 8601: Week starts on Monday, week 1 contains first Thursday
   */
  getWeekNumber(date: Date): { year: number; week: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // Sunday = 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Thursday of current week
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { year: d.getUTCFullYear(), week: weekNo };
  }

  /**
   * Get current week
   */
  getCurrentWeek(): { year: number; week: number } {
    return this.getWeekNumber(new Date());
  }

  /**
   * Get Monday of a given ISO week
   */
  getMonday(year: number, week: number): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  }

  /**
   * Get all 7 days of a week starting from Monday (for day shifts)
   */
  getWeekDays(year: number, week: number): Date[] {
    const monday = this.getMonday(year, week);
    const days: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }

    return days;
  }

  /**
   * Get all 7 days starting from Sunday (for night shifts)
   * Night shifts typically start Sunday night
   */
  getWeekDaysForNightShift(year: number, week: number): Date[] {
    const monday = this.getMonday(year, week);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() - 1); // Go back to Sunday

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      days.push(day);
    }

    return days;
  }

  /**
   * Format date to ISO string (YYYY-MM-DD)
   */
  toISODate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format date to localized string (e.g., "15.01.2025")
   */
  formatDate(date: Date, locale: string = 'de-DE'): string {
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Format date range (e.g., "01.01 - 07.01")
   */
  formatDateRange(startDate: Date, endDate: Date, locale: string = 'de-DE'): string {
    const start = startDate.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
    });
    const end = endDate.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
    });
    return `${start} - ${end}`;
  }

  /**
   * Get date range string for a week
   */
  getWeekDateRange(year: number, week: number, shiftModel?: ShiftModel): string {
    const days =
      shiftModel === 'night'
        ? this.getWeekDaysForNightShift(year, week)
        : this.getWeekDays(year, week);

    const startDate = days[0];
    const endDate = days[6];

    return this.formatDateRange(startDate, endDate);
  }

  /**
   * Create empty day data for a date
   */
  createEmptyDay(date: Date): DayData {
    return {
      date: this.toISODate(date),
      from: '',
      to: '',
      pause1From: '',
      pause1To: '',
      pause2From: '',
      pause2To: '',
      hours: '00:00',
      decimal: '0.00',
      isNightShift: false,
    };
  }

  /**
   * Initialize empty week data
   */
  initializeWeekDays(year: number, week: number, shiftModel: ShiftModel = 'day'): DayData[] {
    const days =
      shiftModel === 'night'
        ? this.getWeekDaysForNightShift(year, week)
        : this.getWeekDays(year, week);

    return days.map((date) => this.createEmptyDay(date));
  }

  /**
   * Get day name for index
   */
  getDayName(index: number, shiftModel: ShiftModel = 'day'): string {
    const dayNames =
      shiftModel === 'night'
        ? ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return dayNames[index] || '';
  }

  /**
   * Navigate to next/previous week
   */
  navigateWeek(
    currentYear: number,
    currentWeek: number,
    direction: 'next' | 'prev' | 'current'
  ): { year: number; week: number } {
    if (direction === 'current') {
      return this.getCurrentWeek();
    }

    const monday = this.getMonday(currentYear, currentWeek);

    if (direction === 'next') {
      monday.setDate(monday.getDate() + 7);
    } else {
      monday.setDate(monday.getDate() - 7);
    }

    return this.getWeekNumber(monday);
  }

  /**
   * Check if a week is in the past
   */
  isWeekInPast(year: number, week: number): boolean {
    const current = this.getCurrentWeek();

    if (year < current.year) return true;
    if (year > current.year) return false;
    return week < current.week;
  }

  /**
   * Check if a week is the current week
   */
  isCurrentWeek(year: number, week: number): boolean {
    const current = this.getCurrentWeek();
    return year === current.year && week === current.week;
  }

  /**
   * Get week year string (e.g., "2025_01")
   */
  getWeekKey(year: number, week: number): string {
    return `${year}_${week.toString().padStart(2, '0')}`;
  }

  /**
   * Parse week key to year and week
   */
  parseWeekKey(key: string): { year: number; week: number } | null {
    const match = key.match(/(\d{4})_(\d{1,2})$/);
    if (!match) return null;

    return {
      year: parseInt(match[1], 10),
      week: parseInt(match[2], 10),
    };
  }
}
