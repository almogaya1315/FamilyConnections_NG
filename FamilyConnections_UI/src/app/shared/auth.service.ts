import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isLoggedIn$ = new BehaviorSubject<boolean>(true);
  login() { this.isLoggedIn$.next(true); }
  logout() { this.isLoggedIn$.next(false); }
}
