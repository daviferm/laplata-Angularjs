import { Component, OnInit } from '@angular/core';
import { Medico } from '../../models/medico.model';
import { EmpleadosService } from 'src/app/services/service.index';
import Swal from 'sweetalert2';
import { CitasService } from 'src/app/services/citas/citas.service';
import { CitaDB } from '../../models/citaDB.model';

@Component({
  selector: 'app-medicos',
  templateUrl: './medicos.component.html',
  styleUrls: ['../usuarios/usuarios.component.css']
})
export class MedicosComponent implements OnInit {

  medicos: Medico[] = [];
  usuarioLogin: Medico;

  // tslint:disable-next-line: variable-name
  constructor( public _medicoService: EmpleadosService,
               private citasService: CitasService ) { }

  ngOnInit() {
    this.cargarMedicos();
    this.usuarioLogin = JSON.parse( localStorage.getItem( 'fisioLaPlata' ) );
  }

  cargarMedicos() {
    this._medicoService.cargarMedicos()
          .subscribe( medicos => {
            this.medicos = medicos;
          }, error => {
            console.log('Error al cargar los empleados');
            console.log(error);
          } );
  }

  borrarMedico( medico: Medico ) {
    Swal.fire({
      title: '¿Esta seguro?',
      text: 'Esta a punto de borrar a ' + medico.nombre,
      type: 'warning',
      confirmButtonText: 'Si, borrarlo!',
      showCancelButton: true
    })
    .then( borrar => {

      if (borrar.value) {

       this._medicoService.borrarMedico( medico._id )
            .subscribe( () =>  {
              this.citasService.borrarCitasMedico( medico._id );
              this.cargarMedicos();

            }, err => {
              console.log(err);
            } );

      }
    });


  }

}
