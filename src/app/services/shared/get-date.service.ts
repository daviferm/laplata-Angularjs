import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetDateService {

  public eventCambioSemana = new EventEmitter<boolean>();
  public eventCambioDia = new EventEmitter<any>();
  public eventHoyMes = new EventEmitter<Date>();


  hoy: Date = new Date();
  diasSemana = [];
  inicioSemana: any;
  diasMenos: number;
  numeroColum: number = 5;
  diaSeleccionado: number;
  getMes: string;
  getYear: number;
  paginaActiva: string;
  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];


  constructor() { }


  getSemana( fecha ): Respuesta {

    this.diaSeleccionado = fecha.getDate();

    this.diasMenos = fecha.getDay() === 0 ? 6 : fecha.getDay() - 1;

    this.inicioSemana = new Date(fecha.getTime()).setDate(fecha.getDate() - this.diasMenos);

    const resp = {
      semana: this.getDiasSemana( this.inicioSemana, this.numeroColum ),
      diaSelected: this.diaSeleccionado,
      nombreMes: this.meses[ fecha.getMonth() ],
      year: fecha.getFullYear()

    };
    this.eventCambioSemana.emit( true );

    return resp;

  }

  // Obtener un arregle con los dias de la semana a mostrar
  getDiasSemana(inicio, colum): any {
    this.diasSemana = [];

    for (let i = 0; i < colum; i++) {

      const siguienteDia = new Date(inicio).setDate( new Date(inicio).getDate() + i );

      this.diasSemana.push(siguienteDia);
    }
    this.inicioSemana = inicio;

    return this.diasSemana;

  }

  // Función para sumar o restar un semana en función del parámetro recibido
  cambiarSemana(param: number): Respuesta {

    let nuevoInicio;
    if ( param > 0 ) {
      nuevoInicio = new Date(this.inicioSemana).setDate( new Date(this.inicioSemana).getDate() + 7 );
    } else {
      nuevoInicio = new Date(this.inicioSemana).setDate( new Date(this.inicioSemana).getDate() - 7 );
    }

    this.inicioSemana = nuevoInicio;

    const respuesta = {
      semana: this.getDiasSemana( nuevoInicio, this.numeroColum ),
      diaSelected: new Date(nuevoInicio).getDate(),
      nombreMes: this.meses[new Date(this.inicioSemana).getMonth()],
      year: new Date(this.inicioSemana).getFullYear()
    };
    this.eventCambioSemana.emit( true );

    return respuesta;

  }
  mostrarHoy() {
    const fechaHoy = new Date();

    this.eventHoyMes.emit( fechaHoy );

  }

  cambiarDia(param: number, fecha: Date ) {
    let nuevoDia;
    if ( param > 0) {
      nuevoDia = fecha.setDate( fecha.getDate() + 1 );
    } else {
      nuevoDia = fecha.setDate( fecha.getDate() - 1 );
    }
    const respuesta = {
      date: nuevoDia,
      diaSelected: new Date(nuevoDia).getDate(),
      nombreMes: this.meses[ new Date(nuevoDia).getMonth() ],
      year: new Date(nuevoDia).getFullYear()
    };

    this.eventCambioDia.emit(respuesta);

    return respuesta;

  }

  cambiarMes(param: number, fecha: Date) {

    let nuevoDia;
    if ( param > 0 ) {
      nuevoDia = fecha.setMonth( fecha.getMonth() + 1 );
    } else {
      nuevoDia = fecha.setMonth( fecha.getMonth() - 1 );
    }
    const respuesta = {
      date: nuevoDia,
      diaSelected: new Date(nuevoDia).getDate(),
      nombreMes: this.meses[ new Date(nuevoDia).getMonth() ],
      year: new Date(nuevoDia).getFullYear()
    };
    this.eventCambioDia.emit(respuesta);

    return respuesta;
  }

}

interface Respuesta {
  semana: number[];
  diaSelected: number;
  nombreMes: string;
  year: number;
}
