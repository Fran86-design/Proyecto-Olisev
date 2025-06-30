import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { UsaurioBoxComponent } from "../../components/usuario-box/usaurio-box.component";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gestion-tienda',
  imports: [RouterModule, UsaurioBoxComponent],
  templateUrl: './gestion-tienda.component.html',
  styleUrl: './gestion-tienda.component.css',
  standalone: true
})
/**
 * Este componente representa una pantalla de gestión de la tienda,
 * cuyo acceso está restringido exclusivamente a usuarios administradores.
 * Sirve como punto intermedio para acceder a herramientas administrativas.
 * 
 * Verifica si el usuario tiene privilegios de administrador al iniciar.
 * Redirige automáticamente al inicio si el usuario no está autorizado.
 * Proporciona una funcionalidad de navegación hacia atrás.
 * 
 * Location para manipulación del historial del navegador
 * AuthService para verificación de permisos de acceso
 * 
 * Este componente se asegura de que solo usuarios autenticados
 * como administradores puedan visualizar o interactuar con su contenido.
 * 
 * ================================================================
 */
export class GestionTiendaComponent implements OnInit{
  /**
   * Se inyectan tres dependencias a través de los parámetros:
   * @param location Servicio de Angular que permite manipular el historial de navegación (retroceder, avanzar, etc.)
   * @param authService Servicio de autenticación que permite verificar si el usuario tiene permisos para acceder.
   * @param router Servicio de Angular para realizar redirecciones programáticas.
   */
  constructor(private location: Location, private authService: AuthService, private router: Router) {}
  // Verifica si el usuario tiene permisos de administrador.
  ngOnInit(): void {
    // Si no está autenticado como admin, se le redirige a la página principal ('/')
    if (!this.authService.isAdminAutenticado()) {
    this.router.navigate(['/']);
    }
  }
  /**
   * Método para volver a la página anterior en el historial de navegación.
   */
  volver(): void {
    this.router.navigate(['/zona-privada']);
  }
}
