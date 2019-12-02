import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { FestivosService } from '../../services/festivos/festivos.service';
import { timer } from 'rxjs';



@Component({
  selector: 'app-minicalendar',
  templateUrl: './mini-calendar.component.html',
  styleUrls: ['./mini-calendar.component.css']
})
export class MinicalendarComponent implements OnInit {

  @ViewChild('calendar') calendar: ElementRef;

  fecha: Date;
  diasSemana: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  diasMes: any[] = [];
  mesActual: any;
  yearActual: number;
  numeroMes: number;
  diaSelected: Date;
  isOpen: boolean;
  fechaActual = new Date();
  pageWitch: any;
  mostrarMes: boolean = true;
  fiestas: any[] = [];
  delay = timer(100);

  constructor( private router: Router,
               private fiestasService: FestivosService,
               private renderer: Renderer2 ) {
    this.diaSelected = new Date();
    this.fecha = new Date();

    this.mesActual = this.meses[this.fecha.getMonth()];
    this.yearActual = this.fecha.getFullYear();


    this.getCalendar();
  }

  ngOnInit() {

    this.fiestas = this.fiestasService.festivos;
    this.mostrarFestivos();

  }

  sumarMes() {

    const mesAct = this.fechaActual.getMonth();
    this.fecha = new Date(this.fechaActual.setMonth(mesAct + 1));

    this.mesActual = this.meses[this.fecha.getMonth()];
    this.yearActual = this.fecha.getFullYear();
    this.getCalendar();
    this.delay.subscribe( () => this.mostrarFestivos());
  }
  restarMes() {

    const mesAct = this.fechaActual.getMonth();
    this.fecha = new Date(this.fechaActual.setMonth(mesAct - 1));

    this.mesActual = this.meses[this.fecha.getMonth()];
    this.yearActual = this.fecha.getFullYear();
    this.getCalendar();
    this.delay.subscribe( () => this.mostrarFestivos());
  }

  getCalendar() {

    this.diasMes = [];

    this.numeroMes = this.fecha.getMonth();

    this.mesActual = this.meses[this.fecha.getMonth()];

    // Dia uno del mes en milisegundos
    const fechaInicio = new Date(this.fecha.setDate(1));

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

  verSemana(fecha) {

    this.diaSelected = new Date(fecha);

    const diaSeleccionado = this.diaSelected.getDate();
    this.mesActual = this.meses[this.diaSelected.getMonth()];
    this.yearActual = this.diaSelected.getFullYear();

    this.router.navigate( ['/calendario', diaSeleccionado, this.diaSelected.getMonth(), this.yearActual] );

    this.fiestasService.cambiarDia(fecha);

    return this.diaSelected;
  }

  mostrarFestivos() {
    const calendario = this.calendar.nativeElement;
    for ( const elem of calendario.children ) {

      this.fiestas.forEach( festivo => {
          if ( festivo.FECHA === elem.firstChild.getAttribute('id') ) {
            this.renderer.addClass( elem.firstChild, 'festivo' );
          }
          if ( festivo.fecha_festivo === elem.firstChild.getAttribute('id') ) {
            this.renderer.addClass( elem.firstChild, 'festivo' );
          }
      } );
    }
  }

}
