import { Component, OnInit, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {  EmpleadosService } from '../../services/service.index';
import Swal from 'sweetalert2';
import { Medico } from '../../models/medico.model';
import { CambiarPasswordService } from 'src/app/components/cambiar-password/cambiar-password.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: []
})
export class ProfileComponent implements OnInit {

  usuario: Medico = {
    password: '',
    direccion: '',
    email: '',
    img: '',
    nombre: '',
    telefono: ''
  };
  nuevoEmpledo: boolean = false;
  medicoID: string;
  colorIdx: number = 2;
  colores: string[];
  nombreColor: string[];

  imagenSubir: File;
  imagenTemp: any = null;

  public notificacion = new EventEmitter<any>();

  constructor(
    // tslint:disable-next-line: variable-name
    public empleadoService: EmpleadosService,
    public editarPasswordServide: CambiarPasswordService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.params.subscribe( params => {
      // tslint:disable-next-line: no-string-literal
      this.medicoID = params['id'];
      // tslint:disable-next-line: no-string-literal
      if ( this.medicoID === 'actual' ) {
        this.usuario = this.empleadoService.empleado;
      } else if ( this.medicoID === 'nuevo' ) {
        this.nuevoEmpledo = true;
        this.usuario = {
          password: '',
          direccion: '',
          email: '',
          img: '',
          nombre: '',
          telefono: ''
        };
      } else {
        this.obtenerMedico( this.medicoID );
      }
    });
  }

  ngOnInit() {
    this.colores = this.empleadoService.colores;
    this.nombreColor = this.empleadoService.nameColor;
  }
  selecColor( idx ) {
    this.colorIdx = idx;
  }

  obtenerMedico( id: string ) {
    this.empleadoService.cargarMedico( id )
        .subscribe( (medico: Medico) => {
            this.usuario = medico;
            this.colorIdx = this.colores.findIndex( color => color === this.usuario.color );
            });
  }

  guardar( ) {

    if ( this.medicoID !== 'nuevo' ) {
      this.usuario.color = this.colores[this.colorIdx];

      this.empleadoService.actualizarEmpleado( this.usuario ).subscribe();

    } else {
      this.usuario.color = this.colores[this.colorIdx];
      this.empleadoService.guardarMedico( this.usuario )
          .subscribe( (medico: Medico) => {
            console.log(medico);
            this.router.navigate([ '/medicos' ]);
          } );
    }
  }

  seleccionImage( archivo: File ) {

    if ( !archivo ) {
      this.imagenSubir = null;
      return;
    }

    if ( archivo.type.indexOf('image') < 0 ) {
      Swal.fire('Sólo imágenes', 'El archivo seleccionado no es una imagen', 'error');
      this.imagenSubir = null;
      return;
    }

    this.imagenSubir = archivo;

    const reader = new FileReader();
    const urlImagenTemp = reader.readAsDataURL( archivo );

    reader.onloadend = () => this.imagenTemp = reader.result;

  }

  cambiarImagen() {
    this.empleadoService.cambiarImagen( this.imagenSubir, this.usuario._id );
  }
  cambiarPassword() {
    this.editarPasswordServide.mostrarModal();
  }

}
