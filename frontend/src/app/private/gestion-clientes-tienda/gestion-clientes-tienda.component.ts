import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsaurioBoxComponent } from "../../components/usuario-box/usaurio-box.component";

@Component({
  selector: 'app-gestion-clientes-tienda',
  imports: [RouterModule, UsaurioBoxComponent],
  templateUrl: './gestion-clientes-tienda.component.html',
  styleUrl: './gestion-clientes-tienda.component.css',
  standalone: true
})
/**
 *  Gestión de clientes de la tienda.
 * 
 *  Funcionalidades principales:
 *    Cargar clientes desde el backend, incluyendo sus pedidos.
 *    Mostrar y gestionar diferentes modales: ver pedidos, ver facturas, editar cliente.
 *    Descargar facturas en PDF relacionadas a pedidos.
 *    Editar y guardar los datos de un cliente.
 *    Eliminar clientes con confirmación.
 *    Calcular el total de un pedido (precio * cantidad).
 *    Mostrar alertas informativas al usuario.
 * 
 *  Utiliza signals de Angular para manejar estado reactivo, clientes, modalAbierto, modalTipo, clienteActivo.
 *  Emplea fetch para llamadas HTTP a distintas rutas de la API.
 *  Este componente está orientado a usuarios con rol administrativo o de gestión,
 *  permitiendo un control completo sobre los clientes de la tienda y sus pedidos.
 */

export class GestionClientesTiendaComponent implements OnInit {
  // Signal reactivo que almacena la lista de clientes
  clientes = signal<any[]>([]);
  modalAbierto = signal(false);
  modalTipo = signal<'pedidos' | 'facturas' | 'editar' | null>(null);
  // Signal que guarda el cliente actualmente seleccionado
  clienteActivo = signal<any | null>(null);
  alerta = {
    visible: false,
    tipo: 'error' as 'success' | 'error' | 'info',
    mensaje: ''
  };

  constructor(private router: Router) {}
  // Carga los clientes y sus pedidos desde la API.
  ngOnInit(): void {
    fetch('http://localhost:8080/api/clientes-tienda')
      .then(res => res.json())
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Respuesta inesperada del servidor');

        const peticiones = data.map((cliente: any) => {
          return fetch(`http://localhost:8080/api/pedidos/cliente?email=${cliente.email}`)
            .then(res => res.json())
            .then((pedidos) => {
              // Se agregan los pedidos al cliente
              cliente.pedidos = pedidos;
              return cliente;
            });
        });
        // Espera a que todas las peticiones terminen antes de actualizar el estado
        Promise.all(peticiones).then(clientesFinales => {
          this.clientes.set(clientesFinales);
        });
      })
      .catch(err => {
        console.error('Error cargando clientes tienda:', err);
        this.mostrarAlerta('error', 'No se pudieron cargar los clientes.');
      });
  }
  /**
   * Abre un modal con el tipo y cliente especificados.
   * @param tipo Tipo de modal a mostrar
   * @param cliente Cliente al que se aplica la acción
   */
  abrirModal(tipo: 'pedidos' | 'facturas' | 'editar', cliente: any) {
    this.modalTipo.set(tipo);
    this.clienteActivo.set({ ...cliente });
    this.modalAbierto.set(true);
  }
  /**
   * Cierra el modal activo y limpia el estado relacionado
   */
  cerrarModal() {
    this.modalAbierto.set(false);
    this.modalTipo.set(null);
    this.clienteActivo.set(null);
  }
  /**
   * Descarga el PDF de una factura relacionada a un pedido.
   * @param pedido Objeto que representa el pedido
   */
  descargarFacturas(pedido: any): void {
    const url = `http://localhost:8080/api/pedidos/${pedido.id}/pdf`;

    fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error('No se pudo descargar el PDF');
      } else {
        // Convierte la respuesta en un blob (archivo)
        return res.blob();
      }
    })
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `factura-${pedido.id}.pdf`;
      // Fuerza la descarga
      link.click();
      // Libera memoria
      URL.revokeObjectURL(link.href);
    })
    .catch(err => {
      this.mostrarAlerta('error', '❌ Error al descargar factura: ' + err.message);
    });
  }
  /**
   * Calcula el total de un pedido sumando precio * cantidad.
   * @param pedido Objeto con detalles del pedido
   * @returns Total en formato con 2 decimales (string)
   */
  calcularTotal(pedido: any): string {
    const total = pedido.detalles.reduce((t: number, d: any) => t + d.precioUnitario * d.cantidad, 0);
    return total.toFixed(2);
  }
  /**
   * ver pedidos de un cliente
   * @param cliente Cliente seleccionado
   */
  verPedidos(cliente: any): void {
    console.log('Ver pedidos de', cliente);
  }
  /**
   * editar un cliente
   * @param cliente Cliente seleccionado 
   */
  editarCliente(cliente: any): void {
    console.log('Editar cliente', cliente);
  }
  /**
   * Elimina un cliente tras confirmación.
   * @param cliente Cliente a eliminar
   */
  eliminarCliente(cliente: any): void {
    if (confirm(`¿Eliminar a ${cliente.nombre}?`)) {
      console.log('Cliente eliminado');
    }
  }
  /**
   * Guarda los cambios editados de un cliente y actualiza la lista.
   */
  guardarCambios(): void {
    const cliente = this.clienteActivo();
    fetch(`http://localhost:8080/api/usuarios/${cliente.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente)
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Error al guardar');
      } else {
        // Devuelve el cliente actualizado
        return res.json();
      }
    })
    .then((actualizado) => {
      const copia = [...this.clientes()];
      const i = copia.findIndex(c => c.id === actualizado.id);
      if (i !== -1) copia[i] = actualizado;
      // Actualiza lista de clientes
      this.clientes.set(copia);
      this.cerrarModal();
    })
    .catch(err => {
      this.mostrarAlerta('error', '❌ Error: ' + err.message);
    });
  }
  /**
   * Extrae el valor de un input desde un evento.
   * @param event Evento del input
   * @returns Valor extraído del input
   */
  obtenerValor(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  irAZonaPrivada(): void {
    this.router.navigate(['/zona-privada']);
  }

  mostrarAlerta(tipo: 'success' | 'error' | 'info', mensaje: string): void {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }
}
