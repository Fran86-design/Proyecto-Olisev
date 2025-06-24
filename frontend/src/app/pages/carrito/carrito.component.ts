import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-carrito',
  imports: [RouterModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
  standalone: true
})
export class CarritoComponent implements AfterViewInit {
    // Referencias a elementos HTML en el documento html
  @ViewChild('subtotalCarrito') subtotalEl!: ElementRef<HTMLSpanElement>;
  @ViewChild('ahorroTotal') ahorroEl!: ElementRef<HTMLSpanElement>;
  @ViewChild('envioPagar') envioEl!: ElementRef<HTMLSpanElement>;
  @ViewChild('totalEstimado') totalEl!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    // Muestra los productos del carrito
    this.mostrarCarrito();
    // Muestra productos adicionales recomendados
    this.mostrarProductosExtra();
    // Configura botones para seguir comprando o pagar
    this.configurarBotonesNavegacion();
  }

  private configurarBotonesNavegacion(): void {
    // Botón seguir comprando
    const btnSeguir = document.querySelector<HTMLButtonElement>('.seguir-comprando-btn');
    // Botón para pagar
    const btnCheckout = document.querySelector<HTMLButtonElement>('.checkout-btn');
    //Si btnSeguir no es null ni undefined, entonces sigue ejecutando lo que hay después, si todavía no se ha renderizado
    btnSeguir?.addEventListener('click', () => {
      // Redirecciona a la tienda
      window.location.href = '/tienda-ventas';
    });

    btnCheckout?.addEventListener('click', () => {
       // Redirecciona a la página de pago
      window.location.href = '/pago';
    });
  }
  // Muestra los productos del carrito y calcula totales
  mostrarCarrito(): void {
  // Obtiene el contenedor HTML donde se mostrarán los productos del carrito
  const contenedor = document.getElementById('carritoLista');

  // Verifica si el contenedor existe
  if (contenedor) {
    // Limpia cualquier contenido anterior dentro del contenedor
    contenedor.innerHTML = ''; 
     // Obtiene los productos guardados en el carrito desde localStorage
    const carrito = this.obtenerCarrito();
    // Variables para calcular los totales
    let subtotal = 0;
    let ahorro = 0;
    const envio = 2.5;

    // Recorre todos los productos del carrito y los renderiza
    carrito.forEach((item: any, index: number) => {
      // Crea un div contenedor para el producto
      const div = document.createElement('div');
      // Aplica clase para estilos CSS
      div.className = 'item-carrito';
      // Crea la imagen del producto
      const img = this.crearImagenItem(item);
      // Crea el bloque con nombre y precio incluyendo descuentos
      const info = this.crearInfoItem(item, ahorro);
      // Crea los botones de cantidad +, - y el botón para eliminar el producto
      const controls = this.crearControlesItem(item, carrito, index);
      // Inserta los elementos creados dentro del div del producto
      div.append(img, info, controls);
      // Agrega el div completo del producto al contenedor del carrito
      contenedor.appendChild(div);

      // Suma el precio al subtotal
      subtotal += item.precio * item.cantidad;

      // Si tiene descuento, calcula cuánto se ahorra
      if (item.precioOriginal && item.precioOriginal > item.precio) {
        ahorro += (item.precioOriginal - item.precio) * item.cantidad;
      }
    });

    // Llama a la función que muestra los totales en la interfaz
    this.actualizarTotales(subtotal, ahorro, envio);
  }
}
  /**
   * Crea una imagen del producto
   * @param item Producto del carrito
   * @returns Etiqueta img con la imagen del producto
   */
  private crearImagenItem(item: any): HTMLImageElement {
    // Crea una imagen
    const img = document.createElement('img');
    // Establece la URL con el ID del producto
    img.src = `http://localhost:8080/api/productos/imagen/${item.productoId}`;
    // Texto alternativo por accesibilidad
    img.alt = item.nombre;
    return img;
  }
  /**
   * Genera la parte visual con el nombre y precio del producto, incluyendo descuentos si aplica.
   * @param item El producto actual del carrito, nombre, precio...
   * @param ahorro Este valor no se usa directamente aquí, pero se pasa desde fuera.
   * @returns Un div con el nombre del producto y su precio, formateado correctamente.
   */
  private crearInfoItem(item: any, ahorro: number): HTMLDivElement {
    const info = document.createElement('div');
    // Para aplicar estilos CSS
    info.className = 'info-carrito';
    // Etiqueta para mostrar el nombre
    const nombre = document.createElement('h4');
    nombre.textContent = item.nombre;
    // Etiqueta para mostrar el precio
    const precio = document.createElement('p');
    // Si hay un precio original mayor al actual, se muestra como descuento
    if (item.precioOriginal && item.precioOriginal > item.precio) {
      precio.innerHTML = `<span class="tachado">$${item.precioOriginal.toFixed(2)}</span> $${item.precio.toFixed(2)}`;
    // Precio sin descuento
    } else {
      precio.textContent = `$${item.precio.toFixed(2)}`;
    }
    // Añade el nombre y precio al div
    info.append(nombre, precio);
    return info;
  }
  /**
   * Genera los botones de control para cada producto +, -
   * @param item Producto actual en el carrito.
   * @param carrito Lista completa del carrito.
   * @param index Índice del producto en la lista del carrito para poder eliminarlo.
   * @returns Un div con todos los controles del producto.
   */
  private crearControlesItem(item: any, carrito: any[], index: number): HTMLDivElement {
    const controls = document.createElement('div');
    controls.className = 'controles';
    // Botón de restar cantidad
    const menos = this.crearBotonCantidad('−', () => {
      if (item.cantidad > 1) {
        item.cantidad--;
        // Guarda la nueva cantidad
        this.guardarCarrito(carrito);
        // Refresca el carrito visualmente
        this.mostrarCarrito();
      }
    });
    // Botón de sumar cantidad
    const mas = this.crearBotonCantidad('+', () => {
      item.cantidad++;
      this.guardarCarrito(carrito);
      this.mostrarCarrito();
    });
    // Muestra la cantidad actual
    const cantidad = document.createElement('span');
    cantidad.className = 'cantidad';
    cantidad.textContent = item.cantidad.toString();
    // Botón para eliminar el producto
    const eliminar = document.createElement('button');
    eliminar.textContent = '🗑';
    eliminar.className = 'btn-delete';
    eliminar.onclick = () => {
      // Elimina el producto por índice
      carrito.splice(index, 1);
      this.guardarCarrito(carrito);
      this.mostrarCarrito();
    };
    // Agrupa los botones +, -, y la cantidad
    const cajaCantidad = document.createElement('div');
    cajaCantidad.className = 'caja-cantidad';
    cajaCantidad.append(menos, cantidad, mas);
    // Junta todo en el bloque de controles
    controls.append(cajaCantidad, eliminar);
    return controls;
  }
  /**
   * Crea un botón reutilizable con una acción definida +
   * @param text exto o símbolo que aparecerá en el botón en este caso +
   * @param onClick exto o símbolo que aparecerá en el botón
   * @returns retorna un button
   */
  private crearBotonCantidad(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = 'qty-btn';
    // Asigna la función a ejecutar al hacer clic
    btn.onclick = onClick;
    return btn;
  }
  /**
   * Muestra los totales calculados del carrito
   * @param subtotal Precio total sin contar el envío.
   * @param ahorro Dinero ahorrado en descuentos.
   * @param envio Costo de envío.
   */
  private actualizarTotales(subtotal: number, ahorro: number, envio: number): void {
    // Calcula el total general
    const totalFinal = subtotal + envio;
    // Verifica si el elemento del subtotal existe en el DOM antes de acceder a él
    if (this.subtotalEl?.nativeElement) {
       // Actualiza el texto visible del elemento con el subtotal formateado a 2 decimales
      this.subtotalEl.nativeElement.textContent = `$${subtotal.toFixed(2)}`;
    }
    if (this.ahorroEl?.nativeElement) {
      // Muestra cuánto dinero se ha ahorrado el usuario gracias a los descuentos
      this.ahorroEl.nativeElement.textContent = `$${ahorro.toFixed(2)}`;
    }
    if (this.envioEl?.nativeElement) {
       // Actualiza el texto del costo de envío
      this.envioEl.nativeElement.textContent = `${envio.toFixed(2)} €`;
    }
    if (this.totalEl?.nativeElement) {
      // Muestra el total final
      this.totalEl.nativeElement.textContent = `$${totalFinal.toFixed(2)}`;
    }
  }
  /**
 * Muestra productos recomendados que no están ya en el carrito.
 * Se consulta el backend, se filtran productos ya presentes, y se agregan al DOM.
 */
  mostrarProductosExtra(): void {
    const contenedor = document.getElementById('productosExtra');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    // Obtiene IDs de los productos que ya están en el carrito
    const idsEnCarrito = this.obtenerCarrito().map((p: any) => p.productoId);
    // Consulta todos los productos visibles al backend
    fetch('http://localhost:8080/api/productos/visibles')
      // Convierte la respuesta a JSON
      .then(res => res.json())
      .then((productos: any[]) => {
        // Filtra productos que no estén ya en el carrito
        productos
          .filter(prod => !idsEnCarrito.includes(prod.id))
          // Agrega al DOM
          .forEach(prod => contenedor.appendChild(this.crearProductoExtra(prod)));
      })
      .catch(error => console.error('Error al cargar productos extra:', error));
  }
  /**
   * Genera visualmente un producto recomendado con un botón para añadirlo al carrito.
   * @param prod  Producto visible y disponible, pero que aún no está en el carrito.
   * @returns Un bloque div listo para insertarse al DOM.
   */
  private crearProductoExtra(prod: any): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'producto-extra';
    // Calcula el precio original si hay descuento
    const original = prod.descuento ? prod.precio / (1 - prod.descuento / 100) : null;
    // Genera el bloque HTML con precio tachado si aplica
    const precioHTML = prod.descuento
      // Si hay descuento, muestra el precio original tachado y el nuevo precio
      ? `<p><span class="tachado">$${original!.toFixed(2)}</span> $${prod.precio.toFixed(2)}</p>`
      // Si no hay descuento, simplemente muestra el precio actual
      : `<p>$${prod.precio.toFixed(2)}</p>`;

      /**
       * Pequeño ejemplo de explicacion de operador ternario:
       * const esMayor = edad >= 18 ? 'Adulto' : 'Menor';
       * seria igual a :
       * 
       * if (edad >= 18) {
            esMayor = 'Adulto';
          } else {
            esMayor = 'Menor';
          }
       */
    // Carga la estructura HTML del producto extra
    div.innerHTML = `
      <img src="http://localhost:8080/api/productos/imagen/${prod.id}" alt="${prod.nombre}" />
      <div>
        <p><strong>${prod.nombre}</strong></p>
        ${precioHTML}
      </div>
      <button>Add</button>
    `;
    // Acción al hacer clic en "Add"
    const button = div.querySelector('button');
    if (button) {
      button.addEventListener('click', () => {
        const carrito = this.obtenerCarrito();
        const existente = carrito.find((p: any) => p.productoId === prod.id);

        if (existente) {
          // Si ya existe, suma cantidad
          existente.cantidad += 1;
        } else {
          // Si es nuevo, lo agrega
          carrito.push({ productoId: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 });
        }
        // Guarda el carrito actualizado
        this.guardarCarrito(carrito);
        // Refresca la vista del carrito
        this.mostrarCarrito();
        // Vuelve a filtrar productos recomendados
        this.mostrarProductosExtra();
      });
    }

    return div;
  }
  /**
   * Recupera el carrito guardado en localStorage del navegador.
   * @returns Un array de productos o vacío si no hay nada guardado.
   */
  private obtenerCarrito(): any[] {
    const data = localStorage.getItem('carrito');
    try {
      // Convierte el JSON a objeto
      // el operador ternario decide ? decide que valor devolver con return dependiendo si data tiene contenido o no
      return data ? JSON.parse(data) : [];
    } catch {
      // Si algo sale mal, devuelve un carrito vacío
      return [];
    }
  }
  /**
   * Guarda la lista actual de productos del carrito en el navegador
   * @param carrito Lista de productos con cantidades a guardar.
   */
  private guardarCarrito(carrito: any[]): void {
    // Convierte a texto JSON
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }
}

