import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmpleadosService } from 'src/app/services/service.index';
import { URL_SERVICIOS } from 'src/app/config/config';
import { CitaDB } from '../../models/citaDB.model';
import { map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material';


@Injectable({
  providedIn: 'root'
})
export class CitasService {


  public actualizarCitas = new EventEmitter<boolean>();

  citasDB: any;

  constructor( private http: HttpClient,
               private snackBar: MatSnackBar,
               private empleadosService: EmpleadosService ) {

  this.cargarCitasStorage();
  }


  openSnackBar(message: string) {
    this.snackBar.open(message, 'cerrar', {
      duration: 4000,
    });
  }



  guardarCitasStorage( citas: any ) {

    localStorage.setItem('citas-laplata', JSON.stringify( citas ));

  }
  cargarCitasStorage() {
    this.citasDB = JSON.parse( localStorage.getItem( 'citas-laplata' ) );
  }

  // Crear nueva cita
  nuevaCita( nuevaCita: CitaDB ) {

    // const token = this.empleadosService.token;

    const url = `${URL_SERVICIOS}/cita`;

    return this.http.post( url, nuevaCita )
            .pipe( map( (res: any) => {
                this.openSnackBar('Cita creada correctamente.')

                this.actualizarCitas.emit( true );
                return res;
            } ) );
  }
  actualizarCita( cita: CitaDB, id: string ) {

    // const token = this.empleadosService.token;

    const url = `${URL_SERVICIOS}/cita/${id}`;

    return this.http.put( url, cita )
          .pipe( map( (res: any) => {
            this.openSnackBar('Cita actualizada correctamente.')

            this.actualizarCitas.emit( true );
            return res;
        }),
        catchError( err => {

          console.log('ERROR DE CONEXIÓN AL ACTUALIZAR CITA!!!');

          return throwError('Error al cargar citas', err);
        } ) );
  }

  obtenerCitasDB() {

    const url = `${URL_SERVICIOS}/cita`;

    return this.http.get( url )
        .pipe( map( (resp: any) => {
          this.citasDB = resp;
          this.guardarCitasStorage( resp );
          return resp;
        }),
        catchError( err => {

          // Swal.fire('Atención', 'Sin conexión con la base de datos', 'error');
          Swal.fire({
            type: 'error',
            title: 'Atención',
            text: 'Sin conexión con la base de datos. Usando base de datos local',
            timer: 4000
          });
          return throwError('Error al cargar citas', err);
        } ) );
  }

  eliminarCita( id: string ) {

    const url = `${URL_SERVICIOS}/cita/${id}`;

    return this.http.delete( url )
        .pipe( map( (resp: any) => {
          this.openSnackBar('Cita eliminada');
          return resp;
        } ) );
  }
  borrarCitasMedico( id: string ): void {

    this.citasDB.citas.forEach( (cita: any) => {
      if ( cita.medicoId._id === id ) {
        this.eliminarCita( cita._id ).subscribe();
      }
      this.guardarCitasStorage( this.citasDB );
    });
  }

  getCitaPorDia(dia: string) {

    const url = `${URL_SERVICIOS}/cita/dia?dia=${dia}`;

    return this.http.get( url )
        .pipe( map( (resp: any) => {
          return resp.citas;
        } ) );
  }
  getCitasPaciente(id: string) {

    const url = `${URL_SERVICIOS}/cita/paciente/${id}`;

    return this.http.get( url )
        .pipe( map( (resp: any) => {
          return resp;
        } ));
  }
  // Convertir los dias de las semana en milisegundos a formato de base de datos
  formatoDia(dia: Date) {

    const year = dia.getFullYear();
    const month = ( (dia.getMonth() + 1) <= 9 ) ? '0' + (dia.getMonth() + 1) : dia.getMonth() + 1;
    const date = ( dia.getDate() <= 9 ) ? '0' + dia.getDate() : dia.getDate();

    const fecha = `${year}/${month}/${date}`;

    return fecha;
  }

}
