// src/app/pages/super-admin/full-super/super-sidebar/super-sidebar.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';

// ✅ تصحيح المسار: الصعود 4 مستويات للوصول إلى layouts
import { BrandingComponent } from '../../../../layouts/full/sidebar/branding.component';
import { AppNavItemComponent } from '../../../../layouts/full/sidebar/nav-item/nav-item.component';

// ✅ استيراد بيانات الـ Super Admin (من نفس المجلد)
import { superAdminNavItems } from './super-admin-data';

@Component({
  selector: 'app-super-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    TablerIconsModule,
    MaterialModule,
    NgScrollbarModule,
    BrandingComponent,      // ✅ الآن سيعمل المسار الصحيح
    AppNavItemComponent,    // ✅ الآن سيعمل المسار الصحيح
  ],
  templateUrl: './super-sidebar.component.html',
})
export class SuperSidebarComponent {
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();

  // ✅ استخدام البيانات الخاصة بالـ Super Admin
  public navItems = superAdminNavItems;
}
