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
import { PatientService } from 'src/app/services/patient.service';
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
  pendingAlertsCount = 0;

  constructor(
    private router: Router,
    private translate: TranslateService,
    readonly core: CoreService,
    private patientService: PatientService,
  ) {}

  ngOnInit(): void {
    this.core.initUserRole();

    this.translate.onLangChange.subscribe(() => {
      // Refresh UI on language change
    });

    const patientId = this.patientService.getCurrentPatientId();
    if (patientId) {
      this.patientService.getPendingAlertsCount().subscribe({
        next: (count) => (this.pendingAlertsCount = count),
        error: () => {},
      });
    }
  }

  goToProfile(): void {
    const r = (localStorage.getItem('user_role') || '').toLowerCase();
    if (r === 'patient') {
      this.router.navigate(['/dashboard/patient/profile']);
    } else {
      this.router.navigate(['/dashboard/profile']);
    }
  }

  logout(): void {
    clearAuthLocalStorage();
    this.core.clearRole();
    this.router.navigate(['/authentication/login']);
  }
}
