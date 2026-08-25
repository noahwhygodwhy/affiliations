import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Thumbnailmodal } from './thumbnailmodal';

describe('Thumbnailmodal', () => {
  let component: Thumbnailmodal;
  let fixture: ComponentFixture<Thumbnailmodal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Thumbnailmodal],
    }).compileComponents();

    fixture = TestBed.createComponent(Thumbnailmodal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
