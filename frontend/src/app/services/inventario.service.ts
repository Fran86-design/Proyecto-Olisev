import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
/**
 * Interfaz que representa un producto en el inventario.
 */
export interface Producto {
  // ID único del producto
  id: number;
  // Nombre del producto
  nombre: string;
  // Categoría a la que pertenece
  categoria: string;  
  // Precio al que se compra el producto     
  precioCompra: number;
  // Precio de venta al cliente
  precio: number;
  // Unidades disponibles en inventario
  stock: number;
  // Fecha de la última actualización del stock
  fechaActualizacionStock: string | Date;
}
/**
 * Interfaz que representa un movimiento de stock (entrada o salida).
 */
export interface MovimientoStock {
   // ID único del movimiento
  id: number;
  // Tipo de movimiento: entrada o salida
  tipo: 'ENTRADA' | 'SALIDA';
  // Cantidad de unidades movidas
  cantidad: number;
  // Fecha en que se realizó el movimiento
  fecha: string;
  // Información básica del producto afectado
  producto: {
    id: number;
    nombre: string;
    categoria: string;
    precioCompra: number;
    precio: number;
    stock: number;
  };
}
/**
 * Servicio para gestionar el inventario de productos.
 * Permite obtener productos, actualizar stock, y consultar movimientos.
 */
@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  // URL base para los endpoints de inventario en el backend
  private apiUrl = 'http://localhost:8080/api/inventario';

  constructor(private http: HttpClient) {}
  /**
   * Obtiene la lista completa de productos del inventario.
   * @returns Observable con un array de productos
   */
  getInventario(): Observable<Producto[]> {
    // GET /api/inventario
    return this.http.get<Producto[]>(this.apiUrl);
  }
  /**
   * Actualiza el stock de un producto específico.
   * @param id ID del producto a actualizar
   * @param stock Nueva cantidad de stock
   * @returns Observable con el producto actualizado
   */
  actualizarStock(id: number, stock: number): Observable<Producto> {
    // PUT /api/inventario/{id}
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, { stock });
  }
  /**
   * Actualiza todos los datos de un producto, no solo stock.
   * @param producto Objeto completo del producto con los nuevos datos
   * @returns Observable con el producto actualizado
   */
  actualizarProducto(producto: Producto): Observable<Producto> {
    // Endpoint externo a inventario
    return this.http.put<Producto>(`http://localhost:8080/api/productos/editar/${producto.id}`, producto);
  }
  /**
   * Obtiene todos los movimientos de stock registrados (entradas y salidas).
   * @returns Observable con un array de movimientos de stock
   */
  getMovimientos(): Observable<MovimientoStock[]> {
    // GET /api/inventario/movimientos
    return this.http.get<MovimientoStock[]>(`${this.apiUrl}/movimientos`);
  }

  /**
 * Registra un movimiento de stock (entrada o salida).
 * @param movimiento Objeto con tipo, cantidad, fecha y producto
 * @returns Observable del movimiento guardado
 */
  registrarMovimiento(movimiento: {
    // Tipo de movimiento
    tipo: 'ENTRADA' | 'SALIDA';
    // ID del producto al que se le modifica el stock
    productoId: number;
    // Cuánto stock entra o sale
    cantidad: number;
    // Fecha del movimiento
    fecha: string;
     // Retorna un Observable para manejar la respuesta (async)
    }) : Observable<any> {
    // Define la URL según el tipo de movimiento
    // Si es ENTRADA → va a /api/inventario/entrada
    // Si es SALIDA → va a /api/inventario/salida
    const url = movimiento.tipo === 'ENTRADA'
      ? 'http://localhost:8080/api/inventario/entrada'
      : 'http://localhost:8080/api/inventario/salida';
    // Hace una petición POST al backend con los datos del movimiento
    // También le dice a Angular que la respuesta será texto (no JSON)
    return this.http.post(url, movimiento, { responseType: 'text' });
  }
}
