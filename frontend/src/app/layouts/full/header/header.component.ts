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
import { CoreService } from 'src/app/services/core.service';
import { clearAuthLocalStorage } from 'src/app/core/app-storage';

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

  constructor(
    private router: Router,
    private translate: TranslateService,
    readonly core: CoreService,
  ) {}

  ngOnInit(): void {
    this.core.initUserRole();
    this.translate.onLangChange.subscribe(() => {
      // optionnel : refresh UI
    });
  }

  // ✅ navigation profile
  goToProfile(): void {
    this.router.navigate(['/dashboard/profile']);
  }

  logout(): void {
    clearAuthLocalStorage();
    this.core.clearRole();
    this.router.navigate(['/authentication/login']);
  }
}
