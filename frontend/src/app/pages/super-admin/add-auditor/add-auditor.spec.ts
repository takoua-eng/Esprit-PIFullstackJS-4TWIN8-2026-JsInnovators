import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAuditor } from './add-auditor';

describe('AddAuditor', () => {
  let component: AddAuditor;
  let fixture: ComponentFixture<AddAuditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAuditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAuditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
