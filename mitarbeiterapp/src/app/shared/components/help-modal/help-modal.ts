import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface HelpItem {
  questionKey: string;
  answerKey: string;
  expanded: boolean;
}

/**
 * Help Modal - FAQ and help information
 */
@Component({
  selector: 'app-help-modal',
  imports: [CommonModule, TranslateModule],
  templateUrl: './help-modal.html',
  styleUrl: './help-modal.scss',
})
export class HelpModal {
  close = output<void>();

  helpItems: HelpItem[] = [
    {
      questionKey: 'dashboard.modals.help.questions.howToUse',
      answerKey: 'dashboard.modals.help.answers.howToUse',
      expanded: false,
    },
    {
      questionKey: 'dashboard.modals.help.questions.dataStorage',
      answerKey: 'dashboard.modals.help.answers.dataStorage',
      expanded: false,
    },
    {
      questionKey: 'dashboard.modals.help.questions.exportPdf',
      answerKey: 'dashboard.modals.help.answers.exportPdf',
      expanded: false,
    },
    {
      questionKey: 'dashboard.modals.help.questions.offline',
      answerKey: 'dashboard.modals.help.answers.offline',
      expanded: false,
    },
    {
      questionKey: 'dashboard.modals.help.questions.deleteData',
      answerKey: 'dashboard.modals.help.answers.deleteData',
      expanded: false,
    },
  ];

  toggleItem(index: number): void {
    this.helpItems[index].expanded = !this.helpItems[index].expanded;
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
