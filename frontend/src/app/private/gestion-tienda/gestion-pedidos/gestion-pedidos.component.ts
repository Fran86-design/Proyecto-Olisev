import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsaurioBoxComponent } from "../../../components/usuario-box/usaurio-box.component";

type LineaPedido = {
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
};

type Pedido = {
  id: number;
  fechaPedido: string;
  total: number;
  nombreCliente: string;
  direccion: string;
  email: string;
  telefono: string;
  enviado: boolean;
  pagado: boolean;
  fechaPago?: string;
  codigoAnual?: string;
  lineas: LineaPedido[];
};

@Component({
  selector: 'app-gestion-pedidos',
  standalone: true,
  imports: [RouterModule, CommonModule, UsaurioBoxComponent],
  templateUrl: './gestion-pedidos.component.html',
  styleUrl: './gestion-pedidos.component.css'
})
/**
 * Gestión de pedidos.
 * 
 * Este componente permite visualizar, filtrar, editar, eliminar, marcar como enviados o pagados,
 * y generar facturas a partir de pedidos realizados por clientes. También gestiona archivos anuales 
 * de pedidos, permitiendo su creación, carga y eliminación. Incluye una interfaz interactiva para 
 * seleccionar y editar pedidos, así como para descargar archivos PDF asociados.
 * 
 * Funcionalidades principales:
 *   Cargar y filtrar pedidos por estado o por año.
 *   Ver detalles de un pedido específico.
 *   Editar y guardar información del cliente asociada a un pedido.
 *   Marcar pedidos como enviados o pagados.
 *   Eliminar pedidos previa confirmación.
 *   Descargar PDF de un pedido.
 *   Generar factura desde un pedido.
 */

