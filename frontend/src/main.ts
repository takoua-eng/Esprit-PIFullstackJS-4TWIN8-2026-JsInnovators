import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideHttpClient } from '@angular/common/http'; // 🔥 IMPORTANT

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(), // ✅ AJOUTER ÇA
    provideNativeDateAdapter()
  ]
}).catch((err) => console.error(err));