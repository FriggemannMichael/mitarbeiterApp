import { Injectable } from '@angular/core';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as QRCode from 'qrcode';
import { WeekData, QRCodeData } from '../models/timesheet.model';
import { APP_VERSION } from '../models/constants';

/**
 * PDF Export Service with QR Code generation
 * Migrated from React PWA (pdfExporter.ts)
 */
@Injectable({
  providedIn: 'root',
})
export class PdfExportService {
  /**
   * Generate QR code data for Bitfarm DMS integration
   */
  private async generateQRData(weekData: WeekData): Promise<string> {
    // Ensure exactly 7 days (pad with empty days if needed)
    const days = weekData.days.slice(0, 7).map((day) => ({
      date: day.date,
      hours: day.hours,
      decimal: day.decimal,
    }));

    // Pad if less than 7 days
    while (days.length < 7) {
      days.push({ date: '', hours: '00:00', decimal: '0.00' });
    }

    const qrData: QRCodeData = {
      type: 'WPDL_TIMESHEET',
      version: APP_VERSION,
      employee: {
        name: weekData.employeeName,
      },
      supervisor: {
        name: weekData.supervisorName,
      },
      period: {
        week: weekData.week,
        year: weekData.year,
        startDate: weekData.startDate,
        endDate: weekData.days[6]?.date || weekData.startDate,
      },
      customer: weekData.customer,
      days: days.filter((d) => d.date && (d.hours !== '00:00' || d.decimal !== '0.00')),
    };

    return JSON.stringify(qrData);
  }

