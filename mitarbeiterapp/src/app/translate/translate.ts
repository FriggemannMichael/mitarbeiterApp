import { Component } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-translate',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './translate.html',
  styleUrl: './translate.scss',
})
export class Translate {
  constructor(public translate: TranslateService) {
    translate.addLangs(['de', 'en']);
    translate.setDefaultLang('de');
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }
}
