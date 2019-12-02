import { Injectable } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../config/config';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';


import { Router } from '@angular/router';
import { SubirArchivoService } from '../subir-archivo/subir-archivo.service';
import { EmpleadosService } from '../empleado/empleado.service';

@Injectable()
export class UsuarioService {

  usuario: Usuario;
  pacientes: Usuario[];
  token: string;

  constructor(
    public http: HttpClient,
    public router: Router,
    // tslint:disable-next-line: variable-name
    public _subirArchivoService: SubirArchivoService,
    // tslint:disable-next-line: variable-name
    private _empleadoService: EmpleadosService
  ) {
  }

  guardarUsuariosStorage( usuarios: any ) {
    localStorage.setItem( 'users-laplata', JSON.stringify( usuarios ) );
  }

  cargarUsuariosStorage( usuarios: any ) {
    this.pacientes = JSON.parse( localStorage.getItem( 'users-laplata' ) );
  }

  crearUsuario( usuario: Usuario ) {
    this.token = this._empleadoService.token;

    const url = `${URL_SERVICIOS}/usuario`;

    return this.http.post( url, usuario )
            .pipe( map( (resp: any) => {

              Swal.fire('Usuario creado', usuario.email, 'success' );
              return resp.usuarioGuardado;
            }) );
  }

  actualizarUsuario( usuario: Usuario ) {

    this.token = this._empleadoService.token;

    const url = `${URL_SERVICIOS}/usuario/${usuario._id}`;

    return this.http.put( url, usuario )
              .pipe( map( (resp: any) => {

                Swal.fire('Usuario actualizado', usuario.nombre, 'success' );

                return resp;
              }));

  }

  cambiarImagen( archivo: File, id: string ) {

    this._subirArchivoService.subirArchivo( archivo, 'usuarios', id )
          .then( (resp: any) => {

            this.usuario.img = resp.usuario.img;
            Swal.fire( 'Imagen Actualizada', this.usuario.nombre, 'success' );

          })
          .catch( resp => {
            console.log( resp );
          }) ;

  }

  cargarUsuarios( desde: number = 0 ) {


    const url = URL_SERVICIOS + '/usuario?desde=' + desde;
    return this.http.get( url )
        .pipe( map( (resp: any) => {

          const usuarios = resp.usuarios;

          // Ordenar alfabéticamente lo usuarios por apellidos
          usuarios.sort( (a, b) => {
            if (a.apellidos > b.apellidos) {
              return 1;
            }
            if (a.apellidos < b.apellidos) {
              return -1;
            }
            // a must be equal to b
            return 0;
          });
          resp.usuarios = usuarios;

          return resp;

        } ) );

  }
  cargarTotalUsuarios() {

    const url = `${URL_SERVICIOS}/usuario/total`;
    return this.http.get( url )
          .pipe( map( (resp: any) => {

            const usuarios = resp.usuarios;

            // Ordenar alfabéticamente lo usuarios por apellidos
            usuarios.sort( (a, b) => {
              if (a.apellidos > b.apellidos) {
                return 1;
              }
              if (a.apellidos < b.apellidos) {
                return -1;
              }
              // a must be equal to b
              return 0;
            });

            resp.usuarios = usuarios;
            this.guardarUsuariosStorage( resp );

            return resp;

          } ) );
  }

  buscarUsuarioId( id: string ) {

    const url = `${URL_SERVICIOS}/usuario/${id}`;

    return this.http.get( url )
              .pipe( map( (usuario: any) => {

                return usuario;
              }));

  }

  buscarUsuarios( termino: string ) {

    const url = URL_SERVICIOS + '/busqueda/coleccion/usuarios/' + termino;
    return this.http.get( url )
              .pipe( map( (resp: any) => resp.usuarios ) );

  }

  borrarUsuario( id: string ) {
    this.token = this._empleadoService.token;

    let url = URL_SERVICIOS + '/usuario/' + id;
    url += '?token=' + this.token;

    return this.http.delete( url )
              .pipe( map( resp => {
                Swal.fire('Usuario borrado', 'El usuario a sido eliminado correctamente', 'success');
                return true;
              }) );

  }

}
