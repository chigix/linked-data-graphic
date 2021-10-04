import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ColorProviderService } from './color-provider.service';

describe('ColorProviderService', () => {
  let service: ColorProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

@Component({
  selector: 'ngld-graphic',
  templateUrl: './canvas.component.svg',
  styleUrls: ['./canvas.scss'],
})
export class DummyComponent { }
