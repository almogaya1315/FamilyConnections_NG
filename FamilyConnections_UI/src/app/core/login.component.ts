import { Component } from '@angular/core';
import { ActivatedRoute, ActivationEnd, ActivationStart, Router } from '@angular/router';
import { delay, filter, map } from 'rxjs';
import { IPerson, IPersonCredentials } from '../persons/person.model';
import { PersonsRepositoryService } from '../persons/persons-repository.service';

import { CacheService, eStorageKeys, eStorageType } from '../services/cache.service';
import { EntranceComponent } from './entrance.component';
import { NavBarComponent } from './nav-bar.component';

@Component({
  selector: 'fc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  validPassword: boolean = true;
  validFullName: boolean = true;
  credentials: IPersonCredentials = {
    Id: 0, FullName: '', Password: ''
  };

  //private currentPerson: IPerson | null = null;

  constructor(private router: Router, private route: ActivatedRoute, private cacheSvc: CacheService, private personsRepo: PersonsRepositoryService) {
    this.route.queryParams.subscribe(params => {
      this.credentials.Id = params['Id'];
      this.credentials.FullName = params['FullName'];
    });
    //this.watchRouterChanges();
  }

  login(inputCredentials: any) {
    this.personsRepo.validateLogin(this.credentials).subscribe((loginRes) => {
      if (loginRes.Valid) {
        delay(2000); // SHOW LOADING SPINNER OVERLAY
        //this.cacheSvc.setCache(loginRes.Person, eStorageKeys.CurrentPerson, [eStorageType.Session])
        //this.currentPerson = loginRes.Person;
        this.router.navigate(['./home']);
      } else {
        if (loginRes.Message.includes('Person')) {
          this.validFullName = false;
          this.validPassword = true;
        }
        else if (loginRes.Message.includes('Password')) {
          this.validPassword = false;
          this.validFullName = true;
        }
      }
    });
  }

  //private watchRouterChanges() {
  //  this.router.events.pipe(
  //    filter((e): e is ActivationStart => e instanceof ActivationStart),
  //    map(event => event.snapshot.component)
  //  ).subscribe(component => {
  //    if (component === LoginComponent || component === EntranceComponent) {
  //      this.currentPerson = null;
  //      this.cacheSvc.removeCache(eStorageKeys.CurrentPerson, [eStorageType.Session]);
  //    } else {
  //      this.cacheSvc.setCache(this.currentPerson, eStorageKeys.CurrentPerson, [eStorageType.Session]);
  //    }
  //    var navBar = (component as unknown as NavBarComponent);
  //    navBar.currentPerson = this.currentPerson;
  //  });
  //}
}
