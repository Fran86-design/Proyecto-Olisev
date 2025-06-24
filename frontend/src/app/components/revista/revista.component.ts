import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
// Importa la clase PageFlip de la librería 'page-flip', que permite simular el paso de páginas como en un libro
import { PageFlip } from 'page-flip';
@Component({
  selector: 'app-revista',
  imports: [],
  templateUrl: './revista.component.html',
  styleUrl: './revista.component.css',
  standalone: true
})
/**
 * Este componente representa una revista digital con efecto de pasar páginas.
 * Usa la librería page-flip para renderizar las páginas con animaciones y carga su contenido desde elementos con la clase .page definidos en el HTML.
 */
export class RevistaComponent implements AfterViewInit {
  // @ViewChild permite acceder a un elemento del DOM identificado con #flipbook en el HTML
  @ViewChild('flipbook') flipbookRef!: ElementRef;
    // Variable que almacenará la instancia del libro interactivo
    pageFlip!: any;

  ngAfterViewInit(): void {
    // Crea una nueva instancia de PageFlip, pasando el elemento HTML del flipbook como contenedor
    this.pageFlip = new PageFlip(this.flipbookRef.nativeElement, {
      // Ancho del libro en píxeles
      width: 400,
      // Altura del libro en píxeles
      height: 600,
      // El tamaño será fijo (no se ajusta automáticamente)
      size: 'fixed',
      // Muestra la portada como una página individual
      showCover: true,
      // Habilita el paso de página con el ratón
      useMouseEvents: true,
      // Habilita el paso de página con el teclado
      useKeyboard: true,
      // Controla la opacidad de la sombra al pasar la página
      maxShadowOpacity: 0.5,
      // Duración de la animación de cambio de página en milisegundos
      flippingTime: 1000
    });
    // Carga las páginas del libro desde los elementos HTML que tengan la clase 'page'
    this.pageFlip.loadFromHTML(document.querySelectorAll('.page'));
  }
}

