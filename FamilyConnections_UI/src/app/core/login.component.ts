import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { delay } from 'rxjs';
import { IPersonOption } from '../persons/person.model';

import { CacheService, eStorageKeys, eStorageType } from '../services/cache.service';

@Component({
  selector: 'fc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials: any = {};

  constructor(private router: Router, private cacheSvc: CacheService) {
    this.credentials = cacheSvc.getCache<IPersonOption>(eStorageKeys.PartialCredentials, eStorageType.Session);
  }

  login(inputCredentials: any) {

    //create userRepo for login validation and flow process
    //create service from setCache method in EntranceComponent, and call it after login

    delay(2000);

    this.router.navigate(['./home']);
  }
}
