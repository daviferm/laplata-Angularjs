import { Component, OnInit, Output, OnDestroy, ViewChild, ElementRef, Renderer2, EventEmitter } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { GetDateService } from '../../../services/shared/get-date.service';
import { CitasService } from '../../../services/citas/citas.service';
import { CitaDB } from '../../../models/citaDB.model';
import { EmpleadosService } from '../../../services/service.index';
import { Medico } from '../../../models/medico.model';
import { FestivosService } from '../../../services/service.index';


@Component({
  selector: 'app-mes',
  templateUrl: './mes.component.html',
  styleUrls: ['./mes.component.css']
})
export class MesComponent implements OnInit, OnDestroy {

  @ViewChild('calendar') calendar: ElementRef;
  @Output() diaSeleccionado: EventEmitter<number>;


  cambioMesSub: Subscription;
  eventoHoy: Subscription;
  fecha: Date;
  yearActual: number;
  diasSemana: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  diasMes: any[] = [];
  numeroMes: number;
  mesActual: string;
  citasDB: CitaDB[];
  citasMes: any[];
  formatMes: string;
  empleados: Medico[];
  delay = timer(100);
  festivos: any;


  constructor( private dateService: GetDateService,
               private citasService: CitasService,
               private empleadosService: EmpleadosService,
               private festivosService: FestivosService,
               private renderer: Renderer2 ) {
    this.fecha = new Date();
    this.yearActual = this.fecha.getFullYear();
    this.diaSeleccionado = new EventEmitter();
  }

  ngOnInit() {
    this.festivos = this.festivosService.festivos;

    this.empleadosService.cargarMedicos().subscribe( resp => {
      this.empleados = resp;
    } );

    this.formatMes = this.citasService.formatoDia( this.fecha );

    this.citasService.obtenerCitasDB().subscribe( resp => {
      this.citasDB = resp.citas;
      // Se obtienen las citas del mes actual
      this.citasMes = this.getCitasMes();
      // Mostrar las citas del mes actual
      this.delay.subscribe( () => this.mostrarCitasMes() );
    } );

    this.cambioMesSub = this.dateService.eventCambioDia.subscribe( resp => {
      const nuevaFecha = new Date(resp.date);
      this.formatMes = this.citasService.formatoDia( nuevaFecha );
      this.getCalendar(nuevaFecha);
      // Se obtienen las citas del mes actual
      this.citasMes = this.getCitasMes();
      // Mostrar las citas del mes actual
      this.borrarVista();
      this.delay.subscribe( () => {
        this.mostrarCitasMes();
      } );

    } );

    this.eventoHoy = this.dateService.eventHoyMes.subscribe( resp => {
      this.formatMes = this.citasService.formatoDia( resp );
      this.getCalendar( resp );
      this.citasMes = this.getCitasMes();
      // Mostrar las citas del mes actual
      this.delay.subscribe( () => this.mostrarCitasMes() );
    });

    this.getCalendar(this.fecha);
  }

  ngOnDestroy() {
    this.cambioMesSub.unsubscribe();
    this.eventoHoy.unsubscribe();
  }

  getCitasMes() {
    const vistaMes = this.formatMes.slice(0, 7);
    const citas = this.citasDB.filter( cita => cita.dia.startsWith(vistaMes) );
    return citas;

  }

  borrarVista() {
    for ( const ref of this.calendar.nativeElement.children ) {
     if ( ref.children.length > 1 ) {
       for ( let i = 0; i < ref.children.length; i++ ) {
         if ( i > 0 ) {
            this.renderer.removeChild( ref, ref.children[i] );
        }
      }
     }
    }
  }

  mostrarCitasMes() {
    for ( const ref of this.calendar.nativeElement.children ) {

      this.comprobarFestivos(ref);

      this.empleados.forEach( fisio => {
        const citasMedico = this.citasMes.filter( cita => cita.dia === ref.getAttribute('id') && cita.medicoId._id === fisio._id );
        if ( citasMedico.length > 0 ) {

          // Insertar nombre del Fisio y número de citas
          this.insertarSmall(ref, fisio, citasMedico.length);
        }
      } );
    }
  }
  insertarSmall(el: any, fisio: Medico, num: number) {

    const div = this.renderer.createElement('div');
    this.renderer.addClass( div, 'btn' );
    this.renderer.addClass( div, 'btn-small' );
    this.renderer.setStyle( div, 'background', fisio.color );
    const medico = this.renderer.createText( fisio.nombre );
    const span = this.renderer.createElement('span');
    this.renderer.addClass( span, 'badge' );
    this.renderer.addClass( span, 'badge-light' );
    this.renderer.addClass( span, 'badge-number' );
    // this.renderer.addClass( span, 'font-10' );
    // this.renderer.addClass( span, 'ml-4' );
    const numero = this.renderer.createText( String(num) );

    this.renderer.appendChild( span, numero );
    this.renderer.appendChild( div, medico );
    this.renderer.appendChild( div, span );
    this.renderer.appendChild( el, div );

  }

  getCalendar(fecha: Date) {

    this.diasMes = [];

    this.numeroMes = fecha.getMonth();

    this.mesActual = this.meses[fecha.getMonth()];

    // Dia uno del mes en milisegundos
    const fechaInicio = new Date(fecha.setDate(1));

    // Establecemos el número de dias que hay que restar según en que dia de la semana caiga el dia uno
    const diasSemana = fechaInicio.getDay() === 0 ? 7 : fechaInicio.getDay();

    let inicio = fechaInicio.setDate(1 - diasSemana);

    let celdas;
    if ( diasSemana >= 6) {
      celdas = 42;
    } else {
      celdas = 35;
    }

    for (let i = 0; i < celdas; i++) {
      const siguienteDia = new Date(inicio).setDate( new Date(inicio).getDate() + 1 );
      inicio = siguienteDia;

      this.diasMes.push( inicio );
    }
  }

  getDia( dia: number ) {
    this.diaSeleccionado.emit( dia );
  }

  comprobarFestivos( ref: any ) {
    // console.log(ref.getAttribute('id'));
    const id = ref.getAttribute('id');
    this.festivos.forEach( fiesta => {
      if ( id === fiesta.FECHA ) {
        this.insertarFiesta(ref, fiesta.DSFIESTA, false);
      }
      if ( id === fiesta.fecha_festivo ) {
        this.insertarFiesta(ref, 'Fiesta Local', true);
      }
    } );
  }

  insertarFiesta(ref: any, fiesta, local: boolean) {

    const color = local ? 'rgba(218, 142, 61, 0.6)' : 'rgba(226, 95, 54, .8)';

    this.renderer.setStyle( ref, 'background', color );
    const div = this.renderer.createElement('div');
    const p = this.renderer.createElement('p');
    const texto = this.renderer.createText( fiesta );
    this.renderer.addClass( div, 'text-festivo' );

    this.renderer.appendChild( p, texto );
    this.renderer.appendChild( div, p );
    this.renderer.appendChild( ref, div );

  }

}
