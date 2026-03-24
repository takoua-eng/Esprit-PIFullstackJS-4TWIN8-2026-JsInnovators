import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, MaterialModule, TranslateModule],
  templateUrl: './admin-profile.component.html',
})
export class AdminProfileComponent {
  superAdmin = {
    name: 'Super Admin',
    email: 'super.admin@hospital.tn',
    role: 'Admin',
    phone: '+216 20 000 000',
    service: 'Global platform',
    hospital: 'MediFollow Demo Hospital',
  };
}

