import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNurse } from './edit-nurse';

describe('EditNurse', () => {
  let component: EditNurse;
  let fixture: ComponentFixture<EditNurse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditNurse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditNurse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
