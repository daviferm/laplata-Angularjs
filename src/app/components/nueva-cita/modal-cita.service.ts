import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalCitaService {


  oculto: string = 'oculto';

  public notificacion = new EventEmitter<boolean>();
  public formulario = new EventEmitter<any>();


  constructor() {

  }

  cerrarModal() {
    this.oculto = 'oculto';
  }
  mostrarModal(init?) {
    this.oculto = '';

    if (init) {
      this.formulario.emit(init);
    } else {
      this.formulario.emit(null);
    }
  }


}
