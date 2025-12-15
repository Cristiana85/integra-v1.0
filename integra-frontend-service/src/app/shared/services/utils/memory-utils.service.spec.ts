import { TestBed } from '@angular/core/testing';

import { MemoryUtilsService } from './memory-utils.service';

describe('MemoryUtilsService', () => {
  let service: MemoryUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemoryUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
