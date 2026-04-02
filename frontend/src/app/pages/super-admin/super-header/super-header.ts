// src/app/pages/super-admin/super-header/super-header.component.ts
import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CommonModule } from '@angular/common';
import { CoreService } from 'src/app/services/core.service';
import { clearAuthLocalStorage } from 'src/app/core/app-storage';

@Component({
  selector: 'app-super-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
    TranslateModule,
  ],
  templateUrl: './super-header.html',
  encapsulation: ViewEncapsulation.None,
})
export class SuperHeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();

  appName = 'SuperAdmin - MediFollow';

  constructor(
    private router: Router,
    private translate: TranslateService,
    private core: CoreService,
  ) {}

  goToProfile() {
    this.router.navigate(['/super-admin/profile']);
  }

  logout() {
    clearAuthLocalStorage();
    this.core.clearRole();
    this.router.navigate(['/authentication/login']);
  }
}
