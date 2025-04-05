import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { delay } from 'rxjs';

import { eGender, IPerson, IPersonOption } from '../persons/person.model';
import { PersonsRepositoryService } from '../persons/persons-repository.service';
import { CacheService, eStorageKeys, eStorageType } from '../services/cache.service';

@Component({
  selector: 'fc-entrance',
  templateUrl: './entrance.component.html',
  styleUrls: ['./entrance.component.css']
})
export class EntranceComponent implements OnInit {
  selectedPerson: string | null = '-1';

  personsOptions: IPersonOption[] = [];
  //[ { text: 'Lior', value: 1 },
  //{ text: 'Keren', value: 2 } ];

  constructor(private router: Router, private cacheSvc: CacheService, private personsRepo: PersonsRepositoryService) { }

  ngOnInit() {
    var persons = this.personsRepo.getPersons();
    persons.subscribe((personsData) => {
      if (personsData) {
        this.personsOptions = personsData.map(p => ({
          text: p.FullName,
          value: typeof p.Id === 'string' ? parseInt(p.Id, 10) : p.Id
        }));
      }
    });
  }

  enter(credentials: any) {
    delay(1000);

    //create userRepo to get data. pull the person by the credentials, and send credentials to cache with Id & fullName
    var personCredentials = this.personsOptions.find(p => p.value == credentials.select);
    this.cacheSvc.setCache(personCredentials, eStorageKeys.PartialCredentials, [eStorageType.Session]);
    this.router.navigate(['./login']);
  }
}
