import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-vacation-modal',
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">Urlaubsantrag</h2>
        <p class="mb-4 text-gray-600">Hier kannst du deinen Urlaubsantrag stellen.</p>
        <input type="date" class="w-full mb-2 p-2 border rounded" />
        <input type="date" class="w-full mb-4 p-2 border rounded" />
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 rounded bg-gray-200" (click)="close.emit()">Abbrechen</button>
          <button class="px-4 py-2 rounded bg-blue-600 text-white">Absenden</button>
        </div>
      </div>
    </div>
  `,
  standalone: true,
})
export class VacationModal {
  @Output() close = new EventEmitter<void>();
}
