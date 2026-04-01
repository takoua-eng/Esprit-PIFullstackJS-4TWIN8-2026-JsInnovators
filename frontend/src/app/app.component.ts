import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'MediFollow';

  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('app_language') || 'en';
    this.translate.addLangs(['en', 'fr', 'ar']);
    this.translate.setDefaultLang('en');
    this.translate.use(savedLang);
    this.applyDirection(savedLang);

    // Écoute les changements de langue en temps réel
    this.translate.onLangChange.subscribe((event) => {
      this.applyDirection(event.lang);
    });
  }

  private applyDirection(lang: string): void {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
}