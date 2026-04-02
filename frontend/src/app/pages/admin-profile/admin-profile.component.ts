import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, MaterialModule, TranslateModule, TablerIconsModule],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss'],
})
export class AdminProfileComponent implements OnInit {
  profile = {
    name: '',
    email: '',
    role: '',
    phone: '',
    service: '',
    hospital: 'MediFollow Demo Hospital',
    avatar: '/assets/images/profile/user-1.jpg',
  };

  ngOnInit(): void {
    const role = (localStorage.getItem('user_role') || '').toLowerCase();

    if (role === 'coordinator') {
      this.profile = {
        name: 'Takoua Outay',
        email: 'outaytakwa@gmail.com',
        role: 'Coordinator',
        phone: '28043310',
        service: 'Cardiology',
        hospital: 'MediFollow Demo Hospital',
        avatar: '/assets/images/profile/user-2.jpg',
      };
    } else {
      this.profile = {
        name: 'Super Admin',
        email: 'super.admin@hospital.tn',
        role: 'Admin',
        phone: '+216 20 000 000',
        service: 'Global platform',
        hospital: 'MediFollow Demo Hospital',
        avatar: '/assets/images/profile/user-1.jpg',
      };
    }
  }
}