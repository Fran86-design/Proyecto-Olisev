import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
/**
 * Interfaz que representa un movimiento de stock (entrada o salida).
 */
export interface MovimientoStock {
  // ID único del movimiento
  id: number;
  // Tipo de movimiento: "ENTRADA" o "SALIDA"
  tipo: string;
  // Cantidad movida
  cantidad: number;
  // Fecha en que ocurrió el movimiento
  fecha: Date;
   // Datos mínimos del producto relacionado
  producto: {
    id: number;
    nombre: string;
  };
}
/**
 * Servicio para consultar, crear y eliminar archivos de movimientos de stock.
 * Se comunica con la API backend a través de distintos endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class MovimientosService {
  // URL base de los endpoints relacionados con movimientos
  private baseUrl = 'http://localhost:8080/api/movimientos';

  constructor(private http: HttpClient) {}
  /**
   * Obtiene los movimientos registrados para un año específico.
   * @param anio Año a consultar
   * @returns Observable con un array de movimientos
   */
  obtenerMovimientosPorAnio(anio: number): Observable<MovimientoStock[]> {
    // GET /api/movimientos/por-anio/{anio}
    return this.http.get<MovimientoStock[]>(`${this.baseUrl}/por-anio/${anio}`);
  }
  /**
   * Obtiene una lista de años para los cuales existen archivos de movimientos guardados.
   * @returns Observable con un array de números (años)
   */
  obtenerAniosDisponibles(): Observable<number[]> {
    // GET /api/movimientos/anios
    return this.http.get<number[]>(`${this.baseUrl}/anios`);
  }
  /**
   * Crea un archivo de resumen de movimientos para un año dado.
   * @param anio Año para el cual se generará el archivo
   * @returns Observable con un string de confirmación desde el backend
   */
  crearArchivo(anio: number): Observable<string> {
    // POST /api/movimientos/crear-archivo/{anio}
    return this.http.post(`${this.baseUrl}/crear-archivo/${anio}`, null, {
       // Espera un texto plano como respuesta
      responseType: 'text'
    });
  }
  /**
   * Elimina un archivo de resumen de movimientos correspondiente a un año.
   * @param anio Año del archivo a eliminar
   * @returns Observable con un string de confirmación desde el backend
   */
  eliminarArchivo(anio: number): Observable<string> {
    // DELETE /api/movimientos/archivos/{anio}
    return this.http.delete(`${this.baseUrl}/archivos/${anio}`, {
      responseType: 'text'
    });
  }
}
