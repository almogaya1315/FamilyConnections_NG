import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotifyService {
  error(msg: string) { alert(msg); }
}
