import { TestBed } from '@angular/core/testing';

import { NavDataServiceService } from './nav-data-service.service';

describe('NavDataServiceService', () => {
  let service: NavDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
