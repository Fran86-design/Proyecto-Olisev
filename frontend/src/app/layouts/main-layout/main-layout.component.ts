/**
 * AfterViewInit, permite usar el método ngAfterViewInit, se ejecuta después de que la vista se renderiza.
 * Component, define esta clase como un componente Angular.
 * ElementRef, permite obtener y manipular directamente elementos HTML del DOM.
 * HostListener, escuchar eventos del DOM desde la clase del componente.
 * OnInit, para usar el método ngOnInit, se ejecuta al inicializar el componente.
 * ViewChild, obtiene referencias a elementos o componentes hijos desde el HTML.
 */
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
/**
 * Router, servicio para navegar entre páginas y rutas.
 * RouterModule, permite que funcione el enrutamiento en Angular.
 * NavigationEnd, evento que indica que una navegación ha terminado.
 * 
 */
import { Router, RouterModule, NavigationEnd } from '@angular/router';
// Componente login de zona privada.
import { LoginComponent } from '../../components/login/login.component';
// Componente login clientes.
import { LoginTiendaComponent } from '../../components/login-tienda/login-tienda.component';
//Componentes login proveedores.
import { LoginFabricaComponent } from '../../components/login-fabrica/login-fabrica.component';

@Component({
  // Nombre que permite usar este componente en un documento html.
  selector: 'app-main-layout',
  // Permite que este componente se use sin estar dentro de un módulo.
  standalone: true,
  // Lista componentes que este componente puede usar.
  imports: [
    RouterModule,
    LoginComponent,
    LoginTiendaComponent,
    LoginFabricaComponent
  ],
  // Ruta del archivo HTML que contiene la plantilla del componente.
  templateUrl: './main-layout.component.html',
  // Ruta del archivo CSS que contiene los estilos del componente.
  styleUrl: './main-layout.component.css'
})
/**
 * Componente principal del layout de la aplicación.
 *
 * Su función principal es estructurar y controlar el comportamiento general de la interfaz:
 *  Gestiona el menú lateral, dropdowns de cliente y visibilidad del footer según la ruta.
 *  Escucha cambios de navegación (`NavigationEnd`) para modificar la vista dinámica del footer.
 *  Administra el login de distintos tipos de usuarios: clientes, empresas y zona privada.
 *  Controla la apertura y visualización del carrito lateral, permitiendo modificar su contenido.
 *  Usa `@ViewChild` para interactuar con componentes hijos y elementos del DOM.
 *  Usa hooks `ngOnInit` y `ngAfterViewInit` para inicializar lógicas y acceder a elementos DOM renderizados.
 *  Usa `HostListener` para cerrar menús o dropdowns al hacer clic fuera de ellos.
 * 
 * También implementa funcionalidades clave como:
 *  Mostrar y ocultar modales de login.
 *  Actualizar dinámicamente el contenido y el contador del carrito.
 *  Redirigir al usuario a distintas rutas dependiendo de su autenticación.
 */

/**
 *  la clase implementa dos interfaces que obligan a definir los métodos ngOnInit() y ngAfterViewInit().
 */
export class MainLayoutComponent implements OnInit, AfterViewInit {
  // Indica si el footer debe mostrarse o no.
  mostrarFooter = true;
  // Controla si el menú lateral está abierto.
  isMenuAbierto = false;
  // Guarda la ruta actual de la aplicación.
  rutaActiva = '/';
  // Controla si el dropdown del usuario está abierto.
  mostrarClientesDropdown = false;
  // Define el tipo de login activo.
  tipoLogin: 'cliente' | 'empresa' | 'privada' | null = null;
  // Clase CSS opcional que se puede aplicar al footer.
  claseFooter = '';

  /**
   * Busca un elemento en el HTML que tenga #menuLateral y lo enlaza aquí.
   * static: false, estará disponible solo después de renderizar la vista
   */
  @ViewChild('menuLateral', { static: false })
  // Referencia al menu lateral, asegurando que no es null
  // ElementRef<HTMLElement>, Se puede usar para leer o modificar el DOM nativo desde TS.
  menuLateral!: ElementRef<HTMLElement>;

