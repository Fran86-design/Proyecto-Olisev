import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
// Servicio personalizado para autenticación
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
/**
 * Este componente representa el formulario de autenticación de administradores.
 * Está diseñado para ser mostrado y ocultado dinámicamente desde otras partes de la aplicación.
 *
 * Funcionalidad principal:
 *  Muestra un formulario con campos de usuario y contraseña.
 *  Permite alternar la visibilidad de la contraseña mediante íconos de ojo.
 *  Valida las credenciales enviadas usando un AuthService.
 *  Si el usuario es administrador, guarda su sesión en localStorage y redirige a la zona privada.
 *  Muestra mensajes de error si las credenciales son inválidas o si el rol no es ADMIN.
 *  Permite cerrar la sesión y regresar a la página principal.
 *
 * Características técnicas:
 *  Utiliza @ViewChild para acceder directamente a elementos del DOM (inputs, íconos, errores).
 *  Usa ElementRef para manipulación directa del DOM del componente.
 *
 * Público objetivo:
 *  Administradores de la aplicación con acceso restringido a la zona privada.
 *
 * Archivos relacionados:
 *  login.component.html - Estructura del formulario.
 *  login.component.css - Estilos visuales del componente.
 *  auth.service.ts - Servicio para autenticación HTTP.
 */

export class LoginComponent implements AfterViewInit {
  // Input de usuario
  @ViewChild('userInput') userInput?: ElementRef<HTMLInputElement>;
  // Input de contraseña
  @ViewChild('passInput') passInput?: ElementRef<HTMLInputElement>;
  // Contenedor de mensaje de error
  @ViewChild('errorText') errorText?: ElementRef<HTMLElement>;
  // Ícono de ojo abierto
  @ViewChild('eyeOpen') eyeOpen?: ElementRef<HTMLElement>;
  // Ícono de ojo cerrado
  @ViewChild('eyeClosed') eyeClosed?: ElementRef<HTMLElement>;
  // Marca si la vista ya fue inicializada
  private viewInitialized = false;

