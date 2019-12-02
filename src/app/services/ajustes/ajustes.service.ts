import { Injectable, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';


@Injectable({
  providedIn: 'root'
})
export class AjustesService implements OnInit {


  ajustes: Ajustes = {
    temaUrl: 'assets/css/colors/default.css',
    tema: 'default'
  };
  colorCalendar: Ajustes = {
    temaUrl: 'assets/css/calendar/font-black.css',
    tema: 'font-black'
  };

  // tslint:disable-next-line: deprecation
  constructor( @Inject(DOCUMENT) private document ) {
    this.cargarAjustes();
  }

  ngOnInit() {
   }

  guardarAjustes() {
    localStorage.setItem('ajustes', JSON.stringify( this.ajustes ));
  }

  cargarAjustes() {
    if ( localStorage.getItem('ajustes') ) {
      this.ajustes = JSON.parse( localStorage.getItem('ajustes') );
      this.aplicarTema( this.ajustes.tema );
    } else {
      this.aplicarTema( this.ajustes.tema );

    }
  }

  aplicarTema( tema: string ) {
    let calendarUrl;

    const url = `assets/css/colors/${tema}.css`;
    this.document.getElementById('tema').setAttribute('href', url );

    if ( tema.endsWith('dark') ) {
      calendarUrl = `assets/css/calendar/font-white.css`;
      this.colorCalendar.tema = 'font-white';
    } else {
      calendarUrl = `assets/css/calendar/font-black.css`;
      this.colorCalendar.tema = 'font-black';
    }
    this.document.getElementById('calendar').setAttribute('href', calendarUrl );

    this.ajustes.temaUrl = url;
    this.ajustes.tema = tema;
    this.colorCalendar.temaUrl = calendarUrl;

    this.guardarAjustes();

  }

}

interface Ajustes {
  temaUrl: string;
  tema: string;
}
