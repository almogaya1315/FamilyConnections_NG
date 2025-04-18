import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, buffer, map, Observable, of } from 'rxjs';

import { eGender, IFlatConnection, ILoginResponse, IPerson, IPersonCredentials } from './person.model';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class PersonsRepositoryService {
  private currentPerson: BehaviorSubject<IPerson | null>;

  constructor(private http: HttpClient) {
    this.currentPerson = new BehaviorSubject<IPerson | null>(null);
  }

  getCurrentPerson(): Observable<IPerson | null> {
    return this.currentPerson;
  }

  resetCurrentPerson() {
    this.currentPerson.next(null);
  }

  getDefaultPerson(): IPerson {
    return {
      Id: -1,
      FullName: '',
      DateOfBirth: null,
      DateOfBirthStr: '0000-00-00',
      Age: 0,
      FlatConnections: [],
      Gender: 0,
      Password: '',
      PlaceOfBirth: ''
    };
  }

  getPersons(): Observable<IPerson[]> {
    return this.http.get<IPerson[]>('/api/persons');
  }

  validateLogin(credentials: IPersonCredentials) {
    return this.http
      .post<ILoginResponse>('/api/validateLogin', credentials)
      .pipe(map((res: ILoginResponse) => {
        if (res.Valid) this.currentPerson.next(res.Person);
        return res;
      }));
  }



  getRelatives(flatConnections: IFlatConnection[]) {
    return this.http.post<IPerson[]>('/api/relatives', flatConnections);
  }
}
