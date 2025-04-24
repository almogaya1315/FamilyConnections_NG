import { Component } from '@angular/core';
import { CacheService, eStorageKeys, eStorageType } from '../services/cache.service';
import { ConnectionsService } from '../services/connections.service';
import { StaticDataService } from '../services/static-data.service';
import { INameToId } from '../shared/common.model';
import { eGender, eRel, IConnection, IFlatConnection, IPerson, IUndecidedConnection } from './person.model';
import { PersonsRepositoryService } from './persons-repository.service';

@Component({
  selector: 'fc-add-person',
  templateUrl: './add-person.component.html',
  styleUrls: ['./add-person.component.css']
})
export class AddPersonComponent {
  //newPerson: IPerson;
  selectedPlaceOfBirth: INameToId = { Id: -1, Name: '' };
  selectedGender: INameToId = { Id: -1, Name: '' };
  selectedRelated: INameToId = { Id: -1, Name: '' };
  selectedRelation: INameToId = { Id: -1, Name: '' };

  newConnection = this.connsSvc.createConnection(
    this.personsRepo.getDefaultPerson(),
    this.personsRepo.getDefaultPerson(),
    eRel.Undecided
  );

  countries: INameToId[];
  genders: INameToId[];
  personsItems: INameToId[] = [];
  relations: INameToId[] = [];

  constructor(
    private personsRepo: PersonsRepositoryService,
    private staticData: StaticDataService,
    private cacheSvc: CacheService,
    private connsSvc: ConnectionsService) {

    this.countries = staticData.getCountries();
    this.genders = staticData.getGenders();
    this.relations = staticData.getRelations();

    var persons = this.cacheSvc.getCache<IPerson[]>(eStorageKeys.AllLocalPersons, eStorageType.Session);
    this.personsItems = persons!.map(p => ({
      Name: p.FullName,
      Id: typeof p.Id === 'string' ? parseInt(p.Id, 10) : p.Id,
    }));

    //this.personsRepo.getPersons().subscribe((personsData) => {
    //  if (personsData) {
    //    this.personsItems = personsData.map(p => ({
    //      Name: p.FullName,
    //      Id: typeof p.Id === 'string' ? parseInt(p.Id, 10) : p.Id,
    //    }));
    //  }
    //});
  }

  next(credentials: any) {

    var persons = this.cacheSvc.getCache<IPerson[]>(eStorageKeys.AllLocalPersons, eStorageType.Session);

    // fill new connection
    this.newConnection = this.connsSvc.fillNewConnection(persons!, {
      selectedPlaceOfBirthName: this.selectedPlaceOfBirth.Name,
      selectedGenderId: this.selectedGender.Id,
      selectedRelatedId: this.selectedRelated.Id,
      selectedRelationId: this.selectedRelation.Id,
      targetPersonFullName: this.newConnection!.TargetPerson!.FullName,
      targetPersonDataOfBirth: this.newConnection!.TargetPerson!.DateOfBirth!,
    });

    // calc other connections
    let newConnections = this.connsSvc.calcConnections(this.newConnection, persons!);

    // set persistency texts -> in last step
    //this.personsRepo.addPerson(this.newConnection!.TartgetPerson);
    //this.personsRepo.addConnections(newConnections);

    // reget persons after addition, and reset cache -> in last step
    //this.personsRepo.getPersons().subscribe((personsData) => {
    //  if (personsData) {
    //    this.cacheSvc.setCache(personsData, eStorageKeys.AllLocalPersons, [eStorageType.Session]);
    //  }
    //});

    this.connsSvc.setLocalCache(persons!, this.newConnection); // between steps

    // handle step 2 UI -> possible complexity

    // handle step 3 UI -> summary
  }
}
