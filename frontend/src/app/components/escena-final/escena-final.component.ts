import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-escena-final',
  imports: [],
  templateUrl: './escena-final.component.html',
  styleUrl: './escena-final.component.css',
  standalone: true
})
export class EscenaFinalComponent {
  //Este evento se utiliza para reiniciar la página.
  @Output() volverAlInicio = new EventEmitter<void>();

  /**
  *Ejecuta emit() sobre el evento volverAlInicio,  
  *enviando una señal al componente padre para volver a mostrar la escena inicial 
  */
  volver(): void{
    this.volverAlInicio.emit();
  }

}
