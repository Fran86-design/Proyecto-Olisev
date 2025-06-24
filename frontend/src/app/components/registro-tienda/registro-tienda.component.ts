import { Component, ElementRef, ViewChild } from '@angular/core';
/**
 * ActivatedRoute es un servicio de Angular que permite acceder a información 
 * de la ruta actualmente activa, como:
 *    Parámetros dinámicos de la URL (por ejemplo, /cliente/:id)
 *    Parámetros de query string (por ejemplo, ?volver=pago)
 *    Datos adicionales configurados en las rutas
 * 
 * En este componente, se usa para leer parámetros de la URL
 * (como `?volver=pago`) y decidir a qué vista redirigir tras un registro exitoso.
 */
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro-tienda',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './registro-tienda.component.html',
  styleUrl: './registro-tienda.component.css',
})
/**
 * Este componente representa el formulario de registro de un cliente tipo "TIENDA".
 * Está diseñado para recolectar los datos del usuario, validarlos en el cliente y 
 * enviarlos al backend para crear una cuenta.

 * Funcionalidades principales:
 *  Muestra un formulario con campos como nombre, email, DNI, dirección, contraseña, etc.
 *  Permite alternar la visibilidad de los campos de contraseña.
 *  Valida los datos del formulario en el cliente antes de enviarlos.
 *  Muestra alertas visuales si hay errores de validación o problemas con el servidor.
 *  Envía los datos al backend (`/api/registro-tienda`) mediante `fetch`.
 *  Guarda los datos del usuario en `localStorage` si el registro fue exitoso.
 *  Redirige automáticamente al usuario según el origen del registro (por ejemplo, desde `/pago`).
 * 
 * - Usa `@ViewChild` para acceder a los inputs directamente.
 * - Usa `Router` y `ActivatedRoute` para navegar y leer parámetros de la URL.
 * - Usa un objeto `alerta` para mostrar mensajes de éxito, error o advertencia.
 * 
 * - Clientes de tipo TIENDA que desean registrarse en el sistema.
 */

export class RegistroTiendaComponent {
  // mostrar u ocultar la contraseña
  showPassword = false;
  // visibilidad de la confirmación de contraseña
  showConfirmPassword = false;
  /**
   * Representa el estado de la alerta.
   */
  alerta = {
    // Si la alerta está visible
    visible: false,
    // Tipo de alerta ('info', 'error', 'success', etc.)
    tipo: 'info', 
    // Mensaje que se mostrará
    mensaje: ''
  };
  // Referencia al formulario HTML completo
  @ViewChild('formRef') formRef!: ElementRef;
  // Referencias directas a los inputs de contraseña y confirmación
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  @ViewChild('confirmPasswordInput') confirmPasswordInput!: ElementRef;

  constructor(private router: Router, private route: ActivatedRoute) {}

  /**
   * Método que se ejecuta al enviar el formulario de registro
   * @param event Evento submit del formulario
   */
  registrar = (event: Event): void => {
    // Evita el comportamiento por defecto del formulario ,recargar la página.
    event.preventDefault();
    // Obtiene la referencia al formulario
    const form = this.formRef.nativeElement;
    // Extrae los valores del formulario y los normaliza
    const values = {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      dni: form.dni.value.trim(),
      direccion: form.direccion.value.trim(),
      poblacion: form.poblacion.value.trim(),
      ciudad: form.ciudad.value.trim(),
      cp: form.cp.value.trim(),
      password: form.password.value,
      confirmPassword: form.confirmPassword.value,
    };
    // Valida los datos ingresados
    const errores = this.validarFormulario(values);
    // Si hay errores, se muestra una alerta. Si no, se envía el formulario
    if (errores.length > 0) {
      this.mostrarAlerta('error', 'Errores:\n' + errores.join('\n'));
    } else {
      this.enviarRegistro(values);
    }
  };

