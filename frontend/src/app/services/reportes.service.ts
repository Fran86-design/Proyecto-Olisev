import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Representa una venta agregada por fecha (día, mes o año).
 */
export interface VentaPorFecha {
  // Fecha en formato YYYY-MM
  fecha: string;
  // Total de ventas para esa fecha
  total: number;
}
/**
 * Representa los detalles de un producto vendido (nombre y cantidad).
 */
export interface ProductoVentaDetalle {
  nombreProducto: string;
  cantidadVendida: number;
}
/**
 * Representa un producto básico en el sistema.
 */
export interface Producto {
  id: number;
  nombre: string;
  stock: number;
}
/**
 * Servicio para gestionar los reportes de ventas y productos.
 * Proporciona métodos para descargar PDF, consultar ventas y stock, y manejar resúmenes anuales.
 */
@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  // URL base para todos los endpoints del módulo de reportes
  private base = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) {}
  /**
   * Descarga un reporte en formato PDF (por día, mes, año o stock).
   * @param tipo Tipo de reporte: 'dia' | 'mes' | 'anio' | 'stock'
   * @returns Observable<Blob> con el contenido del PDF
   */
  descargarPDF(tipo: 'dia' | 'mes' | 'anio' | 'stock'): Observable<Blob> {
    const endpoint: string =
      tipo === 'stock'
        ? 'stock-bajo-pdf'
        : `ventas-${tipo}-pdf`;

    return this.http.get(`${this.base}/${endpoint}`, {
      // Se espera un archivo binario (PDF)
      responseType: 'blob'
    });
  }
  /**
   * Obtiene las ventas agrupadas por fecha
   * @returns Observable con una lista de ventas por fecha
   */
  obtenerVentasPorDia(): Observable<VentaPorFecha[]> {
    return this.http.get<VentaPorFecha[]>(`${this.base}/ventas-por-fecha`);
  }
  /**
   * Obtiene las ventas específicas del día actual.
   * @returns Observable con las ventas del día
   */
  obtenerVentasDelDia(): Observable<VentaPorFecha[]> {
    return this.http.get<VentaPorFecha[]>(`${this.base}/ventas-del-dia`);
  }
  /**
   * Obtiene las ventas agrupadas por mes.
   * @returns Observable con la lista de ventas mensuales
   */
  obtenerVentasPorMes(): Observable<VentaPorFecha[]> {
    return this.http.get<VentaPorFecha[]>(`${this.base}/ventas-por-mes`);
  }
  /**
   * Obtiene las ventas de un año específico.
   * @param anio Año deseado (formato YYYY)
   * @returns Observable con la lista de ventas por mes de ese año
   */
  obtenerVentasPorAnio(anio: number): Observable<VentaPorFecha[]> {
    return this.http.get<VentaPorFecha[]>(`${this.base}/ventas-por-anio?anio=${anio}`);
  }
  /**
   * Obtiene los productos cuyo stock está por debajo de un límite.
   * @param limite Cantidad mínima de stock para considerarse "bajo"
   * @returns Observable con la lista de productos con poco stock
   */
  obtenerProductosBajoStock(limite: number = 5): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.base}/bajo-stock?limite=${limite}`);
  }
  /**
   * Obtiene el detalle de productos vendidos hoy.
   * @returns Observable con la lista de productos vendidos en el día
   */
  obtenerDetalleProductosDelDia(): Observable<ProductoVentaDetalle[]> {
    return this.http.get<ProductoVentaDetalle[]>(`${this.base}/productos-vendidos-hoy`);
  }
  /**
   * Obtiene el detalle de productos vendidos en un mes y año específicos.
   * @param anio Año deseado
   * @param mes mes Mes deseado (1–12)
   * @returns Observable con productos vendidos ese mes
   */
  obtenerDetalleProductosDelMes(anio: number, mes: number): Observable<ProductoVentaDetalle[]> {
    return this.http.get<ProductoVentaDetalle[]>(`${this.base}/productos-vendidos-mes?anio=${anio}&mes=${mes}`);
  }
  /**
   * Obtiene el detalle de productos vendidos durante un año completo.
   * @param anio Año deseado
   * @returns Observable con la lista de productos vendidos en ese año
   */
  obtenerDetalleProductosDelAnio(anio: number): Observable<ProductoVentaDetalle[]> {
    return this.http.get<ProductoVentaDetalle[]>(`${this.base}/productos-vendidos-anio?anio=${anio}`);
  }
  /**
   * Guarda un resumen anual de ventas al finalizar el año.
   * @param resumen Objeto que contiene el resumen anual
   * @returns Observable con la respuesta textual del servidor
   */
  guardarResumenAnual(resumen: unknown): Observable<string> {
    return this.http.post('http://localhost:8080/api/reportes/guardar-resumen-anual', resumen, {
      responseType: 'text'
    }) as Observable<string>;
  }
  /**
   * Lista todos los años para los que existen resúmenes anuales guardados.
   * @returns Observable con la lista de años disponibles
   */
  listarResumenesAnuales(): Observable<number[]> {
    return this.http.get<number[]>('http://localhost:8080/api/reportes/resumenes-anuales');
  }
  /**
   * Obtiene un resumen anual completo con totales y productos por mes.
   * @param anio Año deseado
   * @returns Observable con el resumen anual estructurado por mes
   */
  obtenerResumenAnual(anio: number): Observable<{
    resumenMensual: { mes: string; total: number; productos: ProductoVentaDetalle[] }[];
  }> {
    return this.http.get<{
      resumenMensual: { mes: string; total: number; productos: ProductoVentaDetalle[] }[];
    }>(`${this.base}/resumen-anual?anio=${anio}`);
  }
}