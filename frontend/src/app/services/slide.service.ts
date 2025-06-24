import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

/**
 * Servicio para controlar la navegación entre slides.
 * Utiliza signals de Angular para mantener un estado reactivo.
 */
@Injectable({
  providedIn: 'root'
})
export class SlideService {
  /**
   * Estado reactivo que representa el índice actual del slide.
   * Se inicializa en 0 (primer slide).
   */
  slideActual = signal(0);
  /**
   * Avanza al siguiente slide.
   * Cuando llega al final (índice 4), vuelve al principio (0).
   * La operación % 5 asegura que el índice sea siempre 0–4.
   */
  siguiente(): void {
    this.slideActual.update(s => (s + 1) % 5);
  }
  /**
   * Retrocede al slide anterior.
   * Si está en el primero (0), pasa al último (4).
   * Se suma 5 antes del módulo para evitar índices negativos.
   */
  anterior(): void {
    this.slideActual.update(s => (s - 1 + 5) % 5);
  }
  /**
   * Establece directamente el índice del slide deseado.
   * @param slide ndice al que se desea ir (debe estar entre 0 y 4)
   */
  irA(slide: number) {
    this.slideActual.set(slide);
  }
}


