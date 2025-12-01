import { TestBed } from '@angular/core/testing';

import { SimulationStorageService } from './simulation-storage.service';

describe('SimulationStorageService', () => {
  let service: SimulationStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimulationStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
