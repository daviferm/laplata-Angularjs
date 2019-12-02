import { Injectable, EventEmitter } from '@angular/core';
import { Medico } from '../../models/medico.model';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../config/config';
import { map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { SubirArchivoService } from '../subir-archivo/subir-archivo.service';
import { timer, throwError } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {

  colores: string[] = [ '#ad1457', '#f3511e', '#e3c441', '#0c8043', '#3f51b5',
                        '#8e24aa', '#d81a60', '#ef6c00', '#bfca33', '#039588',
                        '#7a86cb', '#795548', '#d50000', '#f09300', '#7cb343',
                        '#009be5', '#b39ddb', '#616161', '#e77c73', '#f6bf25',
                        '#32b679', '#4285f4', '#9e69af', '#a79b8d' ];
  nameColor: string[] = [ 'Granate', 'Mandarina', 'Mostaza', 'Verde musgo', 'Azul arándano',
                          'Morado intenso', 'Rosa palo', 'Zanahoria', 'Verde lima', 'Verde eucalipto',
                          'Lavanda', 'Marrón chocolate', 'Tomate', 'Melocotón', 'Verde pistacho',
                          'Azul turquesa', 'Malva', 'Grafito', 'Rosa chicle', 'Amarillo huevo',
                          'Verde esmeralda', 'Azul eléctrico', 'Amatista', 'Gris topo'];

  public notificacion = new EventEmitter<any>();
  public checkmedicos = new EventEmitter<Medico[]>();
  public sinConexion = new EventEmitter<boolean>();

  empleado: Medico;
  empleados: Medico[];
  token: string;
  totalMedicos: number = 0;
  delay = timer(200);


  constructor( public http: HttpClient,
               private router: Router,
               // tslint:disable-next-line: variable-name
               public _subirArchivoService: SubirArchivoService ) {

    this.cargarStorage();
    this.cargarMedicosStorage();
  }


  estaLogueado() {
    return ( this.token.length > 5 ) ? true : false;
  }

  cargarStorage() {

    if ( localStorage.getItem('token-calendar')) {
      this.token = localStorage.getItem('token-calendar');
      this.empleado = JSON.parse( localStorage.getItem('fisioLaPlata') );

    } else {
      this.token = '';
      this.empleado = {
        nombre: '',
        email: '',
        password: '',
        img: ''
      };
    }

  }

  guardarStorage( id: string, token: string, empleado: Medico ) {

    localStorage.setItem('laplataID', id );
    localStorage.setItem('token-calendar', token );
    localStorage.setItem('fisioLaPlata', JSON.stringify(empleado) );

    this.empleado = empleado;
    this.token = token;
  }
  guardarMedicosStorage( medicos ) {
    localStorage.setItem('empleados-laplata', JSON.stringify( medicos ));
  }
  cargarMedicosStorage() {
    if ( localStorage.getItem( 'empleados-laplata' ) ) {

      this.empleados = JSON.parse( localStorage.getItem( 'empleados-laplata' ) );
      this.delay.subscribe( () => this.notificacion.emit( this.empleados ) );
    }

  }

  login( usuario: Medico, recordar: boolean = false ) {

    if ( recordar ) {
      localStorage.setItem('laplataEmail', usuario.email);
    } else {
      localStorage.removeItem('laplataEmail');
    }

    const url = `${URL_SERVICIOS}/login`;

    return this.http.post( url, usuario )
              .pipe( map( (resp: any) => {

                  this.empleado = resp.usuario;
                  this.token = resp.token;
                  this.guardarStorage( this.empleado._id, this.token, this.empleado );

                  return true;

              } ) );
  }
  logout() {
    localStorage.removeItem('laplataID');
    localStorage.removeItem('token-calendar');
    localStorage.removeItem('fisioLaPlata');
    this.token = '';

    this.router.navigate([ '/login' ]);
  }

  actualizarEmpleado( usuario: Medico, check?: boolean ) {

    const url = `${URL_SERVICIOS}/medico/${usuario._id}`;

    return this.http.put( url, usuario )
          .pipe( map( (resp: any) => {

            if ( !check ) {

              Swal.fire('Empleado actualizado', usuario.nombre, 'success' );

              this.cargarMedicos().subscribe( medicos => {

                this.notificacion.emit( medicos );
              } );

              this.router.navigate([ '/medicos' ]);
            }

            return true;
          }));
  }

  cambiarImagen( archivo: File, id: string ) {

    this._subirArchivoService.subirArchivo( archivo, 'medicos', id )
          .then( (resp: any) => {

            resp = JSON.parse( resp );
            console.log(resp);

            if ( this.empleado._id === id ) {

              this.empleado = resp.medico;

              this.guardarStorage( this.empleado._id, this.token, this.empleado );
            }

            Swal.fire( 'Imagen Actualizada', resp.medico.nombre, 'success' );


          })
          .catch( resp => {
            console.log( resp );
          }) ;

  }
   actualizarPassword( body: any ) {


    const url = `${URL_SERVICIOS}/medico/password/${this.empleado._id}`;

    return this.http.put( url, body )
              .pipe( map( resp => {

                console.log(resp);

                Swal.fire( 'Contraseña actualizada', this.empleado.email, 'success' );

                return true;
              }));

  }

  cargarMedicos() {

    const url = URL_SERVICIOS + '/medico';

    return this.http.get( url )
              .pipe( map( (resp: any) => {

                this.totalMedicos = resp.total;
                this.notificacion.emit( resp.medicos );
                this.empleados = resp.medicos;
                this.guardarMedicosStorage( this.empleados );
                return resp.medicos;
              }),
              catchError( err => {
                this.sinConexion.emit( true );
                // Swal.fire('Atención', 'Sin conexión con la base de datos', 'error');
                return throwError('Error al cargar médicos', err);
              } ) );

  }

  cargarMedico( id: string ) {

    const url = URL_SERVICIOS + '/medico/' + id;

    return this.http.get( url )
              .pipe( map( (resp: any) => resp.medico ) );

  }

  borrarMedico( id: string ) {

    let url = URL_SERVICIOS + '/medico/' + id;

    return this.http.delete( url )
              .pipe( map( resp => {
                Swal.fire( 'Médico Borrado', 'Médico borrado correctamente', 'success' );
                return resp;
              }) );

  }

  guardarMedico( medico: any ) {

    const url = `${URL_SERVICIOS}/medico`;

    medico.img = 'xxx';

    // creando
    return this.http.post( url, medico )
            .pipe( map( (resp: any) => {
              Swal.fire('Médico Creado', medico.nombre, 'success');

              this.cargarMedicos().subscribe( medicos => {

                this.empleados = medicos;
                this.notificacion.emit( medicos );
              } );

              return resp.medico;
            }),
            catchError( err => {

              return throwError('Error al guardar médico', err);
            } ) );
  }

  checkedMedicos( medicoId, check ) {
    this.empleados.forEach( medico => {

      if ( medicoId === medico._id ) {
        medico.check = check;

        this.actualizarEmpleado( medico, true )
          .subscribe( res => {
            if ( res ) {
              console.log('Empleados actualizado');
            } else {
              console.log('Error a actualizar empleado');
            }
          });
      }
      this.guardarMedicosStorage( this.empleados );

    });
    this.checkmedicos.emit( this.empleados );
  }

}
