import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MaterialModule } from '../../../material.module';
import { SuperHeaderComponent } from '../super-header/super-header';
import { SuperSidebarComponent } from '../full-super/super-sidebar/super-sidebar.component';

@Component({
  selector: 'app-super-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgScrollbarModule,
    MaterialModule,
    SuperHeaderComponent,
    SuperSidebarComponent,
    RouterOutlet,
  ],
  templateUrl: './super-layout.component.html',
})
export class SuperLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('leftsidenav') sidenav!: MatSidenav;

  isOver = false;

  private subscription = new Subscription();

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.subscription.add(
      this.breakpointObserver
        .observe(Breakpoints.Handset)
        .subscribe((result) => {
          this.isOver = result.matches;
        }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSidenavOpenedChange(): void {}

  onSidenavClosedStart(): void {}
}
