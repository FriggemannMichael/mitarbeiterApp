import { Component, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StorageService } from '../../../core/services/storage.service';
import { WeekData } from '../../../core/models/timesheet.model';

interface HistoryEntry {
  year: number;
  week: number;
  totalHours: string;
  signed: boolean;
  dateRange: string;
}

/**
 * History Modal - Shows past weeks
 */
@Component({
  selector: 'app-history-modal',
  imports: [CommonModule, TranslateModule],
  templateUrl: './history-modal.html',
  styleUrl: './history-modal.scss',
})
export class HistoryModal implements OnInit {
  close = output<void>();

  history: HistoryEntry[] = [];

  constructor(private storage: StorageService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  private loadHistory(): void {
    const allWeeks = this.storage.getAllWeeks();

    this.history = allWeeks
      .map((week: WeekData) => this.createHistoryEntry(week))
      .sort((a: HistoryEntry, b: HistoryEntry) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.week - a.week;
      });
  }

  private createHistoryEntry(weekData: WeekData): HistoryEntry {
    const totalMinutes = weekData.days.reduce((total, day) => {
      return total + this.calculateDayMinutes(day);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalHours = `${hours}:${minutes.toString().padStart(2, '0')}`;

    const dateRange = this.getDateRange(weekData.year, weekData.week);
    const signed = !!(weekData.employeeSignature);

    return {
      year: weekData.year,
      week: weekData.week,
      totalHours,
      signed,
      dateRange,
    };
  }

  private calculateDayMinutes(day: any): number {
    if (!day.from || !day.to) return 0;

    let total = this.getTimeDiff(day.from, day.to);

    if (day.pause1From && day.pause1To) {
      total -= this.getTimeDiff(day.pause1From, day.pause1To);
    }

    if (day.pause2From && day.pause2To) {
      total -= this.getTimeDiff(day.pause2From, day.pause2To);
    }

    return Math.max(0, total);
  }

  private getTimeDiff(start: string, end: string): number {
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);
    return endMinutes >= startMinutes
      ? endMinutes - startMinutes
      : (24 * 60 - startMinutes) + endMinutes;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private getDateRange(year: number, week: number): string {
    const date = this.getDateFromWeek(year, week);
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 6);

    const format = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    return `${format(date)} - ${format(endDate)}`;
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

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }
}
