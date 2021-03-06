import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LinkedDataGraphicComponent } from './canvas.component';

describe('LinkedDataGraphicComponent', () => {
  let component: LinkedDataGraphicComponent;
  let fixture: ComponentFixture<LinkedDataGraphicComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LinkedDataGraphicComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedDataGraphicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
