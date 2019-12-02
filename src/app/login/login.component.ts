import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Medico } from '../models/medico.model';
import { EmpleadosService } from '../services/service.index';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  recuerdame: boolean;
  email: string;

  constructor( public router: Router, private empleadoService: EmpleadosService ) {
    this.recuerdame = false;
   }

  ngOnInit() {

    this.email = localStorage.getItem('laplataEmail') || '';
    if ( this.email.length > 2 ) {
      this.recuerdame = true;
    }
  }

  ingresar( forma: NgForm, recordar ) {


    if ( forma.invalid ) {
      return;
    }

    const empleado = new Medico( null, forma.value.email, forma.value.password );

    this.empleadoService.login( empleado, recordar )
        .subscribe( resp => this.router.navigate(['/calendario', 'undefined', 'undefined', 'undefined'])
        , err => Swal.fire('Error', err.error.message, 'error') );


  }

}
