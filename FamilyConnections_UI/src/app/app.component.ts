import { Component } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { EntranceComponent } from './core/entrance.component';
import { LoginComponent } from './core/login.component';
import { IPerson } from './persons/person.model';
import { CacheService, eStorageKeys, eStorageType } from './services/cache.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FamilyConnections_UI';
  //currentPerson: IPerson | null = null;

  constructor(private router: Router, private cacheSvc: CacheService) {
    //this.watchRouterChanges();
    this.router.navigate(['./entrance']);
  }

  //private watchRouterChanges() {
  //  this.router.events.pipe(
  //    filter((e): e is ActivationEnd => e instanceof ActivationEnd),
  //    map(event => event.snapshot.component)
  //  ).subscribe(component => {
  //    if (component === LoginComponent || component === EntranceComponent) {
  //      this.currentPerson = null;
  //      this.cacheSvc.setCache(null, eStorageKeys.CurrentPerson, [eStorageType.Session]);
  //    } else {
  //      this.cacheSvc.setCache(this.currentPerson, eStorageKeys.CurrentPerson, [eStorageType.Session]);
  //    }
  //  });
  //}
}
