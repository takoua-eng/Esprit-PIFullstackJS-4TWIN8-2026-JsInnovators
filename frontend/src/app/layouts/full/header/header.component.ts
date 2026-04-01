import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  OnInit,
} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CommonModule } from '@angular/common';
import { PatientService } from 'src/app/services/patient.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
    TranslateModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();

  appName = 'MediFollow';
  pendingAlertsCount = 0;

  constructor(private router: Router, private translate: TranslateService, private patientService: PatientService) {}

  ngOnInit() {
    const patientId = this.patientService.getCurrentPatientId();
    if (patientId) {
      this.patientService.getPendingAlertsCount().subscribe({
        next: (count) => (this.pendingAlertsCount = count),
        error: () => {},
      });
    }
  }

  goToProfile() {
    this.router.navigate(['/dashboard/patient/profile']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/authentication/login']);
  }
}