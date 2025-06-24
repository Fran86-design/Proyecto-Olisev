// Importa el cliente HTTP para hacer peticiones REST a una API, peticiones REST: solicitudes que una aplicación hace a un servidor para obtener, enviar, modificar o eliminar datos. 
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-clientes-empresa',
  imports: [RouterModule],
  templateUrl: './clientes-empresa.component.html',
  styleUrl: './clientes-empresa.component.css',
  standalone: true,
})
/**
 * Este componente está diseñado para clientes del tipo "empresa" (rol: FABRICA o ADMIN)
 * que acceden a su panel privado para visualizar, organizar y gestionar sus entradas de aceitunas
 * agrupadas por campañas.
 * 
 * Funcionalidades principales:
 *    Verificación del usuario logueado y restricción por roles válidos (FABRICA o ADMIN).
 *    Carga automática de las entradas del cliente desde la API REST al iniciar sesión.
 *    Agrupación de las entradas por campaña, y extracción de los nombres de campañas únicas.
 *    Control del estado de visibilidad (mostrar/ocultar) de campañas en la interfaz.
 *    Control del estado "cerrada/abierta" de campañas, sincronizado con el backend vía PUT.
 *    Uso de signals (`signal`) de Angular para mantener la reactividad y simplificar el control de estado.
 *    Manejo de alertas visuales para errores o restricciones.
 * 
 */
export class ClientesEmpresaComponent implements OnInit {
  // Guarda el usuario logueado obtenido del localStorage
  usuario: any = null;
  // Signal que mantiene un Set con las campañas actualmente visibles, SET: guarda valores sin duplicados, comprueba si un valor existe de forma rápida y agrega o elimina elementos fácilmente.
  campanasAbiertas = signal<Set<string>>(new Set());
  // Signal que contiene los nombres de las campañas del cliente
  campanias = signal<string[]>([]);
  // Signal que agrupa las entradas de aceitunas por campaña
  entradasPorCampania = signal<{ [campana: string]: any[] }>({});
   // Signal que guarda el estado de cada campaña cerrada o no
  estadosCampania = signal<{ [nombre: string]: { id: number; cerrada: boolean } }>({});

