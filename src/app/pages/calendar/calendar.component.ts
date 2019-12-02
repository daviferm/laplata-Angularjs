import { Component, OnInit, ViewChild, ElementRef, Renderer2, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';
import { GetDateService } from '../../services/service.index';
import { CitasService } from '../../services/citas/citas.service';
import { FestivosService } from '../../services/festivos/festivos.service';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  animations: [
    trigger('openClose', [
      state('open', style({
        opacity: 0
      })),
      state('closed', style({
        opacity: 1
      })),
      transition('open => closed', [
       animate( 800 ),
      transition('closed => open', [
        animate( 20 )
      ])
     ]),
    ]),
  ],
})
export class CalendarComponent implements OnInit {

  @ViewChild('mes') btnMes: ElementRef;
  @ViewChild('semana') btnSemana: ElementRef;
  @ViewChild('dia') btnDia: ElementRef;
  @ViewChild('botones') botones: ElementRef;

  fecha: Date;
  getCalendar: string = 'semana';
  diasSemana = [];
  diaSeleccionado: number;
  getMes: string;
  getYear: number;
  isOpen: boolean = true;
  delay = timer(100);
  citasBD: any;
  pageActive: string;
  mesActual: Date = new Date();


  constructor( private router: Router,
               private renderer: Renderer2,
               private activatedRoute: ActivatedRoute,
               public dateService: GetDateService,
               public citasService: CitasService,
               private festivosService: FestivosService ) {

    this.activatedRoute.params.subscribe( params => {
      // tslint:disable-next-line: no-string-literal
      if (params['dia'] === 'undefined') {
        this.fecha = new Date();
      } else {
        // tslint:disable-next-line: no-string-literal
        this.fecha = new Date(params['year'], params['mes'], params['dia']);

        const resp = this.dateService.getSemana( this.fecha );
        this.mostraDatos( resp );

        this.diasSemana = resp.semana;
        this.diaSeleccionado = resp.diaSelected;
      }

    });

  }
  guardarStorage(page: string) {
    localStorage.setItem( 'pageActive', page );
  }

  ngOnInit() {
    const respuesta = this.dateService.getSemana( this.fecha );

    this.mostraDatos( respuesta );


    if ( localStorage.getItem( 'pageActive' ) ) {

      this.pageActive = localStorage.getItem( 'pageActive' );
    } else {
      this.pageActive = 'semana';
    }
    this.cambiarActive( this.pageActive );

    this.guardarStorage( this.pageActive );
  }


  cambiarActive(boton) {
    if ( boton === 'mes' ) {
      this.removerClass( this.btnMes );
      this.getCalendar = 'mes';
      this.pageActive = 'mes';
      this.guardarStorage( this.pageActive );
      this.mesActual = new Date();
    } else if ( boton === 'semana' ) {
      this.removerClass( this.btnSemana );
      this.getCalendar = 'semana';
      this.pageActive = 'semana';

      const resp = this.dateService.getSemana( this.fecha );
      this.diasSemana = resp.semana;
      this.diaSeleccionado = resp.diaSelected;
      this.mostraDatos( resp );
      this.guardarStorage( this.pageActive );
    } else if ( boton === 'dia' ) {
      this.removerClass( this.btnDia );
      this.getCalendar = 'dia';
      this.pageActive = 'dia';
      this.guardarStorage( this.pageActive );
    }
  }
  mostrarDia(dia: number) {
    this.fecha = new Date(dia);
    this.cambiarActive('dia');

    // Mostrar datos de la fecha seleccionada
    this.diaSeleccionado = this.fecha.getDate();

    this.getMes = this.dateService.meses[ this.fecha.getMonth() ];
    this.getYear = this.fecha.getFullYear();
  }
  removerClass( elem: any ): void {
    // tslint:disable-next-line: prefer-for-of
    for ( let i = 0; i < this.botones.nativeElement.children.length; i++ ) {

      this.renderer.removeClass( this.botones.nativeElement.children[i], 'active' );
    }
    this.renderer.addClass( elem.nativeElement , 'active' );
  }

  cambiarVista(param: number): void {

    this.pageActive = ( localStorage.getItem('pageActive') ) ? localStorage.getItem('pageActive') : 'semana';
    let resp;
    switch (this.pageActive) {
      case 'semana':
        resp = this.dateService.cambiarSemana( param );
        this.mostraDatos(resp);
        break;
      case 'dia':
        resp = this.dateService.cambiarDia( param, this.fecha );
        this.mostraDatos(resp);
        this.fecha = new Date(resp.date);
        break;
      case 'mes':
        resp = this.dateService.cambiarMes( param, this.mesActual );
        this.mostrarDatosMes(resp);
    }

  }

  mostrarHoy() {

    if ( this.pageActive === 'mes' ) {
      this.dateService.mostrarHoy();
      this.mesActual = new Date();
    }
    const diaHoy = new Date();
    const resp = this.dateService.getSemana( diaHoy );

    this.mostraDatos( resp );
    this.router.navigate(['calendario', 'undefined', 'undefined', 'undefined']);
  }

  mostraDatos(resp: any) {

    this.diaSeleccionado = resp.diaSelected;
    this.diasSemana = resp.semana;

    this.getMes = resp.nombreMes;
    this.getYear = resp.year;

  }
  mostrarDatosMes(resp: any) {

    this.getMes = resp.nombreMes;
    this.getYear = resp.year;
  }

}
