import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CoreService } from './services/core.service';
import { pruneLocalStorageToWhitelist } from './core/app-storage';
import { API_BASE_URL } from './core/api.config';
import { ZoomControlComponent } from './layouts/full/header/zoom-control.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ZoomControlComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'MediFollow';

  constructor(
    private translate: TranslateService,
    private core: CoreService,
    private http: HttpClient,
  ) {
    pruneLocalStorageToWhitelist();
    this.core.initUserRole();
    const savedLang = localStorage.getItem('app_language') || 'en';
    this.translate.addLangs(['en', 'fr', 'ar']);
    this.translate.setDefaultLang('en');
    this.translate.use(savedLang);
    this.applyDirection(savedLang);
    this.translate.onLangChange.subscribe(e => this.applyDirection(e.lang));
  }

  ngOnInit(): void {
    // Refresh permissions from DB on every app load (token still valid)
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.http.get<{ role: string; permissions: string[] }>(
        `${API_BASE_URL}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } },
      ).subscribe({
        next: (me) => {
          this.core.setPermissions(me.permissions ?? []);
          this.core.setRoleFromLogin(me.role ?? '');
        },
        error: () => {
          // token expired or invalid — keep existing localStorage perms
        },
      });
    }
  }

  private applyDirection(lang: string): void {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}