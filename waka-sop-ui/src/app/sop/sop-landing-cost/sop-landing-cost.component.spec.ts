import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SopLandingCostComponent } from './sop-landing-cost.component';

describe('SopLandingCostComponent', () => {
  let component: SopLandingCostComponent;
  let fixture: ComponentFixture<SopLandingCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SopLandingCostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SopLandingCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
