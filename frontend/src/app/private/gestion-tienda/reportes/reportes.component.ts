import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProductoVentaDetalle, ReportesService, VentaPorFecha } from '../../../services/reportes.service';
import { MovimientoStock } from '../../../services/inventario.service';
import { HttpClient } from '@angular/common/http';
import { UsaurioBoxComponent } from "../../../components/usuario-box/usaurio-box.component";
import { AuthService } from '../../../services/auth.service';

// Interfaz para representar el resumen mensual de ventas
interface MesResumen {
  mes: string;
  total: number;
  productos: ProductoVentaDetalle[];
}

@Component({
  selector: 'app-reportes',
  imports: [RouterModule, UsaurioBoxComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css', 
  standalone: true,

})
/**
 * Este componente se encarga de gestionar, visualizar y exportar
 * los reportes de ventas y movimientos de stock. Permite mostrar
 * información agrupada por día, mes y año, así como acceder a
 * resúmenes anuales previamente guardados en el sistema.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 *  Obtener y renderizar ventas por día, mes y año.
 *  Mostrar detalles de productos vendidos.
 *  Descargar reportes en formato PDF.
 *  Guardar y cargar resúmenes anuales desde el backend.
 *  Visualizar y filtrar movimientos de stock por tipo y año.
 *  Crear archivos anuales de movimientos si no existen.
 *  Navegación a módulos relacionados (stock, gestión, zona privada).
 * 
 * Solo accesible si el usuario tiene rol de administrador autenticado.
 * Redirecciona a la raíz en caso contrario.
 * 
 * Interfaces internas: MesResumen
 * Variables de estado: ventas, productos, movimientos, filtros
 * Métodos públicos: abrirModal, cerrarModal, renderizarTabla, etc.
 * 
 */

export class ReportesComponent implements OnInit{
  // Modal de resumen
  @ViewChild('modal') modal!: ElementRef<HTMLDialogElement>;
  // Cuerpo de la tabla de resumen
  @ViewChild('tablaCuerpo') tablaCuerpo!: ElementRef<HTMLTableSectionElement>;
  // Tabla de productos vendidos
  @ViewChild('tablaDetalleProductos') tablaDetalleProductos!: ElementRef<HTMLTableSectionElement>;
  // Contenedor de resumen anual
  @ViewChild('detalleAnioContenedor') detalleAnioContenedor!: ElementRef<HTMLDivElement>;
  // Modal de movimientos del año
  @ViewChild('modalResumenAnual') modalResumenAnual!: ElementRef<HTMLDialogElement>;
  // Si se está viendo un resumen guardado
  viendoResumenGuardado: boolean = false;
  // Año del resumen actualmente visible
  anioResumenActivo: number | null = null;
  // Tipo de modal abierto
  tipoModalActual: 'dia' | 'mes' | 'anio' | 'resumen-guardado' | 'movimientos-guardados' | null = null;
  ventasDiaRaw: VentaPorFecha[] = [];
  ventasMesRaw: VentaPorFecha[] = [];
  ventasPorAnio: VentaPorFecha[] = [];
  ventasAnio: MesResumen[] = [];
  productosVendidosHoy: ProductoVentaDetalle[] = [];
  productosVendidosMes: ProductoVentaDetalle[] = [];
  // Años disponibles con archivo de movimientos
  aniosMovimientos: number[] = [];
  // Año actualmente seleccionado para ver movimientos
  anioSeleccionado: number | null = null;
  // Movimientos de stock del año seleccionado
  movimientosAnio: MovimientoStock[] = [];
  // Lista de años con resúmenes anuales guardados
  archivosGuardados: number[] = [];
   // Resumen anual cargado desde archivo
  resumenGuardado: MesResumen[] = [];
  // Filtro de tipo de movimiento de stock
  tipoFiltro: 'TODOS' | 'ENTRADA' | 'SALIDA' = 'TODOS';
  /**
   * 
   * @param reportesService Servicio para obtener datos de ventas
   * @param http Cliente HTTP para peticiones directas
   * @param router Servicio de rutas de Angular
   * @param authService authService Servicio de autenticación
   */
  constructor(
    private reportesService: ReportesService,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}
  // Verifica si el usuario es admin; si no, redirige al inicio
  ngOnInit(): void {
    if (!this.authService.isAdminAutenticado()) {
      this.router.navigate(['/']);
    }
    // Cargar ventas del día actual
    this.reportesService.obtenerVentasDelDia().subscribe(data => {
      this.ventasDiaRaw = data;
    });
    // Cargar ventas del mes actual
    this.reportesService.obtenerVentasPorMes().subscribe(data => {
      this.ventasMesRaw = data;
    });
    // Cargar lista de años disponibles con archivos de movimientos
    this.cargarAniosMovimientos();
     // Obtener años de resúmenes anuales guardados en el backends
    this.reportesService.listarResumenesAnuales().subscribe({
      next: anios => this.archivosGuardados = anios,
      error: err => console.error('Error al listar resúmenes:', err)
    });
  }

  /**
   * Getter para obtener las ventas del día (sin filtrar).
   * @returns Lista de ventas del día
   */
  public get ventasHoyFiltradas(): VentaPorFecha[] {
    return this.ventasDiaRaw;
  }
  /**
   * Getter para obtener ventas del mes actual.
   * @returns Ventas filtradas por el mes actual
   */
  public get ventasMesFiltradas(): VentaPorFecha[] {
    // Formato YYYY-MM
    const mes = new Date().toISOString().slice(0, 7); 
    return this.ventasMesRaw.filter(v => v.fecha === mes);
  }
  /**
   * Carga y actualiza el resumen anual de ventas del año actual,
   * incluyendo los productos vendidos por mes.
   */
  actualizarVentasDelAnio(): void {
    // Año actual
    const anio = new Date().getFullYear();
    const nombresMeses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    // Obtener ventas mensuales 
    this.reportesService.obtenerVentasPorMes().subscribe(data => {
       // Crear un resumen mensual con datos vacíos inicialmente
      const resumen: MesResumen[] = Array.from({ length: 12 }, (_, i) => {
        const mes = `${anio}-${(i + 1).toString().padStart(2, '0')}`;
        const entrada = data.find(v => v.fecha === mes);
        return {
          mes: `${nombresMeses[i]} ${anio}`,
          total: entrada ? entrada.total : 0,
          productos: []
        };
      });
      // Llamadas para cargar productos vendidos por cada mes
      const llamadas = resumen.map((mesRes, i) => {
        return this.reportesService.obtenerDetalleProductosDelMes(anio, i + 1).toPromise().then(p => {
          mesRes.productos = p ?? [];
          // Ignora errores
        }).catch(() => {});
      });
       // Espera a que todas las llamadas terminen
      Promise.all(llamadas).then(() => {
        // Guarda el resumen completo
        this.ventasAnio = resumen;
        // Renderiza visualmente
        this.abrirModal('anio'); 
      });
    });
  }
  /**
   * bre el modal correspondiente al tipo de resumen solicitado.
   * @param tipo Puede ser 'dia', 'mes' o 'anio'
   */
  abrirModal(tipo: 'dia' | 'mes' | 'anio') {
    this.tipoModalActual = tipo;

    if (tipo === 'dia') {
      // Mostrar tabla de ventas del día
      this.renderizarTabla(this.ventasHoyFiltradas); 
      // Obtener productos vendidos hoy
      this.reportesService.obtenerDetalleProductosDelDia().subscribe(data => {
        this.productosVendidosHoy = data;
        this.renderizarDetalleProductos(data); 
      });
      // Abre el modal
      this.modal.nativeElement.showModal();
    }
    else if (tipo === 'mes') {
      // Mostrar tabla de ventas del mes
      this.renderizarTabla(this.ventasMesFiltradas); 
      // Determinar mes y año actual
      const hoy = new Date();
      const anioActual = hoy.getFullYear();
      const mesActual = hoy.getMonth() + 1;
      // Obtener productos vendidos en el mes actual
      this.reportesService.obtenerDetalleProductosDelMes(anioActual, mesActual).subscribe(prod => {
        this.productosVendidosMes = prod;
        // Renderizar con delay para evitar problemas de renderizado
        setTimeout(() => this.renderizarDetalleProductos(prod), 0);
      });
      // Mostrar modal
      this.modal.nativeElement.showModal();
    }
    else if (tipo === 'anio') {
      // Cargar y mostrar resumen anual actual
      this.anioResumenActivo = new Date().getFullYear();
      this.tipoModalActual = 'anio';
      this.modal.nativeElement.showModal();

      setTimeout(() => this.renderizarDetalleAnual(), 0);
    }
  }
  /**
   *  Cierra el modal principal y limpia el tipo de modal actual
   */
  cerrarModal() {
    // Cierra el <dialog>
    this.modal.nativeElement.close();
     // Resetea el tipo
    this.tipoModalActual = null;
  }
  /**
   * Renderiza una tabla HTML con las ventas por fecha.
   * @param datos Lista de ventas a mostrar
   */
  renderizarTabla(datos: VentaPorFecha[]) {
    // Referencia al <tbody>
    const tbody = this.tablaCuerpo.nativeElement;
    tbody.innerHTML = '';

    if (datos.length === 0) {
       // Si no hay datos, muestra fila vacía informativa
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="2">Sin ventas registradas</td>';
      tbody.appendChild(tr);
    } else {
      // Inserta una fila por cada venta
      for (const fila of datos) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${fila.fecha}</td><td>${fila.total.toFixed(2)}</td>`;
        tbody.appendChild(tr);
      }
    }
  }
  /**
   * Renderiza los productos vendidos en una tabla HTML.
   * @param productos Lista de productos vendidos
   */
  renderizarDetalleProductos(productos: ProductoVentaDetalle[]) {
    // <tbody> de productos
    const tbody = this.tablaDetalleProductos.nativeElement;
    tbody.innerHTML = '';
    for (const prod of productos) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${prod.nombreProducto}</td><td>${prod.cantidadVendida}</td>`;
      tbody.appendChild(tr);
    }
  }
  /**
   * Renderiza el resumen anual: muestra por cada mes
   * el total vendido y productos vendidos.
   */
  renderizarDetalleAnual() {
    if (!this.detalleAnioContenedor) {
      console.warn('detalleAnioContenedor aún no está disponible.');
    }

  const cont = this.detalleAnioContenedor.nativeElement;
  cont.innerHTML = '';

  for (const mes of this.ventasAnio) {
    const div = document.createElement('div');
    div.innerHTML = `<h4>${mes.mes} - Total: ${mes.total.toFixed(2)} €</h4>`;
    const table = document.createElement('table');
    const body = document.createElement('tbody');

    if (mes.productos.length === 0) {
      body.innerHTML = '<tr><td colspan="2">Sin productos</td></tr>';
    } else {
      for (const p of mes.productos) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${p.nombreProducto}</td><td>${p.cantidadVendida}</td>`;
        body.appendChild(row);
      }
    }

    table.appendChild(body);
    div.appendChild(table);
    cont.appendChild(div);
    }
  }
  
  /**
   * Carga un resumen anual guardado desde el backend y lo muestra en el modal.
   * @param anio Año del resumen a cargar
   */
  cargarResumenGuardado(anio: number) {
    // Define tipo de modal
    this.tipoModalActual = 'resumen-guardado';
    this.anioResumenActivo = anio;
    this.reportesService.obtenerResumenAnual(anio).subscribe({
      next: res => {
        // Actualiza resumen
        this.ventasAnio = res.resumenMensual;
        // Abre modal
        this.modal.nativeElement.showModal();
        // Renderiza detalle
        setTimeout(() => this.renderizarDetalleAnual(), 0);
      },
      error: err => console.log('No se pudo cargar el resumen.')
    });
  }
  /**
   * Solicita al backend la descarga del PDF de reporte.
   * @param tipo Tipo de reporte ('dia', 'mes', 'anio', 'stock')
   */
  descargarPDF(tipo: 'dia' | 'mes' | 'anio' | 'stock') {
    this.reportesService.descargarPDF(tipo).subscribe(blob => {
      // Crea URL temporal
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Nombre del archivo
      a.download = `reporte-${tipo}.pdf`;
      // Simula click para descarga
      a.click();
      // Libera el objeto URL
      URL.revokeObjectURL(url);
    });
  }
  /**
   * Guarda el resumen actual del año en el servidor.
   */
  guardarResumenActual() {
    const resumen = {
      anio: new Date().getFullYear(),
      resumenMensual: this.ventasAnio
    };
    this.reportesService.guardarResumenAnual(resumen).subscribe({
      next: () => console.log('Resumen guardado correctamente'),
      error: () => console.log('Error al guardar el resumen')
    });
  }
  /**
   * Carga la lista de años que tienen archivos de movimientos de stock en el backend.
   */
  cargarAniosMovimientos() {
    this.http.get<number[]>('http://localhost:8080/api/movimientos/anios').subscribe({
      next: anios => {
        this.aniosMovimientos = anios;
      },
      error: err => {
        console.error('Error al cargar años de movimientos:', err);
      }
    });
  }
  /**
   * Obtiene del servidor los movimientos de stock correspondientes a un año.
   * @param anio Año a consultar
   */
  verMovimientosPorAnio(anio: number) {
    this.anioSeleccionado = anio;
    this.http.get<MovimientoStock[]>(`http://localhost:8080/api/movimientos/por-anio/${anio}`).subscribe({
      next: data => {
        // Actualiza movimientos cargados
        this.movimientosAnio = data;
      },
      error: err => {
        console.error('❌ Error al cargar movimientos:', err);
      }
    });
  }
  /**
   * Solicita al usuario un año y lo envía al servidor para crear
   * un archivo de movimientos correspondiente a ese año.
   */
  agregarAnioArchivo() {
    // Pide año al usuario
    const nuevo = prompt('Introduce el año a agregar');

    if (nuevo && !isNaN(+nuevo)) {
      // Convierte a número
      const anio = parseInt(nuevo, 10);
      // Validación del rango de año
      if (anio >= 2000 && anio <= new Date().getFullYear() + 5) {
        this.http.post(`http://localhost:8080/api/movimientos/crear-archivo/${anio}`, {}, {
          responseType: 'text'
        }).subscribe({
          next: () => {
            console.log(`Archivo del año ${anio} creado.`);
            // Recarga la lista
            this.cargarAniosMovimientos(); 
          },
          error: err => {
            if (err.status === 409) {
              console.log(`Ya existe un archivo para el año ${anio}.`);
            } else {
              console.error('Error al crear el archivo:', err);
            }
          }
        });
      }
    } else {
      // Si no se introduce correctamente
      console.log('Año no válido.');
    }
  }
  /**
   * Navega al componente de control de stock.
   */
  irAlControlStock() {
    this.router.navigate(['/stock-control']);
  }
  /**
   * Abre el modal que muestra los movimientos registrados en un año dado.
   * @param anio Año a visualizar
   */
  abrirModalResumen(anio: number): void {
    console.log('Cargando movimientos del año:', anio);
    this.anioResumenActivo = anio;
    this.tipoModalActual = 'movimientos-guardados';

    this.http.get<MovimientoStock[]>(`http://localhost:8080/api/movimientos/por-anio/${anio}`).subscribe({
      next: movimientos => {
        this.movimientosAnio = movimientos;
        // Abre modal de resumen anual
        this.modalResumenAnual.nativeElement.showModal();
      },
      error: err => {
        console.error('Error al cargar movimientos:', err);
      }
    });
  }
  /**
   * Descarga el PDF del resumen anual.
   * @param tipo Tipo de documento ('anio' en este caso)
   */
  descargarPDFAnio(tipo: 'anio') {
  this.reportesService.descargarPDF(tipo).subscribe(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${tipo}.pdf`;
    a.click();
    // Libera recursos
    window.URL.revokeObjectURL(url);
    });
  }
  /**
   * Elimina un resumen anual guardado desde el backend.
   * @param anio Año del resumen a borrar
   */
  borrarResumenAnual(anio: number) {
    if (confirm(`¿Seguro que quieres borrar el resumen del año ${anio}?`)) {
      this.http.delete(`/api/reportes/resumen-anual/${anio}`).subscribe({
        next: () => {
          console.log(`Resumen del ${anio} eliminado`);
          // Cierra modal
          this.modalResumenAnual.nativeElement.close();
        },
        error: () => console.log('No se pudo borrar el resumen')
      });
    }
  }
  /**
   *  Cierra el modal de resumen anual de movimientos.
   */
  cerrarModalResumenAnual() {
    this.modalResumenAnual.nativeElement.close();
  }
  /**
   * Cambia el tipo de filtro para mostrar los movimientos:
   * TODOS, ENTRADA o SALIDA.
   * @param event Evento de cambio en el <select>
   */
  cambiarFiltroTipo(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.tipoFiltro = select.value as 'TODOS' | 'ENTRADA' | 'SALIDA';
  }
  /**
   * Devuelve la lista de movimientos filtrados según el tipo actual.
   * @returns Lista de movimientos filtrados
   */
  movimientosFiltrados(): MovimientoStock[] {
    if (this.tipoFiltro === 'TODOS') {
      return this.movimientosAnio;
    } else {
      return this.movimientosAnio.filter(m => m.tipo === this.tipoFiltro);
    }
  }
  /**
   * Ordena los movimientos filtrados de más reciente a más antiguo.
   * @returns Lista ordenada de movimientos
   */
  movimientosOrdenados(): MovimientoStock[] {
    const lista = this.movimientosFiltrados();
    return [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
  irAGestionTienda(): void {
    this.router.navigate(['/gestion-tienda']);
  }

  irAZonaPrivada(): void {
    this.router.navigate(['/zona-privada']);
  }
}



