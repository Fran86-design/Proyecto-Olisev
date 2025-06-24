import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsaurioBoxComponent } from "../../components/usuario-box/usaurio-box.component";

// Define el tipo de una entrada de aceituna
type EntradaAceituna = {
  id: number;
  cliente: {
    id: number;
    nombre: string;
    apellidos: string;
  };
  variedad: string;
  tipo: string;
  kilos: number;
  fechaEntrada: string;
  cocedera: string;
  fechaCocedera: string;
  fermentador: string;
  fechaFermentador: string;
  gradosSal: number;
  gradosSosa: number;
  campana: string;
  observaciones: string;
  lote: number;
};

@Component({
  selector: 'app-gestion-fabrica',
  imports: [UsaurioBoxComponent],
  templateUrl: './gestion-fabrica.component.html',
  styleUrl: './gestion-fabrica.component.css',
  standalone: true
})
/**
 *  Gestión de entradas de aceituna en fábrica.
 * 
 * Funcionalidades principales:
 *    Carga y visualiza las entradas agrupadas por campañas.
 *    Registra nuevas entradas de aceituna y edita las existentes.
 *    Filtra las entradas por cliente, variedad, fechas y depósitos (cocedera/fermentador).
 *    Permite seleccionar clientes con autocompletado dinámico.
 *    Gestiona campañas: visualización, creación y agrupación de entradas.
 *    Descarga PDFs asociados a entradas individuales.
 *    Elimina entradas tras confirmación del usuario.
 *
 * Tipos definidos:
 *    EntradaAceituna: estructura que representa una entrada de aceituna (cliente, variedad, fechas, cantidades, etc.).
 * 
 * Este componente está diseñado para el personal encargado de controlar la recepción y tratamiento de aceitunas
 * en una fábrica, facilitando su registro, seguimiento y documentación.
 */

export class GestionFabricaComponent {
  // Diccionario de entradas por campaña
  campanias: { [clave: string]: EntradaAceituna[] } = {};
  // Lista de nombres de campañas
  campanasDisponibles: string[] = [];
  // Campaña activa actualmente
  campanaSeleccionada = '';
  mostrarModal = false;
  clientes: { id: number; nombre: string; apellidos: string }[] = [];
  // Estados del menú
  menuActivo: {
  [campana: string]: {
    verEntradas: boolean;
    nuevaEntrada: boolean;
  };
  } = {};
  // Modo actual del modal formulario o detalle
  modoFormulario = true;
  // Entrada que se está editando
  entradaEditando: EntradaAceituna | null = null;
  // Entradas que pasan los filtros
  entradasFiltradas: { [campana: string]: EntradaAceituna[] } = {};
  alerta = {
    visible: false,
    tipo: 'success' as 'success' | 'error' | 'info',
    mensaje: ''
  };

  constructor(private http: HttpClient, private router: Router) {};

