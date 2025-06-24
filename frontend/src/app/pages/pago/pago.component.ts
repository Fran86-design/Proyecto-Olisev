import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginTiendaComponent } from "../../components/login-tienda/login-tienda.component";

@Component({
  selector: 'app-pago',
  imports: [RouterModule, LoginTiendaComponent],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.css',
  standalone: true
})
export class PagoComponent implements AfterViewInit {
  // ViewChild para acceder al componente hijo LoginTiendaComponent
  @ViewChild('loginTienda') loginTienda!: LoginTiendaComponent;
  // Variable para almacenar los datos del usuario logueado
  usuario: any = null;
  alerta = {
    visible: false,
    tipo: 'info',
    mensaje: ''
  };
  /**
 * Este componente gestiona el proceso de pago en la tienda.
 * 
 * Funcionalidades principales:
 *    Recupera el usuario logueado desde localStorage.
 *    Verifica si el carrito contiene productos válidos; redirige si está vacío.
 *    Rellena automáticamente los campos del formulario con datos del usuario si está logueado.
 *    Valida que los campos obligatorios estén completos antes de realizar el pedido.
 *    Construye y envía el objeto de pedido al backend vía HTTP POST.
 *    Muestra alertas de error o éxito según corresponda.
 *    Carga y muestra un resumen del pedido con subtotal, envío y total.
 *    Permite login y registro directamente desde la página de pago.
 * 
 * Consideraciones técnicas:
 *    Usa ChangeDetectorRef inyectado como cdRef para detectar manualmente cambios en caso necesario.
 */