  /**
   * Busca el componente <app-login> en el HTML.
   * No necesita referencia #login porque Angular lo identifica automáticamente.
   */
  @ViewChild(LoginComponent)
  // Instancia del componente LoginComponent.
  loginComp!: LoginComponent;

  // Referencia al componente hijo LoginTienda a través del template.
  @ViewChild('loginTienda')
  loginTienda!: LoginTiendaComponent;

  // Referencia al componente hijo LoginFabrica.
  @ViewChild('loginFabrica')
  loginFabrica!: LoginFabricaComponent;

  constructor(
    // Inyección del servicio de rutas de Angular para escuchar cambios de navegación.
    private router: Router,
    // Inyección de ElementRef para acceder al elemento HTML raíz del componente
    private elementRef: ElementRef<HTMLElement>
  ) {}

  //hook del ciclo de vida Angular que se ejecuta al iniciar, hook: función especial que el framework ejecuta automáticamente en momentos clave del ciclo de vida de un componente.
  ngOnInit(): void {
    // Suscripción a los eventos del router para detectar cambios de navegación
    this.router.events.subscribe(event => {
      // Lógica que se ejecuta solo si la navegación terminó bien
      if (event instanceof NavigationEnd) {
        // Guarda la ruta actual, final, después de que se haya terminado la navegación
        this.rutaActiva = event.urlAfterRedirects;

        // Rutas en las que el footer no debe mostrarse
        const rutasSinFooter: string[] = [
          '/zona-privada',
          '/gestion-tienda',
          '/gestion-clientes-tienda',
          '/gestion-clientes-fabrica',
          '/gestion-fabrica',
          '/stock-control',
          '/reportes',
          '/clientes-tienda',
          '/clientes-empresa'
        ];

        // Verifica si la ruta activa empieza con alguna que no muestra footer
        // .some: método que devuelve true si alguna ruta coincide, !: invierte el resultado
        this.mostrarFooter = !rutasSinFooter.some(ruta =>
          //startsWith: comprueba si la URL empieza con la ruta del array.
          this.rutaActiva.startsWith(ruta)
        );

        // Variable que guarda rutas que necesitan estilos especiales en el footer.
        const rutasConEspaciadoExtra = [
          '/clientes-tienda',
          '/clientes-empresa'
        ];

        // Si la ruta activa necesita espaciado extra.
        if (rutasConEspaciadoExtra.some(r => this.rutaActiva.startsWith(r))) {
          // claseFooter: variable que define la clase CSS aplicada.
          this.claseFooter = this.rutaActiva.startsWith('/clientes-tienda')
            /**
             * operadores ternarios: si empieza con '/clientes-tienda', si no, asume que es '/clientes-empresa'.
             */
            ? 'footer--espaciado-tienda'
            : 'footer--espaciado-empresa';
        } else {
          // En caso contrario, se limpia la clase
          this.claseFooter = '';
        }
      }
    });
  }

