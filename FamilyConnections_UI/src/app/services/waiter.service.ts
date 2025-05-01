import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WaiterService {

  constructor() { }

  async seconds(value: number) {
    await new Promise(resolve => setTimeout(resolve, value * 1000))
  }
}
