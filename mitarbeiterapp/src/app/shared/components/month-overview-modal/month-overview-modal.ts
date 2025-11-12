import { Component, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StorageService } from '../../../core/services/storage.service';

interface MonthSummary {
  month: number;
  year: number;
  totalHours: number;
  daysWorked: number;
  expectedHours: number;
}

/**
 * Month Overview Modal - Shows monthly statistics
 */
@Component({
  selector: 'app-month-overview-modal',
  imports: [CommonModule, TranslateModule],
  templateUrl: './month-overview-modal.html',
  styleUrl: './month-overview-modal.scss',
})
export class MonthOverviewModal implements OnInit {
  close = output<void>();

  monthSummary: MonthSummary | null = null;

  constructor(private storage: StorageService) {}

  ngOnInit(): void {
    this.loadMonthSummary();
  }

  private loadMonthSummary(): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate expected working hours (assuming 8 hours/day, 5 days/week)
    const workingDays = this.getWorkingDaysInMonth(currentYear, currentMonth);
    const expectedHours = workingDays * 8;

    // Get all stored weeks for current month
    const allWeeks = this.storage.getAllWeeks();
    let totalHours = 0;
    let daysWorked = 0;

    allWeeks.forEach((week: any) => {
      const weekDate = this.getDateFromWeek(week.year, week.week);
      if (weekDate.getMonth() === currentMonth && weekDate.getFullYear() === currentYear) {
        // Calculate hours for this week
        week.days.forEach((day: any) => {
          if (day.from && day.to) {
            daysWorked++;
            // Simple calculation - in real app use TimeUtils
            const hours = this.calculateDayHours(day.from, day.to, day.pause1From, day.pause1To, day.pause2From, day.pause2To);
            totalHours += hours;
          }
        });
      }
    });

    this.monthSummary = {
      month: currentMonth,
      year: currentYear,
      totalHours: Math.round(totalHours * 100) / 100,
      daysWorked,
      expectedHours,
    };
  }

  private getWorkingDaysInMonth(year: number, month: number): number {
    const date = new Date(year, month, 1);
    let workingDays = 0;

    while (date.getMonth() === month) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      date.setDate(date.getDate() + 1);
    }

    return workingDays;
  }

  private getDateFromWeek(year: number, week: number): Date {
    const date = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = date.getDay();
    const ISOweekStart = date;
    if (dayOfWeek <= 4) {
      ISOweekStart.setDate(date.getDate() - date.getDay() + 1);
    } else {
      ISOweekStart.setDate(date.getDate() + 8 - date.getDay());
    }
    return ISOweekStart;
  }

  private calculateDayHours(from: string, to: string, pause1From?: string, pause1To?: string, pause2From?: string, pause2To?: string): number {
    if (!from || !to) return 0;

    const start = this.timeToMinutes(from);
    const end = this.timeToMinutes(to);
    let total = end >= start ? end - start : (24 * 60 - start) + end;

    if (pause1From && pause1To) {
      const p1Start = this.timeToMinutes(pause1From);
      const p1End = this.timeToMinutes(pause1To);
      total -= (p1End - p1Start);
    }

    if (pause2From && pause2To) {
      const p2Start = this.timeToMinutes(pause2From);
      const p2End = this.timeToMinutes(pause2To);
      total -= (p2End - p2Start);
    }

    return total / 60;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getMonthName(): string {
    if (!this.monthSummary) return '';
    const date = new Date(this.monthSummary.year, this.monthSummary.month, 1);
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  }

  getDifference(): number {
    if (!this.monthSummary) return 0;
    return this.monthSummary.totalHours - this.monthSummary.expectedHours;
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
