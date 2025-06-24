import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ChatboxComponent } from "./components/chatbox/chatbox.component";
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, ChatboxComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // Título de la app
  title = 'olisev-web';
  /**
   * Inyecta el servicio de rutas y el servicio de autenticación.
   * @param router Angular Router para navegación y control de rutas
   * @param authService Servicio de autenticación (admin y usuarios)
   */
  constructor(public router: Router, private authService: AuthService) {
    /**
     * Listener que se activa cuando el usuario usa los botones de atrás y adelante del navegador.
     * Se utiliza para proteger rutas sensibles si el usuario ya no está autenticado.
     */
    window.onpopstate = () => {
      // Obtiene la ruta actual
      const url = this.router.url;
      // Si el usuario navega hacia zona privada sin ser admin, se redirige al inicio
      if (url.includes('zona-privada') && !this.authService.isAdminAutenticado()) {
        this.router.navigate(['/'], { replaceUrl: true });
      }
      // Si navega hacia secciones de clientes y no está logueado, también se redirige
      if ((url.includes('clientes-tienda') || url.includes('clientes-empresa')) && !this.authService.isUsuarioLogueado()) {
        this.router.navigate(['/'], { replaceUrl: true });
      }
    };
  }

  /**
   *Determina si se debe mostrar la caja de chatbox en función de la ruta actual. 
   * @returns boolean, true si se debe mostrar la chatbox, false si no. 
   */
  showChatbox(): boolean {
    //Lista de rutas en las que no se muestra.
    const hiddenRoutes = ['/elige', '/transforma', '/zona-privada'];
    //Verifica si la ruta actual del navegador está en la lista de rutas ocultas.
    //Si está, se retorna false, no mostrar chatbox. Si no está, se retorna true mostrar chatbox.
    return !hiddenRoutes.includes(this.router.url);
  }

}
