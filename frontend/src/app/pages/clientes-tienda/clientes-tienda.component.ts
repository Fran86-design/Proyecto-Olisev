import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-clientes-tienda',
  imports: [RouterModule],
  templateUrl: './clientes-tienda.component.html',
  styleUrl: './clientes-tienda.component.css', 
  standalone: true
})
/**
 * Este componente representa el panel de clientes para usuarios con rol "TIENDA" o "ADMIN".
 * Permite a estos usuarios gestionar su experiencia de compra desde una tienda en línea.
 *
 * Funcionalidades principales:
 *    Verifica si el usuario está autenticado y tiene el rol adecuado (TIENDA o ADMIN).
 *    Carga la lista de productos favoritos del cliente desde el localStorage.
 *    Permite agregar productos al carrito directamente o mediante un modal para elegir cantidad.
 *    Muestra el historial de pedidos del cliente y permite descargar facturas en PDF.
 *    Habilita la edición de los datos personales del usuario (nombre, correo, teléfono, dirección).
 *    Guara los cambios del usuario y los actualiza en la API mediante fetch.
 *    Usa `localStorage para persistir datos del usuario, carrito y favoritos entre sesiones.
 *
 * Este componente es una parte clave del área de clientes de tienda, proporcionando una experiencia
 * completa de navegación, compra y autogestión de datos personales.
 */
