import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalcPageComponent } from './calc-page.component';

describe('CalcPageComponent', () => {
  let component: CalcPageComponent;
  let fixture: ComponentFixture<CalcPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalcPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalcPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
