import { Inject, Injectable } from '@angular/core';
import { buffer, map, Observable, of } from 'rxjs';
//import { writeFile } from 'fs'

import { eGender, IPerson } from './person.model';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class PersonsRepositoryService {
  constructor(private http: HttpClient) { }

  getPersons(): Observable<IPerson[]> {
    //var persons: IPerson[] = [];
    //this.http.get('/api/persons').pipe(map((dataStr) => {
    //  persons = JSON.parse(dataStr.toString());
    //}));
    //return of(persons);

    var persons = this.http.get<IPerson[]>('/api/persons');
    return persons;
  }
}

//const persons: IPerson[] = [
//  {
//    Id: 1,
//    FullName: 'Lior Matsliah',
//    DateOfBirth: new Date('23/05/1985'),
//    DateOfBirthStr: '23/05/1985',
//    Age: 39,
//    PlaceOfBirth: 'Israel',
//    Gender: eGender.Male,
//    FlatConnections: []
//  },
//  {
//    Id: 2,
//    FullName: 'Keren Matsliah',
//    DateOfBirth: new Date('05/02/1984'),
//    DateOfBirthStr: '05/02/1984',
//    Age: 40,
//    PlaceOfBirth: 'Israel',
//    Gender: eGender.Female,
//    FlatConnections: []
//  },
//  {
//    Id: 3,
//    FullName: 'Gaya Matsliah',
//    DateOfBirth: new Date('06/06/2013'),
//    DateOfBirthStr: '06/06/2013',
//    Age: 12,
//    PlaceOfBirth: 'Israel',
//    Gender: eGender.Female,
//    FlatConnections: []
//  },
//  {
//    Id: 4,
//    FullName: 'Almog Matsliah',
//    DateOfBirth: new Date('26/03/2015'),
//    DateOfBirthStr: '26/03/2015',
//    Age: 10,
//    PlaceOfBirth: 'Israel',
//    Gender: eGender.Female,
//    FlatConnections: []
//  },
//];
