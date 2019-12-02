import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { Medico } from '../../models/medico.model';
import { CambiarPasswordService } from './cambiar-password.service';
import { EmpleadosService } from 'src/app/services/service.index';


@Component({
  selector: 'app-cambiar-password',
  templateUrl: './cambiar-password.component.html',
  styles: []
})
export class CambiarPasswordComponent implements OnInit {

  @Input() empleado: Medico;

  forma: FormGroup;
  oculto: string = '';

  constructor( public cambiarPassordService: CambiarPasswordService,
               public empleadoService: EmpleadosService ) {
  }
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

    this.forma = new FormGroup({
      passwordActual: new FormControl(null, [Validators.required, Validators.minLength(5)]),
      password1: new FormControl(null, [Validators.required, Validators.minLength(5)]),
      password2: new FormControl(null, [Validators.required, Validators.minLength(5)])
    }, { validators: this.sonIguales( 'password1', 'password2' ) });

  }

  actualizar() {

    if ( this.forma.invalid ) { return; }

    this.empleadoService.actualizarPassword( this.forma.value )
      .subscribe( (resp) => {

        console.log(resp);
        this.forma.setValue({
          passwordActual: '',
          password1: '',
          password2: ''
        });
      }, error => {
        Swal.fire('ERROR' , error.error.message, 'error');
        this.forma.setValue({
          passwordActual: '',
          password1: '',
          password2: ''
        });
      });

    this.cambiarPassordService.ocultarModal();


  }

}
