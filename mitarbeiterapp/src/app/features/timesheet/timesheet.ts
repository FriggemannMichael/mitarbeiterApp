import { Component, OnInit, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { WeekService } from '../../core/services/week.service';
import { PdfExportService } from '../../core/services/pdf-export.service';
import { DayCard } from '../../shared/components/day-card/day-card';
import { SignaturePad } from '../../shared/components/signature-pad/signature-pad';
import { ShiftDropdown } from '../../shared/components/shift-dropdown/shift-dropdown';
import { ShiftConfigModal } from '../../shared/components/shift-config-modal/shift-config-modal';
import { ShareModal } from '../../shared/components/share-modal/share-modal';
import { WeekData, ShiftModel, ShiftConfig } from '../../core/models/timesheet.model';
import { ConfigUtils } from '../../core/config/app.config.model';

/**
 * Timesheet Component - Main timesheet page
 * Migrated from React PWA (Timesheet.tsx)
 */
@Component({
  selector: 'app-timesheet',
  imports: [CommonModule, FormsModule, TranslateModule, DayCard, SignaturePad, ShiftDropdown, ShiftConfigModal, ShareModal],
  templateUrl: './timesheet.html',
  styleUrl: './timesheet.scss',
})
export class Timesheet implements OnInit, OnDestroy {
  logout = output<void>();

  // State
  weekData: WeekData | null = null;
  loading = false;
  currentWeek = { year: 0, week: 0 };
  totalHours = { hours: '00:00', decimal: '0.00' };
  isEditable = false;
  canSupervisorSign = false;

  // Share Modal State
  showShareModal = false;
  shareFileName = '';
  shareFileUrl = '';
  sharePdfBlob?: Blob;

  // Shift Config Modal State
  showShiftConfigModal = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private weekService: WeekService,
    private pdfExport: PdfExportService
  ) {}

  ngOnInit(): void {
    // Initialize week
    this.weekService.initializeWeek();

    // Subscribe to week data
    this.subscriptions.push(
      this.weekService.weekData$.subscribe((data) => {
        this.weekData = data;
        if (data) {
          this.totalHours = this.weekService.getTotalHours();
          this.isEditable = this.weekService.isEditable();
          this.canSupervisorSign = this.weekService.canSupervisorSign();
        }
      })
    );

    // Subscribe to current week
    this.subscriptions.push(
      this.weekService.currentWeek$.subscribe((week) => {
        if (week) {
          this.currentWeek = week;
        }
      })
    );

    // Subscribe to loading state
    this.subscriptions.push(
      this.weekService.loading$.subscribe((loading) => {
        this.loading = loading;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Handle day time change
   */
  onDayTimeChange(event: { dayIndex: number; field: string; value: string }): void {
    this.weekService.updateDayTime(event.dayIndex, event.field as any, event.value);
  }

  /**
   * Update customer
   */
  onCustomerChange(customer: string): void {
    this.weekService.updateCustomer(customer);
  }

  /**
   * Open shift config modal
   */
  onOpenShiftConfig(): void {
    this.showShiftConfigModal = true;
  }

  /**
   * Close shift config modal
   */
  onCloseShiftConfig(): void {
    this.showShiftConfigModal = false;
  }

  /**
   * Apply shift configuration
   */
  onApplyShiftConfig(event: { model: ShiftModel; config: ShiftConfig }): void {
    this.weekService.applyShiftConfigToWeek(event.model, event.config);
    this.showShiftConfigModal = false;
  }

  /**
   * Navigate week
   */
  navigateWeek(direction: 'prev' | 'next' | 'current'): void {
    this.weekService.navigateWeek(direction);
  }

  /**
   * Add signature
   */
  onAddSignature(type: 'employee' | 'supervisor', event: { signature: string; name?: string }): void {
    this.weekService.addSignature(type, event.signature, event.name);
  }

  /**
   * Clear signature
   */
  onClearSignature(type: 'employee' | 'supervisor'): void {
    this.weekService.clearSignature(type);
  }

  /**
   * Export PDF
   */
  async onExportPDF(): Promise<void> {
    if (!this.weekData) return;
    try {
      await this.pdfExport.exportWeekAsPDF(this.weekData);
    } catch (error) {
      alert('PDF-Export fehlgeschlagen: ' + (error as Error).message);
    }
  }

  /**
   * Open Share Modal
   */
  async onSharePDF(): Promise<void> {
    if (!this.weekData) return;
    try {
      // Generate PDF Blob
      const pdfBlob = await this.pdfExport.generatePDFBlob(this.weekData);

      // Create object URL for the blob
      this.shareFileUrl = URL.createObjectURL(pdfBlob);
      this.shareFileName = ConfigUtils.generateFilename(
        this.weekData.employeeName,
        this.currentWeek.year,
        this.currentWeek.week
      );
      this.sharePdfBlob = pdfBlob;
      this.showShareModal = true;
    } catch (error) {
      alert('PDF-Erstellung fehlgeschlagen: ' + (error as Error).message);
    }
  }

  /**
   * Close Share Modal
   */
  onCloseShareModal(): void {
    this.showShareModal = false;
    // Clean up object URL
    if (this.shareFileUrl) {
      URL.revokeObjectURL(this.shareFileUrl);
      this.shareFileUrl = '';
    }
  }

  /**
   * Handle Share Complete
   */
  onShareComplete(): void {
    console.log('Share completed successfully');
    // Could show success message or clear week data if needed
  }

  /**
   * Clear week data
   */
  onClearWeek(): void {
    if (confirm('Möchten Sie die Zeitdaten wirklich löschen?')) {
      this.weekService.clearWeekData();
    }
  }

  /**
   * Logout
   */
  onLogout(): void {
    this.logout.emit();
  }

  /**
   * Get day names array
   */
  getDayNames(): string[] {
    return this.weekData?.shiftModel === 'night'
      ? ['days.sunday', 'days.monday', 'days.tuesday', 'days.wednesday', 'days.thursday', 'days.friday', 'days.saturday']
      : ['days.monday', 'days.tuesday', 'days.wednesday', 'days.thursday', 'days.friday', 'days.saturday', 'days.sunday'];
  }

  /**
   * Get date range
   */
  getDateRange(): string {
    return this.weekService.getDateRange();
  }
}
