import { Component, computed, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InventarioService, Producto } from '../../../services/inventario.service';
/**
 * CurrencyPipe: formatear valores numéricos como moneda.
 * DatePipe: formatea fechas.
 */
import { CurrencyPipe, DatePipe} from '@angular/common';
import { UsaurioBoxComponent } from "../../../components/usuario-box/usaurio-box.component";

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [RouterModule, CurrencyPipe, UsaurioBoxComponent, DatePipe],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
/**
 * Este componente es responsable de mostrar, gestionar y actualizar 
 * un inventario de productos. Permite:
 * 
 *  Cargar productos desde un servicio backend.
 *  Filtrar productos por categoría.
 *  Editar información del producto desde un modal.
 *  Agregar stock a un producto y registrar la fecha de actualización.
 *  Mostrar alertas informativas al usuario.
 *  Detectar productos con stock bajo.
 *  Navegar entre secciones de la aplicación.
 * 
 * Utiliza signals para el manejo reactivo del estado del componente
 * y pipes de Angular para formateo de fechas y monedas.
 */

export class InventarioComponent implements OnInit {
   // Lista de productos
  productos = signal<Producto[]>([]);
  // ID del menú desplegable abierto
  menuAbierto = signal<number | null>(null);
  // Estado del modal
  modalAbierto = signal(false);
  // Producto en edición
  productoEditando = signal<Producto | null>(null);
  // Filtro por categoría
  categoriaSeleccionada = signal<string>('todas');
  // Cantidad a agregar
  nuevaCantidadEntrante = 0;
  stockAAgregar: number = 0;
  // Cantidad real a agregar al stock
  alerta = {
    visible: false,
    tipo: 'success' as 'success' | 'error' | 'info',
    mensaje: ''
  };
  // Computed signal para obtener productos con stock bajo
  productosStockBajo = computed(() =>
    this.productos().filter(p => p.stock <= 5)
  );

  constructor(private inventarioService: InventarioService, private router: Router) {}

