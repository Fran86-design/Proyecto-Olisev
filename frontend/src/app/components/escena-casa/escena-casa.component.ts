import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-escena-casa',
  imports: [],
  templateUrl: './escena-casa.component.html',
  styleUrl: './escena-casa.component.css',
  standalone: true,
})
export class EscenaCasaComponent {
  salir: boolean = false;
  textoCasa: boolean = false;
  textoCampo: boolean = false;
  
  
  //Evento personalizado que se emite al componente padre para indicar
  //que se debe avanzar a la escena final
  @Output() irAFinal = new EventEmitter<void>();

  /**
  *Este método activa las variables que controlan las animaciones o la salida de la escena actual.
  */
  onSiguiente(): void {
    this.salir = true;
    this.textoCasa = true;
    this.textoCampo = true;
  }

  /**
  *Este método emite el evento 'irAFinal', permitiendo al componente padre
  *saber que se debe avanzar a la siguiente escena (como mostrar EscenaFinal).
  */
  siguiente(): void {
    this.irAFinal.emit();
  }

}
