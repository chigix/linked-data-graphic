import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedDataGraphicComponent } from './linked-data-graphic.component';

describe('LinkedDataGraphicComponent', () => {
  let component: LinkedDataGraphicComponent;
  let fixture: ComponentFixture<LinkedDataGraphicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkedDataGraphicComponent ]
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
