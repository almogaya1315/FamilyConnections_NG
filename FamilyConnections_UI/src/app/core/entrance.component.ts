import { Component } from '@angular/core';
import { Router } from '@angular/router'
import { delay } from 'rxjs';

import { eGender, IPerson } from '../persons/person.model';
import { CacheService, eStorageKeys, eStorageType } from '../services/cache.service';

@Component({
  selector: 'fc-entrance',
  templateUrl: './entrance.component.html',
  styleUrls: ['./entrance.component.css']
})
export class EntranceComponent {
  selectedPerson: string | null = '-1';

  personsOptions: any[] = [
    { text: 'Lior', value: 1 },
    { text: 'Keren', value: 2 },
  ];

  constructor(private router: Router, private cacheSvc: CacheService) { }

  enter(credentials: any) {
    delay(1000);

    //create userRepo to get data. pull the person by the credentials, and send credentials to cache with Id & fullName
    this.cacheSvc.setCache(credentials, eStorageKeys.PartialCredentials, [eStorageType.Session]);
    this.router.navigate(['./login']);
  }
}
