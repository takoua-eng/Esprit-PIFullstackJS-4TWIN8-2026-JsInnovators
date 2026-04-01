import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { NavItem } from './nav-item';
import { Router } from '@angular/router';
import { NavService } from '../../../../services/nav.service';

import { TranslateModule } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-item',
  imports: [TranslateModule, TablerIconsModule, MaterialModule, CommonModule],
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss'],
})
export class AppNavItemComponent implements OnChanges {
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() item: NavItem | any;

  expanded: boolean = false;

  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() depth: any;

  constructor(public navService: NavService, public router: Router) {}

  private normalizeRoute(route?: string): string {
    if (!route) return '';
    return route.startsWith('/') ? route : `/${route}`;
  }

  ngOnChanges() {
    const url = this.navService.currentUrl();
    const route = this.normalizeRoute(this.item.route);

    if (route && url) {
      this.expanded = url.startsWith(route);
      this.ariaExpanded = this.expanded;
    }
  }

  onItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      const route = this.normalizeRoute(item.route);
      if (route) {
        this.router.navigateByUrl(route);
      }
    }

    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }

    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    if (!this.expanded) {
      if (window.innerWidth < 1024) {
        this.notify.emit();
      }
    }
  }

  openExternalLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  onSubItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      if (this.expanded && window.innerWidth < 1024) {
        this.notify.emit();
      }
    }
  }
}