export class GestionPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  // ID del pedido actualmente seleccionado
  pedidoSeleccionadoId: number | null = null;
  // Pedido que se está editando
  pedidoParaEditar: Pedido | null = null;
  // Filtro actual aplicado
  filtroActual: 'todos' | 'enviados' | 'no-enviados' | number = 'todos';
  archivos: number[] = [];
  alerta = {
    visible: false,
    tipo: 'success' as 'success' | 'error' | 'info',
    mensaje: ''
  };


  constructor(private router: Router) {}

  ngOnInit(): void {
    // Carga todos los pedidos al iniciar
    this.cargarPedidos('todos');
    // Carga archivos existentes
    this.cargarArchivosPorAnio();
  }
  // Getter que devuelve el pedido actualmente seleccionado
  get pedidoSeleccionado(): Pedido | null {
    return this.pedidos.find(p => p.id === this.pedidoSeleccionadoId) || null;
  }
  /**
   * Selecciona un pedido por ID.
   * @param id ID del pedido a seleccionar
   */
  seleccionarPedido(id: number): void {
    this.pedidoSeleccionadoId = id;
    this.pedidoParaEditar = null;
  }
  /**
   * Cierra la vista de detalles o edición
   */
  cerrarDetalles(): void {
    this.pedidoSeleccionadoId = null;
    this.pedidoParaEditar = null;
  }
  /**
   * Carga pedidos desde el backend según el filtro proporcionado.
   * @param filtro Valor que puede ser 'todos', 'enviados', 'no-enviados' o un año (número)
   */
  cargarPedidos(filtro: 'todos' | 'enviados' | 'no-enviados' | number): void {
    this.cerrarDetalles();
    this.filtroActual = filtro;

    let url = 'http://localhost:8080/api/pedidos';
    // Agrega parámetros al URL según el filtro
    if (filtro === 'enviados') {
      url += '?enviado=true';
    } else if (filtro === 'no-enviados') {
      url += '?enviado=false';
    } else if (typeof filtro === 'number') {
      url += '?anio=' + filtro;
    }
    // Realiza la petición
    fetch(url)
    .then(res => res.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new Error('Respuesta no válida del servidor');
      }

      this.pedidos = (typeof filtro === 'number')
      ? data.filter((p: Pedido) => p.enviado)
      : data.filter((p: Pedido) => !p.enviado);
    })
    .catch(() => this.mostrarAlerta('error', 'Error al cargar pedidos'));
  }
  /**
   * Marca el pedido actual como enviado
   */
  marcarComoEnviadoPedido(): void {
    if (!this.pedidoSeleccionadoId) {
    } else {
      fetch(`http://localhost:8080/api/pedidos/${this.pedidoSeleccionadoId}/enviar`, {
        method: 'PUT'
      })
      .then(res => {
        if (!res.ok) throw new Error();
        this.cargarPedidos(this.filtroActual);
      })
      .catch(() => this.mostrarAlerta('error', 'Error al marcar como enviado'));
    }
  }
  /**
   * Marca el pedido actual como pagado
   */
  marcarComoPagadoPedido(): void {
    if (!this.pedidoSeleccionadoId) {
      
    } else {
      fetch(`http://localhost:8080/api/pedidos/${this.pedidoSeleccionadoId}/pagar`, {
        method: 'PUT'
      })
      .then(res => {
        if (!res.ok) throw new Error();
        this.cargarPedidos(this.filtroActual);
      })
      .catch(() => this.mostrarAlerta('error', 'Error al marcar como pagado'));
    }
  }
  /**
   * Descarga el PDF del pedido seleccionado
   */
  descargarPDFPedido(): void {
    if (!this.pedidoSeleccionadoId) {
    
    } else {
      fetch(`http://localhost:8080/api/pedidos/${this.pedidoSeleccionadoId}/pdf`)
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `pedido_${this.pedidoSeleccionadoId}.pdf`;
        link.click();
      })
      .catch(() => this.mostrarAlerta('error', 'No se pudo generar el PDF'));
    }
  }
  /**
   * Elimina el pedido actual con confirmación
   */
  eliminarPedido(): void {
    if (!this.pedidoSeleccionadoId) {
    
    } else if (!confirm('¿Estás seguro de eliminar este pedido?')) {
      // El usuario canceló la confirmación
    } else {
      fetch(`http://localhost:8080/api/pedidos/${this.pedidoSeleccionadoId}`, {
        method: 'DELETE'
      })
      .then(res => {
        if (!res.ok) throw new Error();
        this.cargarPedidos(this.filtroActual);
        this.pedidoSeleccionadoId = null;
      })
      .catch(() => this.mostrarAlerta('error', 'Error al eliminar el pedido'));
    }
  }
  /**
   * Prepara el formulario para editar el pedido seleccionado
   */
  editarPedido(): void {
    if (!this.pedidoSeleccionadoId) {
    
    } else {
      const pedido = this.pedidos.find(p => p.id === this.pedidoSeleccionadoId);
      if (pedido) {
        this.pedidoParaEditar = { ...pedido };
      }
    }
  }
  /**
   * Guarda los cambios realizados en el pedido editado.
   * @param nombre Nombre del cliente
   * @param direccion  Dirección de envío
   * @param email Correo electrónico
   * @param telefono Teléfono
   */
  guardarEdicion(nombre: string, direccion: string, email: string, telefono: string): void {
    if (!this.pedidoParaEditar) {
    
    } else {
      const actualizado: Pedido = {
        ...this.pedidoParaEditar,
        nombreCliente: nombre,
        direccion,
        email,
        telefono
      };

      fetch(`http://localhost:8080/api/pedidos/${actualizado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actualizado)
      })
      .then(res => {
        if (!res.ok) throw new Error();
        this.pedidoParaEditar = null;
        this.pedidoSeleccionadoId = null;
        this.cargarPedidos(this.filtroActual);
      })
      .catch(() => this.mostrarAlerta('error', 'Error al guardar los cambios'));
    }
  }
  /**
   * Solicita el año y crea un archivo nuevo para ese año
   */
  crearArchivoNuevoAnio(): void {
    const anioStr = prompt('Introduce el año:');
    const anio = Number(anioStr);

    if (!anioStr || isNaN(anio)) {
      this.mostrarAlerta('error', 'Año no válido');
    
    } else {
      fetch(`http://localhost:8080/api/pedidos/crear-archivo/${anio}`, {
        method: 'POST'
      })
      .then(res => {
        if (!res.ok) throw new Error();
        this.archivos.push(anio);
        this.archivos = [...new Set(this.archivos)].sort((a, b) => b - a); // Ordena y elimina duplicados
        this.cargarPedidos(anio);
      })
      .catch(() => this.mostrarAlerta('error', 'No se pudo crear el archivo.'));
    }
  }
  /**
   * Carga la lista de años con archivos generados
   */
  cargarArchivosPorAnio(): void {
    fetch('http://localhost:8080/api/pedidos/archivos')
    .then(res => res.json())
    .then((data: number[]) => {
      this.archivos = Array.isArray(data) ? data : [];
    })
    .catch(() => this.mostrarAlerta('error', 'Error al cargar archivos'));
  }
  /**
   * Elimina un archivo de pedidos por año
   * @param anio Año del archivo a eliminar
   */
  eliminarArchivo(anio: number): void {
    if (!confirm(`¿Eliminar el archivo del año ${anio}?`)) {
      // Confirmación cancelada por el usuario
    } else {
      fetch(`http://localhost:8080/api/pedidos/archivos/${anio}`, {
        method: 'DELETE'
      })
      .then(res => {
        if (!res.ok) throw new Error();
        this.cargarArchivosPorAnio();
        if (this.filtroActual === anio) this.cargarPedidos('todos');
      })
      .catch(() => this.mostrarAlerta('error', 'Error al eliminar archivo'));
    }
  }

  irAGestionTienda(): void {
    this.router.navigate(['/gestion-tienda']);
  }

  irAZonaPrivada(): void {
    this.router.navigate(['/zona-privada']);
  }
  /**
   * Activa o desactiva la selección de un pedido
   * @param id ID del pedido que se desea seleccionar
   */
  toggleSeleccionPedido(id: number): void {
    const yaSeleccionado = this.pedidoSeleccionadoId === id;

    this.pedidoSeleccionadoId = yaSeleccionado ? null : id;

    if (yaSeleccionado || (this.pedidoParaEditar && this.pedidoParaEditar.id !== id)) {
      this.pedidoParaEditar = null;
    }
  }
  /**
   * Cancela la edición activa
   */
  cancelarEdicion(): void {
    this.pedidoParaEditar = null;
  }
  /**
   * Envía el formulario de edición desde plantilla HTML.
   * @param event Evento de envío del formulario
   */
  submitEdicion(event: Event): void {
    event.preventDefault();

    if (!this.pedidoParaEditar) {
    } else {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);

      const actualizado: Pedido = {
        ...this.pedidoParaEditar,
        nombreCliente: String(formData.get('nombre')),
        direccion: String(formData.get('direccion')),
        email: String(formData.get('email')),
        telefono: String(formData.get('telefono')),
      };

      fetch(`http://localhost:8080/api/pedidos/${actualizado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actualizado)
      })
      .then(res => {
        if (!res.ok) throw new Error();
        this.pedidoParaEditar = null;
        this.pedidoSeleccionadoId = null;
        this.cargarPedidos(this.filtroActual);
      })
      .catch(() => this.mostrarAlerta('error', 'Error al guardar los cambios'));
    }
  } 
  /**
   * Genera una factura a partir de un pedido.
   * @param pedidoId ID del pedido a facturar
   */
  generarFactura(pedidoId: number): void {
    fetch(`http://localhost:8080/api/facturas/desde-pedido/${pedidoId}`, {
      method: 'POST'
    })
    .then(res => {
      if (!res.ok) {
        throw new Error();
      }
      return res.json();
    })
    .then(factura => {
      this.mostrarAlerta('success', `Factura generada con ID ${factura.id}`);
    })
    .catch(() => this.mostrarAlerta('error', 'Error al generar la factura'));
  }

  mostrarAlerta(tipo: 'success' | 'error' | 'info', mensaje: string): void {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }
  /**
   * Cierra la vista de un archivo anual y vuelve a mostrar todos los pedidos.
   */
  cerrarArchivo(): void {
    this.filtroActual = 'todos';
    this.pedidoSeleccionadoId = null;
    this.pedidoParaEditar = null;
    this.cargarPedidos('todos');
  }
}