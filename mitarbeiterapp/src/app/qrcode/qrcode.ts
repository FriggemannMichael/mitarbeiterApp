import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-qrcode',
  standalone: true,
  imports: [FormsModule, QRCodeComponent],
  templateUrl: './qrcode.html',
  styleUrl: './qrcode.scss',
})
export class Qrcode {
  public qrData: string = '';
}
