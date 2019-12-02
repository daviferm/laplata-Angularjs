import { Component, OnInit } from '@angular/core';
import { EmpleadosService } from '../../services/service.index';
import { Medico } from '../../models/medico.model';
import { Router } from '@angular/router';
import { InterceptorService } from '../../interceptors/interceptor.service';
import { WhatsappService } from '../../pages/whatsapp/whatsapp.service';


declare function init_pluying();

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent implements OnInit {

  empleado: Medico;
  sinConexion: boolean;
  fecha: Date;
  recordatorio: boolean;
  mensaje: string;
  horas: any;
  minutos: any;
  segundos: any;
  hours: string;
  minutes: string;
  seconds: any;

  constructor( public empleadoService: EmpleadosService,
               public interceptorService: InterceptorService,
               public whatsappService: WhatsappService,
               public router: Router ) {
  this.sinConexion = false;
  }

  ngOnInit() {


    init_pluying();
    this.fecha = new Date();

    this.horas = this.fecha.getHours();
    this.minutos = this.fecha.getMinutes();
    this.segundos = this.fecha.getSeconds();
    this.mostrarReloj();
    this.empleado = this.empleadoService.empleado;

    this.empleadoService.sinConexion.subscribe( resp => {
      if ( resp ) {
        this.sinConexion = resp;
      }
    } );
    this.recordatorio = this.whatsappService.whatsappSend;

  }
  verPerfil() {
    this.router.navigate([ '/perfil', 'actual' ]);
  }

  mostrarReloj() {
    setInterval( () => {
      this.segundos ++;
      while ( this.segundos === 60 ) {
        this.segundos = 0;
        this.minutos ++;
      }
      while ( this.minutos === 60 ) {
        this.minutos = 0;
        this.horas ++;
      }
      while ( this.horas === 24 ) {
        this.horas = 0;
      }
      this.segundos = ( this.segundos < 10 ) ? '0' + this.segundos : this.segundos;
      this.minutes = ( this.minutos < 10 ) ? '0' + this.minutos : this.minutos;
      this.hours = ( this.horas < 10 ) ? '0' + this.horas : this.horas;
    }, 1000);
  }

}
