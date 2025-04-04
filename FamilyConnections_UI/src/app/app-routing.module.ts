import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EntranceComponent } from './core/entrance.component';
import { LoginComponent } from './core/login.component';

const routes: Routes = [
  { path: 'entrance', component: EntranceComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '', pathMatch: 'full' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
