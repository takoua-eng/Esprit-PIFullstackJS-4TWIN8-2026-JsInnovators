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
  userRole: string | null = null;
  pendingAlertsCount = 0;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    // Language change subscription
    this.translate.onLangChange.subscribe(() => {
      // Refresh UI on language change
    });

    // Get user role and pending alerts
    this.userRole = localStorage.getItem('user_role');
    const patientId = this.patientService.getCurrentPatientId();
    if (patientId) {
      this.patientService.getPendingAlertsCount().subscribe({
        next: (count) => (this.pendingAlertsCount = count),
        error: () => {},
      });
    }
  }

  goToProfile(): void {
    this.router.navigate(['/dashboard/patient/profile']);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/authentication/login']);
  }
}