  //se ejecuta después de que las vistas hijas estén listas
  ngAfterViewInit(): void {
    /**
     * Botón que abre el carrito lateral.
     * as HTMLElement | null: le dice al compilador que el resultado será un elemento html o null, no otro tipo.
     */
    const btnCarro = document.getElementById('carro') as HTMLElement | null;
    // Panel del carrito lateral.
    const panel = document.getElementById('carritoLateral') as HTMLElement | null;
    // Botón para cerrar el panel.
    const cerrarBtn = document.getElementById('cerrarCarrito') as HTMLElement | null;

    // Selector del botón Comprar ahora.
    const btnComprarAhora = document.querySelector(
      '.btn-carrito.oscuro'
    ) as HTMLButtonElement | null;

    // Añade evento clic y redirecciona a la página pago.
    // ?: verifica si el objeto no es null ni undefined antes de intentar acceder a algo como una propiedad o método.
    btnComprarAhora?.addEventListener('click', () => {
      window.location.href = '/pago';
    });
    
    /**
     * Al hacer clic en el botón del carrito, Llama al método que muestra el carrito.
     * Quita la clase hidden y añade la clase mostrar.
     */
    btnCarro?.addEventListener('click', () => {
      this.mostrarCarritoLateral();
      panel?.classList.remove('hidden');
      panel?.classList.add('mostrar');
    });
    // Evento para cerrar el carrito
    cerrarBtn?.addEventListener('click', () => {
      panel?.classList.remove('mostrar');
      panel?.classList.add('hidden');
    });

    // Se agrega una función global al objeto window para refrescar el carrito
    (window as any).actualizarCarritoLateral = () => {
      this.mostrarCarritoLateral();
    };
    // Igual para contador del carrito
    (window as any).actualizarContadorCarrito = () => {
      this.actualizarContadorCarrito();
    };
    // Llama inmediatamente si existe
    (window as any).actualizarContadorCarrito?.();

    // Muestra el modal login tienda si se dispara el evento
    window.addEventListener('mostrarLoginTienda', () => {
      this.loginTienda?.mostrar();
    });
  }

  /**
   * // Cambia el estado de visibilidad del menú
   */
  toggleMenu(): void {
    this.isMenuAbierto = !this.isMenuAbierto;
  }

  /**
   * // Cierra el menú
   */
  cerrarMenu(): void {
    this.isMenuAbierto = false;
  }

  // Escucha clics en todo el documento
  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    // Elemento donde ocurre el clic
    const target = event.target as HTMLElement;
    // Verifica si se hizo clic dentro del botón del menú
    const esBotonMenu = target.closest('.menuBtn');
    // O dentro del panel del menú
    const esMenuLateral = this.menuLateral?.nativeElement.contains(target);
    // Si no, se cierra
    if (!esBotonMenu && !esMenuLateral && this.isMenuAbierto) {
      this.cerrarMenu();
    }

    const esDropdown = target.closest('.clientDropdown');
    const esBotonCliente = target.closest('.zonaClienteContainer');

