import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-fabrica',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login-fabrica.component.html',
  styleUrl: './login-fabrica.component.css'
})
export class LoginFabricaComponent {

  @ViewChild('userInput') userInput!: ElementRef;
  @ViewChild('passInput') passInput!: ElementRef;
  @ViewChild('errorText') errorText!: ElementRef;
  @ViewChild('eyeOpen') eyeOpen!: ElementRef;
  @ViewChild('eyeClosed') eyeClosed!: ElementRef;

  constructor(
    private _el: ElementRef,
    private authService: AuthService,
    private router: Router
  ) {}

  public get el(): ElementRef {
    return this._el;
  }

  public mostrarLogin(): void {
    this.resetForm();
    this._el.nativeElement.classList.remove('hidden');
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

  public login(): void {
    const email = this.userInput.nativeElement.value.trim();
    const password = this.passInput.nativeElement.value.trim();

    this.authService.login(email, password).subscribe({
      next: (usuario) => {
        this.errorText.nativeElement.textContent = '';
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
        this.cerrarLogin();

        if (usuario.rol === 'FABRICA') {
          this.router.navigate(['/clientes-empresa']);
        } else if (usuario.rol === 'ADMIN') {
          this.router.navigate(['/zona-privada']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.errorText.nativeElement.textContent = 'Usuario o contraseña incorrectos';
      }
    });
  }
}


