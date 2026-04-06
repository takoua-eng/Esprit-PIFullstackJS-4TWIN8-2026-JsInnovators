import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { CoreService } from 'src/app/services/core.service';

import { filter } from 'rxjs/operators';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';

import { NgScrollbarModule } from 'ngx-scrollbar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AppNavItemComponent } from './sidebar/nav-item/nav-item.component';
import { AppTopstripComponent } from './top-strip/topstrip.component';

import { adminNavItems, coordinatorNavItems } from './sidebar/sidebar-data';
import { nurseNavItems } from './sidebar/nurse-sidebar-data';
import { doctorNavItems } from './sidebar/doctor-sidebar-data';
import { NavItem } from './sidebar/nav-item/nav-item';
import { normalizeRoleKey } from 'src/app/core/post-login-route';




const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [
    RouterModule,
    AppNavItemComponent,
    MaterialModule,
    SidebarComponent,
    NgScrollbarModule,
    TablerIconsModule,
    HeaderComponent,
    AppTopstripComponent,
  ],
  templateUrl: './full.component.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None,
})
export class FullComponent implements OnInit {
  navItems: NavItem[] = [];

  @ViewChild('leftsidenav')
  public sidenav: MatSidenav;

  resView = false;

  @ViewChild('content', { static: true }) content!: MatSidenavContent;

  options = this.settings.getOptions();

  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  constructor(
    private settings: CoreService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW])
      .subscribe((state) => {
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[MOBILE_VIEW];

        if (this.options.sidenavCollapsed == false) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
      });

    // Scroll top
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.content?.scrollTo({ top: 0 });
      });
  }

  ngOnInit(): void {
    this.updateSidebar(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateSidebar(event.urlAfterRedirects);
      });
  }

  // ✅ LOGIQUE FIX
  private updateSidebar(url: string) {
    const role = normalizeRoleKey(
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('user_role')
        : null,
    );

    if (url.startsWith('/dashboard/admin')) {
      this.navItems = adminNavItems;
    } else if (url.startsWith('/dashboard/nurse')) {
      this.navItems = nurseNavItems;
    } else if (url.startsWith('/dashboard/doctor')) {
      this.navItems = doctorNavItems;
    } else if (url.startsWith('/dashboard/profile') && role === 'nurse') {
      this.navItems = nurseNavItems;
    } else if (
      url.startsWith('/dashboard/profile') &&
      (role === 'doctor' || role === 'physician')
    ) {
      this.navItems = doctorNavItems;
    } else if (url.startsWith('/admin/coordinator')) {
      this.navItems = coordinatorNavItems;
    } else {
      this.navItems = adminNavItems;
    }
  }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  toggleCollapsed() {
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.options.sidenavOpened = isOpened;
  }
}