  ngOnInit(): void {
    // Cargar productos al iniciar
    this.cargarInventario();
  }
  /**
   * Carga la lista de productos desde el servicio.
   */
  cargarInventario(): void {
    this.inventarioService.getInventario().subscribe(data => {
      // Actualiza el signal con los productos obtenidos
      this.productos.set(data);
    });
  }
  /**
   * Alterna la visibilidad del menú de opciones de un producto.
   * @param id ID del producto
   */
  toggleMenu(id: number) {
    this.menuAbierto.set(this.menuAbierto() === id ? null : id);
  }
  /**
   * Abre el modal para editar un producto.
   * @param producto Producto seleccionado
   */
  abrirModal(producto: Producto) {
    // Copia del producto
    this.productoEditando.set({ ...producto });
    // Abre el modal
    this.modalAbierto.set(true);
  }
  /**
   * Cierra el modal de edición y resetea los campos relacionados.
   */
  cerrarModal() {
    this.modalAbierto.set(false);
    this.productoEditando.set(null);
    this.nuevaCantidadEntrante = 0;
  }
  /**
   * Actualiza un campo específico del producto en edición.
   * Convierte strings numéricos a números.
   * @param campo Nombre del campo a actualizar
   * @param valor Valor nuevo
   */
  actualizarCampo(campo: keyof Producto, valor: string | number) {
    const prod = this.productoEditando();
    if (prod) {
      const actualizado = {
        ...prod,
        [campo]: typeof valor === 'string' && !isNaN(+valor) ? +valor : valor
      };
      this.productoEditando.set(actualizado);
    }
  }
  /**
   * Manejador del input de cantidad entrante.
   * @param event Evento del input
   */
  onStockInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = parseInt(input.value, 10);
    this.nuevaCantidadEntrante = isNaN(valor) ? 0 : valor;
  }
  /**
   * Manejador del input para stock extra a agregar.
   * @param event Evento del input
   */
  onStockExtraChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = parseInt(input.value, 10);
    this.stockAAgregar = isNaN(valor) || valor < 0 ? 0 : valor;
  }
  /**
   * Guarda los cambios del producto editado, actualizando el stock y fecha.
   */
  guardarCambios(): void {
  const producto = this.productoEditando();
  const cantidad = this.stockAAgregar;

  if (producto && cantidad > 0) {
    const nuevoStock = producto.stock + cantidad;
    const ahora = new Date().toISOString();

    const actualizado = {
      ...producto,
      stock: nuevoStock,
      fechaActualizacionStock: ahora
    };

    this.inventarioService.actualizarProducto(actualizado).subscribe(() => {
      // 🔄 Actualiza la lista local
      const actualizados = this.productos().map(p =>
        p.id === actualizado.id ? actualizado : p
      );
      this.productos.set(actualizados);

      // ✅ REGISTRA EL MOVIMIENTO DE ENTRADA
      this.inventarioService.registrarMovimiento({
        tipo: 'ENTRADA',
        productoId: producto.id,
        cantidad: cantidad,
        fecha: ahora
      }).subscribe({
        next: () => {
          this.mostrarAlerta('success', 'Stock actualizado y movimiento registrado');
        },
        error: () => {
          this.mostrarAlerta('error', 'Stock actualizado, pero no se pudo registrar el movimiento');
        }
      });

      // Cierra modal y resetea
      this.cerrarModal();
      this.stockAAgregar = 0;
    });
  }
}
  /**
   * Manejador genérico para cambios en inputs.
   * @param event Evento del input
   * @param campo Campo del producto
   */
  onInputChange(event: Event, campo: keyof Producto) {
    const input = event.target as HTMLInputElement;
    this.actualizarCampo(campo, input.value);
  }
  /**
   * Valida y actualiza campos numéricos decimales o enteros.
   * @param event Evento del input
   * @param campo Campo del producto
   */
  onNumeroDecimalValidado(event: Event, campo: keyof Producto) {
    const inputElement = event.target as HTMLInputElement;
    let valor = inputElement.value.trim().replace(',', '.');
    
    if (campo === 'stock') {
      const entero = parseInt(valor, 10);
      if (!isNaN(entero) && entero >= 0) {
        this.actualizarCampo(campo, entero);
      } else {
        inputElement.value = '';
        this.mostrarAlerta('error', 'Por favor, introduce una cantidad válida de stock (número entero positivo).');
      }
    } else {
      const decimalRegex = /^\d*\.?\d*$/;
      if (decimalRegex.test(valor)) {
        const numero = parseFloat(valor);
        if (!isNaN(numero)) {
          this.actualizarCampo(campo, numero);
        }
      } else {
        inputElement.value = '';
        this.mostrarAlerta('error', 'Por favor, introduce un número válido (ej. 12.34).');
      }
    }
  }
  /**
   * Determina si el producto es el último en la lista.
   * @param id ID del producto
   * @returns true si es el último producto
   */
  esUltimaFila(id: number): boolean {
    const productos = this.productos();
    const index = productos.findIndex(p => p.id === id);
    return index === productos.length - 1;
  }
  /**
   * Devuelve la lista de productos filtrada por categoría.
   * @returns Lista filtrada de productos
   */
  get productosFiltrados() {
    return this.productos().filter(p => {
      const cat = this.categoriaSeleccionada();
      return cat === 'todas' || p.categoria?.toLowerCase() === cat.toLowerCase();
    });
  }
  /**
   * Manejador del cambio en el selector de categoría.
   * @param event Evento del select
   */
  onCategoriaChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const valor = select.value;
    this.categoriaSeleccionada.set(valor);
  }

  mostrarAlerta(tipo: 'success' | 'error' | 'info', mensaje: string): void {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }

  irAGestionTienda(): void {
    this.router.navigate(['/gestion-tienda']);
  }

  irAZonaPrivada(): void {
    this.router.navigate(['/zona-privada']);
    this.cargarInventario();
  }
}

