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




  /** Return true when current role has an alerts page we can navigate to */
  canNavigateToAlerts(): boolean {
    const r = (localStorage.getItem('user_role') || '').toLowerCase();
    return r === 'patient' || r === 'nurse' || r === 'physician' || r === 'doctor';
  }



  goToAlerts(): void {
    const r = (localStorage.getItem('user_role') || '').toLowerCase();
    if (r === 'patient') {
      this.router.navigate(['/dashboard/patient/alerts']);
    } else if (r === 'nurse') {
      this.router.navigate(['/dashboard/nurse/alerts']);
    } else if (r === 'physician' || r === 'doctor') {
      this.router.navigate(['/dashboard/doctor/alerts']);
    } else {
      // fallback to generic alerts page
      this.router.navigate(['/dashboard/alerts']);
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
