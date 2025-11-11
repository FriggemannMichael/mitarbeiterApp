import { Component } from '@angular/core';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-pdf',
  standalone: true,
  templateUrl: './pdf.html',
  styleUrl: './pdf.scss',
})
export class Pdf {
  generatePdf() {
    const doc = new jsPDF();
    doc.text('Hallo aus der PDF-Komponente!', 10, 10);
    doc.save('beispiel.pdf');
  }
}
