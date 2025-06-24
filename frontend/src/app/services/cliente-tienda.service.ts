import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ClienteTienda {
  id?: number;
  username: string;
  password: string;
  nombre: string;
  email: string;
  direccion: string;
  telefono: string;
}
/**
 * Servicio para gestionar operaciones relacionadas con los clientes de tienda.
 * Encargado del registro de nuevos clientes en la API.
 */
@Injectable({
  // El servicio estará disponible globalmente en toda la aplicación
  providedIn: 'root'
})
export class ClienteTiendaService {
  // URL base de la API donde se encuentran los endpoints relacionados
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }
  /**
   * Registra un nuevo cliente de tienda enviando sus datos al backend.
   * @param cliente Objeto de tipo ClienteTienda con la información del nuevo cliente
   * @returns Observable con la respuesta del backend que incluye el cliente registrado
   */
  registrar(cliente: ClienteTienda) {
    // Realiza una solicitud POST al endpoint de registro con los datos del cliente
    return this.http.post<ClienteTienda>(`${this.baseUrl}/registro-tienda`, cliente);
  }
}
