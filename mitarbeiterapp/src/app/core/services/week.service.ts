import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WeekData, DayData, ShiftModel, ShiftConfig, TotalHours } from '../models/timesheet.model';
import { StorageService } from './storage.service';
import { WeekUtilsService } from './week-utils.service';
import { TimeUtilsService } from './time-utils.service';

/**
 * Week state management service
 * Migrated from React PWA (useWeek hook)
 */
@Injectable({
  providedIn: 'root',
})
export class WeekService {
  private currentWeekSubject = new BehaviorSubject<{ year: number; week: number } | null>(null);
  private weekDataSubject = new BehaviorSubject<WeekData | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  currentWeek$ = this.currentWeekSubject.asObservable();
  weekData$ = this.weekDataSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(
    private storage: StorageService,
    private weekUtils: WeekUtilsService,
    private timeUtils: TimeUtilsService
  ) {}

  /**
   * Initialize week data for current or specific week
   */
  initializeWeek(year?: number, week?: number): void {
    this.loadingSubject.next(true);

    const weekInfo = year && week ? { year, week } : this.weekUtils.getCurrentWeek();
    this.currentWeekSubject.next(weekInfo);

    this.loadWeekData(weekInfo.year, weekInfo.week);
  }

  /**
   * Load week data from storage or create new
   */
  private loadWeekData(year: number, week: number): void {
    const employeeName = this.storage.getEmployeeName();

    // Try to load existing data
    let weekData = this.storage.getWeekData(year, week);

    // Create new week data if not exists
    if (!weekData) {
      const startDate = this.weekUtils.getMonday(year, week);
      const days = this.weekUtils.initializeWeekDays(year, week);

      weekData = {
        employeeName,
        customer: '',
        week,
        year,
        startDate: this.weekUtils.toISODate(startDate),
        days,
        locked: false,
        shiftModel: 'day',
      };

      this.storage.setWeekData(year, week, weekData);
    }

    this.weekDataSubject.next(weekData);
    this.loadingSubject.next(false);
  }

  /**
   * Update day time field
   */
  updateDayTime(dayIndex: number, field: keyof DayData, value: string): void {
    const weekData = this.weekDataSubject.value;
    if (!weekData || !weekData.days[dayIndex]) return;

    const updatedDays = [...weekData.days];
    const day = { ...updatedDays[dayIndex] };

    // Update field
    (day as any)[field] = value;

    // Auto-detect night shift
    if (field === 'from' || field === 'to') {
      day.isNightShift = this.timeUtils.isNightShift(day.from, day.to);
      if (day.isNightShift) {
        day.nightShiftEndDate = this.timeUtils.getNightShiftEndDate(day.date);
      }
    }

    // Recalculate hours
    const { hours, decimal } = this.timeUtils.calculateWorkHours(day);
    day.hours = hours;
    day.decimal = decimal;

    updatedDays[dayIndex] = day;

    const updatedWeekData = {
      ...weekData,
      days: updatedDays,
    };

    this.weekDataSubject.next(updatedWeekData);
    this.storage.setWeekData(weekData.year, weekData.week, updatedWeekData);
  }

  /**
   * Apply shift configuration to week
   */
  applyShiftConfigToWeek(shiftModel: ShiftModel, config: ShiftConfig): void {
    const weekData = this.weekDataSubject.value;
    if (!weekData) return;

    const updatedDays = weekData.days.map((day, index) => {
      // Only apply to selected days
      if (!config.days[index]) return day;

      const updatedDay: DayData = {
        ...day,
        from: config.from,
        to: config.to,
        pause1From: config.pause1From,
        pause1To: config.pause1To,
        pause2From: config.pause2From,
        pause2To: config.pause2To,
      };

      // Auto-detect night shift
      updatedDay.isNightShift = this.timeUtils.isNightShift(updatedDay.from, updatedDay.to);
      if (updatedDay.isNightShift) {
        updatedDay.nightShiftEndDate = this.timeUtils.getNightShiftEndDate(updatedDay.date);
      }

      // Calculate hours
      const { hours, decimal } = this.timeUtils.calculateWorkHours(updatedDay);
      updatedDay.hours = hours;
      updatedDay.decimal = decimal;

      return updatedDay;
    });

    const updatedWeekData = {
      ...weekData,
      days: updatedDays,
      shiftModel,
    };

    this.weekDataSubject.next(updatedWeekData);
    this.storage.setWeekData(weekData.year, weekData.week, updatedWeekData);
  }

  /**
   * Update customer name
   */
  updateCustomer(customer: string): void {
    const weekData = this.weekDataSubject.value;
    if (!weekData) return;

    const updatedWeekData = { ...weekData, customer };
    this.weekDataSubject.next(updatedWeekData);
    this.storage.setWeekData(weekData.year, weekData.week, updatedWeekData);
  }

