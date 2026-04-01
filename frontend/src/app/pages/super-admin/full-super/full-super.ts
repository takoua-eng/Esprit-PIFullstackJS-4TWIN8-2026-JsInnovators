// src/app/pages/super-admin/full-super/full-super.component.ts
import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  MatSidenav,
  MatSidenavContent,
  MatSidenavModule,
} from '@angular/material/sidenav';
import { CoreService } from 'src/app/services/core.service';
import { SuperTopstripComponent } from '../super-topstrip/super-topstrip.component';
// ✅ استيراد SuperSidebarComponent (من نفس المجلد)
import { SuperSidebarComponent } from './super-sidebar/super-sidebar.component';
import { HeaderComponent } from '../../../layouts/full/header/header.component';

@Component({
  selector: 'app-full-super',
  templateUrl: './full-super.html',
  styleUrls: ['./full-super.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    HeaderComponent,
    SuperTopstripComponent,
    SuperSidebarComponent, // ✅ استخدام الـ Sidebar الخاص بالـ Super Admin
  ],
})
export class FullSuperComponent implements OnInit {
  @ViewChild('leftsidenav') public sidenav: MatSidenav;
  @ViewChild('content', { static: true }) content!: MatSidenavContent;

  options = this.settings.getOptions();
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  constructor(
    private settings: CoreService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.layoutChangesSubscription = this.breakpointObserver
      .observe(['screen and (max-width: 768px)'])
      .subscribe((state) => {
        this.isMobileScreen =
          state.breakpoints['screen and (max-width: 768px)'];
      });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.content.scrollTo({ top: 0 });
      });
  }

  ngOnInit(): void {}
  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }
  resetCollapsedState(timer = 400) {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }
  onSidenavOpenedChange(isOpened: boolean) {
    this.options.sidenavOpened = isOpened;
  }
}
