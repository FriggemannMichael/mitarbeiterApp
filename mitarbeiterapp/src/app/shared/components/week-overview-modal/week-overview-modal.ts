import { Component, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WeekService } from '../../../core/services/week.service';
import { StorageService } from '../../../core/services/storage.service';

interface WeekOverview {
  year: number;
  week: number;
  totalHours: string;
  days: number;
}

/**
 * Week Overview Modal - Shows current week statistics
 */
@Component({
  selector: 'app-week-overview-modal',
  imports: [CommonModule, TranslateModule],
  templateUrl: './week-overview-modal.html',
  styleUrl: './week-overview-modal.scss',
})
export class WeekOverviewModal implements OnInit {
  close = output<void>();

  weekOverview: WeekOverview | null = null;

  constructor(
    private weekService: WeekService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.loadWeekOverview();
  }

  private loadWeekOverview(): void {
    const currentWeek = this.weekService.getCurrentWeekInfo();
    const weekData = this.weekService.getCurrentWeekData();

    if (weekData && currentWeek) {
      const totalHours = this.weekService.getTotalHours();
      const daysWorked = weekData.days.filter((day: any) => day.from || day.to).length;

      this.weekOverview = {
        year: currentWeek.year,
        week: currentWeek.week,
        totalHours: totalHours.hours,
        days: daysWorked,
      };
    }
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