  alerta = {
    visible: false,
    tipo: 'error',
    mensaje: ''
  };
  // Se activa si el usuario tiene permiso, rol válido
  accesoPermitido = false;
  // Se activa si ya se verificó el usuario
  accesoEvaluado = false;
  // HttpClient: para hacer peticiones HTTP
  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    // Intenta recuperar el usuario del almacenamiento local
    const userStr = localStorage.getItem('usuarioLogueado');
    // Si no hay usuario guardado, muestra alerta y redirige a la página principal
    if (!userStr) {
      this.mostrarAlerta('error', '❌ No has iniciado sesión');
      setTimeout(() => this.router.navigate(['/']), 1500);
      // Si hay datos, intenta convertir el texto JSON a un objeto
    } else {
      const user = JSON.parse(userStr);
      // Si el usuario no es válido o su rol no es FABRICA o ADMIN, redirige
      if (!user || !user.rol || (user.rol !== 'FABRICA' && user.rol !== 'ADMIN')) {
        this.mostrarAlerta('error', '⛔ Acceso restringido solo para clientes de empresa');
        setTimeout(() => this.router.navigate(['/']), 1500);
        // Si el usuario es válido, lo guarda en la propiedad
      } else {
        this.usuario = user;
        // Marca el acceso como evaluado y válido
        this.accesoPermitido = true;
        this.accesoEvaluado = true;
        // Carga las entradas del cliente desde la API
        this.cargarEntradasDelCliente();
      }
    }
  }
  // Llama a la API para obtener todas las entradas de aceitunas de ese cliente
  cargarEntradasDelCliente(): void {
    this.http.get<any[]>(`http://localhost:8080/api/aceitunas/cliente/${this.usuario.id}`).subscribe({
      // Si se recibe respuesta exitosa:
      next: (entradas) => {
        // Objeto para agrupar por campaña
        const agrupadas: { [campana: string]: any[] } = {};
        // Recorre todas las entradas
        for (const entrada of entradas) {
          // Solo si la entrada tiene campaña
          if (entrada.campana) {
             // Si es la primera vez que aparece la campaña, se crea el array
            if (!agrupadas[entrada.campana]) {
              agrupadas[entrada.campana] = [];
            }
          // Añade la entrada a la campaña correspondiente
          agrupadas[entrada.campana].push(entrada);
          }
        }
        // Guarda las entradas agrupadas en el signal
        this.entradasPorCampania.set(agrupadas);
        // Extrae los nombres de campaña, los ordena y los guarda
        this.campanias.set(Object.keys(agrupadas).sort());
        // Llama a función para obtener los estados de cada campaña
        this.cargarEstadosCampania(Object.keys(agrupadas));
      },
      // Si falla la petición
      error: () => console.log('Error al cargar las entradas')
    });
  }
  /**
   * Carga los estados, cerrada o no de las campañas indicadas por nombre.
   * Hace una petición HTTP al servidor, filtra solo las campañas del cliente actual,
   * y actualiza el signal `estadosCampania` con sus estados.
   * @param nombres Lista de nombres de campaña que pertenecen al cliente y que se desean actualizar.
   */
  cargarEstadosCampania(nombres: string[]): void {
    // Llama a la API para obtener todas las campañas del sistema
    this.http.get<any[]>('http://localhost:8080/api/aceitunas/campanias').subscribe({
      next: (campanias) => {
        const estados: { [nombre: string]: { id: number; cerrada: boolean } } = {};
         // Recorre las campañas devueltas y filtra solo las del cliente actual
        for (const c of campanias) {
          if (c && c.nombre && nombres.includes(c.nombre)) {
            estados[c.nombre] = { id: c.id, cerrada: c.cerrada };
          }
        }
        // Guarda los estados en el signal correspondiente
        this.estadosCampania.set(estados);
      },
      // Error en API
      error: () => console.log('Error al cargar estados de campañas')
    });
  }
  /**
   * Cambia el estado abierto/cerrado de una campaña específica.
   * Luego actualiza la información en el servidor mediante una petición PUT
   * y modifica el signal `estadosCampania` para reflejar el nuevo estado.
   * @param nombre  Nombre de la campaña que se desea alternar
   */
  alternarEstado(nombre: string): void {
    // Obtiene estado actual
    const estado = this.estadosCampania()[nombre];

    if (estado) {
      // Invierte el estado actual
      const nuevoEstado = !estado.cerrada;
      // Llamada PUT a la API para actualizar el estado de esa campaña
      this.http.put(`http://localhost:8080/api/campanias/${estado.id}/estado`, { cerrada: nuevoEstado }).subscribe({
        next: () => {
          // Copia objeto de estados
          //... operador de propagación: copia las propiedades de un objeto en uno nuevo, crea una copia independiente del objeto, se puede modificar sin romper la reactividad del signal.
          const copia = { ...this.estadosCampania() };
          // Modifica el estado de esta campaña
          copia[nombre].cerrada = nuevoEstado;
          // Guarda el nuevo objeto
          this.estadosCampania.set(copia);
        },
        error: () => console.log('Error al cambiar el estado de la campaña')
      });
    }
  }
  /**
   * Alterna la visibilidad de una campaña en la interfaz.
   * Si la campaña está visible, la oculta. Si está oculta, la muestra.
   * Internamente usa un Set<string> para controlar qué campañas están "abiertas".
   * @param campana campaña cuya visibilidad se desea alternar
   */
  alternarVisible(campana: string): void {
    // Obtiene el Set actual con campañas visibles
    const actual = this.campanasAbiertas();
    // Crea una copia para no modificar el original directamente
    const nuevo = new Set(actual);
     // Si ya está visible
    if (nuevo.has(campana)) {
      // la quita del Set, la oculta
      nuevo.delete(campana);
    } else {
      // Si no está, la añade, la muestra
      nuevo.add(campana);
    }
    // Actualiza el signal con el nuevo Set
    this.campanasAbiertas.set(nuevo);
  }

  cerrarSesion(): void {
    // Borra los datos del usuario
    localStorage.removeItem('usuarioLogueado');
    // Redirige al inicio
    this.router.navigate(['/']);
  }

  mostrarAlerta(tipo: string, mensaje: string): void {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }
}