    if (!esDropdown && !esBotonCliente) {
      // Cierra el dropdown si se hace clic fuera
      this.mostrarClientesDropdown = false;
    }
  }

  /**
   * Alterna la visibilidad del menú desplegable de clientes.
   * @param event El evento de clic generado por el usuario. Se usa para detener la propagación.
   */
  toggleClientesDropdown(event: MouseEvent): void {
    // Evita que el clic se propague
    event.stopPropagation();
    // Alterna el estado del dropdown
    this.mostrarClientesDropdown = !this.mostrarClientesDropdown;
  }

  /**
   * Navega a una ruta específica según el tipo de cliente.
   * También cierra el dropdown de clientes antes de navegar.
   * @param ruta La ruta de destino a la que se desea navegar. Puede ser 'clientes-tienda', 'clientes-empresa'.
   */
  irA(ruta: string): void {
    // Oculta el menú desplegable antes de navegar
    this.mostrarClientesDropdown = false;
    // Verifica si hay sesión activa
    const yaLogueado = localStorage.getItem('usuarioLogueado');

    if (ruta === 'clientes-tienda') {
      if (yaLogueado) {
        // Navega directamente si ya está logueado
        this.router.navigate(['/clientes-tienda']);
      } else {
        // Muestra el login de tienda si no lo está
        this.loginTienda.mostrar();
      }
    } else if (ruta === 'clientes-empresa') {
      if (yaLogueado) {
        this.router.navigate(['/clientes-empresa']);
      } else {
        // Muestra el login de proveedores
        this.loginFabrica.mostrarLogin();
      }
    } else {
      this.router.navigate(['/' + ruta]);
    }
  }

  /**
   * Muestra modal de login
   */
  mostrarLogin(): void {
    this.loginComp.mostrarLogin();
  }

  /**
   * Cierra el modal
   */
  ocultarLogin(): void {
    this.loginComp.cerrarLogin();
  }

  /**
   * Muestra y actualiza visualmente el contenido del carrito lateral.
   * Obtiene los productos del carrito desde `localStorage`.
   * Genera los elementos HTML dinámicamente: imagen, nombre, precio, cantidad.
   * Permite incrementar, decrementar o eliminar productos.
   * Calcula y actualiza subtotal y total.
   * Llama a `actualizarContadorCarrito()` al final.
   */
  mostrarCarritoLateral(): void {
    const contenedor = document.getElementById('carritoItems') as HTMLElement | null;

    if (contenedor) {
      // Limpia el contenido anterior
      contenedor.innerHTML = '';
      // carrito: array que contendrá los productos del carrito.
      // JSON.parse: convierte el string JSON a objeto JS.
      // localStorage.getItem('carrito'): obtiene el string del carrito guardado.
      // || '[]': si no hay carrito, usa array vacío
      // any[]: el array puede tener objetos de cualquier tipo
      const carrito: any[] = JSON.parse(localStorage.getItem('carrito') || '[]');
       // Inicializa el subtotal en 0
      let subtotal = 0;

      // Recorre cada producto del carrito
      carrito.forEach((item: any, index: number) => {
        // Crea un div para mostrar el producto
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '0.5rem';
        div.style.marginBottom = '1rem';

        // Imagen del producto
        const img = document.createElement('img');
        img.src = `http://localhost:8080/api/productos/imagen/${item.productoId}`;
        // Texto alternativo de la imagen
        img.alt = item.nombre;
         // Aplica estilos CSS a la imagen
        Object.assign(img.style, {
          width: '40px',
          height: '40px',
          objectFit: 'cover',
          borderRadius: '6px'
        });
        // Crea contenedor para la información del producto
        const info = document.createElement('div');
        // Contenedor de botones +/− y cantidad
        const cantidadBox = document.createElement('div');
        cantidadBox.style.display = 'flex';
        cantidadBox.style.alignItems = 'center';
        cantidadBox.style.gap = '5px';

        // Botón para disminuir cantidad
        const btnMenos = document.createElement('button');
        btnMenos.textContent = '−';
        Object.assign(btnMenos.style, {
          border: 'none',
          background: '#eee',
          padding: '0 8px',
          cursor: 'pointer',
          fontSize: '16px'
        });
        // Muestra la cantidad actual
        const cantidadSpan = document.createElement('span');
        // Convierte cantidad a string
        cantidadSpan.textContent = item.cantidad.toString();
        cantidadSpan.style.minWidth = '20px';
        cantidadSpan.style.textAlign = 'center';
        // Botón para aumentar cantidad
        const btnMas = document.createElement('button');
        btnMas.textContent = '+';
        Object.assign(btnMas.style, {
          border: 'none',
          background: '#eee',
          padding: '0 8px',
          cursor: 'pointer',
          fontSize: '16px'
        });
        // Aumenta en 1 la cantidad
        btnMas.addEventListener('click', () => {
          carrito[index].cantidad++;
          // Guarda el carrito actualizado
          localStorage.setItem('carrito', JSON.stringify(carrito));
          // Vuelve a renderizar el carrito
          this.mostrarCarritoLateral();
        });

        btnMenos.addEventListener('click', () => {
          // Evita reducir por debajo de 1
          if (carrito[index].cantidad > 1) {
            carrito[index].cantidad--;
            localStorage.setItem('carrito', JSON.stringify(carrito));
            this.mostrarCarritoLateral();
          }
        });

        // Añade botón −
        cantidadBox.appendChild(btnMenos);
         // Añade cantidad
        cantidadBox.appendChild(cantidadSpan);
        // Añade botón +
        cantidadBox.appendChild(btnMas);
        // Botón de eliminar producto
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = '🗑';
        Object.assign(btnEliminar.style, {
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          marginLeft: '0.1rem'
        });
        // Evento al hacer clic en papelera
        btnEliminar.addEventListener('click', () => {
          // Elimina el producto del carrito
          carrito.splice(index, 1);
          // Guarda cambios
          localStorage.setItem('carrito', JSON.stringify(carrito));
          // Recarga carrito
          this.mostrarCarritoLateral();
          // Llama función global si existe
          if ((window as any).actualizarContadorCarrito) {
            (window as any).actualizarContadorCarrito();
          }
        });
        // Muestra nombre y precio
        info.innerHTML = `<strong>${item.nombre}</strong><br>${item.precio.toFixed(2)} €`;
        // Contenedor para cantidad + eliminar
        const filaCantidadYEliminar = document.createElement('div');
        filaCantidadYEliminar.style.display = 'flex';
        filaCantidadYEliminar.style.alignItems = 'center';
        filaCantidadYEliminar.style.justifyContent = 'space-between';
        filaCantidadYEliminar.style.marginTop = '0.3rem';
        // Añade control de cantidad
        filaCantidadYEliminar.appendChild(cantidadBox);
        // Añade botón eliminar
        filaCantidadYEliminar.appendChild(btnEliminar);
        // Añade fila a la info
        info.appendChild(filaCantidadYEliminar);
        // Suma al subtotal
        subtotal += item.precio * item.cantidad;

        // Añade imagen al div del producto
        div.appendChild(img);
        // Añade info al div
        div.appendChild(info);
        // Añade todo al contenedor del carrito
        contenedor.appendChild(div);
      });
      // Actualiza los totales visibles
      (document.getElementById('subtotalCarrito') as HTMLElement).textContent = `${subtotal.toFixed(2)} €`;
      (document.getElementById('descuentoCarrito') as HTMLElement).textContent = `0.00 €`;
      (document.getElementById('totalCarrito') as HTMLElement).textContent = `${subtotal.toFixed(2)} €`;

      // Actualiza el número que aparece junto al ícono del carrito
      this.actualizarContadorCarrito();
    }
  } 

  /**
   * Recalcula y actualiza el número de productos mostrados junto al ícono del carrito.
   * Si el carrito está vacío, oculta el contador.
   * Si contiene productos, lo muestra con la cantidad total sumada.
   */
  actualizarContadorCarrito(): void {
    const contador = document.getElementById('contadorCarrito') as HTMLElement | null;
    const carrito: any[] = JSON.parse(localStorage.getItem('carrito') || '[]');
    // carrito.reduce(...): recorre todos los elementos y suma las cantidades.
    // sum: acumulador que comienza en 0.
    // item: producto actual en cada iteración
    // sum + item.cantidad: suma la cantidad de cada producto
    const total = carrito.reduce((sum: number, item: any) => sum + item.cantidad, 0);

    // Si el elemento existe.
    if (contador) {
      // Convierte el número a texto y lo muestra
      contador.textContent = total.toString();
      // Si hay productos
      if (total > 0) {
        // Lo muestra con display flex
        contador.style.display = 'flex';
        // Asegura que no tenga la clase "hidden"
        contador.classList.remove('hidden');
        // Si no hay productos
      } else {
        // Oculta visualmente
        contador.style.display = 'none';
        // Añade clase "hidden"
        contador.classList.add('hidden');
      }
    }
  }
  /**
   * Oculta el carrito lateral si está visible y redirige a la vista completa del carrito.
   */
  irAlCarrito(): void {
    const panel = document.getElementById('carritoLateral') as HTMLElement | null;
    // Si el panel existe, le quita la clase 'mostrar'
    panel?.classList.remove('mostrar');
     // Y le añade la clase 'hidden' para ocultarlo
    panel?.classList.add('hidden');
    // Redirige al usuario a la ruta '/carrito'
    this.router.navigate(['/carrito']);
  }
}

