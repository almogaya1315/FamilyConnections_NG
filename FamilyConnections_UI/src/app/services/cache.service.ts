import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor(private cookies: CookieService) { }

  getCache(key: eStorageKeys, storage: eStorageType) {
    var cahceOutput = null;

    if (storage == null || storage == eStorageType.Local) {
      cahceOutput = localStorage.getItem(key);
    }
    else
    {
      if (storage == eStorageType.Session) {
        cahceOutput = sessionStorage.getItem(key);
      }
      else if (storage == eStorageType.Cookies) {
        cahceOutput = this.cookies.get(key);
      }
    }

    return cahceOutput;
  }

  setCache(credentials: any, key: eStorageKeys, storages: eStorageType[]) {
    if (storages.length == 0) {
      this.setLocalStorage(key, credentials);
      this.setSessionStorage(key, credentials);
      this.setCookiesStorage(key, credentials);
    } else {
      if (storages.includes(eStorageType.Local)) {
        this.setLocalStorage(key, credentials);
      }
      if (storages.includes(eStorageType.Session)) {
        this.setSessionStorage(key, credentials);
      }
      if (storages.includes(eStorageType.Cookies)) {
        this.setCookiesStorage(key, credentials);
      }
    }
  }

  private setLocalStorage(key: eStorageKeys, credentials: any) {
    localStorage.setItem(key, credentials);
  }
  private setSessionStorage(key: eStorageKeys, credentials: any) {
    sessionStorage.setItem(key, credentials);
  }
  private setCookiesStorage(key: eStorageKeys, credentials: any) {
    this.cookies.set(key, credentials)
  }
}

export enum eStorageType {
  Local = 'Local',
  Session = 'Session',
  Cookies = 'Cookies'
}

export enum eStorageKeys {
  PartialCredentials = 'PartialCredentials',
  FullCredentials = 'FullCredentials',
  CurrentPerson = 'CurrentPerson'
}