  /**
   * Valida los campos del formulario
   * @param values Objeto con los datos del formulario
   * @return Array de strings con los mensajes de error
   */
  private validarFormulario(values: any): string[] {
    const errores: string[] = [];
    // Validaciones por campo usando expresiones regulares
    if (!/^[a-zA-Z\s]{3,}$/.test(values.nombre)) errores.push('Nombre inválido.');
    if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(values.email)) errores.push('Email inválido.');
    if (!/^\d{9}$/.test(values.telefono)) errores.push('Teléfono inválido.');
    if (!/^\d{8}[A-Za-z]$/.test(values.dni)) errores.push('DNI inválido.');
    if (!/^\d{5}$/.test(values.cp)) errores.push('Código postal inválido.');
    // Requisitos de seguridad para la contraseña
    if (values.password.length < 8 || !/[A-Z]/.test(values.password) || !/\d/.test(values.password)) {
      errores.push('Contraseña insegura. Usa al menos 8 caracteres, 1 mayúscula y 1 número.');
    }
    // Verifica que ambas contraseñas coincidan
    if (values.password !== values.confirmPassword) errores.push('Las contraseñas no coinciden.');
    // Devuelve los errores encontrados
    return errores;
  }
  /**
   * Envia los datos del formulario al backend para registrar al usuario
   * @param values Objeto con los datos a enviar
   */
  private enviarRegistro(values: any): void {
    fetch('http://localhost:8080/api/registro-tienda', {
      method: 'POST',
      // Tipo de contenido enviado
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: values.email,
        password: values.password,
        nombre: values.nombre,
        email: values.email,
        direccion: values.direccion,
        telefono: values.telefono,
        // El nuevo usuario siempre será del tipo TIENDA
        rol: 'TIENDA',
      }),
    })
      .then(async (res) => {
        // Si la respuesta fue exitosa
        if (res.ok) {
          this.registroExitoso(values);
        } else if (res.status === 409) {
          // Si ya existe el usuario o hay conflicto
          const msg = await res.text();
          this.mostrarAlerta('warning', msg);
        } else {
          // Otro tipo de error
          this.mostrarAlerta('error', 'Error al registrarse. Intenta más tarde.');
        }
      })
      .catch(() => {
        // Error de red o servidor no disponible
        this.mostrarAlerta('error', 'No se pudo conectar con el servidor.');
      });
  }
  /**
   * Ejecutado cuando el registro fue exitoso
   * @param values Valores del usuario registrado
   */
  private registroExitoso(values: any): void {
    this.mostrarAlerta('success', 'Usuario registrado correctamente');
    // Guarda la sesión del usuario recién registrado en localStorage
    localStorage.setItem(
      'usuarioLogueado',
      JSON.stringify({
        nombre: values.nombre,
        email: values.email,
        rol: 'TIENDA',
      })
    );
    // Determina si el usuario llegó desde la ruta de pago
    const estaEnPago = window.history.state?.navigationId && this.router.url.includes('/pago');

    if (estaEnPago) {
      // Si venía desde /pago, redirige allí directamente
      this.router.navigateByUrl('/pago');
    } else {
       // Si no, verifica si hay un parámetro de query "volver=pago"
      this.route.queryParams.subscribe((params) => {
        const volver = params['volver'];
        this.router.navigateByUrl(volver === 'pago' ? '/pago' : '/clientes-tienda');
      });
    }
  }
  /**
   * Cierra el formulario de registro y redirige a la página de inicio
   */
  cerrar(): void {
    this.router.navigate(['/']);
  }
  /**
   * Alterna la visibilidad del campo de contraseña
   * @param field Campo objetivo: 'password' o 'confirm'
   */
  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      // Alterna el estado
      this.showPassword = !this.showPassword;
      this.passwordInput.nativeElement.type = this.showPassword ? 'text' : 'password';
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
      this.confirmPasswordInput.nativeElement.type = this.showConfirmPassword ? 'text' : 'password';
    }
  }
  /**
   * Muestra una alerta visual
   * @param tipo Tipo de alerta ('error', 'success', 'warning', etc.)
   * @param mensaje Texto del mensaje a mostrar
   */
  mostrarAlerta(tipo: string, mensaje: string) {
    this.alerta = { visible: true, tipo, mensaje };
    // Oculta la alerta automáticamente después de 3 segundos
    setTimeout(() => this.cerrarAlerta(), 3000);
  }
  /**
   * Oculta la alerta visual
   */
  cerrarAlerta() {
    this.alerta.visible = false;
  }
}

