import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ColorProviderService } from './color-provider.service';

@Component({
  selector: 'ngld-graphic',
  templateUrl: './canvas.component.svg',
  styleUrls: ['./component.scss'],
})
export class DummyComponent { }

describe('ColorProviderService', () => {
  let service: ColorProviderService<DummyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
