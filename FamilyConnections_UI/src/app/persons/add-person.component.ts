import { Component } from '@angular/core';
import { StaticDataService } from '../services/static-data.service';
import { INameToId } from '../shared/common.model';
import { IPerson } from './person.model';
import { PersonsRepositoryService } from './persons-repository.service';

@Component({
  selector: 'fc-add-person',
  templateUrl: './add-person.component.html',
  styleUrls: ['./add-person.component.css']
})
export class AddPersonComponent {
  newPerson: IPerson;
  selectedPlaceOfBirth: INameToId = { Id: -1, Name: '' };
  selectedRelated: INameToId = { Id: -1, Name: '' };
  selectedRelation: INameToId = { Id: -1, Name: '' };
  countries: INameToId[];
  genders: INameToId[];
  personsItems: INameToId[] = [];
  relations: INameToId[] = [];

  constructor(
    private personsRepo: PersonsRepositoryService,
    private staticData: StaticDataService) {
    this.newPerson = personsRepo.getDefaultPerson();
    this.countries = staticData.getCountries();
    this.genders = staticData.getGenders();
    this.relations = staticData.getRelations();

    this.personsRepo.getPersons().subscribe((personsData) => {
      if (personsData) {
        this.personsItems = personsData.map(p => ({
          Name: p.FullName,
          Id: typeof p.Id === 'string' ? parseInt(p.Id, 10) : p.Id,
        }));
      }
    });
  }

  add(credentials: any) {

  }
}
