import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'date'
})
export class DatePipe implements PipeTransform {

  transform(value: number, option: number): number {

    let diaMes;
    if (option === 0) {
      diaMes = new Date(value).getDate();
    } else if (option === 1) {
      diaMes = new Date(value).getMonth();
    } else if (option === 2) {
      diaMes = new Date(value).getDay();
    } else if (option === 3) {

      const fecha = new Date(value);

      diaMes = this.formatoDia( fecha );

    } else {
      const hoy = new Date();
      if (new Date(value).getDate() === hoy.getDate() && new Date(value).getMonth() === hoy.getMonth()) {
        diaMes = -1;
      }
    }
    return diaMes;
  }


  // Convertir los dias de las semana en milisegundos a formato de base de datos
  formatoDia(dia: Date) {

    const year = dia.getFullYear();
    const month = ( (dia.getMonth() + 1) <= 9 ) ? '0' + (dia.getMonth() + 1) : dia.getMonth() + 1;
    const date = ( dia.getDate() <= 9 ) ? '0' + dia.getDate() : dia.getDate();

    const fecha = `${month}/${date}`;

    return fecha;
  }


}
