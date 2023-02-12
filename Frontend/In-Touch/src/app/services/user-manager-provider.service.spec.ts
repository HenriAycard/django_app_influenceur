import { TestBed } from '@angular/core/testing';

import { UserManagerProviderService } from './user-manager-provider.service';

describe('UserManagerProviderService', () => {
  let service: UserManagerProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserManagerProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
