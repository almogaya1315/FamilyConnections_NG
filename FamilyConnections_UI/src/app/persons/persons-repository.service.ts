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
    return this.http.get<IPerson[]>('http://localhost:8081/api/persons');
  }
}
