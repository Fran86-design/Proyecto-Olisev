// Importa el decorador Injectable para marcar esta clase como un servicio que puede ser inyectado
import { Injectable } from '@angular/core';
// Importa el cliente HTTP para realizar peticiones al backend
import { HttpClient } from '@angular/common/http';
// Importa el tipo Observable para manejar respuestas asincrónicas
import { Observable } from 'rxjs';
/**
 * Servicio de autenticación para la aplicación.
 * Gestiona el inicio de sesión, verificación de roles y cierre de sesión.
 */

// Hace que el servicio esté disponible a nivel global
@Injectable({ providedIn: 'root' })
export class AuthService {
  // URL base para autenticación en el backend
  private apiUrl = 'http://localhost:8080/api/login';

  constructor(private http: HttpClient) {}
  /**
   * Realiza una solicitud de inicio de sesión al backend con las credenciales del usuario.
   * @param username Nombre de usuario introducido
   * @param password Contraseña del usuario
   * @returns Observable con la respuesta del backend
   */
  login(username: string, password: string): Observable<any> {
    // Envia una petición POST al endpoint de login con las credenciales
    return this.http.post('http://localhost:8080/api/login', { username, password });
  }
  /**
   * Verifica si un administrador está autenticado en el sistema.
   * Consulta el almacenamiento local.
   * @returns true si hay un usuario admin logueado, false en caso contrario
   */
  isAdminAutenticado(): boolean {
    // Intenta obtener el objeto 'adminLogueado' desde localStorage
    const user = JSON.parse(localStorage.getItem('adminLogueado') || 'null');
    // Devuelve true si el usuario existe y tiene rol 'ADMIN'
    return user?.rol === 'ADMIN';
  }
  /**
   * Verifica si cualquier usuario (no necesariamente admin) está autenticado
   * @returns true si hay un usuario logueado, false si no
   */
  isUsuarioLogueado(): boolean {
    // Intenta obtener el objeto 'usuarioLogueado' desde localStorage
    const user = JSON.parse(localStorage.getItem('usuarioLogueado') || 'null');
    // Devuelve true si user no es null ni undefined
    return !!user;
  }
  /**
   * Cierra la sesión del usuario eliminando su información del almacenamiento local.
   */
  cerrarSesion(): void {
    // Borra cualquier dato de autenticación del localStorage
    localStorage.removeItem('adminLogueado');
    localStorage.removeItem('usuarioLogueado'); 
  }

}
