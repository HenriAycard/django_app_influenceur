import { TestBed } from '@angular/core/testing';

import { UtilsProviderService } from './utils-provider';

describe('UtilsProviderService', () => {
  let service: UtilsProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilsProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
