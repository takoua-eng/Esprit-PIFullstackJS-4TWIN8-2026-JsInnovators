import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Spike Angular Admin Template';

  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('app_language') || 'en';
    this.translate.addLangs(['en', 'fr', 'ar']);
    this.translate.setDefaultLang('en');
    this.translate.use(savedLang);

    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  }
}
