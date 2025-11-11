import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ShiftModel, ShiftConfig } from '../../../core/models/timesheet.model';

/**
 * Shift Configuration Modal
 * Allows users to select a shift model and configure times for the entire week
 */
@Component({
  selector: 'app-shift-config-modal',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './shift-config-modal.html',
  styleUrl: './shift-config-modal.scss',
})
export class ShiftConfigModal {
  // Inputs
  isOpen = input<boolean>(false);
  currentModel = input<ShiftModel>('day');

  // Outputs
  close = output<void>();
  apply = output<{ model: ShiftModel; config: ShiftConfig }>();

  // State
  selectedModel: ShiftModel = 'day';
  config: ShiftConfig = {
    from: '',
    to: '',
    pause1From: '',
    pause1To: '',
    pause2From: '',
    pause2To: '',
    days: [true, true, true, true, true, false, false], // Default Mon-Fri
  };

  shifts: { key: ShiftModel }[] = [
    { key: 'day' },
    { key: 'late' },
    { key: 'night' },
    { key: 'continuous' },
  ];

  constructor() {
    // Initialize selectedModel when currentModel changes
    effect(() => {
      this.selectedModel = this.currentModel();
    });
  }

  /**
   * Select shift model
   */
  selectModel(model: ShiftModel): void {
    this.selectedModel = model;
  }

  /**
   * Toggle day selection
   */
  toggleDay(index: number): void {
    this.config.days[index] = !this.config.days[index];
  }

  /**
   * Get day names based on selected shift model
   */
  getDayNames(): string[] {
    return this.selectedModel === 'night'
      ? ['days.sunday', 'days.monday', 'days.tuesday', 'days.wednesday', 'days.thursday', 'days.friday', 'days.saturday']
      : ['days.monday', 'days.tuesday', 'days.wednesday', 'days.thursday', 'days.friday', 'days.saturday', 'days.sunday'];
  }

  /**
   * Apply configuration
   */
  onApply(): void {
    this.apply.emit({
      model: this.selectedModel,
      config: this.config,
    });
    this.onClose();
  }

  /**
   * Close modal
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