  /**
   * Generate QR code as Base64 PNG
   */
  private async generateQRCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'M',
      });
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate PDF document
   */
  async generatePDF(weekData: WeekData): Promise<Uint8Array> {
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    let yPosition = height - 50;

    // Title
    page.drawText('Stundennachweis', {
      x: 50,
      y: yPosition,
      size: 20,
      font: fontBold,
      color: rgb(0.15, 0.39, 0.92), // primary color
    });
    yPosition -= 40;

    // Employee info
    page.drawText(`Mitarbeiter: ${weekData.employeeName}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });
    yPosition -= 20;

    page.drawText(`Kunde/Projekt: ${weekData.customer}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });
    yPosition -= 20;

    page.drawText(`Kalenderwoche: ${weekData.week}/${weekData.year}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });
    yPosition -= 40;

    // Table header
    const tableStartY = yPosition;
    const cellHeight = 25;
    const colWidths = [80, 60, 60, 70, 70, 80, 70];
    const colHeaders = ['Datum', 'Von', 'Bis', 'Pause 1', 'Pause 2', 'Stunden', 'Dezimal'];

    // Draw header row
    let xPos = 50;
    colHeaders.forEach((header, index) => {
      page.drawText(header, {
        x: xPos + 5,
        y: yPosition - 15,
        size: 10,
        font: fontBold,
      });
      xPos += colWidths[index];
    });

    // Draw header border
    page.drawRectangle({
      x: 50,
      y: yPosition - cellHeight,
      width: colWidths.reduce((a, b) => a + b, 0),
      height: cellHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    yPosition -= cellHeight;

    // Day names (translated keys - will be replaced by actual translation)
    const dayNames = [
      'Montag',
      'Dienstag',
      'Mittwoch',
      'Donnerstag',
      'Freitag',
      'Samstag',
      'Sonntag',
    ];
    if (weekData.shiftModel === 'night') {
      dayNames.unshift(dayNames.pop()!); // Move Sunday to start
    }

    // Draw data rows
    weekData.days.forEach((day, index) => {
      const date = new Date(day.date);
      const dateStr = `${dayNames[index]}, ${date.getDate()}.${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;

      const pause1 = day.pause1From && day.pause1To ? `${day.pause1From}-${day.pause1To}` : '-';
      const pause2 = day.pause2From && day.pause2To ? `${day.pause2From}-${day.pause2To}` : '-';

      const rowData = [
        dateStr,
        day.from || '-',
        day.to || '-',
        pause1,
        pause2,
        day.hours,
        `${day.decimal}h`,
      ];

      xPos = 50;
      rowData.forEach((text, colIndex) => {
        page.drawText(text, {
          x: xPos + 5,
          y: yPosition - 15,
          size: 9,
          font: font,
        });
        xPos += colWidths[colIndex];
      });

      // Draw row border
      page.drawRectangle({
        x: 50,
        y: yPosition - cellHeight,
        width: colWidths.reduce((a, b) => a + b, 0),
        height: cellHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.5,
      });

      yPosition -= cellHeight;
    });

    // Total hours
    yPosition -= 10;
    const totalHours = weekData.days.reduce((sum, day) => {
      const [hours, minutes] = day.hours.split(':').map(Number);
      return sum + hours * 60 + minutes;
    }, 0);

    const totalHoursStr = `${Math.floor(totalHours / 60)
      .toString()
      .padStart(2, '0')}:${(totalHours % 60).toString().padStart(2, '0')}`;
    const totalDecimal = (totalHours / 60).toFixed(2);

    page.drawText(`Gesamt: ${totalHoursStr} (${totalDecimal}h)`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: fontBold,
    });

    yPosition -= 40;

    // Signatures section
    if (weekData.employeeSignature || weekData.supervisorSignature) {
      yPosition -= 20;

      // Employee signature
      if (weekData.employeeSignature) {
        page.drawText('Unterschrift Mitarbeiter:', {
          x: 50,
          y: yPosition,
          size: 10,
          font: fontBold,
        });

        try {
          const signatureImage = await pdfDoc.embedPng(weekData.employeeSignature);
          const signatureDims = signatureImage.scale(0.3);
          page.drawImage(signatureImage, {
            x: 50,
            y: yPosition - 60,
            width: signatureDims.width,
            height: signatureDims.height,
          });
        } catch (e) {
          console.error('Failed to embed employee signature:', e);
        }

        yPosition -= 80;
      }

      // Supervisor signature
      if (weekData.supervisorSignature) {
        page.drawText(`Unterschrift Vorarbeiter: ${weekData.supervisorName || ''}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: fontBold,
        });

        try {
          const signatureImage = await pdfDoc.embedPng(weekData.supervisorSignature);
          const signatureDims = signatureImage.scale(0.3);
          page.drawImage(signatureImage, {
            x: 50,
            y: yPosition - 60,
            width: signatureDims.width,
            height: signatureDims.height,
          });
        } catch (e) {
          console.error('Failed to embed supervisor signature:', e);
        }

        yPosition -= 80;
      }
    }

    // Generate and embed QR code
    try {
      const qrData = await this.generateQRData(weekData);
      const qrCodeDataUrl = await this.generateQRCode(qrData);
      const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);

      // Position QR code in top right corner
      page.drawImage(qrImage, {
        x: width - 150,
        y: height - 150,
        width: 100,
        height: 100,
      });

      page.drawText('QR-Code für Bitfarm DMS', {
        x: width - 150,
        y: height - 160,
        size: 8,
        font: font,
      });
    } catch (e) {
      console.error('Failed to generate QR code:', e);
    }

    // Footer
    page.drawText('Westfalia Personaldienstleistungen GmbH', {
      x: 50,
      y: 30,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, {
      x: width - 150,
      y: 30,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save PDF
    return await pdfDoc.save();
  }

  /**
   * Export week as PDF and trigger download
   */
  async exportWeekAsPDF(weekData: WeekData): Promise<void> {
    try {
      const pdfBytes = await this.generatePDF(weekData);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Stundennachweis_KW${weekData.week}_${weekData.year}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }

  /**
   * Generate PDF as Blob (for sharing)
   */
  async generatePDFBlob(weekData: WeekData): Promise<Blob> {
    const pdfBytes = await this.generatePDF(weekData);
    return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  }
}
