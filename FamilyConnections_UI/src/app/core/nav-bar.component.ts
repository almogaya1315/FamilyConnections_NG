import { Component, Input } from '@angular/core';
import { IPerson } from '../persons/person.model';

@Component({
  selector: 'fc-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  @Input() currentPerson: IPerson | null = null;

  signOut() {
    this.currentPerson = null;
  }
}
