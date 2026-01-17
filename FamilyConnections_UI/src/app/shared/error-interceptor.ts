import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotifyService } from './notify.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notify: NotifyService, private router: Router) { }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.error?.error || err.statusText || 'שגיאה לא צפויה';
        if (err.status === 401) this.router.navigateByUrl('/login');   // למה: טיפול auth
        if (err.status === 0) this.notify.error('אין חיבור לשרת');     // רשת/קורס
        else this.notify.error(msg);
        return throwError(() => err);
      })
    );
  }
}