  // ChangeDetectorRef: controla manualmente la detección de cambios en el componente
  constructor(private cdRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    // Intenta obtener el usuario logueado desde localStorage
    const usuarioRaw = localStorage.getItem('usuarioLogueado');
    // Parsea el string JSON a objeto, o null si no hay usuario
    this.usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    // Espera a que el navegador termine de pintar la vista
    requestAnimationFrame(() => {
      // Si hay un usuario logueado, se rellenan los campos
      if (this.usuario) {
        // Se ejecuta en el próximo ciclo de eventos
        setTimeout(() => this.rellenarCamposConUsuario(), 0);
      }
      // Obtiene botones de la vista por su ID
      const btnCarrito = document.getElementById('btnVolverCarrito') as HTMLButtonElement | null;
      const btnTienda = document.getElementById('btnVolverTienda') as HTMLButtonElement | null;
      const btnPagar = document.getElementById('btnProcederPago') as HTMLButtonElement | null;
      // Obtiene el carrito desde localStorage
      const carritoRaw: string | null = localStorage.getItem('carrito');
      // Parsea el carrito o usa array vacío si no existe
      const carrito: any[] = carritoRaw ? JSON.parse(carritoRaw) : [];
      // Si el carrito está vacío o no es válido
      if (!Array.isArray(carrito) || carrito.length === 0) {
        // Muestra mensaje de carrito vacío
        const mensaje = document.getElementById('mensajeCarritoVacio');
        if (mensaje) mensaje.classList.remove('hidden');
        // Redirige al carrito después de 1 segundo
        setTimeout(() => window.location.href = '/carrito', 1000);
      } else {
        // Si el usuario está logueado
        if (this.usuario) {
           // Oculta opciones de login/registro
          const loginBtns = document.querySelector('.opciones-usuario') as HTMLElement;
          if (loginBtns) loginBtns.style.display = 'none';
          // Rellena campos de formulario con datos del usuario
          (document.querySelector('#formInvitado input[placeholder="Nombre completo"]') as HTMLInputElement).value = this.usuario.nombre || '';
          (document.querySelector('#formInvitado input[placeholder="Correo electrónico"]') as HTMLInputElement).value = this.usuario.email || '';
          (document.querySelector('#formInvitado input[placeholder="Teléfono (opcional)"]') as HTMLInputElement).value = this.usuario.telefono || '';
        }
        // Si existe el botón de pagar
        if (btnPagar) {
          // Añade listener de click al botón de pago
          btnPagar.addEventListener('click', () => {
            // Obtiene todos los inputs requeridos
            const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[required]');
            let valido = true;
            // Valida que todos los campos requeridos estén completos
            inputs.forEach(input => {
              if (!input.value.trim()) {
                // Marca como inválido
                input.style.border = '2px solid red';
                valido = false;
              } else {
                // Restaura estilo válido
                input.style.border = '1px solid #ccc';
              }
            });
            // Si hay campos vacíos, muestra alerta
            if (!valido) {
              this.mostrarAlerta('error', 'Por favor, completa los campos obligatorios.');
            } else {
              // Obtiene datos del formulario, usando datos del usuario si está logueado
              const nombre = this.usuario?.nombre || (document.querySelector('#formInvitado input[placeholder="Nombre completo"]') as HTMLInputElement)?.value;
              const email = this.usuario?.email || (document.querySelector('#formInvitado input[placeholder="Correo electrónico"]') as HTMLInputElement)?.value;
              const telefono = this.usuario?.telefono || (document.querySelector('#formInvitado input[placeholder="Teléfono (opcional)"]') as HTMLInputElement)?.value;
              const direccion = [
                // Concatena dirección desde los campos del formulario
                (document.querySelector('#formformEnvio input[placeholder="Calle y número"]') as HTMLInputElement)?.value,
                (document.querySelector('#formformEnvio input[placeholder="Ciudad"]') as HTMLInputElement)?.value,
                (document.querySelector('#formformEnvio input[placeholder="Provincia"]') as HTMLInputElement)?.value,
                (document.querySelector('#formformEnvio input[placeholder="Código postal"]') as HTMLInputElement)?.value,
                (document.querySelector('#formformEnvio input[placeholder="País"]') as HTMLInputElement)?.value
              ].filter(Boolean).join(', ');
              // Construye detalles del pedido desde el carrito
              const lineas = Array.isArray(carrito)
                ? carrito.map((item: any) => {
                    if (item.nombre && item.precio != null && item.cantidad != null) {
                      return {
                        nombreProducto: item.nombre,
                        cantidad: item.cantidad,
                        precioUnitario: item.precio
                      };
                    }
                    return null;
                  }).filter(item => item !== null)
                : [];
              // Si el carrito no tiene productos válidos
              if (lineas.length === 0) {
                this.mostrarAlerta('error', 'El carrito no contiene productos válidos.');
              } else {
                // Construye el objeto pedido final
                const pedido = {
                  nombreCliente: nombre,
                  direccion: direccion,
                  email: email,
                  telefono: telefono,
                  detalles: carrito.map((item: any) => ({
                    nombreProducto: item.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio,
                    productoId: item.productoId
                  }))
                };
                // Muestra el JSON por consola
                console.log('JSON enviado al backend:', JSON.stringify(pedido));
                // Envia el pedido al backend
                fetch('http://localhost:8080/api/pedidos', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(pedido)
                })
                .then(res => {
                  if (!res.ok) throw new Error('Error al crear el pedido');
                  // Parsea la respuesta del backend
                  res.json().then(data => {
                    console.log('Pedido creado:', data);
                    // Limpia el carrito
                    localStorage.removeItem('carrito');
                    // Redirige a página de agradecimiento
                    window.location.href = '/gracias';
                  }).catch(err => {
                    console.error('Error al procesar JSON:', err);
                    this.mostrarAlerta('error', 'No se pudo procesar la respuesta del servidor.');
                  });
                })
                .catch(err => {
                  console.error(err);
                  this.mostrarAlerta('error', 'No se pudo procesar el pedido.');
                });
              }
            }
          });
        }
        // Listeners para volver al carrito o tienda
        if (btnCarrito) btnCarrito.addEventListener('click', () => window.location.href = '/carrito');
        if (btnTienda) btnTienda.addEventListener('click', () => window.location.href = '/tienda-ventas');
        // Carga resumen del pedido en la interfaz
        this.cargarResumen();
      }
    });
    // Obtiene botones de login y registro
    const btnLogin = document.getElementById('btnLogin');
    const btnRegistro = document.getElementById('btnRegistro');
    // Listener para mostrar login
    if (btnLogin) {
      btnLogin.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('mostrarLoginTienda'));
      });
    }
    // Listener para redirigir a registro
    if (btnRegistro) {
      btnRegistro.addEventListener('click', () => {
        window.location.href = '/registro-tienda?volver=pago';
      });
    }
  }
  /**
   * Carga el resumen del carrito y lo muestra en el DOM
   */
  cargarResumen(): void {
    // Obtiene carrito
    const carritoRaw: string | null = localStorage.getItem('carrito');
    // Parsea o usa vacío
    const carrito: any[] = carritoRaw ? JSON.parse(carritoRaw) : [];
    // Contenedor resumen
    const contenedor = document.getElementById('resumenPedido');

    if (contenedor) {
      // Limpia contenido anterior
      contenedor.innerHTML = '';
      // Inicializa subtotal
      let subtotal = 0;
      // Coste fijo de envío
      const envio = 2.5;
       // Itera productos del carrito
      carrito.forEach((item: { nombre: string; cantidad: number; precio: number }) => {
        // Crea elemento <p>
        const p = document.createElement('p');
        // Texto producto
        p.textContent = `${item.nombre} x${item.cantidad} - ${item.precio.toFixed(2)} €`;
        // Añade al resumen
        contenedor.appendChild(p);
        // Acumula subtotal
        subtotal += item.precio * item.cantidad;
      });
      // Total incluyendo envío
      const totalConEnvio = subtotal + envio;
      // Actualiza elementos del DOM con los totales
      const subtotalElem = document.getElementById('subtotalCarrito');
      const envioElem = document.getElementById('envioCarrito');
      const totalElem = document.getElementById('totalPagar');

      if (subtotalElem) subtotalElem.textContent = `${subtotal.toFixed(2)} €`;
      if (envioElem) envioElem.textContent = `${envio.toFixed(2)} €`;
      if (totalElem) totalElem.textContent = `${totalConEnvio.toFixed(2)} €`;
    }
  }
  /**
   * Callback ejecutado al iniciar sesión desde el componente de pago
   * @param usuario Objeto del usuario autenticado
   */
  onLoginDesdePago(usuario: any): void {
    console.log('onLoginDesdePago() ejecutado. Usuario:', usuario);
    // Actualiza usuario en el componente
    this.usuario = usuario;
    // Guarda en localStorage
    localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));

    setTimeout(() => {
      // Rellena formulario
      this.rellenarCamposConUsuario(); 
      this.mostrarAlerta('success', `Has iniciado sesión como ${usuario.nombre}`);
    }, 50);
  }
  /**
   * Rellena campos del formulario con los datos del usuario logueado
   */
  rellenarCamposConUsuario(): void {
    const loginBtns = document.querySelector('.opciones-usuario') as HTMLElement;
    // Oculta botones login
    if (loginBtns) loginBtns.style.display = 'none';
    // Rellena campos
    (document.querySelector('#formInvitado input[placeholder="Nombre completo"]') as HTMLInputElement).value = this.usuario?.nombre || '';
    (document.querySelector('#formInvitado input[placeholder="Correo electrónico"]') as HTMLInputElement).value = this.usuario?.email || '';
    (document.querySelector('#formInvitado input[placeholder="Teléfono (opcional)"]') as HTMLInputElement).value = this.usuario?.telefono || '';
  }
  /**
   * Llama al método mostrar() del componente de login
   */
  mostrarLogin(): void {
    const loginComp = document.querySelector('app-login-tienda') as any;
    // Ejecuta función mostrar si existe
    loginComp?.mostrar?.();
  }

  mostrarAlerta(tipo: 'success' | 'error' | 'info' | 'warning', mensaje: string): void {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => {
      this.alerta.visible = false;
    }, 3000);
  }
}