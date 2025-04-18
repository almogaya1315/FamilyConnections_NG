import { Injectable } from '@angular/core';
import { eRel } from '../persons/person.model';
import { INameToId } from '../shared/common.model';

@Injectable({
  providedIn: 'root'
})
export class StaticDataService {

  constructor() { }

  getCountries(): INameToId[] {
    return [
      { Id: 1, Name: 'Israel' }
    ];
  }

  getGenders(): INameToId[] {
    return [
      { Id: 0, Name: 'Male' },
      { Id: 1, Name: 'Female' },
    ]
  }

  getRelations(): INameToId[] {

    return Object.entries(eRel)
      .filter(([key, value]) =>
        isNaN(Number(key)) && typeof value === 'number' && value <= 32
      )
      .map(([key, value]) => ({
        Id: value as number,
        Name: key
      }));

    //return Object.keys(eRel)
    //  .map(key => ({
    //  Id: Number(key),
    //  Name: eRel[Number(key)]
    //}));
  }
}
