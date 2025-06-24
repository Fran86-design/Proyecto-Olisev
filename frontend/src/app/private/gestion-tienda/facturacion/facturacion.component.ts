import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UsaurioBoxComponent } from "../../../components/usuario-box/usaurio-box.component";

// Tipo para representar una línea de factura
type LineaFactura = {
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
};
// Tipo completo de factura
type Factura = {
  id: number;
  fecha: string;
  direccion: string;
  total: number;
  iva: number;
  costeEnvio: number;
  totalConIva: number;
  lineas: LineaFactura[];
  pedido: {
    id: number;
    nombreCliente: string;
  };
};

@Component({
  selector: 'app-facturacion',
  imports: [RouterModule, UsaurioBoxComponent],
  templateUrl: './facturacion.component.html',
  styleUrl: './facturacion.component.css',
  standalone: true
})
/**
 * Gestión y visualización de facturas.
 * 
 * Este componente permite:
 *   Cargar y listar todas las facturas desde el backend.
 *   Visualizar los detalles completos de una factura (incluye líneas de productos y cliente).
 *   Descargar una factura en formato PDF.
 *   Eliminar facturas existentes, con confirmación previa del usuario.
 *   Mostrar alertas informativas al usuario según el resultado de sus acciones.
 *   Navegar a otras secciones de la aplicación (gestión tienda, zona privada).
 * 
 * Ideal para personal administrativo o responsable de facturación dentro de la aplicación.
 */

export class FacturacionComponent implements OnInit {
  // Lista de facturas disponibles
  facturas: Factura[] = [];
  // Factura actualmente seleccionada para ver detalles
  facturaSeleccionada: Factura | null = null;
  alerta = {
    visible: false,
    tipo: 'success' as 'success' | 'error' | 'info',
    mensaje: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    console.log('Facturas:', this.facturas);
     // Se cargan las facturas al iniciar
    this.cargarFacturas();
  }
  /**
   * Realiza una petición HTTP para cargar las facturas desde el backend.
   */
  cargarFacturas(): void {
    this.http.get<Factura[]>('http://localhost:8080/api/facturas')
      .subscribe({
        // Asigna la respuesta a la lista de facturas
        next: data => this.facturas = data,
        error: () => this.mostrarAlerta('error', 'Error al cargar facturas')
      });
  }
  /**
   * Selecciona una factura para mostrar sus detalles.
   * @param factura Factura que se quiere visualizar
   */
  verDetalles(factura: Factura): void {
    this.facturaSeleccionada = factura;
  }
  /**
   * Cierra el panel de detalles, deseleccionando la factura actual.
   */
  cerrarDetalles(): void {
    this.facturaSeleccionada = null;
  }
  /**
   * Abre una nueva ventana para descargar el PDF de una factura.
   * @param id ID de la factura a descargar
   */
  descargarPDF(id: number): void {
    window.open(`http://localhost:8080/api/facturas/${id}/pdf`, '_blank');
  }
  /**
   * Elimina una factura tras confirmación del usuario.
   * @param id ID de la factura que se desea eliminar
   */
  eliminarFactura(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
      // Confirmación cancelada, no se ejecuta nada más
    } else {
      this.http.delete(`http://localhost:8080/api/facturas/${id}`)
      .subscribe({
        next: () => {
          this.facturas = this.facturas.filter(f => f.id !== id);
          this.facturaSeleccionada = null;
          this.mostrarAlerta('success', 'Factura eliminada correctamente');
        },
        error: () => this.mostrarAlerta('error', 'Error al eliminar la factura')
      });
    }
  }

  mostrarAlerta(tipo: 'success' | 'error' | 'info', mensaje: string): void {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }

  irAGestionTienda(): void {
    this.router.navigate(['/gestion-tienda']);
  }

  irAZonaPrivada(): void {
    this.router.navigate(['/zona-privada']);
  }
}

