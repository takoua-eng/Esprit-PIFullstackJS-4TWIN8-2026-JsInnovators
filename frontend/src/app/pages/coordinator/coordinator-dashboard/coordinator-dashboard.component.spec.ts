import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinatorDashboard } from './coordinator-dashboard.component';

describe('CoordinatorDashboard', () => {
  let component: CoordinatorDashboard;
  let fixture: ComponentFixture<CoordinatorDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordinatorDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoordinatorDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
