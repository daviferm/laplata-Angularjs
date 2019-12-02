import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { AjustesService } from '../services/service.index';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styles: []
})
export class AjustesComponent implements OnInit {

  @ViewChild('temas') temas: ElementRef;

  constructor( public ajustes: AjustesService, private renderer: Renderer2 ) { }

  ngOnInit() {
    this.colocarCheck();
  }

  cambiarColor(tema: string, link: any) {

    this.aplicarCheck( link );

    this.ajustes.aplicarTema( tema );

  }

  aplicarCheck( link: any ) {

    for ( const ref of this.temas.nativeElement.children ) {
      this.renderer.removeClass( ref.children[0], 'working' );
    }
    link.classList.add('working');

  }


  colocarCheck() {

    const tema = this.ajustes.ajustes.tema;
    const themes = this.temas.nativeElement.children;

    for ( const ref of themes ) {
      if ( ref.children[0].getAttribute('data-theme') === tema ) {
        this.renderer.addClass(ref.children[0], 'working');
        break;
      }
    }

  }



}