export class ClientesTiendaComponent implements OnInit {
  // Elementos del DOM a los que accedemos directamente usando ViewChild
  @ViewChild('modalCantidad') modalCantidadRef!: ElementRef;
  @ViewChild('modalNombre') modalNombreRef!: ElementRef;
  @ViewChild('cantidadVisual') cantidadVisualRef!: ElementRef;
  @ViewChild('btnAgregarCarrito') btnAgregarRef!: ElementRef;
  @ViewChild('btnCancelarModal') btnCancelarRef!: ElementRef;
  @ViewChild('btnMas') btnMasRef!: ElementRef;
  @ViewChild('btnMenos') btnMenosRef!: ElementRef;
  // Controla si se muestra el formulario de editar datos
  mostrarFormularioEdicion = false;
  // Lista de productos favoritos
  favoritos: any[] = [];
  // Muestra favoritos o no
  mostrarFavoritos: boolean = false;
  // Cantidad para añadir al carrito
  cantidad: number = 1;
  productoSeleccionado: any = null;
  // Información del usuario logueado
  usuario: any = null;
  pedidos: any[] = [];
  mostrarPedidos: boolean = false;
  pedidoSeleccionado: any = null;
  // Muestra el formulario de edición
  mostrarEditar = false;
  // Formulario de datos del usuario
  formUsuario = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  };

  alerta = {
    visible: false,
    tipo: 'info',
    mensaje: ''
  };

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    //Verifica el rol y carga datos si es valido
    const userStr = localStorage.getItem('usuarioLogueado');

    if (!userStr) {
      // Si no hay usuario, redirige a inicio
      this.router.navigate(['/'], { replaceUrl: true });
    } else {
      // Convierte el JSON guardado a objeto
      this.usuario = JSON.parse(userStr);
      const rol = this.usuario?.rol;
      // Si el rol no es válido, muestra error y redirige
      if (rol !== 'TIENDA' && rol !== 'ADMIN') {
        this.mostrarAlerta('error', 'Acceso restringido: solo clientes tienda o administradores');
        this.router.navigate(['/'], { replaceUrl: true });
      } else {
        // Si es válido carga pedidos del usuario
        this.cargarPedidos();
        // Carga favoritos
        this.cargarFavoritos();
      }
    }
  }
  // Carga los productos favoritos desde localStorage
  cargarFavoritos(): void {
    const ids = JSON.parse(localStorage.getItem('favoritos') || '[]');
     // Si no hay IDs, deja el array vacío
    if (ids.length === 0) {
      this.favoritos = [];
    } else {
      // Hace una petición para obtener los productos visibles
      fetch('http://localhost:8080/api/productos/visibles')
        .then(res => res.json())
        .then((productos: any[]) => {
          // Filtra los productos que están en favoritos
          this.favoritos = productos.filter(p => ids.includes(p.id));
        })
        .catch(() => {
          // En caso de error, muestra alerta
          this.mostrarAlerta('error', 'Error al cargar productos favoritos');
        });
    }
  }
  /**
   * Agrega un producto favorito al carrito
   * @param producto El producto que se desea agregar
   */
  agregarFavoritoAlCarrito(producto: any): void {
     // Obtiene el carrito actual
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    // Verifica si el producto ya existe
    const existente = carrito.find((item: any) => item.productoId === producto.id);
    // Si ya existe, incrementa la cantidad
    if (existente) {
      existente.cantidad += 1;
      // Si no, lo agrega como nuevo
    } else {
      carrito.push({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        precioOriginal: producto.precioOriginal ?? producto.precio,
        cantidad: 1
      });
    }
    // Guarda el carrito actualizado
    localStorage.setItem('carrito', JSON.stringify(carrito));
    // Si existe la función global para actualizar el contador, la ejecuta
    if ((window as any).actualizarContadorCarrito) {
      (window as any).actualizarContadorCarrito();
    }

    this.mostrarAlerta('success', `${producto.nombre} añadido al carrito`);
  }

  ngAfterViewInit(): void {
    // Evento click en botón +
    this.btnMasRef.nativeElement.addEventListener('click', () => {
      this.cantidad++;
      this.cantidadVisualRef.nativeElement.textContent = this.cantidad;
    });
     // Evento click en botón -
    this.btnMenosRef.nativeElement.addEventListener('click', () => {
      if (this.cantidad > 1) {
        this.cantidad--;
        this.cantidadVisualRef.nativeElement.textContent = this.cantidad;
      }
    });
    // Evento click en cancelar modal
    this.btnCancelarRef.nativeElement.addEventListener('click', () => {
      this.modalCantidadRef.nativeElement.classList.add('hidden');
      this.cantidad = 1;
      this.cantidadVisualRef.nativeElement.textContent = '1';
    });
    // Evento click en agregar al carrito desde modal
    this.btnAgregarRef.nativeElement.addEventListener('click', () => {
    // Solo ejecuta todo si hay un producto seleccionado
    if (this.productoSeleccionado) {
      // Obtiene el carrito desde localStorage y lo convierte de texto a array
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      // Busca si el producto ya está en el carrito
      const existente = carrito.find((item: any) => item.productoId === this.productoSeleccionado.id);
      // Si ya existe, suma la cantidad seleccionada
      if (existente) {
        existente.cantidad += this.cantidad;
        // Si no existe, lo agrega como nuevo producto en el carrito
      } else {
        carrito.push({
          productoId: this.productoSeleccionado.id,
          nombre: this.productoSeleccionado.nombre,
          precio: this.productoSeleccionado.precio,
          precioOriginal: this.productoSeleccionado.precioOriginal ?? this.productoSeleccionado.precio,
          cantidad: this.cantidad
        });
      }
      // Guarda el carrito actualizado en localStorage
      localStorage.setItem('carrito', JSON.stringify(carrito));

      // Llama a una función global para actualizar el contador del carrito
      if ((window as any).actualizarContadorCarrito) {
        (window as any).actualizarContadorCarrito();
      }

      // Cierra el modal de cantidad y reinicia visualmente el contador
      this.modalCantidadRef.nativeElement.classList.add('hidden');
      this.cantidad = 1;
      this.cantidadVisualRef.nativeElement.textContent = '1';

      // Muestra un mensaje de éxito
      this.mostrarAlerta('success', 'Producto añadido al carrito');
      }
    });
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuarioLogueado');
    this.router.navigate(['/']);
  }
  // Carga los pedidos realizados por el usuario
  cargarPedidos(): void {
    // Se hace una solicitud HTTP GET al backend usando el email del usuario logueado
    this.http.get<any[]>(`http://localhost:8080/api/pedidos/cliente?email=${this.usuario.email}`)
    .subscribe({
      // Si tiene éxito, guarda los pedidos recibidos
      next: (data) => this.pedidos = data,
      error: () => this.mostrarAlerta('error', 'Error al cargar pedidos')
    });
  }
  /**
   * Guarda el pedido seleccionado para mostrar detalles
   * @param pedido  Objeto del pedido
   */
  verDetalles(pedido: any): void {
    // Asigna el pedido a la variable que se usa en la vista
    this.pedidoSeleccionado = pedido;
  }
  /**
   * Descarga una factura en formato PDF desde el backend
   * @param id ID del pedido del cual descargar la factura
   */
  descargarFactura(id: number): void {
  // Hace un fetch para descargar un archivo PDF desde la API
  fetch(`http://localhost:8080/api/pedidos/${id}/pdf`)
  .then(res => res.blob())
  // Convierte la respuesta en un Blob (archivo binario)
  .then(blob => {
    // Crea un enlace temporal
    const link = document.createElement('a');
    // Genera una URL desde el blob
    link.href = URL.createObjectURL(blob);
    // Asigna un nombre al archivo
    link.download = `pedido_${id}.pdf`;
    // Dispara el clic automáticamente para descargar el archivo
    link.click();
    })
    this.mostrarAlerta('error', 'No se pudo descargar la factura');
  }
  // Cambia la vista para mostrar la sección de pedidos
  verPedidos(): void {
    this.mostrarPedidos = true;
  }
  // Activa el formulario para editar los datos del usuario
  editarDatos(): void {
    // Muestra el formulario de edición
    this.mostrarFormularioEdicion = true; 
    // Oculta la sección de pedidos si estaba visible
    this.mostrarPedidos = false;
    // Rellena el formulario con los datos actuales del usuario
  this.formUsuario = {
    nombre: this.usuario.nombre || '',
    email: this.usuario.email || '',
    telefono: this.usuario.telefono || '',
    direccion: this.usuario.direccion || ''
    };
  }
  /**
   * Envía los cambios del formulario del usuario al backend
   * @param event Evento submit del formulario HTML
   */
  guardarCambios(event: Event): void {
    // Evita que el formulario recargue la página
    event.preventDefault();

    // Solo continua si existe el usuario y su ID
    if (this.usuario && this.usuario.id) {
      // Obtiene el formulario y sus datos
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      // Captura la contraseña actual y la nueva, si están presentes
      const passwordActual = String(formData.get('passwordActual') || '').trim();
      const nuevaPassword = String(formData.get('nuevaPassword') || '').trim();
       // Crea un objeto con los datos actualizados
      const datosActualizados: any = {
        // Clona los datos anteriores
        ...this.usuario,
        nombre: String(formData.get('nombre')),
        email: String(formData.get('email')),
        telefono: String(formData.get('telefono')),
        direccion: String(formData.get('direccion')),
      };

      // Si el usuario ingresó una nueva contraseña, la agrega al objeto
      if (nuevaPassword.length > 0) {
        datosActualizados.passwordActual = passwordActual;
        datosActualizados.nuevaPassword = nuevaPassword;
      }

      // Envia los datos actualizados por fetch a la API
      fetch(`http://localhost:8080/api/usuarios/${this.usuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
      })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((usuarioActualizado) => {
          localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioActualizado));
          this.usuario = usuarioActualizado;
          this.mostrarFormularioEdicion = false;
          this.mostrarAlerta('success', '✅ Datos actualizados correctamente');
        })
        .catch(() => {
          this.mostrarAlerta('error', '❌ Error al actualizar datos');
        });
    } else {
      // Si no hay usuario o le falta ID, mostramos el error y no ejecutamos lo demás
      console.log('No se puede actualizar: falta el ID del usuario');
    }
  }
  // Oculta el formulario de edición del usuario
  cancelarEdicion(): void {
    this.mostrarFormularioEdicion = false;
  }
  /**
   * Abre el modal para seleccionar la cantidad de un producto que se quiere agregar al carrito.
   * @param producto Objeto del producto seleccionado por el usuario.
   */
  abrirModalCantidad(producto: any): void {
    // Guarda el producto actual para usarlo al agregar al carrito
    this.productoSeleccionado = producto;
    // Muestra el nombre del producto en el modal
    this.modalNombreRef.nativeElement.textContent = producto.nombre;
    // Quita la clase 'hidden' para mostrar el modal en pantalla
    this.modalCantidadRef.nativeElement.classList.remove('hidden');
    // Reinicia la cantidad a 1 al abrir el modal
    this.cantidad = 1;
    // Actualiza visualmente el número mostrado en el modal
    this.cantidadVisualRef.nativeElement.textContent = '1';
  }

  mostrarAlerta(tipo: string, mensaje: string): void {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }
}