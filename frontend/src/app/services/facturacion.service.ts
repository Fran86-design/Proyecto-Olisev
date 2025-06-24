import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
/**
 * Interfaz que representa una línea de factura.
 * Cada línea corresponde a un producto individual en una factura.
 */
export interface LineaFactura {
  // Nombre del producto vendido
  nombreProducto: string;
  // Cantidad de unidades vendidas
  cantidad: number;
  // Precio unitario
  precioUnitario: number;
}
/**
 * Interfaz que representa una factura completa.
 */
export interface Factura {
  // ID único de la factura
  id: number;
  // Fecha de emisión de la factura (formato ISO)
  fecha: string;
  // Dirección de entrega o facturación
  direccion: string;
  // Total sin IVA ni costes adicionales
  total: number;
  // Monto del IVA aplicado
  iva: number;
  // Coste adicional por envío
  costeEnvio: number;
  // Total final (total + IVA + envío)
  totalConIva: number;
  // Lista de productos incluidos en la factura
  lineas: LineaFactura[];
}
/**
 * Servicio de facturación encargado de gestionar facturas y su generación.
 */
@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  // URL base para el endpoint de facturación en el backend
  private baseUrl = 'http://localhost:8080/api/facturas';

  constructor(private http: HttpClient) {}
  /**
   * Obtiene la lista completa de facturas almacenadas en el backend.
   * @returns Observable que emite un array de objetos Factura
   */
  listarFacturas(): Observable<Factura[]> {
    // GET /api/facturas
    return this.http.get<Factura[]>(this.baseUrl);
  }
  /**
   * Genera una nueva factura a partir de un pedido existente.
   * @param pedidoId ID del pedido del cual se desea generar una factura
   * @returns Observable que emite la factura generada
   */
  generarFacturaDesdePedido(pedidoId: number): Observable<Factura> {
    // POST /api/facturas/desde-pedido/{pedidoId}
    return this.http.post<Factura>(`${this.baseUrl}/desde-pedido/${pedidoId}`, {});
  }
}