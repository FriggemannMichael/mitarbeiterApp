import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DayData } from '../../../core/models/timesheet.model';

/**
 * Day Card Component - Individual day time entry
 * Migrated from React PWA (DayCard.tsx)
 */
@Component({
  selector: 'app-day-card',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './day-card.html',
  styleUrl: './day-card.scss',
})
export class DayCard {
  // Input properties
  day = input.required<DayData>();
  dayName = input.required<string>();
  dayIndex = input.required<number>();
  isEditable = input<boolean>(true);

  // Output events
  timeChange = output<{ dayIndex: number; field: keyof DayData; value: string }>();

  // Track collapsed state - default closed
  isCollapsed = true;

  /**
   * Toggle collapse state
   */
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  /**
   * Handle time field change
   */
  onTimeChange(field: keyof DayData, value: string): void {
    this.timeChange.emit({
      dayIndex: this.dayIndex(),
      field,
      value,
    });
  }

  /**
   * Check if day has any data
   */
  hasData(): boolean {
    const d = this.day();
    return !!(d.from || d.to || d.pause1From || d.pause1To || d.pause2From || d.pause2To);
  }

  /**
   * Format date for display
   */
  formatDate(): string {
    const date = new Date(this.day().date);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }
}
