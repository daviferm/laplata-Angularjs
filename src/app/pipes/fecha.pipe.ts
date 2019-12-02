import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fecha'
})
export class FechaPipe implements PipeTransform {

  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];


  transform(value: any): string {

    const fecha = value.split('-');
    const dia = fecha[2];
    const mes = this.meses[Number(fecha[1])-1];
    const year = fecha[0];

    return (value === '') ? '' : `${dia}-${mes}-${year}`;
  }

}
