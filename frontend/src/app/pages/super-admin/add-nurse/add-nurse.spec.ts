import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNurse } from './add-nurse';

describe('AddNurse', () => {
  let component: AddNurse;
  let fixture: ComponentFixture<AddNurse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNurse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNurse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
