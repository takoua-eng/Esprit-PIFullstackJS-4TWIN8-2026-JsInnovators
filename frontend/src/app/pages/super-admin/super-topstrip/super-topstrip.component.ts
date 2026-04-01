import { Component } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-super-topstrip',
  imports: [
    CommonModule,
    UpperCasePipe,
    TablerIconsModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    TranslateModule,
  ],
  templateUrl: './super-topstrip.component.html',
})
export class SuperTopstripComponent {
  selectedLanguage = localStorage.getItem('app_language') || 'en';
  highContrastEnabled = localStorage.getItem('high_contrast') === 'true';

  availableLanguages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
  ];

  constructor(private translate: TranslateService) {
    this.translate.onLangChange.subscribe((event) => {
      this.selectedLanguage = event.lang;
    });
    this.setHighContrastClass();
  }

  changeLanguage(lang: string) {
    this.selectedLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  toggleHighContrast() {
    this.highContrastEnabled = !this.highContrastEnabled;
    localStorage.setItem(
      'high_contrast',
      this.highContrastEnabled ? 'true' : 'false',
    );
    this.setHighContrastClass();
  }

  setHighContrastClass() {
    document.documentElement.classList.toggle(
      'high-contrast',
      this.highContrastEnabled,
    );
  }
}
