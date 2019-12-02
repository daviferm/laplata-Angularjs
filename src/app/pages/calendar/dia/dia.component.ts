import { Component, OnInit, OnDestroy, Renderer2, Input, ViewChild, ElementRef } from '@angular/core';
import { CitasService } from '../../../services/citas/citas.service';
import { GetDateService, EmpleadosService } from '../../..//services/service.index';
import { ModalCitaService } from '../../../components/nueva-cita/modal-cita.service';
import { FestivosService } from '../../../services/festivos/festivos.service';
import { timer, Subscription } from 'rxjs';
import { Medico } from '../../../models/medico.model';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-dia',
  templateUrl: './dia.component.html',
  styleUrls: ['./dia.component.css']
})
export class DiaComponent implements OnInit, OnDestroy {

  @Input() diaSeleccionado: Date;
  @ViewChild('tabla') tabla: ElementRef;
  @ViewChild('badge') badge: ElementRef;

  cambioSub: Subscription;
  checkEmpl: Subscription;
  calendarSub: Subscription;

  citasDB: any;
  horasDia: string[] = [];
  spinner: boolean;
  fecha: Date = new Date();
  diaSelect: Date;
  empleados: Medico[];
  numMedicosActivos: number;
  medicosActios: Medico[];
  delay = timer(100);
  colorAnulada: string = '#d50000';
  colorNoAsiste: string = '#616161';
  festivos: any;
  badgeFestivo: boolean = false;


  constructor( public renderer: Renderer2,
               public citasService: CitasService,
               public dateService: GetDateService,
               public empleadosService: EmpleadosService,
               public modalCitaService: ModalCitaService,
               private snackBar: MatSnackBar,
               private festivosService: FestivosService,
               private router: Router
               ) {
    let horaInicio = 7;
    for (let i = 0; i < 16; i++) {

      const hora = (horaInicio < 10) ? `0${horaInicio}:00` : `${horaInicio}:00`;
      this.horasDia.push(hora);
      horaInicio ++;
    }
  }

