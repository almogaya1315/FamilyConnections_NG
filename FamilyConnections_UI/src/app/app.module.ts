import { ErrorHandler, NgModule } from '@angular/core';
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

import { DoneDirective } from './shared/directives/done.directive';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './shared/error-interceptor' 
import { GlobalErrorHandler } from './shared/global-error-handler.global';
import { TaskListComponent } from './features/tasks/task-list/task-list.component';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    EntranceComponent,
    LoginComponent,
    HomeComponent,
    AddPersonComponent,
    DoneDirective,
    TaskListComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  exports: [
    DoneDirective
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
