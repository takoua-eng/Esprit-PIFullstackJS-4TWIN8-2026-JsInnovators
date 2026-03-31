import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinatorPatients } from './coordinator-patients';

describe('CoordinatorPatients', () => {
  let component: CoordinatorPatients;
  let fixture: ComponentFixture<CoordinatorPatients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordinatorPatients]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoordinatorPatients);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