  /**
   * Update customer email
   */
  updateCustomerEmail(email: string): void {
    const weekData = this.weekDataSubject.value;
    if (!weekData) return;

    const updatedWeekData = { ...weekData, customerEmail: email };
    this.weekDataSubject.next(updatedWeekData);
    this.storage.setWeekData(weekData.year, weekData.week, updatedWeekData);
  }

  /**
   * Update shift model
   */
  updateShiftModel(shiftModel: ShiftModel): void {
    const weekData = this.weekDataSubject.value;
    if (!weekData) return;

    const updatedWeekData = { ...weekData, shiftModel };
    this.weekDataSubject.next(updatedWeekData);
    this.storage.setWeekData(weekData.year, weekData.week, updatedWeekData);
  }

  /**
   * Add signature
   */
  addSignature(type: 'employee' | 'supervisor', signatureData: string, name?: string): void {
    const weekData = this.weekDataSubject.value;
    if (!weekData) return;

    const updatedWeekData = { ...weekData };

    if (type === 'employee') {
      updatedWeekData.employeeSignature = signatureData;
    } else {
      updatedWeekData.supervisorSignature = signatureData;
      if (name) {
        updatedWeekData.supervisorName = name;
      }
    }

    // Lock week when both signatures are present
    if (updatedWeekData.employeeSignature && updatedWeekData.supervisorSignature) {
      updatedWeekData.locked = true;
    }

    this.weekDataSubject.next(updatedWeekData);
    this.storage.setWeekData(weekData.year, weekData.week, updatedWeekData);
  }

  /**
   * Clear signature
   */
  clearSignature(type: 'employee' | 'supervisor'): void {
    const weekData = this.weekDataSubject.value;
    if (!weekData) return;

    const updatedWeekData = { ...weekData, locked: false };

    if (type === 'employee') {
      updatedWeekData.employeeSignature = undefined;
    } else {
      updatedWeekData.supervisorSignature = undefined;
      updatedWeekData.supervisorName = undefined;
    }

    this.weekDataSubject.next(updatedWeekData);
    this.storage.setWeekData(weekData.year, weekData.week, updatedWeekData);
  }

  /**
   * Navigate to next/previous/current week
   */
  navigateWeek(direction: 'next' | 'prev' | 'current'): void {
    const current = this.currentWeekSubject.value;
    if (!current) return;

    const newWeek = this.weekUtils.navigateWeek(current.year, current.week, direction);
    this.initializeWeek(newWeek.year, newWeek.week);
  }

  /**
   * Get total hours for current week
   */
  getTotalHours(): TotalHours {
    const weekData = this.weekDataSubject.value;
    if (!weekData) return { hours: '00:00', decimal: '0.00' };

    return this.timeUtils.calculateTotalHours(weekData.days);
  }

  /**
   * Check if week is editable (not locked and not signed)
   */
  isEditable(): boolean {
    const weekData = this.weekDataSubject.value;
    if (!weekData) return false;

    return !weekData.locked && !weekData.employeeSignature;
  }

  /**
   * Check if supervisor can sign (employee already signed)
   */
  canSupervisorSign(): boolean {
    const weekData = this.weekDataSubject.value;
    if (!weekData) return false;

    return !!weekData.employeeSignature && !weekData.locked;
  }

  /**
   * Get date range string for current week
   */
  getDateRange(): string {
    const current = this.currentWeekSubject.value;
    const weekData = this.weekDataSubject.value;
    if (!current) return '';

    return this.weekUtils.getWeekDateRange(current.year, current.week, weekData?.shiftModel);
  }

  /**
   * Clear current week data
   */
  clearWeekData(): void {
    const weekData = this.weekDataSubject.value;
    if (!weekData) return;

    const clearedDays = weekData.days.map((day) => ({
      ...day,
      from: '',
      to: '',
      pause1From: '',
      pause1To: '',
      pause2From: '',
      pause2To: '',
      hours: '00:00',
      decimal: '0.00',
      isNightShift: false,
    }));

    const clearedWeekData: WeekData = {
      ...weekData,
      days: clearedDays,
      employeeSignature: undefined,
      supervisorSignature: undefined,
      supervisorName: undefined,
      locked: false,
    };

    this.weekDataSubject.next(clearedWeekData);
    this.storage.setWeekData(weekData.year, weekData.week, clearedWeekData);
  }

  /**
   * Get current week data synchronously
   */
  getCurrentWeekData(): WeekData | null {
    return this.weekDataSubject.value;
  }

  /**
   * Get current week info synchronously
   */
  getCurrentWeekInfo(): { year: number; week: number } | null {
    return this.currentWeekSubject.value;
  }
}
