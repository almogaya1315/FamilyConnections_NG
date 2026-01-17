import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EntranceComponent } from './core/entrance.component';
import { LoginComponent } from './core/login.component';
import { HomeComponent } from './home/home.component';
import { AddPersonComponent } from './persons/add-person.component';
import { AuthGuard } from './shared/auth.guard';



const routes: Routes = [
  { path: 'entrance', component: EntranceComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'addPerson', component: AddPersonComponent },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'admin', loadChildren: () => import('./app.module').then(m => m.AppModule), canActivate: [AuthGuard] }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
