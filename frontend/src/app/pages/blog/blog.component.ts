import { Component} from '@angular/core';
// Importación del componente RevistaComponent para usarlo dentro de este componente
import { RevistaComponent } from "../../components/revista/revista.component";

@Component({
  selector: 'app-blog',
  imports: [RevistaComponent],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
  standalone: true
})
export class BlogComponent {
  taponQuitado: boolean = false;
  //Metodo para cambiar el estado del tapon
  toggleTapon(): void {
    this.taponQuitado = !this.taponQuitado;
  }
}

