import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';

import { timer, Subscription } from 'rxjs';
import { CitasService } from '../../../services/citas/citas.service';
import { GetDateService } from '../../../services/service.index';
import { EmpleadosService } from '../../../services/service.index';
import { Medico } from '../../../models/medico.model';
import Swal from 'sweetalert2';
import { ModalCitaService } from '../../../components/nueva-cita/modal-cita.service';
import { FestivosService } from '../../../services/festivos/festivos.service';
import { Router } from '@angular/router';




@Component({
  selector: 'app-semana',
  templateUrl: './semana.component.html',
  styleUrls: ['./semana.component.css']
})
export class SemanaComponent implements OnInit, OnDestroy {

  @ViewChild('dias') elementDias: ElementRef;
  @ViewChild('celdaSemana') elementSemana: ElementRef;
  delay = timer(100);
  cambioSub: Subscription;
  checkEmpl: Subscription;
  fecha: Date = new Date();
  @Input() diasSemana = [];
  @Input() diaSeleccionado: number;
  finSemana: any[] = [];
  @Output() verDia: EventEmitter<number>;
  semana: string[] = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIER', 'SAB'];
  finDeSemana: string[] = ['SAB', 'DOM'];

  public sinConexion = new EventEmitter<boolean>();

  calendar: any;
  columnaDia: any;
  celSemana: any;
  semanaDate: any;
  citasDB: any = null;
  citasSemana: any[] = [];
  fechas: string[] = [];
  fiestasLocales: any[] = [];

  horasDia: string[] = [];
  empleados: Medico[];
  // Mecicos activos para mostrar citas
  numMedicosActivos: number;
  medicosActivos: Medico[] = [];
  cargando: boolean = true;
  colorAnulada: string = '#d50000';
  colorNoAsiste: string = '#616161';


  constructor( public renderer: Renderer2,
               public citasService: CitasService,
               public dateService: GetDateService,
               public empleadosService: EmpleadosService,
               public modalCitaService: ModalCitaService,
               private festivosService: FestivosService,
               private router: Router ) {

    let horaInicio = 7;
    for (let i = 0; i < 16; i++) {

      const hora = (horaInicio < 10) ? `0${horaInicio}:00` : `${horaInicio}:00`;
      this.horasDia.push(hora);
      horaInicio ++;
    }
    this.verDia = new EventEmitter();
  }

  ngOnInit(): void {

    this.checkEmpl = this.empleadosService.checkmedicos.subscribe( (empleados: any) => {
      this.limpiarCalendario();
      this.obtenerCitasDB(empleados);
    } );

    this.cambioSub = this.dateService.eventCambioSemana.subscribe( resp => {
      if ( resp ) {
        this.delay.subscribe( () => {
          this.calendar = this.elementDias.nativeElement;
          this.limpiarCalendario();
          this.cargarMedicos();
          this.celSemana = this.elementSemana.nativeElement;
          this.agregarFestivos();
          this.mostrarFinSemana(this.diasSemana);
        } );
      }
    } );
    this.citasService.actualizarCitas.subscribe( resp => {
      if ( resp ) {
        this.limpiarCalendario();
        this.obtenerCitasDB(this.empleados);
      }
    } );

    this.delay.subscribe( () => {
      this.fiestasLocales = this.festivosService.festivos;
      this.celSemana = this.elementSemana.nativeElement;
      this.agregarFestivos();
    } );

    this.cargarMedicos();
    this.calendar = this.elementDias.nativeElement;

    this.mostrarFinSemana(this.diasSemana);
  }

  ngOnDestroy() {
    this.cambioSub.unsubscribe();
    this.checkEmpl.unsubscribe();
  }

