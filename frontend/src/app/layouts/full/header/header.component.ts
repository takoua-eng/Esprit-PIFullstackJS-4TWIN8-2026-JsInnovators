import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
    TranslateModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();

  appName = 'MediFollow';
  userRole = localStorage.getItem('user_role') || 'Admin';

  constructor(
    private router: Router,
    private translate: TranslateService,
  ) {}

  // ✅ CORRECT: ngOnInit bien défini
  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      // optionnel : refresh UI
    });
  }

  // ✅ navigation profile
  goToProfile(): void {
    this.router.navigate(['/dashboard/profile']);
  }

  // ✅ logout
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('app_language');
    localStorage.removeItem('user_role');
    localStorage.removeItem('high_contrast');

    this.router.navigate(['/authentication/login']);
  }
}
