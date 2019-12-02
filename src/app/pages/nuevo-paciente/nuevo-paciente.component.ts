import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-nuevo-paciente',
  templateUrl: './nuevo-paciente.component.html',
  styles: []
})
export class NuevoPacienteComponent implements OnInit {

  forma: FormGroup;
  usuario: Usuario;

  // tslint:disable-next-line: variable-name
  constructor( public _usuarioService: UsuarioService,
               private router: Router ) {

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
  }


  registrarUsuario( ) {

    console.log(this.forma.value);
    const fechaNacimiento: Date = this.forma.value.nacimiento;

    if ( this.forma.invalid ) { return; }

    const fecha = new Date();

    this.usuario = this.forma.value;

    let antiguedad = `${ fecha.getDate() }/${ fecha.getMonth() + 1 }/${ fecha.getFullYear() }`;
    const nacimiento = `${ fechaNacimiento.getDate() }-${ fechaNacimiento.getMonth() }-${ fechaNacimiento.getFullYear() }`;

    antiguedad = String(antiguedad);

    this.usuario.antiguedad = antiguedad;
    this.usuario.nacimiento = nacimiento;
    console.log(this.usuario);

    this._usuarioService.crearUsuario( this.usuario )
        .subscribe( (usuario: Usuario) => {
          if ( usuario ) {
            this.router.navigate(['pacientes']);
          }
        });

  }

}
