import { Injectable, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CambiarPasswordService {

  @ViewChild('input') input: ElementRef;

  oculto: string = 'oculto';

  constructor( ) { }

  ocultarModal() {
    this.oculto = 'oculto';
  }
  mostrarModal() {
    this.oculto = '';
    // console.log(this.input.nativeElement);
  }


}
