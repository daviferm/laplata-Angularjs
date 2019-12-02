import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/service.index';
import { Usuario } from '../../models/usuario.model';
import { CitasService } from '../../services/citas/citas.service';
import Swal from 'sweetalert2';
import { EditUsuarioService } from '../../components/edit-usuario/edit-usuario.service';
import { CitaDB } from '../../models/citaDB.model';


@Component({
  selector: 'app-paciente',
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css']
})
export class PacienteComponent implements OnInit {

  spinner: boolean;
  paciente: Usuario;
  citasDB: any;

  usuarioDB: Usuario;
  modalEdit: boolean = false;


  constructor( private activatedRoute: ActivatedRoute,
               private usuarioService: UsuarioService,
               private citasService: CitasService,
               private editUsuarioService: EditUsuarioService,
               private router: Router ) {

    this.spinner = true;
    this.activatedRoute.params.subscribe( params => {
      this.usuarioService.buscarUsuarioId( params.id )
        .subscribe( resp => {
          this.paciente = resp.usuario;
          this.spinner = false;
          this.citasService.getCitasPaciente( this.paciente._id )
              .subscribe( (resp: any) => {
                this.citasDB = resp.citas;
              } );
        } );
    });
   }

  ngOnInit() {
  }
  actualizarVista( resp ) {
    if ( resp ) {
      this.paciente = resp.usuario;
    }
  }

  borrarUsuario() {

    Swal.fire({
      title: '¿Esta seguro?',
      html: `<br>
            <p>Esta a punto de borrar a ${this.paciente.nombre} ${this.paciente.apellidos}</p>
            <strong>Tambien se eliminarán todas sus citas.</strong>`,
      type: 'warning',
      confirmButtonText: 'Si, borrarlo!',
      showCancelButton: true
    })
    .then( borrar => {

      if (borrar.value) {

        this.usuarioService.borrarUsuario( this.paciente._id )
                  .subscribe( borrado => {
                      this.router.navigate(['pacientes']);
                      this.citasDB.forEach( (cita: CitaDB) => {
                        this.citasService.eliminarCita( cita._id ).subscribe();
                      } );
                  });

      }
    });
  }

  actualizarUsuario() {

    this.usuarioDB = this.paciente;
    this.modalEdit = true;
    this.editUsuarioService.mostrarModal();
  }
  cerrarModal( $event ) {

    this.modalEdit = $event;
  }


}
