import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-superadmin-profile',
  standalone: true,
  imports: [CommonModule, MaterialModule, TranslateModule],
  templateUrl: './superadmin-profile.component.html',
})
export class SuperAdminProfileComponent {


  superAdmin = {
    name: 'Super Admin',
    email: 'super.admin@hospital.tn',
    role: 'Super Admin', 
    phone: '+216 20 000 000',
    service: 'Global Platform',
    hospital: 'MediFollow Demo Hospital',
  };
}
