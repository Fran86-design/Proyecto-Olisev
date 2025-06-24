import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsaurioBoxComponent } from '../../../components/usuario-box/usaurio-box.component';

@Component({
  selector: 'app-productos',
  imports: [RouterModule, UsaurioBoxComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css',
  standalone: true
})
/**
 * Este componente es responsable de mostrar, gestionar y eliminar productos 
 * en la sección de administración de la tienda. 
 * 
 * Funcionalidades clave:
 *   Renderiza dinámicamente una tabla de productos al cargar la vista.
 *   Carga productos desde una API externa (backend).
 *   Permite eliminar productos con confirmación previa.
 * 
 * Utiliza:
 *   ViewChild para acceder directamente al DOM de la tabla.
 *   ElementRef para manipulación manual de filas y celdas.
 *   Router para navegación entre rutas.
 *   Fetch API para operaciones HTTP (GET y DELETE).
 *
 */

export class ProductosComponent implements AfterViewInit {
  alerta = {
    visible: false,
    tipo: 'success' as 'success' | 'error' | 'info',
    mensaje: ''
  };
  // Referencia al cuerpo de la tabla <tbody> en el DOM
  @ViewChild('tablaBody', { static: true }) tablaBody!: ElementRef<HTMLTableSectionElement>;
  // Lista de productos usada inicialmente antes de la carga desde la API
  productos = [
    { id: 1, nombre: 'Aceite Virgen Extra', precio: 10.00, visible: true },
    { id: 2, nombre: 'Aceitunas Verdes', precio: 5.50, visible: false },
  ];

  constructor(private router: Router) {}
  //Aquí se construyen filas dinámicamente y se cargan productos desde la API.
  ngAfterViewInit(): void {
    // Crear filas para productos locales
    this.productos.forEach(producto => {
      const fila = document.createElement('tr');

      const colNombre = document.createElement('td');
      colNombre.textContent = producto.nombre;
      colNombre.style.textAlign = 'left';
      colNombre.style.paddingLeft = '10px';

      const colPrecio = document.createElement('td');
      colPrecio.textContent = producto.precio.toFixed(2);
      colPrecio.style.textAlign = 'center';
      colPrecio.style.paddingLeft = '110px'; 

      const colVisible = document.createElement('td');
      colVisible.style.textAlign = 'center';
      colVisible.innerHTML = producto.visible
        ? '<span style="color:green;">✅</span>'
        : '<span style="color:red;">❌</span>';

      const colAcciones = document.createElement('td');
      colAcciones.style.textAlign = 'right';

      const btnEditar = document.createElement('button');
      btnEditar.textContent = '✏️';
      btnEditar.className = 'btn-editar';
      // Acción eliminar producto
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = '🗑️';
      btnEliminar.className = 'btn-eliminar';

      btnEliminar.addEventListener('click', () => {
        this.eliminarProducto(producto.id);
      });
       // Añadir botones al TD de acciones
      colAcciones.appendChild(btnEditar);
      colAcciones.appendChild(btnEliminar);
      // Añadir columnas a la fila
      fila.appendChild(colNombre);
      fila.appendChild(colPrecio);
      fila.appendChild(colVisible);
      fila.appendChild(colAcciones);

      this.tablaBody.nativeElement.appendChild(fila);
      fila.style.borderBottom = '1px solid #ccc';
    });
    // Cargar productos reales desde el backend
    fetch('http://localhost:8080/api/productos')
    .then(res => {
      if (!res.ok) {
        throw new Error('Error al obtener productos');
      }
      // Convertir respuesta a JSON
      return res.json();
    })
    .then((productos: any[]) => {
      // Mostrar productos en la tabla
      this.renderizarTabla(productos);
    })
    .catch(err => {
      console.error('Error:', err);
      this.mostrarAlerta('error', 'No se pudieron cargar los productos');
    });
  }
  /**
   * Renderiza dinámicamente una tabla con los productos dados.
   * @param productos Lista de productos a mostrar
   */
  renderizarTabla(productos: any[]): void {
    const tabla = this.tablaBody.nativeElement;
    tabla.innerHTML = ''; 

    productos.forEach(producto => {
      const fila = document.createElement('tr');

      const colNombre = document.createElement('td');
      colNombre.textContent = producto.nombre;
      colNombre.style.textAlign = 'left';
      colNombre.style.paddingLeft = '10px';

      const colPrecio = document.createElement('td');
      colPrecio.textContent = producto.precio.toFixed(2);
      colPrecio.style.textAlign = 'center';
      colPrecio.style.paddingLeft = '110px';

      const colVisible = document.createElement('td');
      colVisible.innerHTML = producto.visible ? '✅' : '❌';
      colVisible.style.textAlign = 'center';

      const colAcciones = document.createElement('td');
      colAcciones.style.textAlign = 'right';
      // Navegar al formulario de edición
      const btnEditar = document.createElement('button');
      btnEditar.textContent = '✏️';
      btnEditar.className = 'btn-editar';
      btnEditar.addEventListener('click', () => {
      this.router.navigate([`/gestion-tienda/productos/editar/${producto.id}`]);
      });
      // Eliminar producto
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = '🗑️';
      btnEliminar.className = 'btn-eliminar';
      btnEliminar.addEventListener('click', () => {
        this.eliminarProducto(producto.id);
      });

      colAcciones.appendChild(btnEditar);
      colAcciones.appendChild(btnEliminar);

      fila.appendChild(colNombre);
      fila.appendChild(colPrecio);
      fila.appendChild(colVisible);
      fila.appendChild(colAcciones);

      tabla.appendChild(fila);
    });
  }
  /**
   * Navega al formulario para crear un nuevo producto.
   */
  irANuevoProducto(): void {
    this.router.navigate(['/gestion-tienda/productos/nuevo']);
  }
  /**
   * Elimina un producto mediante solicitud HTTP DELETE.
   * @param id ID del producto a eliminar
   */
  eliminarProducto(id: number): void {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este producto?');

    if (confirmar) {
      fetch(`http://localhost:8080/api/productos/${id}`, {
        method: 'DELETE'
      })
      .then(res => {
        if (!res.ok) throw new Error('Error al eliminar');
        this.mostrarAlerta('success', 'Producto eliminado correctamente');
        // Recargar vista tras eliminar
        window.location.reload(); 
      })
      .catch(err => {
        console.error(err);
        this.mostrarAlerta('error', 'No se pudo eliminar el producto');
      });
    }
  }

  mostrarAlerta(tipo: 'success' | 'error' | 'info', mensaje: string) {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }

  irAGestionTienda(): void {
    this.router.navigate(['/gestion-tienda']);
  }

  irAZonaPrivada(): void {
    this.router.navigate(['/zona-privada']);
  }
}
