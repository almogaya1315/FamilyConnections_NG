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

  newConnection: IConnection = {
    TartgetPerson: this.personsRepo.getDefaultPerson(),
    RelatedPerson: this.personsRepo.getDefaultPerson(),
    Relationship: { Id: -1, Type: eRel.Undecided },
    Flat: null
  };

  countries: INameToId[];
  genders: INameToId[];
  personsItems: INameToId[] = [];
  relations: INameToId[] = [];

  constructor(
    private personsRepo: PersonsRepositoryService,
    private staticData: StaticDataService,
    private cacheSvc: CacheService,
    private connsSvc: ConnectionsService) {
    //this.newPerson = personsRepo.getDefaultPerson();
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
      targetPersonFullName: this.newConnection!.TartgetPerson!.FullName,
      targetPersonDataOfBirth: this.newConnection!.TartgetPerson!.DateOfBirth!,
    });

    // calc other connections
    let newConnections = this.connsSvc.calcConnections(this.newConnection, persons!);

    // set persistency texts
    //this.personsRepo.addPerson(this.newConnection!.TartgetPerson);
    //this.personsRepo.addConnections(newConnections);

    // reget persons after addition, and reset cache
  }
}