  ngOnInit() {

    this.festivos = this.festivosService.festivos;

    this.cambioSub = this.dateService.eventCambioDia.subscribe( resp => {
      if ( resp ) {
        const newDia = this.formatoDia(new Date(resp.date));
        this.limpiarCalendario();
        this.borrarFestivo();
        this.obtenerCitasDB(newDia);
        this.agregarFestivos();
      }
    } );

    this.checkEmpl = this.empleadosService.checkmedicos.subscribe( (empleados: any) => {
      const newDia = this.formatoDia(this.diaSeleccionado);
      this.borrarFestivo();
      this.limpiarCalendario();
      this.obtenerCitasDB(newDia);
    } );

    this.citasService.actualizarCitas.subscribe( resp => {
      if ( resp ) {
        this.borrarFestivo();
        this.limpiarCalendario();
        const newDia = this.formatoDia(this.diaSeleccionado);
        this.obtenerCitasDB(newDia);
      }
    } );

    // this.festivosService.cambioDia.subscribe( resp => {
    //   if ( resp ) {
    //     this.limpiarCalendario();
    //     const newDia = this.formatoDia( new Date(resp) );
    //     this.obtenerCitasDB(newDia);
    //   }
    // });

    this.cargarMedicos(this.diaSeleccionado);

  }
  ngOnDestroy() {
    this.cambioSub.unsubscribe();
    this.checkEmpl.unsubscribe();
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'cerrar', {
      duration: 4000,
    });
  }
  // Nueva cita
  nuevaCita(event, horaInicio) {

    if ( horaInicio !== '07:00' ) {

      const elemento = event.target.className;
      if ( elemento.startsWith('celdas') ) {
        const fecha = this.formatoDia(new Date(this.diaSeleccionado));
        const cita = {
          color: '',
          dia: fecha,
          evento: '',
          final: '',
          inicio: horaInicio,
          medicoId: '',
          pacienteId: ''
        };
        this.modalCitaService.mostrarModal(cita);
      }
    }
  }

  // Limpiar plantilla
  limpiarCalendario() {
    const element = this.tabla.nativeElement;
    for ( const refHora of element.children ) {
      if ( refHora.children.length > 0 ) {
        for ( const nodo of refHora.children ) {
          this.renderer.removeChild( refHora, nodo );
        }
      }
    }
  }
  agregarFestivos() {

    console.log(this.festivos);
    const fecha = this.formatoDia(this.diaSeleccionado);
    console.log(fecha);
    this.festivos.forEach( fiesta => {
        if ( fecha === fiesta.FECHA ) {
          this.isertarFiestaNacional(fiesta);
        }
        if ( fecha === fiesta.fecha_festivo ) {
          this.isertarFiestaLocal(fiesta);
        }
    } );
  }

  // Insertar festivo nacional
  isertarFiestaNacional(festivo: any) {

    const ref = this.badge.nativeElement;

    // badge badge-danger span-festivo
    const div = this.renderer.createElement('div');
    this.renderer.addClass( div, 'div-festivo' );
    const small = this.renderer.createElement( 'small' );
    const texto = this.renderer.createText( festivo.DSFIESTA );
    this.renderer.addClass( small, 'badge' );
    this.renderer.addClass( small, 'badge-danger' );
    this.renderer.addClass( small, 'span-festivo' );
    this.renderer.appendChild( small, texto );
    this.renderer.appendChild( div, small );
    this.renderer.appendChild( ref, div );

  }
  // INsertar festivo Local
  isertarFiestaLocal(festivo: any) {

    const ref = this.badge.nativeElement;

    // badge badge-warning span-festivo
    const div = this.renderer.createElement('div');
    this.renderer.addClass( div, 'div-festivo' );
    const small = this.renderer.createElement( 'small' );
    const texto = this.renderer.createText( 'Fiesta Local' );
    this.renderer.addClass( small, 'badge' );
    this.renderer.addClass( small, 'badge-warning' );
    this.renderer.addClass( small, 'span-festivo' );
    this.renderer.appendChild( small, texto );
    this.renderer.appendChild( div, small );
    this.renderer.appendChild( ref, div );
  }

  borrarFestivo() {
    const ref = this.badge.nativeElement;
    if ( ref.children.length > 0 ) {
      this.renderer.removeChild( ref, ref.children[0] );
    }

  }

  // Obtener los médicos
  cargarMedicos(fecha) {
    this.empleadosService.cargarMedicos()
      .subscribe( medicos => {
        this.empleados = medicos;
        this.numMedicosActivos = medicos.length;
        const dateString = this.formatoDia(fecha);
        this.obtenerCitasDB(dateString);
        this.agregarFestivos();
      }, err => {
        console.log(err);
        this.openSnackBar('No hay conexión con la base de datos');
        this.empleados = JSON.parse( localStorage.getItem( 'empleados-laplata' ) );
        console.log(this.empleados);
        this.numMedicosActivos = this.empleados.length;
        const dateString = this.formatoDia(fecha);
        this.obtenerCitasDB( dateString );
        this.agregarFestivos();

      } );
  }

  // Obtenemos las citas de la base de datos y los dias de la semana mostrados
  obtenerCitasDB( diaSelected? ) {
    this.spinner = true;
    this.citasService.getCitaPorDia(diaSelected)
      .subscribe( (resp: any) => {

        this.spinner = false;
        this.citasDB = resp;
        if ( this.citasDB.length > 0 ) {
          this.mostrarCitasDia(this.citasDB);
        }
        this.stylePopup();

      }, err => {
        // Si hay no hay conexión con la base de datos las carga de localStorage
        this.citasDB = JSON.parse( localStorage.getItem( 'citas-laplata' ) ).citas;
        this.spinner = false;


        console.error('Error al obtener citas de la base de datos');
      } );
  }

  mostrarCitasDia(citas) {
    this.medicosActios = this.empleados.filter( fisio => fisio.check === true );

    const element = this.tabla.nativeElement;
    for ( const ref of element.children ) {

      this.medicosActios.forEach( fisio => {

        citas.forEach( cita => {

          if ( cita.medicoId._id === fisio._id ) {

            const hora = cita.inicio.slice(0, 2);
            if ( ref.getAttribute('id') === hora ) {
              this.insertarCita(cita, ref);
            }
          }
        } );
      } );
    }

  }
  stylePopup() {
    const element = this.tabla.nativeElement;
    for ( const ref of element.children ) {

      if ( ref.children.length > 0 ) {
        const indexCell = ref.children;
        for ( let i = 0; i < indexCell.length; i++ ) {
          if ( i > 1 ) {
            this.renderer.setStyle( indexCell[i].lastChild, 'right', '40px' );
          }
          if ( ref.getAttribute('id') > 10 ) {
            this.renderer.addClass( indexCell[i].lastChild, 'popup-top' );
          }
        }
      }
    }
  }

  insertarCita(cita, refhora) {
    const {  pacienteId, medicoId, dia, inicio, final, color, evento, _id } = cita;

    const inicioId = String(inicio).substr(0, 2);
    const comienzoCita = String(inicio).substr(3, 4);
    const duracion = this.duracionCita(inicio, final);


    const div = this.renderer.createElement('div');
    const divhijo = this.renderer.createElement('div');
    const br = this.renderer.createElement('br');
    let titulo;

    if ( pacienteId ) {

      titulo = this.renderer.createText( `${pacienteId.nombre}` );
    } else {
      titulo = this.renderer.createText( evento );
    }
    const text = this.renderer.createText( `${inicio}-${final}` );

    this.renderer.addClass(div, `new-cita` );
    this.renderer.addClass(div, `animated` );
    this.renderer.addClass(div, `fadeInUp` );
    this.renderer.addClass(div, `top${comienzoCita}` );
    this.renderer.setAttribute( div, 'id', _id);

    this.renderer.appendChild(div, divhijo);
    this.renderer.appendChild(div, titulo);
    this.renderer.appendChild(div, br);
    this.renderer.appendChild(div, text);
    this.renderer.appendChild(refhora, div);

    if ( this.numMedicosActivos > 1 ) {

      this.renderer.setStyle( refhora.children[ refhora.children.length - 1 ],
        'width', ( 100 / this.numMedicosActivos ) + 10 + '%' );

    } else {
      this.renderer.setStyle( refhora.children[ refhora.children.length - 1 ], 'width', '100%' );
    }
    // const indexCell = this.empleados.findIndex( fisio => fisio.nombre === cita.medicoId.nombre );

    this.renderer.setStyle( refhora.children[ refhora.children.length - 1 ], 'height', duracion + '%' );

    this.renderer.setStyle( refhora.children[ refhora.children.length - 1 ], 'background', color );

    // Crear popup de edicion y borrado de la cita
    const popup = this.renderer.createElement('div');
    const divSuperior = this.renderer.createElement('div');
    const divInferior = this.renderer.createElement('div');
    this.renderer.addClass( divInferior, 'div-inferior' );
    this.renderer.addClass( divSuperior, 'div-superior' );
    this.renderer.addClass( popup, 'tooltips' );
    // if ( indexCell < 1 ) {
    //   this.renderer.setStyle( popup, 'left', '50%');
    // } else {
    //   this.renderer.setStyle( popup, 'left', '-20%');
    // }
    // if ( refhora.getAttribute('id') < 15 ) {
    //   this.renderer.setStyle( popup, 'top', '0px' );
    // } else {
    //   this.renderer.setStyle( popup, 'top', '-200%' );
    // }
    this.renderer.appendChild( popup, divSuperior );
    this.renderer.appendChild( popup, divInferior );

    const divBody = this.renderer.createElement('div');
    this.renderer.addClass( divBody, 'popup-body' );
    const medico = this.renderer.createElement('p');
    const spanMedico = this.renderer.createElement('span');
    this.renderer.setStyle( spanMedico, 'font-weight', '500' );
    const textSpan = this.renderer.createText( 'Fisioterapeuta: ' );
    const textoMedico = this.renderer.createText( `${medicoId.nombre}` );
    this.renderer.appendChild( spanMedico, textSpan );
    this.renderer.appendChild( medico, spanMedico );
    this.renderer.appendChild( medico, textoMedico );
    this.renderer.appendChild( divBody, medico );

    const paciente = this.renderer.createElement('p');
    const spanElem = this.renderer.createElement('span');
    this.renderer.setStyle( spanElem, 'font-weight', '500' );
    const textoPaciente = this.renderer.createText( 'Paciente: ' );
    const textoNombre = this.renderer.createText( `${pacienteId.nombre} ${pacienteId.apellidos}` );
    this.renderer.appendChild( spanElem, textoPaciente );
    this.renderer.appendChild( paciente, spanElem );
    this.renderer.appendChild( paciente, textoNombre );
    this.renderer.appendChild( divBody, paciente );

    const parrafoDuracion = this.renderer.createElement('p');
    const strongElem = this.renderer.createElement('strong');
    this.renderer.setStyle( strongElem, 'font-weight', '500' );
    const textoDuracion = this.renderer.createText( 'Duración: ' );
    const duracionText = this.renderer.createText( `${inicio}-${final}` );
    this.renderer.appendChild( strongElem, textoDuracion );
    this.renderer.appendChild( parrafoDuracion, strongElem );
    this.renderer.appendChild( parrafoDuracion, duracionText );
    this.renderer.appendChild( divBody, parrafoDuracion );

    this.renderer.appendChild( divInferior, divBody );
    this.renderer.appendChild( div, popup );
    this.renderer.setStyle( popup, 'display', 'none' );

    // Dropdowns de acciones
    const btnGroup = this.renderer.createElement('div');
    this.renderer.addClass( btnGroup, 'btn-group' );
    this.renderer.addClass( btnGroup, 'dropright' );
    this.renderer.setStyle( btnGroup, 'margin-top', '-4px' );
    const dropButton = this.renderer.createElement('button');
    this.renderer.setProperty( dropButton, 'type', 'button' );
    this.renderer.setAttribute( dropButton, 'data-toggle', 'dropdown' );
    this.renderer.setAttribute( dropButton, 'aria-haspopup', 'true' );
    this.renderer.setAttribute( dropButton, 'aria-expanded', 'false' );
    this.renderer.addClass( dropButton, 'btn' );
    this.renderer.addClass( dropButton, 'btn-outline-secondary' );
    this.renderer.addClass( dropButton, 'dropdown-toggle' );

    const btnMenu = this.renderer.createElement('div');
    this.renderer.addClass( btnMenu, 'dropdown-menu' );
    const anulada = this.renderer.createElement('a');
    const textAnular = this.renderer.createText('Anulada');
    this.renderer.addClass( anulada, 'dropdown-item' );
    this.renderer.appendChild( anulada, textAnular );
    const noAsiste = this.renderer.createElement('a');
    const textAsistencia = this.renderer.createText('No asiste');
    this.renderer.addClass( noAsiste, 'dropdown-item' );
    this.renderer.appendChild( noAsiste, textAsistencia );

    this.renderer.appendChild( btnMenu, anulada );
    this.renderer.appendChild( btnMenu, noAsiste );

    this.renderer.appendChild( btnGroup, dropButton );
    this.renderer.appendChild( btnGroup, btnMenu );
    this.renderer.appendChild( divSuperior, btnGroup );

    // Crear un hijo al popup para editar la cita
    const editCita = this.renderer.createElement('div');
    this.renderer.addClass( editCita, 'body-icon' );
    this.renderer.appendChild( divSuperior, editCita );
    // Crear icono edición
    const iconEdit = this.renderer.createElement('i');
    this.renderer.addClass( iconEdit, 'fa' );
    this.renderer.addClass( iconEdit, 'fa-pencil' );
    this.renderer.appendChild( editCita, iconEdit );

    // Crear un hijo al popup para borrar la cita
    const borrarCita = this.renderer.createElement('div');
    this.renderer.addClass( borrarCita, 'body-icon' );
    this.renderer.appendChild( divSuperior, borrarCita );
      // Crear icono borrado
    const iconDelete = this.renderer.createElement('i');
    this.renderer.addClass( iconDelete, 'fa' );
    this.renderer.addClass( iconDelete, 'fa-trash-o' );
    this.renderer.appendChild( borrarCita, iconDelete );

    // Crear un hijo al popup para acceder al perfil del paciente
    const pacienteIcon = this.renderer.createElement('div');
    this.renderer.addClass( pacienteIcon, 'body-icon' );
    this.renderer.appendChild( divSuperior, pacienteIcon );
      // Crear icono perfil usuario
    const iconPerfil = this.renderer.createElement('i');
    this.renderer.addClass( iconPerfil, 'fa' );
    this.renderer.addClass( iconPerfil, 'fa-user-circle' );
    this.renderer.appendChild( pacienteIcon, iconPerfil );


    this.renderer.listen( div, 'click', () => {
        this.renderer.setStyle( div, 'background', '#343a40' );
        // this.renderer.setStyle( div, 'font-weight', 'bold' );
        this.renderer.setStyle( popup, 'display', 'block' );
        this.renderer.setStyle( div, 'z-index', '200' );
      } );
    this.renderer.listen( anulada, 'click', () => {
        console.log('Cita anulada...');
        cita.incidencia = 'anulada';
        cita.color = this.colorAnulada;
        this.citasService.actualizarCita(cita, cita._id).subscribe();
      } );

    this.renderer.listen( noAsiste, 'click', () => {
        console.log('No asiste...');
        cita.incidencia = 'no asiste';
        cita.color = this.colorNoAsiste;
        this.citasService.actualizarCita(cita, cita._id).subscribe();
      } );

    this.renderer.listen( div, 'mouseover', () => {
        this.renderer.setStyle( div, 'background', '#343a40' );
        this.renderer.setStyle( div, 'z-index', '200' );
      } );

    this.renderer.listen( div, 'mouseleave', () => {
        this.renderer.setStyle( div, 'background', color );
        this.renderer.setStyle( popup, 'display', 'none' );
        this.renderer.setStyle( div, 'z-index', '1' );
      } );

    this.renderer.listen( editCita, 'click', () => {
        this.modalCitaService.mostrarModal(cita);

      } );
    this.renderer.listen( pacienteIcon, 'click', () => {
        this.router.navigate(['paciente', cita.pacienteId._id]);

      } );
    this.renderer.listen( borrarCita, 'click', () => {
        const titulo: string = ( cita.pacienteId ) ? cita.pacienteId.nombre : cita.evento;
        Swal.fire({
          title: '¿Esta seguro?',
          text: 'Esta a punto de borrar: ' + titulo,
          type: 'warning',
          confirmButtonText: 'Si, borrarlo!',
          showCancelButton: true
        })
        .then( borrar => {
          if (borrar.value) {

            this.citasService.eliminarCita( cita._id )
            .subscribe( resp => {
                  // Swal.fire({
                  //   type: 'success',
                  //   title: 'Eliminado',
                  //   text: 'Se a eliminado la cita',
                  //   timer: 2000
                  // });
                  this.limpiarCalendario();
                  this.cargarMedicos(this.diaSeleccionado);
                } );

          }
        });
      });

  }


  // Convertir los dias de las semana en milisegundos a formato de base de datos
  formatoDia(dia: Date) {

    const year = dia.getFullYear();
    const month = ( (dia.getMonth() + 1) <= 9 ) ? '0' + (dia.getMonth() + 1) : dia.getMonth() + 1;
    const date = ( dia.getDate() <= 9 ) ? '0' + dia.getDate() : dia.getDate();

    const fecha = `${year}/${month}/${date}`;

    return fecha;
  }

  duracionCita(inicio, final) {

    const minutosInicio = inicio.substr(3, 4);
    const horaInicio = inicio.substr(0, 2);
    const minutosFinal = final.substr(3, 4);
    const horaFinal = final.substr(0, 2);

    let duracion;

    if ( horaInicio === horaFinal ) {
        duracion = Number( minutosFinal ) - Number( minutosInicio );
    } else {
      const horas = (Number(horaFinal) - Number(horaInicio)) - 1;
      const sumarMinutes = horas * 60;
      if ( minutosInicio === '00' ) {
        duracion = 60 + Number( minutosFinal ) + sumarMinutes;
      } else {
        duracion = ( 60 - Number( minutosInicio ) ) + ( Number( minutosFinal ) ) + sumarMinutes;
      }
    }

    duracion = (duracion / 60) * 100;
    return duracion;
  }


}


