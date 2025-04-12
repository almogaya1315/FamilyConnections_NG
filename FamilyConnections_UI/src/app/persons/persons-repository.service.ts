import { Inject, Injectable } from '@angular/core';
import { buffer, map, Observable, of } from 'rxjs';

import { eGender, ILoginResponse, IPerson, IPersonCredentials } from './person.model';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class PersonsRepositoryService {
  
  constructor(private http: HttpClient) { }

  getPersons(): Observable<IPerson[]> {
    //return this.http.get<IPerson[]>('http://localhost:8081/api/persons');
    return this.http.get<IPerson[]>('/api/persons');
  }

  validateLogin(credentials: IPersonCredentials) {
    return this.http.post<ILoginResponse>('/api/validateLogin', credentials);
  }
}
