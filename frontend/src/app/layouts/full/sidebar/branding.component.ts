import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
  imports: [],
  template: `
    <a href="/" class="logodark d-flex align-items-center m-2" style="text-decoration: none;">
      <span class="f-w-600 f-s-18 text-dark">Admin Dashboard</span>
    </a>
  `,
})
export class BrandingComponent {
  options = this.settings.getOptions();
  constructor(private settings: CoreService) {}
}
