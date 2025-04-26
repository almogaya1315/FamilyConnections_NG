import { Component, OnInit } from '@angular/core';
import { IPerson, IConnection, IRelationshipInfo, eRel } from '../persons/person.model';
import { PersonsRepositoryService } from '../persons/persons-repository.service';
import { CacheService, eStorageKeys, eStorageType } from '../services/cache.service';
import { ConnectionsService } from '../services/connections.service';

@Component({
  selector: 'fc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  eRel = eRel;
  person: IPerson | null = null;
  personConnections: { relative: IPerson, relationship: any }[] = [];

  ngOnInit(): void {
    this.setPerson();
    this.setRelatives();
    this.setConnections();
  }

  private setConnections() {
    this.personsRepo.getConnections().subscribe((conns) => {
      this.cacheSvc.setCache(conns, eStorageKeys.AllLocalConnections, [eStorageType.Session]);
    });
  }

  private setPerson() {
    this.personsRepo.getCurrentPerson().subscribe({
      next: (person) => { this.person = person }
    });
  }
  private setRelatives() {
    this.personsRepo.getRelatives(this.person?.FlatConnections ?? []).subscribe((relatives) => {
      relatives.forEach(r => {
        this.personConnections.push({
          relative: r,
          relationship: this.getRelationship(r.Id as number)
        });
      });
    });
  }

  constructor(
    private cacheSvc: CacheService,
    private personsRepo: PersonsRepositoryService,
    private connsSvc: ConnectionsService) {
    //this.person = cacheSvc.getCache(eStorageKeys.CurrentPerson, eStorageType.Session);
  }

  getRelationship(relatedId: number): IRelationshipInfo {
    var relId = this.person?.FlatConnections.find(f => f.RelatedId == relatedId)?.RelationshipId;
    return this.connsSvc.newRelationship(relId!);
  }
}
