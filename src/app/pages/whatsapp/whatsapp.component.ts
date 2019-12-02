import { Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { timer } from 'rxjs';
import { WhatsappService } from './whatsapp.service';
import { CitasService } from '../../services/citas/citas.service';
import { EmpleadosService } from '../../services/service.index';
import { Medico } from '../../models/medico.model';


@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.css']
})
export class WhatsappComponent implements OnInit {

  @ViewChild('card') card: ElementRef;
  @ViewChild('btnleft') btnleft: ElementRef;

  fecha: Date;
  fechaRef: Date;
  diaHoy: string;
  totalCitas: number;
  citasDB: any;
  empleados: Medico[];
  delay = timer(100);
  delayAlert = timer(400);
  btnDisabled: boolean = true;
  whatsappSend: any;
  alertCitas: boolean = false;
  semana: string[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];


  constructor( private citasService: CitasService,
               private whatsappService: WhatsappService,
               private empleadosService: EmpleadosService,
               private renderer: Renderer2 ) {
  this.obtenerFecha();
  // this.enviarWhatsap();
  }

  ngOnInit() {
    this.fechaRef = new Date();

    if ( this.fechaRef.getDay() === 5 ) {
      this.fechaRef.setDate( this.fechaRef.getDate() + 3 );
    } else if (this.fechaRef.getDay() === 6) {
      this.fechaRef.setDate( this.fechaRef.getDate() + 2 );
    } else {
      this.fechaRef.setDate( this.fechaRef.getDate() + 1 );
    }

    this.empleados = this.empleadosService.empleados;
    this.delay.subscribe( () => {

      this.limpiarCitas();
      this.enviarWhatsap();
    });
  }

  obtenerFecha() {
    this.fecha = new Date();

    if ( this.fecha.getDay() === 5 ) {
      this.fecha.setDate( this.fecha.getDate() + 3 );
    } else if (this.fecha.getDay() === 6) {
      this.fecha.setDate( this.fecha.getDate() + 2 );
    } else {
      this.fecha.setDate( this.fecha.getDate() + 1 );
    }

    return this.fecha;
  }
  cambiarDia(num: number) {
    if ( num > 0 ) {
      this.fecha.setDate( this.fecha.getDate() + 1 );
      this.btnDisabled = false;

    } else {
      this.fecha.setDate( this.fecha.getDate() - 1 );
      this.btnDisabled = ( this.fecha.getDate() === this.fechaRef.getDate() ) ? true : false;

    }
    this.limpiarCitas();
    this.enviarWhatsap();
  }

  comprobarStorage() {
    if ( localStorage.getItem( 'checked' ) ) {
      this.whatsappSend = JSON.parse( localStorage.getItem( 'checked' ) );
    }
  }
  guardarStorage() {

    if ( this.citasDB.length > 0 ) {
      this.whatsappSend = {dia: this.diaHoy, checked: []};
      this.citasDB.forEach( el => this.whatsappSend.checked.push( {check: false} ) );
      this.delay.subscribe( () => {
        localStorage.setItem( 'checked', JSON.stringify( this.whatsappSend ) );
      });
    } else {
      this.alertCitas = true;
      this.whatsappService.whatsappSend = true;
    }
  }


