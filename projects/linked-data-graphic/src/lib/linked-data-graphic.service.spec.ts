import { TestBed } from '@angular/core/testing';

import { LinkedDataGraphicService } from './linked-data-graphic.service';

describe('LinkedDataGraphicService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LinkedDataGraphicService = TestBed.get(LinkedDataGraphicService);
    expect(service).toBeTruthy();
  });
});
