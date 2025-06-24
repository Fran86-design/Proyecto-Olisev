// computed: crea valores reactivos derivados de otros valores reactivos, como los signal.
// signal: variable reactiva que almacena un valor y avisa automáticamente cuando cambia.
import { Component, computed, Signal } from '@angular/core';
// Importa los 5 componentes de diapositivas (slides) que componen la tienda
import { Slide1Component } from "../../components/slide1/slide1.component";
import { Slide2Component } from '../../components/slide2/slide2.component';
import { Slide3Component } from '../../components/slide3/slide3.component';
import { Slide4Component } from '../../components/slide4/slide4.component';
import { Slide5Component } from '../../components/slide5/slide5.component';
// Importa el servicio que maneja la lógica de los slides
import { SlideService } from '../../services/slide.service';


@Component({
  selector: 'app-tienda',
  imports: [Slide1Component, Slide2Component, Slide3Component, Slide4Component, Slide5Component],
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.css',
  standalone: true
})
export class TiendaComponent {
  // Inyecta el servicio SlideService en el constructor para poder usar sus funciones en este componente
  constructor(public slideService: SlideService) {}

  // Valor reactivo que obtiene el slide actual desde el servicio
  // Al tratarse de un Signal<number>, puede obtener su valor usando slideActual()
  slideActual: Signal<number> = computed(() => this.slideService.slideActual());

  // Métodos públicos que llaman a funciones del servicio
  // Avanza al slide anterior
  siguiente(): void {
    this.slideService.siguiente();
  }

  anterior(): void {
    this.slideService.anterior();
  }
}
