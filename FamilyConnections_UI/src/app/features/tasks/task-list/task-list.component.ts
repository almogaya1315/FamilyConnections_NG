import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent {
  //tasks$ = this.svc.getAll();                        
  byId = (_: number, x: { id: number }) => x.id;     
  constructor(/*private svc: TasksService, */ private cdr: ChangeDetectorRef) { }
  refreshFromExternal() { this.cdr.markForCheck(); }
}