  cargarMedicos() {
    this.empleadosService.cargarMedicos()
      .subscribe( medicos => {
        this.empleados = medicos;
        this.numMedicosActivos = medicos.length;
        this.obtenerCitasDB(this.empleados);
      }, err => {
        console.log(err);
        this.empleados = JSON.parse( localStorage.getItem( 'empleados-laplata' ) );
        this.numMedicosActivos = this.empleados.length;
        this.obtenerCitasDB(this.empleados);

      } );
  }
  // Mostrar dia selecionado
  mostrarDia(dia: number) {
    this.verDia.emit( dia );
  }
  // Nueva cita
  nuevaCita(event, dia, horaInicio) {

    if ( horaInicio !== '07:00' ) {

      const elemento = event.target.className;
      if ( elemento.startsWith('celdas') ) {
        const fecha = this.formatoDia(new Date(dia));
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
  // Convertir los dias de las semana en milisegundos a formato de base de datos
  formatoDia(dia: Date) {

    const year = dia.getFullYear();
    const month = ( (dia.getMonth() + 1) <= 9 ) ? '0' + (dia.getMonth() + 1) : dia.getMonth() + 1;
    const date = ( dia.getDate() <= 9 ) ? '0' + dia.getDate() : dia.getDate();

    const fecha = `${year}/${month}/${date}`;

    return fecha;
  }
  mostrarFinSemana(semana) {

    this.finSemana = [];

    this.finSemana.push(  new Date(semana[4]).setDate( new Date(semana[4]).getDate() + 1 ) );
    this.finSemana.push(  new Date(semana[4]).setDate( new Date(semana[4]).getDate() + 2 ) );


  }

  // Obtenemos las citas de la base de datos y los dias de la semana mostrados
  obtenerCitasDB(medicosActivos) {
    this.cargando = true;
    this.citasService.obtenerCitasDB()
      .subscribe( (resp: any) => {

        this.cargando = false;
        this.citasDB = resp.citas;
        this.fechas = this.getDiasSemana(this.diasSemana);

        this.citasSemana = this.mostrarCitasSemana(this.fechas, resp.citas, medicosActivos);

      }, err => {
        // Si hay no hay conexión con la base de datos las carga de localStorage
        this.citasDB = JSON.parse( localStorage.getItem( 'citas-laplata' ) ).citas;
        this.fechas = this.getDiasSemana(this.diasSemana);
        this.cargando = false;

        this.mostrarCitasSemana(this.fechas, this.citasDB, medicosActivos);

        console.error('Error al obtener citas de la base de datos');
      } );
  }

  // Convertir los dias de las semana en milisegundos a formato de base de datos
  getDiasSemana(dias) {

    const respuesta = [];

    dias.forEach( dia => {
      const year = new Date(dia).getFullYear();
      const month = ( (new Date(dia).getMonth() + 1) <= 9 ) ? '0' + (new Date(dia).getMonth() + 1) : new Date(dia).getMonth() + 1;
      const date = ( new Date(dia).getDate() <= 9 ) ? '0' + new Date(dia).getDate() : new Date(dia).getDate();

      const fecha = `${year}/${month}/${date}`;
      respuesta.push(fecha);
    });

    return respuesta;

  }
  // Mostrar las citas de la semana mostrada
  mostrarCitasSemana(semana, citas, medicos): any {
    this.medicosActivos = medicos.filter( medico => medico.check !== false );
    this.numMedicosActivos = this.medicosActivos.length;
    this.citasSemana = [];
    if ( this.medicosActivos.length <= 0 ) {
      return;
    }
    this.columnaDia = this.calendar.children;

    semana.forEach( elem => {

      citas.forEach( cita => {

        this.medicosActivos.forEach( medico => {

          if (cita.dia === elem && cita.medicoId._id === medico._id  ) {
            if ( cita.pacienteId ) {
              this.citasSemana.push(cita);
              this.agregarCita( this.columnaDia, cita );

            } else {
              this.citasService.eliminarCita( cita._id ).subscribe(res => console.log(res));
            }
          }
        } );
      } );
    });
    return this.citasSemana;

  }

  limpiarCalendario() {

    this.columnaDia = this.calendar.children;

    for ( const ref of this.columnaDia ) {
      for ( const refhora of ref.children ) {
        if ( refhora.children.length > 0 ) {
          for ( const nodo of refhora.children ) {
            this.renderer.removeChild( refhora, nodo );
          }
        }
      }
    }
  }
  agregarFestivos() {

    const semanaDate = this.celSemana.children;

    for ( const ref of semanaDate ) {
      const diaRef = ref.getAttribute('id').substr(5, 10);
      this.fiestasLocales.forEach( festivo => {
        if ( festivo.FECHA ) {
          const fiesta = festivo.FECHA.substr(5, 10);
          if ( diaRef === fiesta ) {

            if ( ref.children[2] ) {
              this.renderer.removeChild( ref, ref.children[2] );
            }
            // badge badge-danger span-festivo
            const div = this.renderer.createElement('div');
            const small = this.renderer.createElement( 'small' );
            const texto = this.renderer.createText( festivo.DSFIESTA );
            this.renderer.addClass( small, 'badge' );
            this.renderer.addClass( small, 'badge-danger' );
            this.renderer.addClass( small, 'span-festivo' );
            this.renderer.appendChild( ref, div );
            this.renderer.appendChild( small, texto );
            this.renderer.appendChild( div, small );
          }
        }
        if ( festivo.fecha_festivo ) {

          const fiestaLocal = festivo.fecha_festivo.substr(5, 10);
          if ( diaRef === fiestaLocal ) {
            const small = this.renderer.createElement( 'small' );
            const texto = this.renderer.createText( 'Fiesta Local' );
            this.renderer.addClass( small, 'badge' );
            this.renderer.addClass( small, 'badge-warning' );
            this.renderer.addClass( small, 'span-festivo' );
            this.renderer.appendChild( small, texto );
            this.renderer.appendChild( ref, small );
          }
        }
      } );
    }

  }

  agregarCita(columDia: any, cita: any) {

    const {  pacienteId, medicoId, dia, inicio, final, color, evento, _id } = cita;

    const inicioId = String(inicio).substr(0, 2);
    const comienzoCita = String(inicio).substr(3, 4);
    const duracion = this.duracionCita(inicio, final);

    for ( const ref of columDia ) {
      if ( ref.getAttribute('id') === dia ) {

        for ( const refhora of ref.children ) {

          if ( refhora.getAttribute('id') === inicioId ) {

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
                'width', ( 100 / this.numMedicosActivos ) - 1 + '%' );

            } else {
              this.renderer.setStyle( refhora.children[ refhora.children.length - 1 ], 'width', '100%' );
            }
            const indexCell = this.fechas.findIndex( fecha => fecha === dia);

            this.renderer.setStyle( refhora.children[ refhora.children.length - 1 ], 'height', duracion + '%' );

            this.renderer.setStyle( refhora.children[ refhora.children.length - 1 ], 'background', color );

            // Crear popup de edicion y borrado de la cita
            const popup = this.renderer.createElement('div');
            const divSuperior = this.renderer.createElement('div');
            const divInferior = this.renderer.createElement('div');
            this.renderer.addClass( divInferior, 'div-inferior' );
            this.renderer.addClass( divSuperior, 'div-superior' );
            this.renderer.addClass( popup, 'tooltips' );

            if ( indexCell < 2 ) {
              this.renderer.setStyle( popup, 'top', '0px' );
            } else if ( indexCell > 2 ) {
              this.renderer.setStyle( popup, 'top', '0px' );
              this.renderer.setStyle( popup, 'transform', 'translateX(-70%)');
            } else if  ( indexCell === 2 ) {
              this.renderer.setStyle( popup, 'top', '0px' );
            }
            if ( refhora.getAttribute('id') > 15 ) {
              this.renderer.setStyle( popup, 'top', '-142px' );
            } 
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
                        this.limpiarCalendario();
                        this.cargarMedicos();
                      } );

                }
              });
            });

          }
        }
      }
    }

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


