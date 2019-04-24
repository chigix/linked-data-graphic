import { TestBed } from '@angular/core/testing';

import { PrettyPrinterService } from './pretty-printer.service';

describe('PrettyPrinterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PrettyPrinterService = TestBed.get(PrettyPrinterService);
    expect(service).toBeTruthy();
  });
});
