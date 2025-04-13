import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module'
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'

import { AppComponent } from './app.component';
import { NavBarComponent } from './core/nav-bar.component';
import { EntranceComponent } from './core/entrance.component';
import { LoginComponent } from './core/login.component';
import { HomeComponent } from './home/home.component';
import { AddPersonComponent } from './persons/add-person.component';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    EntranceComponent,
    LoginComponent,
    HomeComponent,
    AddPersonComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
