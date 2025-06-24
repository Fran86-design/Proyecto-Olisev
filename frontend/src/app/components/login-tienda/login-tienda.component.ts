import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login-tienda',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login-tienda.component.html',
  styleUrl: './login-tienda.component.css'
})
export class LoginTiendaComponent implements OnInit {

  @ViewChild('userInput') userInput!: ElementRef;
  @ViewChild('passInput') passInput!: ElementRef;
  @ViewChild('errorText') errorText!: ElementRef;
  @ViewChild('eyeOpen') eyeOpen!: ElementRef;
  @ViewChild('eyeClosed') eyeClosed!: ElementRef;
  @ViewChild('loginContainer') loginContainer!: ElementRef;
  @ViewChild('mensajeRecuperacion') mensajeRecuperacion!: ElementRef;

  @Output() loginExitoso = new EventEmitter<any>();

  constructor(
    private _el: ElementRef,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const yaLogueado = localStorage.getItem('usuarioLogueado');

    if (yaLogueado) {
      setTimeout(() => {
        this.loginContainer?.nativeElement.classList.add('hidden');
      }, 0);

      if (['/', '/clientes-tienda'].includes(this.router.url)) {
        this.router.navigate(['/clientes-tienda']);
      }
    }
  }

  public mostrar(): void {
    this._el.nativeElement.classList.remove('hidden');
    this.resetForm();
  }

  public cerrarLogin(): void {
    this._el.nativeElement.classList.add('hidden');
    this.resetForm();
  }

  public resetForm(): void {
    this.userInput.nativeElement.value = '';
    this.passInput.nativeElement.value = '';
    this.errorText.nativeElement.textContent = '';
    this.restaurarIconoOjo();
  }

  public togglePassword(): void {
    const input = this.passInput.nativeElement;
    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';

    this.eyeOpen.nativeElement.style.display = mostrar ? 'none' : 'inline-block';
    this.eyeClosed.nativeElement.style.display = mostrar ? 'inline-block' : 'none';
  }

  private restaurarIconoOjo(): void {
    this.passInput.nativeElement.type = 'password';
    this.eyeOpen.nativeElement.style.display = 'inline-block';
    this.eyeClosed.nativeElement.style.display = 'none';
  }
  /**
 * Método que maneja el proceso de login del usuario.
 * Si el usuario accede desde la ruta "/pago", emite el evento loginExitoso
 * y rellena automáticamente el formulario de invitado.
 * Si no, redirige a "/clientes-tienda".
 */
  public login(): void {
  const username = this.userInput.nativeElement.value.trim();
  const password = this.passInput.nativeElement.value.trim();

  this.authService.login(username, password).subscribe({
    next: (usuario) => {
      localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
      this.cerrarLogin();

      // Verifica si la ruta actual es "/pago"
      if (this.router.url === '/pago') {
        console.log('Emitiendo loginExitoso desde LoginTienda');
        // Emite el evento loginExitoso pasando el objeto usuario como argumento
        this.loginExitoso.emit(usuario);

        setTimeout(() => {
          // Selecciona los inputs del formulario de invitado por su placeholder
          const nombreInput = document.querySelector<HTMLInputElement>('#formInvitado input[placeholder="Nombre completo"]');
          const emailInput = document.querySelector<HTMLInputElement>('#formInvitado input[placeholder="Correo electrónico"]');
          const telefonoInput = document.querySelector<HTMLInputElement>('#formInvitado input[placeholder="Teléfono (opcional)"]');
          // Selecciona el contenedor de botones de login (para ocultarlo)
          const loginBtns = document.querySelector<HTMLElement>('.opciones-usuario');

           // Si el contenedor existe, lo oculta para no mostrar opciones de login tras autenticación
          if (loginBtns) loginBtns.style.display = 'none';
           // Rellena el input de nombre con el valor del usuario o vacío si no viene definido
          if (nombreInput) nombreInput.value = usuario.nombre || '';
          if (emailInput) emailInput.value = usuario.email || '';
          if (telefonoInput) telefonoInput.value = usuario.telefono || '';
          // Espera 50 ms para que el DOM esté completamente listo antes de manipularlo
          }, 50);
        } else {
          // Si no estás en la ruta "/pago", redirige al panel de clientes de tienda
          this.router.navigate(['/clientes-tienda']);
        }
      },
      error: () => {
        this.errorText.nativeElement.textContent = 'Credenciales incorrectas';
      }
    });
  } 
  /**
 * Redirige al usuario al formulario de registro de la tienda.
 * Se usa, por ejemplo, si el usuario no tiene cuenta.
 */
  public irARegistro(): void {
    // Cierra el formulario de login actual
    this.cerrarLogin();
    // Redirige al registro
    this.router.navigate(['/registro-tienda']);
  }
  /**
 * Envía una solicitud de recuperación de contraseña al backend.
 * Muestra mensajes según la validez del correo y el resultado de la petición.
 */
  public olvidoContrasena(): void {
    // Obtiene el valor del email desde el input de usuario
    const email = this.userInput.nativeElement.value.trim();
    // Referencia al elemento HTML donde se muestran mensajes de recuperación
    const mensajeEl = this.mensajeRecuperacion.nativeElement;
    // Expresión regular para validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Si el formato del email no es válido, muestra un mensaje
    if (!emailRegex.test(email)) {
      mensajeEl.textContent = 'Por favor, introduce un email válido.';
      mensajeEl.classList.remove('hidden');
    } else {
      // Muestra mensaje de estado mientras se procesa la solicitud
      mensajeEl.textContent = 'Procesando solicitud...';
      mensajeEl.classList.remove('hidden');
    }
    // Envía la solicitud POST al backend para recuperación de contraseña
    // cuerpo de la solicitud
    this.http.post<{ mensaje?: string; error?: string }>('http://localhost:8080/api/recuperar-password', { email })
    .subscribe({
      // Respuesta exitosa del servidor
      next: (resp) => {
        mensajeEl.textContent = resp.mensaje || resp.error || 'Operación completada.';
      },
      // Si ocurre un error durante la solicitud
      error: (err) => {
        mensajeEl.textContent = err.error?.error || 'Ocurrió un error al procesar tu solicitud.';
      }
    });
  }
}

