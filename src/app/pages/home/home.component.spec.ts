import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkedDataGraphicModule } from 'linked-data-graphic';

import {
  MatIconModule,
} from '@angular/material';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LinkedDataGraphicModule,
        MatIconModule,
      ],
      declarations: [HomeComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
