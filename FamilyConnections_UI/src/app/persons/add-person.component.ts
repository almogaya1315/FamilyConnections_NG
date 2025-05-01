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
  persons: IPerson[] = [];
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

    this.persons = this.cacheSvc.getCache<IPerson[]>(eStorageKeys.AllLocalPersons, eStorageType.Session)!;
    this.personsItems = this.persons!.map(p => ({
      Name: p.FullName,
      Id: typeof p.Id === 'string' ? parseInt(p.Id, 10) : p.Id,
    }));

    this.personsRepo.getConnections().subscribe((conns) => {
      this.cacheSvc.setCache(conns, eStorageKeys.AllLocalConnections, [eStorageType.Session]);
    });

    //this.personsRepo.getPersons().subscribe((personsData) => {
    //  if (personsData) {
    //    this.personsItems = personsData.map(p => ({
    //      Name: p.FullName,
    //      Id: typeof p.Id === 'string' ? parseInt(p.Id, 10) : p.Id,
    //    }));
    //  }
    //});
  }

  compareById = (a: any, b: any) => a?.Id === b?.Id;

  private inputs() {
    return {
      selectedPlaceOfBirthName: this.selectedPlaceOfBirth.Name,
      selectedGenderId: this.selectedGender.Id,
      selectedRelatedId: this.selectedRelated.Id,
      selectedRelationId: this.selectedRelation.Id,
      targetPersonFullName: this.newConnection!.TargetPerson!.FullName,
      targetPersonDataOfBirth: this.newConnection!.TargetPerson!.DateOfBirth!,
    };
  }

  next(credentials: any) {
    // fill new connection
    this.newConnection = this.connsSvc.fillNewConnection(this.newConnection!, this.persons!, this.inputs());

    // calc other connections
    let newConnections = this.connsSvc.calcConnections(this.newConnection, this.persons!);

    // set persistency texts -> in last step
    //this.personsRepo.addPerson(this.newConnection!.TartgetPerson);
    //this.personsRepo.addConnections(newConnections);

    // reget persons after addition, and reset cache -> in last step
    //this.personsRepo.getPersons().subscribe((personsData) => {
    //  if (personsData) {
    //    this.cacheSvc.setCache(personsData, eStorageKeys.AllLocalPersons, [eStorageType.Session]);
    //  }
    //});

    this.connsSvc.setLocalCache(this.persons!, this.newConnection); // between steps

    // handle step 2 UI -> possible complexity

    // handle step 3 UI -> summary
  }

  fillTest() {
    this.newConnection!.TargetPerson!.FullName = "Racheli Paz";
    this.newConnection!.TargetPerson!.DateOfBirth = new Date(1996, 2, 4);
    this.selectedPlaceOfBirth = this.countries.find(c => c.Id === 1)!;
    this.selectedGender = this.genders.find(g => g.Id === 1)!;
    this.selectedRelated = this.personsItems.find(p => p.Id === 2)!;
    this.selectedRelation = this.relations.find(r => r.Id === 2)!;
  }
}
