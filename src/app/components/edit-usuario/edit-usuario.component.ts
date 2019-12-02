import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Usuario } from '../../models/usuario.model';
import { EditUsuarioService } from './edit-usuario.service';
import { UsuarioService } from 'src/app/services/service.index';

@Component({
  selector: 'app-edit-usuario',
  templateUrl: './edit-usuario.component.html',
  styles: []
})
export class EditUsuarioComponent implements OnInit {

  @Input() usuario: Usuario;
  @Output() cerrarmodal = new EventEmitter<boolean>();
  @Output() actualizar = new EventEmitter<Usuario>();

  image: string;
  id: string;

  forma: FormGroup;

  constructor( public editUsuarioService: EditUsuarioService,
               public usuarioService: UsuarioService ) {
   }

  ngOnInit() {
    this.forma = new FormGroup({
      nombre: new FormControl('', Validators.required),
      apellidos: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      genero: new FormControl('', Validators.required),
      telefono: new FormControl('', Validators.required),
      nacimiento: new FormControl(''),
      direccion: new FormControl(''),
      ciudad: new FormControl(''),
      provincia: new FormControl(''),
      codigoPostal: new FormControl(''),
      observaciones: new FormControl('')
    });

    this.forma.setValue({
      apellidos: this.usuario.apellidos,
      ciudad: this.usuario.ciudad,
      codigoPostal: this.usuario.codigoPostal,
      direccion: this.usuario.direccion,
      email: this.usuario.email,
      genero: this.usuario.genero,
      nacimiento: this.usuario.nacimiento,
      nombre: this.usuario.nombre,
      observaciones: this.usuario.observaciones,
      provincia: this.usuario.provincia,
      telefono: this.usuario.telefono
    });
  }

  actualizarUsuario() {
    this.image = this.usuario.img;
    this.id = this.usuario._id;

    this.usuario = this.forma.value;

    this.usuario.img = this.image;
    this.usuario._id = this.id;

    this.usuarioService.actualizarUsuario( this.usuario )
      .subscribe( resp => {
        console.log('ACTUALIZADO..');
        this.actualizar.emit( resp );
      } );

    this.editUsuarioService.ocultarModal();

  }

  cerrarModal() {
    this.editUsuarioService.ocultarModal();
    this.cerrarmodal.emit( false );
  }

}
