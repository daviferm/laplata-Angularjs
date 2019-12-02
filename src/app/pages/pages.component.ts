import { Component, OnInit } from '@angular/core';
import { Router, ActivationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { AjustesService } from '../services/service.index';
import { ModalCitaService } from 'src/app/components/nueva-cita/modal-cita.service';



declare function init_pluying();

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styles: []
})
export class PagesComponent implements OnInit {

  titulo: string;
  modalCita: boolean;

  constructor( private router: Router,
               private title: Title,
               public ajustes: AjustesService,
               public modalCitaService: ModalCitaService ) {

    // Mostrar la data del archivo pages.routes.ts en la pestaña del navegador
    this.getDateRoute().subscribe( data => {
      this.titulo = data.titulo;
      this.title.setTitle( this.titulo );
    } );
    this.modalCita = true;
  }

  ngOnInit() {
    init_pluying();

    this.modalCitaService.notificacion.subscribe( resp => {
      console.log(resp);
      this.modalCita = resp;
    } );

  }


  // Obtener la data del archivo pages.routes.ts
  getDateRoute() {

    return this.router.events.pipe(
      filter( evento => evento instanceof ActivationEnd ),
      filter( (evento: ActivationEnd) => evento.snapshot.firstChild === null ),
      map( (evento: ActivationEnd) => evento.snapshot.data )
    );
  }

}
