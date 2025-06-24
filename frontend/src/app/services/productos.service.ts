import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
/**
 * Servicio para gestionar operaciones relacionadas con productos.
 * Permite crear productos mediante envío de datos tipo `FormData`.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  // URL base del endpoint del backend que gestiona productos
  private apiUrl = 'http://localhost:8080/api/productos'; 

  constructor(private http: HttpClient) { }
  /**
   * Envía una solicitud para crear un nuevo producto al backend.
   * Los datos del producto se envían en formato FormData para imágenes y archivos.
   * @param formData FormData con los datos del producto (nombre, precio, imagen, etc.)
   * @returns Observable que emite un texto de confirmación si tiene éxito
   */
  crearProducto(formData: FormData): Observable<string> {
    return this.http.post(`${this.apiUrl}/crear`, formData, { 
      // Espera una respuesta de tipo texto plano desde el backend
      responseType: 'text' })
    // Permite aplicar operadores de RxJS al Observable que devuelve el http.post.
    // En este caso, usa catchError para manejar cualquier error HTTP.
    .pipe(
      // Manejo de errores en caso de fallo de la petición
      catchError((error: HttpErrorResponse) => {
        console.error('Error al crear producto:', error);
         // Retorna un observable que lanza un error personalizado
        return throwError(() => new Error('Error al crear producto'));
      })
    );
  }
}
