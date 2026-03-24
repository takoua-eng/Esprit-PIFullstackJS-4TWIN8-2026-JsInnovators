import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coordinateurs } from './coordinateurs';

describe('Coordinateurs', () => {
  let component: Coordinateurs;
  let fixture: ComponentFixture<Coordinateurs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coordinateurs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coordinateurs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
