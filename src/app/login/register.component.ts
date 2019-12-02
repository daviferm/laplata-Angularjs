import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { EmpleadosService } from 'src/app/services/service.index';


declare function init_pluying();

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./login.component.css']
})
export class RegisterComponent implements OnInit {

  forma: FormGroup;

  constructor( private empleadoService: EmpleadosService ) { }
  sonIguales( campo1: string, campo2: string) {

    return ( group: FormGroup ) => {

      const pass1 = group.controls[campo1].value;
      const pass2 = group.controls[campo2].value;

      if ( pass1 === pass2 ) {
        return null;
      }

      return {
        sonIguales: true
      };
    };
  }

  ngOnInit() {
    init_pluying();

    this.forma = new FormGroup({
      nombre: new FormControl(null, Validators.required),
      correo: new FormControl(null, [Validators.required, Validators.email]),
      password1: new FormControl(null, Validators.required),
      password2: new FormControl(null, Validators.required)
    }, { validators: this.sonIguales( 'password1', 'password2' ) });

    this.forma.setValue({
      nombre: '',
      correo: '',
      password1: '',
      password2: ''
    });
  }


  registrarUsuario() {

    console.log(this.forma);
    if ( this.forma.invalid ) {
      if ( this.forma.controls.correo.status === 'INVALID' ) {

        Swal.fire('Oops...', 'No es un formato de correo válido!!', 'warning');
        return;
      } else if ( this.forma.errors.sonIguales ) {

        Swal.fire('Oops...', 'Las contraseñas debe de ser iguales!!', 'warning');
      }

      return;
    }
    const medico = {
      nombre: this.forma.value.nombre,
      email: this.forma.value.correo,
      password: this.forma.value.password1
    };
    this.empleadoService.guardarMedico( medico )
        .subscribe();

  }

}