  constructor(
    /**
     * Indica que la propiedad _el solo es accesible dentro de esta clase.
     * Comienza con un guion bajo (_) por convención: esto sugiere que es una propiedad privada interna.
     * Referencia al elemento raíz del componente
     */
    private _el: ElementRef<HTMLElement>,
    // Servicio de autenticación
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Getter para acceder al elemento raíz del componente.
   * @return ElementRef<HTMLElement> referencia al DOM raíz
   */
  public get el(): ElementRef {
    return this._el;
  }

  /**
   * Ciclo de vida de Angular: se ejecuta después de que la vista ha sido completamente inicializada
   */
  ngAfterViewInit(): void {
    this.viewInitialized = true;
  }
  /**
   * Muestra el formulario de login si no hay un admin autenticado
   */
  public mostrarLogin(): void {
    // Intenta recuperar admin logueado
    const admin = JSON.parse(localStorage.getItem('adminLogueado') || 'null');
    // Solo entra aquí si:
    //  admin no es null
    //  admin tiene una propiedad "rol"
    //  y esa propiedad es "ADMIN"
    if (admin?.rol === 'ADMIN') {
      // Redirige si ya está logueado
      this.router.navigate(['/zona-privada']);
    } else {
      // Limpia campos
      this.resetForm();
      // Muestra el login
      this._el.nativeElement.classList.remove('hidden');
    }
  }
  /**
   * Oculta el formulario de login y resetea los campos
   */
  public cerrarLogin(): void {
    // Oculta el componente
    this._el.nativeElement.classList.add('hidden');
    // Limpia el formulario
    this.resetForm();
  }

  /**
  * Restablece los valores del formulario de login a su estado inicial:
  *  Vacía los campos de usuario y contraseña
  *  Limpia cualquier mensaje de error
  *  Restaura el ícono del ojo para ocultar la contraseña
  */
  public resetForm(): void {
    // Verifica si la vista ya está inicializada, los elementos del DOM están disponibles.
    if (this.viewInitialized) {
      // Si el input de usuario existe, borra su valor
      if (this.userInput?.nativeElement) {
        this.userInput.nativeElement.value = '';
      }
      // Si el input de contraseña existe, borra su valor
      if (this.passInput?.nativeElement) {
        this.passInput.nativeElement.value = '';
      }
      // Si el elemento del texto de error existe, borra su contenido
      if (this.errorText?.nativeElement) {
      this.errorText.nativeElement.textContent = '';
      }
      // Restaura el ícono del ojo al estado "oculto" por defecto
      this.restaurarIconoOjo();
    }
  }
  /**
 * Alterna la visibilidad del campo de contraseña entre texto y password.
 * También alterna los íconos de ojo abierto y cerrado.
 */
  public togglePassword(): void {
    // Solo entra si la vista está inicializada y el campo de contraseña existe
    if (this.viewInitialized && this.passInput?.nativeElement) {
      const input = this.passInput.nativeElement;
      // Verifica si actualmente está en modo 'password'
      const mostrar = input.type === 'password';
      // Cambia el tipo del input según el estado actual
      input.type = mostrar ? 'text' : 'password';
      // Si los íconos de ojo existen, actualiza su visibilidad
      if (this.eyeOpen?.nativeElement && this.eyeClosed?.nativeElement) {
        // Oculta el ícono de ojo abierto si se va a mostrar la contraseña
        this.eyeOpen.nativeElement.style.display = mostrar ? 'none' : 'inline-block';
        // Muestra el ícono de ojo cerrado si se va a mostrar la contraseña
        this.eyeClosed.nativeElement.style.display = mostrar ? 'inline-block' : 'none';
      }
    }
  }

  /**
 * Restaura la visibilidad del campo de contraseña al estado inicial.
 *  Cambia el input a tipo 'password' (oculto).
 *  Muestra el ícono de ojo abierto y oculta el cerrado.
 */
  private restaurarIconoOjo(): void {
    // Solo ejecuta la lógica si la vista ya está inicializada
    // y el input de contraseña está disponible
    if (this.viewInitialized && this.passInput?.nativeElement) {
      // Asegura que el campo de contraseña sea de tipo "password"
      this.passInput.nativeElement.type = 'password';

      // Si los íconos están disponibles, muestra el ojo abierto y oculta el cerrado
      if (this.eyeOpen?.nativeElement && this.eyeClosed?.nativeElement) {
        this.eyeOpen.nativeElement.style.display = 'inline-block';
        this.eyeClosed.nativeElement.style.display = 'none';
      }
    }
  }
  /**
 * Realiza el proceso de login del usuario:
 *  Lee los datos ingresados en el formulario.
 *  Llama al servicio de autenticación.
 *  Procesa la respuesta para permitir o denegar el acceso.
 */
  public login(): void {
    // Verifica que los inputs de usuario, contraseña y el contenedor de error estén disponibles
    if (this.userInput?.nativeElement && this.passInput?.nativeElement && this.errorText?.nativeElement) {
      // Obtiene el valor ingresado por el usuario, eliminando espacios extra
      const username = this.userInput.nativeElement.value.trim();
      // Obtiene la contraseña ingresada, también sin espacios extra
      const password = this.passInput.nativeElement.value.trim();
      // Llama al servicio de autenticación pasándole usuario y contraseña
      this.authService.login(username, password).subscribe({
        /**
       * Callback que se ejecuta si el login es exitoso
       * @param usuario - Objeto devuelto por el backend que contiene los datos del usuario autenticado
       */
        next: (usuario) => {
          // Muestra en consola el usuario recibido
          console.log('usuario recibido:', usuario);
          // Verifica si el usuario tiene rol de administrador
          if (usuario.rol === 'ADMIN') {
            // Guarda los datos del usuario en localStorage
            localStorage.setItem('adminLogueado', JSON.stringify(usuario));
            localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
            localStorage.setItem('horaLogin', Date.now().toString());
            // Limpia el mensaje de error si había alguno
            this.errorText!.nativeElement.textContent = '';
            // Cierra el formulario de login
            this.cerrarLogin();
            // Redirige inmediatamente a la zona privada
            setTimeout(() => this.router.navigate(['/zona-privada']), 0);
          } else {
            // Si el usuario no es admin, muestra mensaje de acceso denegado
            this.errorText!.nativeElement.textContent = 'Acceso restringido solo para administradores';
          }
        },
        /**
       * Callback que se ejecuta si hay un error en la autenticación
       */
        error: () => {
           // Muestra mensaje de error en el formulario si el login falla
          this.errorText!.nativeElement.textContent = 'Usuario o contraseña incorrectos';
        }
      });
    }
  }
  /**
   * Cierra la sesión y redirige a la raíz
   */
  public cerrarSesion(): void {
    // Llama al servicio para cerrar sesión
    this.authService.cerrarSesion();
    // Redirige a página principal
    this.router.navigate(['/'], { replaceUrl: true });
  }
}