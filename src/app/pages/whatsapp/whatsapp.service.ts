import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  whatsappSend = false;

  public notificacion = new EventEmitter<boolean>();

  constructor() {
    if ( localStorage.getItem('checked') ) {

      const checked = JSON.parse( localStorage.getItem( 'checked' ) )
      this.vericarCheck( checked );
    }
  }


  vericarCheck( check: Checked ) {

    const recordatorios = check.checked.filter( (el: any) => !el.check );

    if ( recordatorios.length === 0 ) {
      this.whatsappSend = true;
    }
  }

}




interface Checked {
  dia: string;
  checked: [];
}
