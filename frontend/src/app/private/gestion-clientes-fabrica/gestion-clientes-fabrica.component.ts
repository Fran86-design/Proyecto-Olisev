import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsaurioBoxComponent } from "../../components/usuario-box/usaurio-box.component";

// Tipo para representar un cliente de fábrica
/**
 * type se usa para definir un alias de tipo. Es una forma de describir la estructura esperada de un objeto, en este caso, un cliente de fábrica. 
 */
type ClienteFabrica = {
  // ID del cliente (opcional), opcional cuando se crea un cliente por primera vez el backend lo asigna.
  id?: number;
  nombre: string;
  apellidos: string;
  nif: string;
  finca: string;
  direccion: string;
  telefono: string;
  email: string;
  password: string;
};


@Component({
  selector: 'app-gestion-clientes-fabrica',
  imports: [RouterModule, UsaurioBoxComponent],
  templateUrl: './gestion-clientes-fabrica.component.html',
  styleUrl: './gestion-clientes-fabrica.component.css',
  standalone: true
})
/**
 * Gestión de clientes de fábrica.
 * 
 * Este componente permite:
 *    Cargar y mostrar una lista de clientes desde el backend.
 *    Registrar nuevos clientes mediante un formulario.
 *    Eliminar clientes existentes con confirmación del usuario.
 *    Regenerar la contraseña de un cliente y enviarla por correo electrónico.
 *    Abrir y cerrar modales de registro o lista de clientes.
 *    Mostrar alertas temporales para informar del resultado de las acciones.
 *    Navegar a la zona privada de la aplicación.
 * 
 * El componente hace uso de:
 *    HttpClient para comunicarse con la API REST.
 *    Router para la navegación interna.
 *    UsaurioBoxComponent como componente auxiliar visual.
 * 
 * Tipado:
 *    Se define el tipo `ClienteFabrica` para estandarizar los datos de cliente.
 * 
 */

export class GestionClientesFabricaComponent implements OnInit {
  // Lista de clientes que se mostrarán
  clientes: ClienteFabrica[] = [];
  // Controla qué modal está abierto registro o lista
  // | une varios tipos posibles para una msma variable
  modal: 'registro' | 'lista' | null = null;
  // Booleano para mostrar u ocultar la contraseña
  verPassword: boolean = false;
  alerta = {
    visible: false,
    tipo: 'info', 
    mensaje: ''
  };


  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Se cargan los clientes desde el backend
    this.cargarClientes();
  }
  /**
   * Abre un modal específico.
   * @param nombre modal a abrir registro o lista.
   */
  abrirModal(nombre: 'registro' | 'lista'): void {
    this.modal = nombre;
  }
  // Cierra el modal activo.
  cerrarModal(): void {
    this.modal = null;
  }
  // Carga los clientes desde el backend y los asigna a la propiedad clientes.
  cargarClientes(): void {
  this.http.get<ClienteFabrica[]>('http://localhost:8080/api/clientes-fabrica')
  .subscribe({
    // Asignación de los datos
    next: data => this.clientes = data,
    error: () => this.mostrarAlerta('error', 'Error al cargar clientes')
  });
}
  /**
   * nvía los datos del formulario de registro para crear un nuevo cliente.
   * @param event Evento de envío del formulario
   */
  registrarCliente(event: Event): void {
    event.preventDefault(); 

    const form = event.target as HTMLFormElement;
    // Recolección de datos desde el formulario
    const datosCliente = {
      nombre: form['nombre'].value,
      apellidos: form['apellidos'].value,
      nif: form['nif'].value,
      finca: form['finca'].value,
      direccion: form['direccion'].value,
      telefono: form['telefono'].value,
      email: form['email'].value,
      password: form['password'].value
    };
    // Envío de datos al backend
    this.http.post<{ mensaje: string }>('http://localhost:8080/api/registro-fabrica', datosCliente).subscribe({
      next: (res) => {
        console.log(res.mensaje); 
        // Actualiza la lista
        this.cargarClientes();
        this.cerrarModal();
      },
    error: (err) => {
      console.error(err);
      this.mostrarAlerta('error', 'Error al registrar cliente')
      }
    });
  }
  /**
   * Elimina un cliente tras confirmación del usuario.
   * @param id ID del cliente a eliminar
   */
  eliminarCliente(id: number): void {
  if (confirm('¿Seguro que deseas eliminar este cliente?')) {
    this.http.delete(`http://localhost:8080/api/usuarios/${id}`).subscribe({
      next: () => {
         // Se elimina el cliente de la lista local
        this.clientes = this.clientes.filter(c => c.id !== id);
        this.mostrarAlerta('success', 'Cliente eliminado correctamente');
      },
      error: () => this.mostrarAlerta('error', 'Error al eliminar cliente')
    });
  }
}
  /**
   * Regenera la contraseña del cliente tras confirmación y la envía por email.
   * @param id ID del cliente
   */
  regenerarPassword(id: number) {
  if (confirm('¿Estás seguro de regenerar la contraseña de este cliente?')) {
    fetch(`http://localhost:8080/api/clientes-fabrica/${id}/regenerar-password`, {
      method: 'PUT'
    })
    .then(res => {
      // Verifica si la respuesta fue exitosa
      if (!res.ok) throw new Error();
      this.mostrarAlerta('success', 'Contraseña regenerada y enviada por email');
      this.cargarClientes();
    })
    .catch(() => this.mostrarAlerta('error', 'Error al regenerar la contraseña'));
    }
  } 

  irAZonaPrivada(): void {
    this.router.navigate(['/zona-privada']);
  }
  
  mostrarAlerta(tipo: 'success' | 'error' | 'info' | 'warning', mensaje: string): void {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }
}

