import { AfterViewInit, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tienda-ventas',
  imports: [RouterModule],
  templateUrl: './tienda-ventas.component.html',
  styleUrl: './tienda-ventas.component.css',
  standalone: true
})
/**
 * Este componente representa la página principal de ventas de la tienda online.
 *
 * Funcionalidades principales:
 *    Muestra un listado dinámico de productos obtenidos desde el backend.
 *    Permite aplicar filtros por:
 *       Rango de precio
 *       Descuento disponible
 *       Categoría del producto
 *    Permite agregar productos al carrito desde un modal con control de cantidad.
 *    Controla visualmente si un producto está sin stock o tiene descuento mediante etiquetas.
 *    Permite marcar productos como favoritos, almacenando esa preferencia en localStorage.
 *    Actualiza el panel lateral y el contador del carrito automáticamente tras agregar productos.
 */

export class TiendaVentasComponent implements AfterViewInit {
  alerta = {
    visible: false,
    tipo: 'info',
    mensaje: ''
  };

  ngAfterViewInit(): void {
    // Elementos del modal de cantidad y nombre del producto
    const modal = document.getElementById('modalCantidad') as HTMLElement;
    const modalNombre = document.getElementById('modalNombre') as HTMLElement;
    // Botones para agregar al carrito y cancelar el modal
    const btnAgregar = document.getElementById('btnAgregarCarrito') as HTMLButtonElement;
    const btnCancelar = document.getElementById('btnCancelarModal') as HTMLButtonElement;
    // Variables de control para producto seleccionado y cantidad
    let productoSeleccionado: any = null;
    let cantidad = 1;
    // Elementos para mostrar y modificar la cantidad
    const cantidadSpan = document.getElementById('cantidadVisual') as HTMLElement;
    const btnMenos = document.getElementById('btnMenos') as HTMLButtonElement;
    const btnMas = document.getElementById('btnMas') as HTMLButtonElement;
    // Contenedor donde se renderizan los productos
    const grid = document.getElementById('productosGrid');
    const filtroPrecio = document.getElementsByName('filtroPrecio');
    const filtroDescuento = document.getElementById('filtroDescuento') as HTMLInputElement;
    const filtroCategoria = document.getElementsByName('filtroCategoria');
     // Lista original de productos (sin filtros)
    let productosOriginales: any[] = [];
    // Evento para aumentar la cantidad
    btnMas?.addEventListener('click', () => {
      cantidad++;
      // Actualiza el span visual
      cantidadSpan.textContent = cantidad.toString();
    });
    // Evento para disminuir la cantidad visual del producto
    btnMenos?.addEventListener('click', () => {
      // Si la cantidad es 1 o menos, no permite disminuir más y sale de la función
      if (cantidad <= 1) return;
      cantidad--;
      // Actualiza el valor visual del span con la nueva cantidad
      cantidadSpan.textContent = cantidad.toString();
    });
    // Evento para cancelar el modal de selección de cantidad
    btnCancelar.addEventListener('click', () => {
      // Oculta el modal añadiendo la clase 'hidden'
      modal.classList.add('hidden');
    });
    // Evento para agregar el producto seleccionado al carrito
    btnAgregar.addEventListener('click', () => {
      // Previene que se agregue el producto si la cantidad es menor a 1
      if (cantidad < 1) return;
      // Añade el nuevo producto al carrito con su información correspondiente
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      carrito.push({
        productoId: productoSeleccionado.id,
        nombre: productoSeleccionado.nombre,
        precio: productoSeleccionado.precio,
        precioOriginal: productoSeleccionado.precioOriginal ?? productoSeleccionado.precio,
        cantidad: cantidad
      });
      // Guarda el carrito actualizado en localStorage
      localStorage.setItem('carrito', JSON.stringify(carrito));
      // Oculta el modal y reinicia la cantidad a 1
      modal.classList.add('hidden');
      cantidad = 1;
      cantidadSpan.textContent = '1';
      // Si el panel lateral del carrito está visible, lo actualiza
      const panel = document.getElementById('carritoLateral');
      panel?.classList.contains('mostrar') && (window as any).actualizarCarritoLateral?.();
      // Actualiza el contador del carrito en el encabezado
      (window as any).actualizarContadorCarrito?.();

      this.mostrarAlerta('success', 'Producto añadido al carrito');
    });
    /**
     * Función que aplica los filtros seleccionados y renderiza los productos en pantalla
     * @returns Su efecto es directamente en el DOM, modificando el contenido del contenedor de productos (`grid`).
     */
    function aplicarFiltros() {
      // Si no hay grid, sale
      if (!grid) return;
      // Limpia el contenedor
      grid.innerHTML = '';
      // Obtiene valores seleccionados de los filtros
      const precioSeleccionado = (Array.from(filtroPrecio).find((input) => (input as HTMLInputElement).checked) as HTMLInputElement)?.value || '';
      const conDescuento = filtroDescuento.checked;
      const categoriaSeleccionada = (Array.from(filtroCategoria).find((input) => (input as HTMLInputElement).checked) as HTMLInputElement)?.value || '';
      // Filtra productos según los criterios
      const productosFiltrados = productosOriginales.filter(prod => {
        let cumplePrecio = true;
        if (precioSeleccionado) {
          const [min, max] = precioSeleccionado.split('-').map(Number);
          cumplePrecio = prod.precio >= min && prod.precio <= max;
        }

        const cumpleDescuento = !conDescuento || (prod.descuento && prod.descuento > 0);
        const cumpleCategoria = !categoriaSeleccionada || prod.categoria === categoriaSeleccionada;

        return cumplePrecio && cumpleDescuento && cumpleCategoria;
      });
      // Renderiza los productos filtrados en la grid
      productosFiltrados.forEach(prod => {
        const card = document.createElement('div');
        card.classList.add('card-producto');
         // Si no hay stock, muestra cinta de "Sin stock"
        prod.stock === 0 && (() => {
          const sinStockRibbon = document.createElement('div');
          sinStockRibbon.classList.add('ribbon-sin-stock');
          sinStockRibbon.textContent = 'Sin stock';
          card.appendChild(sinStockRibbon);
        })();
        // Si hay descuento, muestra cinta con porcentaje
        prod.descuento && prod.descuento > 0 && (() => {
          const ribbon = document.createElement('div');
          ribbon.classList.add('ribbon-descuento');
          ribbon.textContent = `-${prod.descuento}%`;
          card.appendChild(ribbon);
        })();
        // Crea contenedor de imagen del producto
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');
        const img = document.createElement('img');
        img.src = `http://localhost:8080/api/productos/imagen/${prod.id}`;
        img.alt = prod.nombre;
        imgContainer.appendChild(img);
        // Botón de favorito (corazón)
        const favBtn = document.createElement('div');
        favBtn.classList.add('icono-favorito');
        const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
        favBtn.innerHTML = favoritos.includes(prod.id) ? '❤️' : '🤍';
        favBtn.title = 'Guardar como favorito';
        // Evento para marcar/desmarcar favorito
        favBtn.addEventListener('click', () => {
          let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
          if (favoritos.includes(prod.id)) {
            favoritos = favoritos.filter((id: number) => id !== prod.id);
            favBtn.innerHTML = '🤍';
          } else {
            favoritos.push(prod.id);
            favBtn.innerHTML = '❤️';
          }
          localStorage.setItem('favoritos', JSON.stringify(favoritos));
        });
        // Nombre del producto
        const h3 = document.createElement('h3');
        h3.textContent = prod.nombre;
        // Precio del producto
        const precio = document.createElement('p');
        precio.classList.add('precio');
        precio.textContent = `${prod.precio.toFixed(2)} €`;
        // Descripción del producto
        const descripcion = document.createElement('p');
        descripcion.classList.add('descripcion');
        descripcion.textContent = prod.descripcion;
        // Botón de compra
        const btn = document.createElement('button');
        btn.classList.add('boton-comprar');
        btn.textContent = '🛒 Comprar';
        // Si no hay stock, deshabilita el botón
        if (prod.stock === 0) {
          btn.disabled = true;
          btn.classList.add('boton-deshabilitado');
        }
        // Evento que abre el modal con el producto seleccionado
        btn.addEventListener('click', () => {
          productoSeleccionado = prod;
          modalNombre.textContent = prod.nombre;
          modal.classList.remove('hidden');
        });
        // Añade los elementos a la tarjeta del producto
        card.appendChild(favBtn);
        card.appendChild(imgContainer);
        card.appendChild(h3);
        card.appendChild(precio);
        card.appendChild(descripcion);
        card.appendChild(btn);
        grid.appendChild(card);
      });
    }
    // Asocia el evento de cambio en los filtros para volver a aplicar los filtros
    [filtroDescuento, ...filtroPrecio, ...filtroCategoria].forEach((el: any) =>
      el.addEventListener('change', aplicarFiltros)
    );
    // Petición HTTP para obtener productos visibles desde el backend
    fetch('http://localhost:8080/api/productos/visibles')
      .then(res => res.ok ? res.json() : Promise.reject('Error al obtener productos'))
      .then((productos: any[]) => {
         // Asigna categoría a los productos según su nombre
        productosOriginales = productos.map(p => ({
          ...p,
          categoria: p.nombre.toLowerCase().includes('aceite') ? 'aceite'
            : p.nombre.toLowerCase().includes('aceituna') ? 'aceitunas'
            : ''
        }));
        // Renderiza los productos filtrados
        aplicarFiltros();
      })
      .catch(err => {
        console.error(err);
        this.mostrarAlerta('error', 'No se pudieron cargar los productos.');
      });
  }

  mostrarAlerta(tipo: 'success' | 'error' | 'info' | 'warning', mensaje: string): void {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }
}


