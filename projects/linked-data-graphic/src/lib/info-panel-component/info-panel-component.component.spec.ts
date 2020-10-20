import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoPanelComponentComponent } from './info-panel-component.component';

describe('InfoPanelComponentComponent', () => {
  let component: InfoPanelComponentComponent;
  let fixture: ComponentFixture<InfoPanelComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoPanelComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoPanelComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
