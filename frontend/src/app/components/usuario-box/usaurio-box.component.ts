import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usaurio-box',
  imports: [],
  templateUrl: './usaurio-box.component.html',
  styleUrl: './usaurio-box.component.css',
  standalone: true
})
/**
 * Este componente se encarga de mostrar un recuadro de usuario con información útil:
 *    Nombre del usuario actualmente logueado.
 *    Tiempo de conexión en formato HH:mm:ss (actualizado cada segundo).
 *    Botón para cerrar sesión, que borra los datos del usuario almacenados en `localStorage`.
 * 
 * FUNCIONALIDADES:
 *    Recupera los datos del usuario y la hora de login desde `localStorage`.
 *    Calcula el tiempo transcurrido desde el inicio de sesión.
 *    Muestra visualmente el tiempo de conexión actualizado en tiempo real.
 *    Permite cerrar sesión y redirigir al inicio de la aplicación.
 */
export class UsaurioBoxComponent implements OnInit{
  // Nombre del usuario que se mostrará que viene del padre
  @Input() nombre: string = '';
  // Primer apellido del usuario (opcional)           
  @Input() primerApellido: string = ''; 
  // Tiempo conectado en formato 
  @Input() tiempoConexion: string = ''; 

  constructor(private router: Router) {}
  /**
   * Recupera los datos del usuario desde localStorage y calcula el tiempo conectado.
   */
  ngOnInit(): void {
    // Intenta obtener el usuario guardado en localStorage
    const user = JSON.parse(localStorage.getItem('usuarioLogueado') || 'null');
    // Si el usuario existe, asigna el nombre; si no, "Desconocido"
    this.nombre = user?.nombre || 'Desconocido';
    // Intenta recuperar la hora de login desde localStorage
    const horaLogin = parseInt(localStorage.getItem('horaLogin') || '0', 10);
    // Si hay una hora válida, actualiza el tiempo de conexión
    if (horaLogin) {
      this.actualizarTiempoConexion(horaLogin);
      // Cada segundo, actualiza el contador de conexión
      setInterval(() => this.actualizarTiempoConexion(horaLogin), 1000);
    }
  }
  /**
   * Calcula la diferencia de tiempo entre la hora actual y la hora de login
   * y actualiza la propiedad `tiempoConexion`.
   * @param horaLogin - Tiempo de login en milisegundos desde el epoch (Date.now())
   */
  private actualizarTiempoConexion(horaLogin: number): void {
    // Tiempo actual
    const ahora = Date.now();
    // Diferencia de tiempo en ms
    const diff = ahora - horaLogin;
    // Convierte a formato HH:mm:ss
    const segundos = Math.floor(diff / 1000) % 60;
    const minutos = Math.floor(diff / 60000) % 60;
    const horas = Math.floor(diff / 3600000);
    // Formatea el string de tiempo con ceros a la izquierda
    this.tiempoConexion = `${this.pad(horas)}:${this.pad(minutos)}:${this.pad(segundos)}`;
  }
  /**
   * Añade un cero delante si el número es menor que 10.
   * @param num - Número a formatear
   * @return string - Número formateado como cadena con dos dígitos
   */
  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
  /**
   * Cierra la sesión del usuario actual eliminando sus datos del localStorage
   * y redirige a la página principal (ruta '/').
   */
  cerrarSesion(): void {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('adminLogueado');
    localStorage.removeItem('horaLogin');
    // Redirige al inicio
    this.router.navigate(['/']);
  }
}