  ngOnInit(): void {
    // Carga todas las entradas
    this.cargarEntradas();
    // Carga todos los clientes
    this.cargarClientes();
    // Define una función global para filtrar clientes por nombre/apellido
    (window as any).filtrarClientes = (valor: string) => {
      const sugerencias = document.getElementById('sugerencias')!;
      const input = valor.toLowerCase().trim();
      sugerencias.innerHTML = '';

      if (input) {
        // Filtra la lista de clientes usando el texto ingresado
        const resultados = this.clientes.filter(cliente =>
          `${cliente.nombre} ${cliente.apellidos}`.toLowerCase().includes(input)
        );

        if (resultados.length > 0) {
          resultados.forEach(cliente => {
            const li = document.createElement('li');
            li.textContent = `${cliente.nombre} ${cliente.apellidos}`;
            // Al hacer clic en el cliente sugerido, se selecciona y se completa el input
            li.onclick = () => {
              const inputNombre = document.getElementById('busquedaCliente') as HTMLInputElement;
              const inputId = document.getElementById('clienteId') as HTMLInputElement;

              if (inputNombre) inputNombre.value = `${cliente.nombre} ${cliente.apellidos}`;
              if (inputId) inputId.value = cliente.id.toString();

              sugerencias.innerHTML = '';
              sugerencias.classList.add('oculto');
              console.log('Cliente seleccionado:', cliente);
            };
            sugerencias.appendChild(li);
          });
          sugerencias.classList.remove('oculto');
        } else {
          sugerencias.classList.add('oculto');
        }
      } else {
        sugerencias.classList.add('oculto');
      }
    };
    // Función global para aplicar filtros
    (window as any).aplicarFiltros = () => this.aplicarFiltros();
    // Función para aplicar filtros con tecla Enter
    (window as any).enterFiltrar = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.aplicarFiltros();
        if (!this.mostrarModal) {
          this.mostrarModal = true;
          this.modoFormulario = false;
        }
      }
    };
    // Función global para limpiar un campo de filtro por ID
    (window as any).limpiarFiltro = (id: string) => {
      const input = document.getElementById(id) as HTMLInputElement;
      if (input) {
        input.value = '';
        this.aplicarFiltros();
      }
    };
  }

  ngAfterViewChecked(): void {
    if (this.mostrarModal && !this.modoFormulario) {
      // Añade evento keydown a los inputs de filtros para permitir filtrar con Enter
      const filtros = document.querySelectorAll('.filtros-entradas input');
      filtros.forEach(input => {
        const htmlInput = input as HTMLElement;
        htmlInput.removeEventListener('keydown', this._enterFiltrar as EventListener);
        htmlInput.addEventListener('keydown', this._enterFiltrar as EventListener);
      });
    }
  }
  // Función auxiliar para manejar Enter en inputs de filtros
  private _enterFiltrar = (e: Event) => {
    const teclado = e as KeyboardEvent;
    if (teclado.key === 'Enter') {
      e.preventDefault();
      this.aplicarFiltros();
    }
  };

  /**
   * Crea una nueva campaña si el nombre no existe ya
   * @param event Evento submit del formulario
   */
  crearCampana(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const nombre = (form['nuevaCampana'] as HTMLInputElement).value.trim();

    if (nombre && !this.campanasDisponibles.includes(nombre)) {
      this.campanias[nombre] = [];
      this.campanasDisponibles.push(nombre);
      form.reset();
    }
  }
  /**
   * Carga la lista de clientes desde el backend.
   */
  cargarClientes(): void {
    this.http.get<any[]>('http://localhost:8080/api/clientes-fabrica').subscribe({
      next: data => this.clientes = data,
      error: () => this.mostrarAlerta('error', 'Error al cargar clientes')
    });
  }
  /**
   * Carga las entradas de aceituna y las organiza por campaña.
   */
  cargarEntradas(): void {
    this.http.get<EntradaAceituna[]>('http://localhost:8080/api/aceitunas').subscribe({
      next: entradas => {
        this.campanias = {};
        entradas.forEach(e => {
          if (!this.campanias[e.campana]) {
          this.campanias[e.campana] = [];
          }
        this.campanias[e.campana].push(e);
        });
        this.campanasDisponibles = Object.keys(this.campanias).sort();

        this.aplicarFiltros();
      },
      error: () => this.mostrarAlerta('error', 'Error al cargar entradas')
    });
  }
  /**
   * Registra o edita una entrada de aceituna.
   * @param event Evento submit del formulario
   */
  registrarEntrada(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const datos = {
      cliente: { id: Number((form['clienteId'] as HTMLInputElement).value) },
      variedad: form['variedad'].value,
      tipo: form['tipo'].value,
      kilos: Number(form['kilos'].value),
      fechaEntrada: form['fechaEntrada'].value,
      cocedera: form['cocedera'].value,
      fechaCocedera: form['fechaCocedera'].value,
      fermentador: form['fermentador'].value,
      fechaFermentador: form['fechaFermentador'].value,
      gradosSal: Number(form['gradosSal'].value),
      gradosSosa: Number(form['gradosSosa'].value),
      campana: this.campanaSeleccionada,
      observaciones: form['observaciones'].value,
      lote: Number(form['lote'].value)
    };

    if (datos.cliente.id && !isNaN(datos.cliente.id)) {
      const url = this.entradaEditando
        ? `http://localhost:8080/api/aceitunas/${this.entradaEditando.id}`
        : 'http://localhost:8080/api/aceitunas';

      const peticion = this.entradaEditando
        ? this.http.put(url, datos)
        : this.http.post(url, datos);

      peticion.subscribe({
        next: () => {
          this.mostrarAlerta('success', this.entradaEditando ? 'Entrada actualizada' : 'Entrada registrada');
          this.cargarEntradas();
          this.cerrarModal();
        },
        error: () => this.mostrarAlerta('error', 'Error al guardar entrada')
      });
    } else {
      this.mostrarAlerta('error', 'Debes seleccionar un cliente antes de guardar.');
    }
  }
  /**
   * Abre el modal de detalle de campaña.
   * @param campana Campaña seleccionada
   */
  abrirModal(campana: string): void {
    this.campanaSeleccionada = campana;
    this.mostrarModal = true;
  }
  /**
   * Alterna entre ver entradas y formulario de nueva entrada.
   * @param campana Campaña a mostrar
   * @param tipo Tipo de vista
   */
  alternarVista(campana: string, tipo: 'verEntradas' | 'nuevaEntrada'): void {
    const estado = this.menuActivo[campana] ?? { verEntradas: false, nuevaEntrada: false };
    this.menuActivo[campana] = {
      ...estado,
      [tipo]: !estado[tipo]
    };
    this.campanaSeleccionada = campana;
  }
  /**
   * Cierra el modal actual
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.entradaEditando = null;
  }
  /**
   * Aplica filtros de cliente, fecha, variedad, cocedera y fermentador a las entradas.
   */
  aplicarFiltros(): void {
    const cliente = (document.getElementById('filtro-cliente') as HTMLInputElement)?.value.toLowerCase() || '';
    const fecha = (document.getElementById('filtro-fecha') as HTMLInputElement)?.value || '';
    const variedad = (document.getElementById('filtro-variedad') as HTMLInputElement)?.value.toLowerCase() || '';
    const cocedera = (document.getElementById('filtro-cocedera') as HTMLInputElement)?.value.toLowerCase() || '';
    const fermentador = (document.getElementById('filtro-fermentador') as HTMLInputElement)?.value.toLowerCase() || '';

    this.entradasFiltradas = {};

    for (const campana of this.campanasDisponibles) {
      const todas = this.campanias[campana] || [];

      this.entradasFiltradas[campana] = todas.filter(e => {
        return (
          `${e.cliente.nombre} ${e.cliente.apellidos}`.toLowerCase().includes(cliente) &&
          (!fecha || e.fechaEntrada === fecha) &&
          e.variedad.toLowerCase().includes(variedad) &&
          e.cocedera.toLowerCase().includes(cocedera) &&
          e.fermentador.toLowerCase().includes(fermentador)
        );
      });
    }
  }
  /**
   * Muestra sugerencias de clientes en el input de búsqueda.
   * @param valor Texto introducido por el usuario
   */
  filtrarClientes(valor: string): void {
    const lista = document.getElementById('sugerencias');
    if (lista) {
      valor = valor.toLowerCase();
      lista.innerHTML = '';

      this.clientes
      .filter(c => `${c.nombre} ${c.apellidos}`.toLowerCase().includes(valor))
      .forEach(c => {
        const li = document.createElement('li');
        li.textContent = `${c.nombre} ${c.apellidos}`;
        li.onclick = () => (window as any).seleccionarCliente(c);
        lista.appendChild(li);
      });
    }
  }
  /**
   * Selecciona un cliente y rellena los campos del formulario.
   * @param cliente Cliente seleccionado
   */
  seleccionarCliente(cliente: { id: number; nombre: string; apellidos: string }): void {
    const input = document.getElementById('busquedaCliente') as HTMLInputElement;
    const hidden = document.getElementById('clienteId') as HTMLInputElement;
    const lista = document.getElementById('sugerencias');

    if (input) input.value = `${cliente.nombre} ${cliente.apellidos}`;
    if (hidden) hidden.value = cliente.id.toString();
    if (lista) lista.innerHTML = '';
  }
  /**
   * Abre el formulario de nueva entrada
   * @param campana Nombre de la campaña en la que se va a registrar la nueva entrada.
   */
  abrirFormularioEntrada(campana: string): void {
    this.mostrarModal = true;
    this.campanaSeleccionada = campana;
    this.modoFormulario = true;
  }
  /**
   * Prepara el formulario para editar una entrada existente
   * @param entrada Entrada seleccionada para editar
   */
  editarEntrada(entrada: EntradaAceituna): void {
    console.log('Entrada a editar:', entrada);

    this.entradaEditando = entrada;
    this.campanaSeleccionada = entrada.campana;
    this.modoFormulario = true;
    this.mostrarModal = true;

    setTimeout(() => {
      const clienteIdInput = document.getElementById('clienteId') as HTMLInputElement | null;
      const clienteNombreInput = document.getElementById('busquedaCliente') as HTMLInputElement | null;

      const cliente = entrada.cliente;

      if (clienteIdInput && cliente?.id != null) {
        clienteIdInput.value = cliente.id.toString();
      } else if (clienteIdInput) {
        clienteIdInput.value = '';
      }

      if (clienteNombreInput && cliente?.nombre && cliente?.apellidos) {
        clienteNombreInput.value = `${cliente.nombre} ${cliente.apellidos}`;
      } else if (clienteNombreInput) {
        clienteNombreInput.value = '';
      }
    }, 0);
  }
  /**
   * Descarga el PDF asociado a una entrada.
   * @param entrada Entrada para la cual se descarga el PDF
   */
  descargarPDF(entrada: EntradaAceituna): void {
    const url = `http://localhost:8080/api/aceitunas/${entrada.id}/pdf`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `entrada_${entrada.id}.pdf`;
    a.target = '_blank';
    a.click();
  }
  /**
   * Elimina una entrada de la base de datos
   * @param id ID de la entrada a eliminar
   */
  eliminarEntrada(id: number): void {
    if (confirm('¿Seguro que deseas eliminar esta entrada?')) {
      this.http.delete(`http://localhost:8080/api/aceitunas/${id}`).subscribe({
        next: () => {
          this.mostrarAlerta('success', 'Entrada eliminada');
          this.cargarEntradas();
        },
        error: () => this.mostrarAlerta('error', 'Error al eliminar entrada')
      });
    }
  }
  /**
   * Muestra el detalle de una campaña sin activar el modo formulario
   * @param campana Nombre de la campaña que se desea visualizar.
   */
  abrirDetalleCampana(campana: string) {
    this.campanaSeleccionada = campana;
    this.modoFormulario = false;
    this.mostrarModal = true;
  }
  
  irAZonaPrivada(): void {
    this.router.navigate(['/zona-privada']);
  }

  mostrarAlerta(tipo: 'success' | 'error' | 'info', mensaje: string): void {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }
}
