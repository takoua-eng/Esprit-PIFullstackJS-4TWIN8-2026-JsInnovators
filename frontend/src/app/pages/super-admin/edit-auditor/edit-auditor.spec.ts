import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAuditor } from './edit-auditor';

describe('EditAuditor', () => {
  let component: EditAuditor;
  let fixture: ComponentFixture<EditAuditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAuditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAuditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
