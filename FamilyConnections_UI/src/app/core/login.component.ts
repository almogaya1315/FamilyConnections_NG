import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { delay } from 'rxjs';
import { IPersonCredentials } from '../persons/person.model';
import { PersonsRepositoryService } from '../persons/persons-repository.service';

import { CacheService, eStorageKeys, eStorageType } from '../services/cache.service';

@Component({
  selector: 'fc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  validLogin: boolean = true;
  credentials: IPersonCredentials = {
    Id: 0, FullName: '', Password: ''
  };

  constructor(private router: Router, private route: ActivatedRoute, private cacheSvc: CacheService, private personsRepo: PersonsRepositoryService) {
    //this.credentials = cacheSvc.getCache<IPersonCredentials>(eStorageKeys.PartialCredentials, eStorageType.Session);
    this.route.queryParams.subscribe(params => {
      this.credentials.Id = params['Id'];
      this.credentials.FullName = params['FullName'];
    });
  }

  login(inputCredentials: any) {
    this.personsRepo.validateLogin(this.credentials).subscribe((loginRes) => {
      if (loginRes.Valid) {
        delay(2000); // SHOW LOAIND SPINNER OVERLAY
        this.cacheSvc.setCache(this.credentials, eStorageKeys.PersonCredentials, [eStorageType.Session])
        this.router.navigate(['./home']);
      } else {
        this.validLogin = false;
      }
    }); 
  }
}
