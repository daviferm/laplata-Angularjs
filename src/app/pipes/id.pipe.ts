import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'id'
})
export class IdPipe implements PipeTransform {


  transform(value: any, idx?: number): string {

    const fecha = new Date(value);

    const year = fecha.getFullYear();
    const mes = ((fecha.getMonth() + 1) <= 9) ? '0' + (fecha.getMonth() + 1) : fecha.getMonth() + 1;

    const dia = (fecha.getDate() <= 9) ? '0' + fecha.getDate() : fecha.getDate();



    let hora;

    if ( idx ) {

      switch (idx) {
        case(0):
        hora = '07';
        break;
        case(1):
        hora = '08';
        break;
        case(2):
        hora = '09';
        break;
        case(3):
        hora = '10';
        break;
        case(4):
        hora = '11';
        break;
        case(5):
        hora = '12';
        break;
        case(6):
        hora = '13';
        break;
        case(7):
        hora = '14';
        break;
        case(8):
        hora = '15';
        break;
        case(9):
        hora = '16';
        break;
        case(10):
        hora = '17';
        break;
        case(11):
        hora = '18';
        break;
        case(12):
        hora = '19';
        break;
        case(13):
        hora = '20';
        break;
        case(14):
        hora = '21';
        break;
        case(15):
        hora = '22';
        break;
        case(16):
        hora = '23';
        break;
        default:
          hora = '';
      }
    }
    const respuesta = ( !idx ) ? `${year}/${mes}/${dia}` : `${hora}`;


    return respuesta;
  }

}
