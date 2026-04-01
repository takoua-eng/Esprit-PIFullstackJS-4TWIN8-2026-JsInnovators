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

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
    TranslateModule,
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();

  appName = 'MediFollow';

  constructor(
    private router: Router,
    private translate: TranslateService,
  ) {}

  goToProfile() {
    this.router.navigate(['/admin/profile']);
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('app_language');
    this.router.navigate(['/authentication/login']);
  }
}
