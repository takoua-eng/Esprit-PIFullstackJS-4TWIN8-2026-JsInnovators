import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCoordinateurDialog } from './add-coordinateur-dialog';

describe('AddCoordinateurDialog', () => {
  let component: AddCoordinateurDialog;
  let fixture: ComponentFixture<AddCoordinateurDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCoordinateurDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCoordinateurDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
