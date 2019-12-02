import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class FestivosService {

  fiestas: any[] = [];
  festivos = [
    { 'DSFIESTA': 'Año Nuevo', 'FECHA': '2019/01/01', 'año': 2019 },
    { 'DSFIESTA': 'traslado de la Epifanía del Señor', 'FECHA': '2019/01/07', 'año': 2019 },
    { 'DSFIESTA': 'Jueves Santo', 'FECHA': '2019/04/18', 'año': 2019 },
    { 'DSFIESTA': 'Viernes Santo', 'FECHA': '2019/04/19', 'año': 2019 },
    { 'DSFIESTA': 'Fiesta del Trabajo', 'FECHA': '2019/05/01', 'año': 2019 },
    { 'DSFIESTA': 'Fiesta de la Comunidad de Madrid', 'FECHA': '2019/05/02', 'año': 2019 },
    { 'DSFIESTA': 'Asunción de la Virgen', 'FECHA': '2019/08/15', 'año': 2019 },
    { 'DSFIESTA': 'Fiesta Nacional de España', 'FECHA': '2019/10/12', 'año': 2019 },
    { 'DSFIESTA': 'Todos los Santos', 'FECHA': '2019/11/01', 'año': 2019 },
    { 'DSFIESTA': 'Día de la Constitución Española', 'FECHA': '2019/12/06', 'año': 2019 },
    { 'DSFIESTA': 'traslado Inmaculada Concepción', 'FECHA': '2019/12/09', 'año': 2019 },
    { 'DSFIESTA': 'Natividad del Señor', 'FECHA': '2019/12/25', 'año': 2019 },
    {
      'municipio_codigo': '161',
      'entidad_codigo': '00',
      'municipio_nombre': 'Valdemoro',
      'año': 2019,
      'entidad_nombre': 'Valdemoro',
      'fecha_festivo': '2019/05/06'
    },
    {
      'municipio_codigo': '161',
      'entidad_codigo': '00',
      'municipio_nombre': 'Valdemoro',
      'año': 2019,
      'entidad_nombre': 'Valdemoro',
      'fecha_festivo': '2019/09/09'
    },
    { 'DSFIESTA': 'Año Nuevo', 'FECHA': '2020/01/01', 'año': 2020 },
    { 'DSFIESTA': 'Epifanía del Señor', 'FECHA': '2020/01/06', 'año': 2020 },
    { 'DSFIESTA': 'Fiesta del Trabajo', 'FECHA': '2020/05/01', 'año': 2020 },
    { 'DSFIESTA': 'Fiesta de la Comunidad de Madrid', 'FECHA': '2020/05/02', 'año': 2020 },
    { 'DSFIESTA': 'Asunción de la Virgen', 'FECHA': '2020/08/15', 'año': 2020 },
    { 'DSFIESTA': 'Fiesta Nacional de España', 'FECHA': '2019/10/12', 'año': 2020 },
    { 'DSFIESTA': 'Todos los Santos', 'FECHA': '2020/11/01', 'año': 2020 },
    { 'DSFIESTA': 'Día de la Constitución Española', 'FECHA': '2020/12/06', 'año': 2020 },
    { 'DSFIESTA': 'traslado Inmaculada Concepción', 'FECHA': '2020/12/09', 'año': 2020 },
    { 'DSFIESTA': 'Natividad del Señor', 'FECHA': '2020/12/25', 'año': 2020 },
    {
      'municipio_codigo': '161',
      'entidad_codigo': '00',
      'municipio_nombre': 'Valdemoro',
      'año': 2020,
      'entidad_nombre': 'Valdemoro',
      'fecha_festivo': '2020/05/06'
    },
    {
      'municipio_codigo': '161',
      'entidad_codigo': '00',
      'municipio_nombre': 'Valdemoro',
      'año': 2020,
      'entidad_nombre': 'Valdemoro',
      'fecha_festivo': '2020/09/09'
    },
  ];


  constructor( private http: HttpClient ) {

   }

  public fiestasLocales = new EventEmitter<any>();
  public cambioDia = new EventEmitter<string>();


  festifosRegionales() {

    // tslint:disable-next-line: max-line-length
    const url = '/catalogo/dataset/2f422c9b-47df-407f-902d-4a2f44dd435e/resource/453162e0-bd61-4f52-8699-7ed5f33168f6/download/festivos_regionales.json';

    return this.http.get( url )
        .pipe( map( (resp: any) => {

          this.fiestas = resp.data;
          return resp.data;
        } ) );
  }
  festivosLocales() {

    // tslint:disable-next-line: max-line-length
    const url = '/catalogo/dataset/2f422c9b-47df-407f-902d-4a2f44dd435e/resource/580121e4-d11c-45bb-9075-014f7beee29b/download/festivos_locales.json';

    return this.http.get( url )
        .pipe( map( (resp: any) => {

          const data = resp.data;
          const valdemoro = data.filter( fest => fest.municipio_nombre === 'Valdemoro' );

          valdemoro.forEach( elem => {
            this.fiestas.push(elem);
          } );
          console.log(this.fiestas);

          this.fiestasLocales.emit( this.fiestas );
          return valdemoro;
        } ) );

  }

  cambiarDia(fecha) {
    this.cambioDia.emit( fecha );
  }
}