  enviarWhatsap(fecha?) {
    this.alertCitas = false;

    this.diaHoy = this.formatoDia( this.fecha );

    this.citasService.getCitaPorDia(this.diaHoy)
        .subscribe( resp => {
          this.citasDB = resp;
          if ( this.citasDB.length <= 0 ) {

            this.whatsappService.whatsappSend = true;
          }

          this.totalCitas = this.citasDB.length;
          this.comprobarChecked();

          const citasOrdenadas = [];
          this.empleados.forEach( medico => {
            this.citasDB.forEach( cita => {
              if ( medico.nombre === cita.medicoId.nombre ) {
                citasOrdenadas.push( cita );
              }
            } );
          } );

          this.delay.subscribe( () => {
            let idx = 0;
            // tslint:disable-next-line: prefer-for-of
            for ( let i = 0; i < this.card.nativeElement.children.length; i++ ) {
              if ( i > 0 ) {

                const tabla = this.card.nativeElement.children[i];
                // tslint:disable-next-line: prefer-for-of
                for ( let y = 0; y < tabla.children.length; y++ ) {
                  if ( y > 0 ) {
                    if ( tabla.children[y].children.length > 0 ) {
                      for ( const ref of tabla.children[y].children ) {
                        // tslint:disable-next-line: max-line-length
                        const mensaje = `Buenos días. Le recordamos su cita el próximo día ${citasOrdenadas[idx].dia.substr( citasOrdenadas[idx].dia.length - 2, citasOrdenadas[idx].dia.length )} a las ${citasOrdenadas[idx].inicio}h en Fisioterapia Alicia de la Plata. Por favor, confirme su asistencia. Gracias.`;

                        const link = `whatsapp://send?phone=34${citasOrdenadas[idx].pacienteId.telefono}&text=${mensaje}`;
                        const elemento = ref.firstChild.children[1].firstChild.lastChild.firstChild.firstChild;
                        this.renderer.setAttribute( elemento, 'href', link );
                        idx ++;
                      }
                    } else {
                      // const divMedico = this.renderer.parentNode( tabla.children[y] );
                    }
                  }
                }
              }
            }
            this.insertarMensajesAlert();
          });
        } );
  }

  insertarMensajesAlert() {
    const tarjeta = this.card.nativeElement;
    let medicoIdx = 0;

    // tslint:disable-next-line: prefer-for-of
    for ( let i = 0; i < tarjeta.children.length; i++ ) {
      if ( i > 0 ) {
        if ( this.citasDB.length > 0 ) {

          if ( this.citasDB.filter( cita => cita.medicoId.nombre === this.empleados[medicoIdx].nombre ).length <= 0 ) {
            // Añadir mensaje a este elemento
            const elemento = this.card.nativeElement.children[medicoIdx + 1];
            const nombre = this.empleados[medicoIdx].nombre;

            this.insertarMensaje(elemento, nombre);
          }
          medicoIdx ++;
        }
      }
    }
  }
  insertarMensaje( elem, nombre ) {

    // const nombreFisio = divMedico.textContent.split(' ');
    const alert = this.renderer.createElement('div');
    this.renderer.addClass( alert, 'alert' );
    this.renderer.addClass( alert, 'alert-info' );
    this.renderer.addClass( alert, 'text-center' );
    this.renderer.addClass( alert, 'col-md-12' );
    this.renderer.setAttribute( alert, 'role', 'alert' );
    const strong = this.renderer.createElement('strong');
    const text = this.renderer.createText(nombre + ' no tiene citas pendientes');
    this.renderer.appendChild( strong, text );
    this.renderer.appendChild( alert, strong );
    this.renderer.appendChild( elem, alert );

  }

  limpiarCitas() {

    const card = this.card.nativeElement;
    // tslint:disable-next-line: prefer-for-of
    for ( let i = 0; i < card.children.length; i++ ) {
      if ( i > 0 ) {
        const tabla = card.children[i];
        // tslint:disable-next-line: prefer-for-of
        for ( let y = 0; y < tabla.children.length; y++ ) {

          if ( y > 0 ) {
            this.renderer.removeChild( tabla, tabla.children[y] );
          }
        }
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

  checkedSms(idx: number) {
    this.whatsappSend.checked[idx].check = true;
    localStorage.setItem( 'checked', JSON.stringify( this.whatsappSend ) );

    this.whatsappService.vericarCheck( this.whatsappSend );

  }

  comprobarChecked() {

    if ( localStorage.getItem( 'checked' ) ) {

      this.whatsappSend = JSON.parse( localStorage.getItem( 'checked' ) );

      if ( this.whatsappSend.checked.length < this.citasDB.length ) {
        const diferencia = this.citasDB.length - this.whatsappSend.checked.length;
        for ( let i = 0; i < diferencia; i++ ) {
          this.whatsappSend.checked.push(  {check: false} );
        }
      }

      this.whatsappService.vericarCheck( this.whatsappSend );

      if ( this.whatsappSend.dia === this.diaHoy ) {
        return;
      } else {
        this.guardarStorage();
      }
    } else {
      this.guardarStorage();
    }
  }
}
