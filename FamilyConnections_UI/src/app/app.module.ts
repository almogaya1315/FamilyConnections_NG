import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module'
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component';
import { NavBarComponent } from './core/nav-bar.component';
import { EntranceComponent } from './core/entrance.component';
import { LoginComponent } from './core/login.component';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    EntranceComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
