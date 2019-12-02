import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import Swal from 'sweetalert2';
import { timer } from 'rxjs';

import { UsuarioService, EmpleadosService } from 'src/app/services/service.index';
import { Usuario } from '../../models/usuario.model';
import { Cita } from '../../models/citas.model';
import { CitaDB } from '../../models/citaDB.model';
import { Medico } from '../../models/medico.model';
import { ModalCitaService } from './modal-cita.service';
import { CitasService } from '../../services/citas/citas.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-nueva-cita',
  templateUrl: './nueva-cita.component.html',
  styles: []
})
export class NuevaCitaComponent implements OnInit {

  @ViewChild('modal') modal: ElementRef;
  @ViewChild('paciente') paciente: ElementRef;
  @ViewChild('dia') diaCita: ElementRef;

  usuarios: Usuario[];
  empleados: Medico[];
  total: number;
  colores: string[];
  colorIdx: any = 0;
  delay = timer(100);
  selectFin: string = 'option1';
  selectInit: string = 'option1';
  inputPaciente: any = 'option1';

  horas: any[] = [];
  minutos: string[] = [':00', ':15', ':30', ':45'];
  citaNueva: Cita;
  citaDB: CitaDB;
  medicoSelect: Medico;
  pacienteSelect: Usuario;
  actualizarCita: boolean = false;
  editarCita: any = {
    medicoId: '',
    dia: '',
    inicio: '',
    final: '',
    color: '',
    pacienteId: '',
    evento: ''
  };
  editarCitaId: string;
  forma: FormGroup;
  date = new FormControl(new Date());
  dispositivo: string;

  constructor( public usuarioService: UsuarioService,
               public empleadosService: EmpleadosService,
               public modalCitaService: ModalCitaService,
               public citasService: CitasService,
               private renderer: Renderer2 ) {

    for ( let i = 8; i < 23; i++ ) {

      let hora = ( i <= 9 ) ? '0' + i : i;
      hora = String(hora);
      // tslint:disable-next-line: no-shadowed-variable
      for ( let i = 0; i < 4; i++ ) {
         const horas = hora + this.minutos[i];
         this.horas.push(horas);
      }
    }
  }

  ngOnInit() {
    this.forma = new FormGroup({
      atendido: new FormControl('', Validators.required),
      sinregistrar: new FormControl(''),
      paciente: new FormControl('', Validators.required),
      dia: new FormControl('', Validators.required),
      inicio: new FormControl('', Validators.required),
      final: new FormControl('', Validators.required)
    });

    this.colores = this.empleadosService.colores;
    this.obtenerUsuarios();
    this.obtenerEmpleados();

    this.modalCitaService.formulario.subscribe( cita => {
      this.llenarFormulario( cita );
      this.editarCita = cita;

      this.pacienteSelect = null;
      this.obtenerUsuarios();
      console.log(this.forma);

    });

    this.dispositivo = this.isMobile();
    console.log(this.dispositivo);
  }
  isMobile() {
    if (
        (navigator.userAgent.match(/Android/i)) ||
        (navigator.userAgent.match(/webOS/i)) ||
        (navigator.userAgent.match(/iPhone/i)) ||
        (navigator.userAgent.match(/iPod/i)) ||
        (navigator.userAgent.match(/iPad/i)) ||
        (navigator.userAgent.match(/BlackBerry/i))
    ) {
      return 'Mobile';
    } else {
      return 'Descktop';
    }
}
  cerrarModal() {
    this.modalCitaService.cerrarModal();
  }
  cerrarVentana( event ) {
    const evento = event.target.className;
    if ( evento.includes('cdk-drag') ) {

      this.cerrarModal();
    }
  }
  selecColor( idx ) {
    this.colorIdx = idx;
  }
  empleadoSeleccionado( empleado ) {

    this.empleados = this.empleadosService.empleados;

    this.medicoSelect = this.empleados.find( medico => medico.nombre.startsWith(empleado) );

    if ( !this.medicoSelect ) { return; }
    this.colorIdx = this.colores.findIndex( color => color === this.medicoSelect.color );
  }

  usuarioSeleccionado( paciente ) {

    this.pacienteSelect = paciente;
  }

  buscarPacientes( usuario ) {
    if ( usuario.length > 1 ) {
      usuario = usuario.toLowerCase();

      this.usuarios = this.usuarios.filter( elem => elem.nombre.toLocaleLowerCase().startsWith(usuario) );
    } else {
      this.obtenerUsuarios();
    }
  }

