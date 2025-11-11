import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ShiftModel } from '../../../core/models/timesheet.model';

@Component({
  selector: 'app-shift-dropdown',
  imports: [CommonModule, TranslateModule],
  templateUrl: './shift-dropdown.html',
  styleUrl: './shift-dropdown.scss',
})
export class ShiftDropdown {
  currentModel = input<ShiftModel>('day');
  isEditable = input<boolean>(true);

  // Output event to open config modal
  openConfig = output<void>();

  /**
   * Open shift configuration modal
   */
  onOpenConfig(): void {
    if (this.isEditable()) {
      this.openConfig.emit();
    }
  }
}
