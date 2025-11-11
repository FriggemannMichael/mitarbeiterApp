import { Injectable } from '@angular/core';
import { DayData, ShiftModel, TotalHours } from '../models/timesheet.model';
import { SHIFT_DETECTION, SHIFT_MODELS } from '../models/constants';

/**
 * Time calculation utilities
 * Migrated from React PWA (storage.ts - timeUtils)
 */
@Injectable({
  providedIn: 'root',
})
export class TimeUtilsService {
  /**
   * Convert HH:MM time string to minutes since midnight
   */
  timeToMinutes(time: string): number {
    if (!time || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes to HH:MM format
   */
  minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate work hours for a day with support for night shifts and two breaks
   * Returns both HH:MM and decimal (industrial minutes) format
   */
  calculateWorkHours(day: DayData): { hours: string; decimal: string } {
    const { from, to, pause1From, pause1To, pause2From, pause2To, isNightShift } = day;

    // Check if required fields are empty
    if (!from || !to) {
      return { hours: '00:00', decimal: '0.00' };
    }

    let startMinutes = this.timeToMinutes(from);
    let endMinutes = this.timeToMinutes(to);

    // Handle night shifts (end time is next day)
    if (isNightShift || endMinutes <= startMinutes) {
      endMinutes += 24 * 60; // Add 24 hours
    }

    let totalMinutes = endMinutes - startMinutes;

    // Subtract first break
    if (pause1From && pause1To) {
      const break1Start = this.timeToMinutes(pause1From);
      const break1End = this.timeToMinutes(pause1To);
      const break1Duration = break1End > break1Start ? break1End - break1Start : 0;
      totalMinutes -= break1Duration;
    }

    // Subtract second break
    if (pause2From && pause2To) {
      const break2Start = this.timeToMinutes(pause2From);
      const break2End = this.timeToMinutes(pause2To);
      const break2Duration = break2End > break2Start ? break2End - break2Start : 0;
      totalMinutes -= break2Duration;
    }

    // Ensure non-negative
    totalMinutes = Math.max(0, totalMinutes);

    // Convert to HH:MM
    const hours = this.minutesToTime(totalMinutes);

    // Convert to decimal (industrial minutes format)
    const decimalHours = (totalMinutes / 60).toFixed(2);

    return { hours, decimal: decimalHours };
  }

  /**
   * Calculate total hours for entire week
   */
  calculateTotalHours(days: DayData[]): TotalHours {
    let totalMinutes = 0;

    days.forEach((day) => {
      const { hours } = this.calculateWorkHours(day);
      totalMinutes += this.timeToMinutes(hours);
    });

    return {
      hours: this.minutesToTime(totalMinutes),
      decimal: (totalMinutes / 60).toFixed(2),
    };
  }

  /**
   * Detect if a time range is a night shift
   */
  isNightShift(from: string, to: string): boolean {
    if (!from || !to) return false;

    const fromMinutes = this.timeToMinutes(from);
    const toMinutes = this.timeToMinutes(to);

    // Night shift if:
    // 1. Start time is >= 22:00 (10 PM)
    // 2. End time is <= 08:00 (8 AM)
    // 3. End time is before start time (crosses midnight)
    const fromHour = Math.floor(fromMinutes / 60);
    const toHour = Math.floor(toMinutes / 60);

    return (
      fromHour >= SHIFT_DETECTION.NIGHT_SHIFT_START_HOUR ||
      toHour <= SHIFT_DETECTION.NIGHT_SHIFT_END_HOUR ||
      toMinutes <= fromMinutes
    );
  }

  /**
   * Get default shift times for a shift model
   */
  getShiftModelTemplate(shiftModel: ShiftModel) {
    return SHIFT_MODELS[shiftModel]?.defaultTimes || SHIFT_MODELS.day.defaultTimes;
  }

  /**
   * Format time to ensure HH:MM format
   */
  formatTime(time: string): string {
    if (!time || !time.includes(':')) return '';
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  /**
   * Validate time format HH:MM
   */
  isValidTimeFormat(time: string): boolean {
    if (!time) return true; // Empty is valid
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Parse time input and auto-format
   * Accepts: "8", "8:30", "830", "0830"
   */
  parseTimeInput(input: string): string {
    if (!input) return '';

    // Remove any non-digits
    const digits = input.replace(/\D/g, '');

    if (digits.length === 0) return '';
    if (digits.length === 1 || digits.length === 2) {
      // Just hours: "8" or "08" -> "08:00"
      const hours = parseInt(digits, 10);
      if (hours >= 0 && hours <= 23) {
        return `${hours.toString().padStart(2, '0')}:00`;
      }
    }
    if (digits.length === 3) {
      // "830" -> "08:30"
      const hours = parseInt(digits.substring(0, 1), 10);
      const minutes = parseInt(digits.substring(1, 3), 10);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    if (digits.length === 4) {
      // "0830" -> "08:30"
      const hours = parseInt(digits.substring(0, 2), 10);
      const minutes = parseInt(digits.substring(2, 4), 10);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    return input;
  }

  /**
   * Get end date for night shift (next day)
   */
  getNightShiftEndDate(startDate: string): string {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Calculate if work hours exceed maximum per day
   */
  exceedsMaxHours(day: DayData, maxHours: number = 12): boolean {
    const { decimal } = this.calculateWorkHours(day);
    return parseFloat(decimal) > maxHours;
  }
}
