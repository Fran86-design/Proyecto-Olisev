import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UsaurioBoxComponent } from '../../components/usuario-box/usaurio-box.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-zona-privada',
  imports: [UsaurioBoxComponent, RouterModule],
  templateUrl: './zona-privada.component.html',
  styleUrl: './zona-privada.component.css',
  standalone: true
})
/**
 * Este bloque asegura que únicamente usuarios con rol de ADMIN puedan
 * acceder al componente. Se implementa una doble verificación:
 * 
 * 1. A través del servicio AuthService en el método ngOnInit.
 * 2. Mediante verificación directa desde localStorage tras la carga de la vista.
 * 
 *   OBJETIVOS:
 *    Proteger rutas de acceso restringido.
 *    Redirigir inmediatamente al usuario si no tiene privilegios.
 *    Refuerza seguridad incluso si se manipula el frontend localmente.
 */

export class ZonaPrivadaComponent implements OnInit, AfterViewInit {

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Si el usuario NO está autenticado como administrador mediante el AuthService
    if (!this.authService.isAdminAutenticado()) {
      // Redirige al usuario al inicio ('/'), reemplazando la URL para evitar volver con el botón "Atrás".
      this.router.navigate(['/'], { replaceUrl: true });
    }
  }

  ngAfterViewInit(): void {
    // Se usa setTimeout para asegurar que la verificación se haga después del render completo.
    setTimeout(() => {
      // Llama a una función que revisa si el usuario es admin.
      this.verificarAcceso();
    });
  }
  /**
   * Verifica si el usuario tiene el rol de administrador usando el localStorage.
   * Si no cumple, redirige al inicio. Método defensivo ante manipulaciones del AuthService.
   */
  private verificarAcceso(): void {
    // Intenta obtener el objeto 'adminLogueado' desde el localStorage.
    // Si no existe, se asigna null para evitar errores.
    const admin = JSON.parse(localStorage.getItem('adminLogueado') || 'null');
    // Si no hay admin o su rol no es 'ADMIN', redirige a la raíz.
    if (!admin || admin.rol !== 'ADMIN') {
      this.router.navigate(['/'], { replaceUrl: true });
    }
  }
  
}



