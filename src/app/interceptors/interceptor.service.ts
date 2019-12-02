import { Injectable, EventEmitter } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EmpleadosService } from 'src/app/services/service.index';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  public sinConexion = new EventEmitter<boolean>();

  constructor( public empleadoService: EmpleadosService ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const headers = new HttpHeaders({
      'token-usuario': this.empleadoService.token
    });

    const reqClone = req.clone({
      headers
    });

    return next.handle( reqClone ).pipe(
      catchError( this.manejarError )
      );
  }


  manejarError( err: HttpErrorResponse) {

    console.log('Error interceptado...');
    console.warn(err);
    return throwError('Error personalizado');

  }
}