  llenarFormulario(cita: any) {
    if ( cita && cita._id ) {
      console.log('EDITAR CITA');
      const diaCita = cita.dia.replace(/[\/]/g, '-');

      this.actualizarCita = true;
      const pacienteIdx = this.usuarios.findIndex( usuario => usuario._id === cita.pacienteId._id );

      this.delay.subscribe( () => {
        const colorIndex = this.empleadosService.colores.findIndex( color => cita.color === color);
        this.forma.setValue({
          atendido: cita.medicoId.nombre,
          sinregistrar: cita.evento,
          paciente: '',
          dia: diaCita,
          inicio: cita.inicio,
          final: cita.final
        });

        if ( this.dispositivo === 'Descktop' ) {

          this.renderer.setProperty( this.paciente.nativeElement.item(pacienteIdx), 'selected', true );
        } else {
          this.inputPaciente = String(pacienteIdx);
        }
        this.colorIdx = colorIndex;

        this.editarCitaId = cita._id;
      });


    } else {

      this.actualizarCita = false;

      if ( cita ) {
        const diaCita = cita.dia.replace(/[\/]/g, '-');
        const numeroHora = Number(cita.inicio.substr(0, 2)) + 1;
        const horaFinal = ( numeroHora <= 9 ) ? '0' + String(numeroHora) + ':00' : String(numeroHora) + ':00';
        this.forma.setValue({
          atendido: '',
          sinregistrar: '',
          paciente: '',
          dia: diaCita,
          inicio: cita.inicio,
          final: horaFinal
        });
      } else {

        this.forma.setValue({
          atendido: '',
          sinregistrar: '',
          paciente: '',
          dia: '',
          inicio: '',
          final: ''
        });
      }
    }
  }


  obtenerUsuarios() {
    this.usuarioService.cargarTotalUsuarios()
        .subscribe( (resp: any) => {
          this.usuarios = resp.usuarios;
          this.total = resp.total;
        });
  }

  obtenerEmpleados() {
    this.empleadosService.cargarMedicos()
        .subscribe( (resp: any) => {
          this.empleados = resp;
        });
  }

  guardarCita() {


    if ( !this.actualizarCita ) {

      if ( !this.forma.valid ) { return; }
      const final = this.forma.controls.final.value.split(':');
      const inicio = this.forma.controls.inicio.value.split(':');

      if ( Number(final[0]) <= Number(inicio[0]) && Number(final[1]) <= Number(inicio[1]) ) {
        Swal.fire('Atención!', 'La hora final no puede ser menor o igual que la hora inicial', 'info');
        return;
      }

      const diaCita = this.forma.value.dia.replace(/[\-]/g, '/');

      this.citaDB = {
        medicoId: this.medicoSelect._id,
        dia: diaCita,
        inicio: this.forma.value.inicio,
        final: this.forma.value.final,
        color: this.colores[this.colorIdx],
        pacienteId: null,
        evento: this.forma.value.sinregistrar
      };
      if ( this.pacienteSelect  ) {
        this.citaDB.pacienteId = this.pacienteSelect._id;
      }

      this.citasService.nuevaCita( this.citaDB )
          .subscribe( resp => {
            this.modalCitaService.cerrarModal();
          });



    } else {
      let stringDia: string;
      if ( typeof this.forma.value.dia === 'object' ) {
        const fecha = this.forma.value.dia;
        const dia = ( fecha.getDate() > 9 ) ? fecha.getDate() : '0' + String(fecha.getDate());
        stringDia = `${fecha.getFullYear()}/${fecha.getMonth() + 1}/${dia}`;
      } else {
        stringDia = this.forma.value.dia.replace(/[\-]/g, '/');
      }

      const citaPaciente: CitaDB = {
        medicoId: ( this.medicoSelect ) ? this.medicoSelect._id : this.editarCita.medicoId._id,
        dia: stringDia,
        inicio: this.forma.value.inicio,
        final: this.forma.value.final,
        color: this.colores[this.colorIdx],
        pacienteId: ( this.pacienteSelect ) ? this.pacienteSelect._id : this.editarCita.pacienteId._id,
        evento: ''
      };


      this.citasService.actualizarCita( citaPaciente, this.editarCita._id )
            .subscribe( resp => {
              this.modalCitaService.cerrarModal();
            } );

    }

  }


}
