import { Component} from '@angular/core';
import { EscenaCasaComponent } from "../../components/escena-casa/escena-casa.component";
import { EscenaFinalComponent } from '../../components/escena-final/escena-final.component';

@Component({
  selector: 'app-elige',
  imports: [EscenaCasaComponent, EscenaFinalComponent],
  templateUrl: './elige.component.html',
  styleUrl: './elige.component.css',
  standalone: true
})
export class EligeComponent{
  mostrarFinal: boolean = false;

  /**
  *Método que se ejecuta cuando el usuario quiere ver la escena final.
  *Cambia el valor de 'mostrarFinal' a true, lo que permite mostrar esa parte del contenido en el HTML.
  */
  mostrarEscenaFinal(): void{
    this.mostrarFinal = true;
  }

  /**
  *Método que se ejecuta para volver al estado inicial.
  *Cambia 'mostrarFinal' a false, ocultando así la escena final y volviendo al inicio.  
  */
  volverAlInicio(): void{
    this.mostrarFinal = false;
}
}
