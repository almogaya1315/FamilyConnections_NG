import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { delay, Observable } from 'rxjs';

import { eGender, IPerson, IPersonCredentials } from '../persons/person.model';
import { PersonsRepositoryService } from '../persons/persons-repository.service';
import { CacheService, eStorageKeys, eStorageType } from '../services/cache.service';

@Component({
  selector: 'fc-entrance',
  templateUrl: './entrance.component.html',
  styleUrls: ['./entrance.component.css']
})
export class EntranceComponent implements OnInit {
  selectedPerson: string | null = '-1';
  personsOptions: IPersonCredentials[] = [];

  constructor(private router: Router, private cacheSvc: CacheService, private personsRepo: PersonsRepositoryService) { }

  ngOnInit() {
    this.personsRepo.getPersons().subscribe((personsData) => {
      if (personsData) {
        this.personsOptions = personsData.map(p => ({
          FullName: p.FullName,
          Id: typeof p.Id === 'string' ? parseInt(p.Id, 10) : p.Id,
          Password: ''
        }));
      }
    });
  }

  enter(credentials: any) {
    delay(1000); // SHOW LOADING SPINNER OVERLAY
    var personCredentials = this.personsOptions.find(p => p.Id == credentials.select);
    this.router.navigate(['./login'], {
      queryParams: { Id: personCredentials?.Id, FullName: personCredentials?.FullName }
    });
  }
}
