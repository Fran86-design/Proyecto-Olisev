import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
// Importa un servicio personalizado que gestiona el estado de los slides
import { SlideService } from '../../services/slide.service';

@Component({
  selector: 'app-slide1',
  imports: [RouterModule],
  templateUrl: './slide1.component.html',
  styleUrl: './slide1.component.css',
  standalone: true
})
export class Slide1Component {
  /**
   * 
   * @param router Servicio de Angular para controlar la navegación y consultar la URL actual
   * @param slideService Servicio propio que contiene la lógica y estado relacionado con los slides
   */
  constructor(private router: Router, public slideService: SlideService) {}

  /**
   * Verifica si el slide actual es el que está activo según la URL. 
   * @param slide - Número del slide que se quiere comprobar (por ejemplo, 1, 2, 3...)
   * @return boolean - Devuelve `true` si la URL actual contiene el número del slide especificado, lo que indica que está activo.
   */
  isActivo(slide: number): boolean {
    // Verifica si la URL actual contiene "/slide" seguido del número pasado como argumento
    return this.router.url.includes('/slide' + slide);
  }
}
