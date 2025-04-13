import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { IPerson } from '../persons/person.model';
import { PersonsRepositoryService } from '../persons/persons-repository.service';
import { CacheService, eStorageKeys, eStorageType } from '../services/cache.service';

@Component({
  selector: 'fc-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  //@Input()
  currentPerson: IPerson | null = null;

  constructor(private cacheSvc: CacheService, private personsRepo: PersonsRepositoryService, private router: Router) {
    //this.currentPerson = cacheSvc.getCache(eStorageKeys.CurrentPerson, eStorageType.Session);
  }

  ngOnInit() {
    this.personsRepo.getCurrentPerson().subscribe({
      next: (person) => { this.currentPerson = person }
    });
  }

  signOut() {
    this.personsRepo.resetCurrentPerson();
    this.router.navigate(['./entrance']);
  }
}
