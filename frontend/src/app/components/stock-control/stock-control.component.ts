import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InventarioService, MovimientoStock} from '../../services/inventario.service';
// Importa ReactiveFormsModule por si se usa formularios reactivos en la plantilla
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsaurioBoxComponent } from "../usuario-box/usaurio-box.component";

@Component({
  selector: 'app-stock-control',
  imports: [RouterModule, ReactiveFormsModule, CommonModule, UsaurioBoxComponent],
  templateUrl: './stock-control.component.html',
  styleUrl: './stock-control.component.css',
  standalone: true
})
/**
 * Este componente gestiona la visualización y filtrado de los movimientos de stock (entradas y salidas)
 * de productos dentro del sistema de gestión de tienda. Su propósito principal es ofrecer una interfaz
 * clara para que los usuarios consulten la actividad del inventario y puedan acceder a reportes detallados.
 * 
 * Funcionalidades principales:
 *  Obtiene los movimientos de inventario desde el servicio `InventarioService`.
 *  Permite filtrar los movimientos por tipo: 'TODOS', 'ENTRADA' o 'SALIDA'.
 *  Redirige a la sección de reportes de gestión de tienda.
 * 
 * Este componente también utiliza un componente hijo `UsuarioBoxComponent`.
 */
export class StockControlComponent implements OnInit {
  /**
   * Inyección del servicio de inventario usando `inject()`:
   *  Alternativa moderna al constructor
   *  Permite obtener una instancia del servicio sin declararlo en el constructor
   *  Debe usarse dentro de clases decoradas por Angular
   */
  inventarioService = inject(InventarioService);
  // Lista de movimientos de stock que se mostrarán
  movimientos: MovimientoStock[] = [];
  mensaje = '';
  // Filtro actual aplicado: TODOS, ENTRADA o SALIDA
  tipoFiltro: 'TODOS' | 'ENTRADA' | 'SALIDA' = 'TODOS';

  constructor(private router: Router) {}
  /**
   * Aquí se obtiene la lista de movimientos desde el servicio.
   */
  ngOnInit(): void {
    this.inventarioService.getMovimientos().subscribe(data => {
      // Asigna los movimientos obtenidos a la propiedad local
      this.movimientos = data;
    });
  }
  /**
   * Maneja el evento cuando el usuario cambia el filtro desde el <select>.
   * @param event - Evento emitido por el select
   */
  cambiarFiltroTipo(event: Event) {
    const select = event.target as HTMLSelectElement;
    // Cambia el filtro actual según el valor seleccionado
    this.tipoFiltro = select.value as 'TODOS' | 'ENTRADA' | 'SALIDA';
  }
  /**
   * Filtra la lista de movimientos según el tipo seleccionado.
   * @return MovimientoStock[] - Lista de movimientos filtrados
   */
  movimientosFiltrados(): MovimientoStock[] {
    if (this.tipoFiltro === 'TODOS') return this.movimientos;
    // Devuelve solo los movimientos que coincidan con el tipo
    return this.movimientos.filter(m => m.tipo === this.tipoFiltro);
  }
  /**
   * Redirige al usuario a la sección de reportes de gestión.
   */
  irAReportes(): void {
    this.router.navigate(['gestion-tienda/reportes']);
  }
}
