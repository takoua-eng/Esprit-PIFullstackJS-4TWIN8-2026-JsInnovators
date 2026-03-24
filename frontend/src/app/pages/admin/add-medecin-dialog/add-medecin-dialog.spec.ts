import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMedecinDialog } from './add-medecin-dialog';

describe('AddMedecinDialog', () => {
  let component: AddMedecinDialog;
  let fixture: ComponentFixture<AddMedecinDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMedecinDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMedecinDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
