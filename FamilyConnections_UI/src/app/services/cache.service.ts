import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor(private cookies: CookieService) { }

  getCache<T>(key: eStorageKeys, storage: eStorageType) {
    var cahceOutput = null;

    if (storage == null || storage == eStorageType.Local) {
      cahceOutput = this.getLocalStorage<T>(key);
    }
    else
    {
      if (storage == eStorageType.Session) {
        cahceOutput = this.getSessionStorage<T>(key);
      }
      else if (storage == eStorageType.Cookies) {
        cahceOutput = this.getCookiesStorage<T>(key);
      }
    }

    return cahceOutput;
  }

  private getLocalStorage<T>(key: eStorageKeys) {
    var json = localStorage.getItem(key);
    return json ? (JSON.parse(json) as T) : null;
  }
  private getSessionStorage<T>(key: eStorageKeys) {
    var json = sessionStorage.getItem(key);
    return json ? (JSON.parse(json) as T) : null;
  }
  private getCookiesStorage<T>(key: eStorageKeys) {
    var json = this.cookies.get(key);
    return json ? (JSON.parse(json) as T) : null;
  }

  setCache(data: any, key: eStorageKeys, storages: eStorageType[]) {
    if (data != null) {
      if (storages.length == 0) {
        this.setLocalStorage(key, data);
        this.setSessionStorage(key, data);
        this.setCookiesStorage(key, data);
      } else {
        if (storages.includes(eStorageType.Local)) {
          this.setLocalStorage(key, data);
        }
        if (storages.includes(eStorageType.Session)) {
          this.setSessionStorage(key, data);
        }
        if (storages.includes(eStorageType.Cookies)) {
          this.setCookiesStorage(key, data);
        }
      }
    }
  }

  private setLocalStorage(key: eStorageKeys, credentials: any) {
    localStorage.setItem(key, JSON.stringify(credentials));
  }
  private setSessionStorage(key: eStorageKeys, credentials: any) {
    sessionStorage.setItem(key, JSON.stringify(credentials));
  }
  private setCookiesStorage(key: eStorageKeys, credentials: any) {
    this.cookies.set(key, JSON.stringify(credentials));
  }

  removeCache(key: eStorageKeys, storages: eStorageType[]) {
    if (storages.length == 0) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      this.cookies.delete(key);
    } else {
      if (storages.includes(eStorageType.Local)) {
        localStorage.removeItem(key);
      }
      if (storages.includes(eStorageType.Session)) {
        sessionStorage.removeItem(key);
      }
      if (storages.includes(eStorageType.Cookies)) {
        this.cookies.delete(key);
      }
    }
  }
}

export enum eStorageType {
  Local = 'Local',
  Session = 'Session',
  Cookies = 'Cookies'
}

export enum eStorageKeys {
  //PartialCredentials = 'PartialCredentials',
  //FullCredentials = 'FullCredentials',
  CurrentPerson = 'CurrentPerson',
  PersonCredentials = 'PersonCredentials',
  AllLocalPersons = "AllLocalPersons"
}
