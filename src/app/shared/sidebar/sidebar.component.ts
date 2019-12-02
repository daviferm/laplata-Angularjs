import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { EmpleadosService } from '../../services/service.index';
import { Medico } from '../../models/medico.model';
import { ModalCitaService } from 'src/app/components/nueva-cita/modal-cita.service';
import { timer } from 'rxjs';



@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styles: []
})
export class SidebarComponent implements OnInit {

  @ViewChild('check') checkMedico: ElementRef;
  @ViewChild('lista') listaMedicos: ElementRef;

  medicos: Medico[] = [];
  delay = timer(100);

  constructor( public empleadosService: EmpleadosService,
               public citaService: ModalCitaService,
               public renderer: Renderer2 ) {
  }

  desconectar() {
    this.empleadosService.logout();
  }

  ngOnInit() {

    this.empleadosService.notificacion.subscribe( resp => {
      this.medicos = resp;
      for ( let i = 0; i < this.medicos.length; i++ ) {

        if ( this.medicos[i].check !== false ) {
          this.delay.subscribe( () => this.listaMedicos.nativeElement.children[i].firstChild.checked = true);
        } else {
          this.delay.subscribe( () => this.listaMedicos.nativeElement.children[i].firstChild.checked = false);
        }
      }
    } );
  }
  checeMedico( medico, check ) {
    this.empleadosService.checkedMedicos( medico._id, check.checked );
  }


}
