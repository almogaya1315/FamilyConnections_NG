import { TestBed } from '@angular/core/testing';

import { PersonsRepositoryService } from './persons-repository.service';

describe('PersonsRepositoryService', () => {
  let service: PersonsRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonsRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
