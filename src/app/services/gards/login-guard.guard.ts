import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { EmpleadosService } from '../empleado/empleado.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardGuard implements CanActivate {

  constructor(
    public empleadoService: EmpleadosService,
    public router: Router
  ) {}

  canActivate() {

    if ( this.empleadoService.estaLogueado() ) {
      return true;
    } else {
      console.log( 'Bloqueado por guard' );
      this.router.navigate(['/login']);
      return false;
    }

  }
}
