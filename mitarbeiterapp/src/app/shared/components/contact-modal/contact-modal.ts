import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface Contact {
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

/**
 * Contact Modal - Display contact information and actions
 */
@Component({
  selector: 'app-contact-modal',
  imports: [CommonModule, TranslateModule],
  templateUrl: './contact-modal.html',
  styleUrl: './contact-modal.scss',
})
export class ContactModal {
  close = output<void>();

  contacts: Contact[] = [
    {
      name: 'Max Mustermann',
      role: 'dashboard.modals.contact.roles.dispatcher',
      email: 'disponent@example.com',
      phone: '+49 123 456789',
    },
    {
      name: 'Anna Schmidt',
      role: 'dashboard.modals.contact.roles.administration',
      email: 'verwaltung@example.com',
      phone: '+49 123 456790',
    },
    {
      name: 'Thomas Müller',
      role: 'dashboard.modals.contact.roles.supervisor',
      email: 'vorgesetzter@example.com',
      phone: '+49 123 456791',
    },
  ];

  onEmail(email: string): void {
    window.location.href = `mailto:${email}`;
  }

  onCall(phone: string): void {
    window.location.href = `tel:${phone}`;
  }

  onWhatsApp(phone: string): void {
    const cleanPhone = phone.replace(/\s/g, '').replace('+', '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
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
