import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DayData } from '../../../core/models/timesheet.model';

/**
 * Day Time Entry Modal
 * Modal for entering work times for a specific day
 */
@Component({
  selector: 'app-day-time-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './day-time-modal.html',
  styleUrl: './day-time-modal.scss',
})
export class DayTimeModal {
  // Inputs
  isOpen = input<boolean>(false);
  day = input.required<DayData>();
  dayName = input.required<string>();
  isEditable = input<boolean>(true);

  // Outputs
  close = output<void>();
  save = output<DayData>();

  // Local state for editing
  editedDay: DayData = {
    date: '',
    from: '',
    to: '',
    pause1From: '',
    pause1To: '',
    pause2From: '',
    pause2To: '',
    hours: '00:00',
    decimal: '0.00',
  };

  constructor() {
    // Initialize editedDay when day changes
    effect(() => {
      const dayData = this.day();
      if (dayData) {
        this.editedDay = { ...dayData };
      }
    });
  }

  /**
   * Format date for display
   */
  formatDate(): string {
    const date = new Date(this.editedDay.date);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Save changes
   */
  onSave(): void {
    this.save.emit(this.editedDay);
    this.close.emit();
  }

  /**
   * Cancel and close
   */
  onCancel(): void {
    // Reset edited day to original
    this.editedDay = { ...this.day() };
    this.close.emit();
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
