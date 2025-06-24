import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsaurioBoxComponent } from '../../../components/usuario-box/usaurio-box.component';
import { ProductosService } from '../../../services/productos.service';

@Component({
  selector: 'app-productos-nuevos',
  imports: [RouterModule, UsaurioBoxComponent],
  templateUrl: './productos-nuevos.component.html',
  styleUrl: './productos-nuevos.component.css',
  standalone: true
})
/**
 * Este componente permite crear un nuevo producto desde un formulario.
 * Está diseñado para ser usado en el panel de gestión de tienda y se encarga
 * de recopilar los datos del formulario, validarlos, previsualizar la imagen 
 * y enviar la información al backend.
 * 
 * Funcionalidades principales:
 *  Validación de campos obligatorios como nombre y precio.
 *  Conversión y validación del valor numérico del precio.
 *  Previsualización de la imagen seleccionada antes de enviarla.
 *  Envío de los datos mediante un objeto FormData al servicio de productos.
 */

export class ProductosNuevosComponent {
  alerta = {
    visible: false,
    tipo: 'success' as 'success' | 'error' | 'info',
    mensaje: ''
  };

  constructor(
      private router: Router,
      private productosService: ProductosService
    ) {}
    /**
     * Envía el formulario para crear un nuevo producto.
     * @param event Evento de submit del formulario
     */
  crearProducto(event: Event): void {
    event.preventDefault(); 

    const form = event.target as HTMLFormElement;
    // Extrae datos del formulario
    const formData = new FormData(form);
    // Obtiene los valores del formulario
    const nombre = formData.get('nombre');
    const precio = formData.get('precio');
    const descripcion = formData.get('descripcion');
    const descuento = formData.get('descuento');
    const visible = formData.get('visible');
    const imagen = formData.get('imagen') as File | null;
    // Validación: nombre y precio deben ser strings
    if (typeof nombre !== 'string' || typeof precio !== 'string') {
      this.mostrarAlerta('error', 'Nombre o precio inválido.');
    } else {
      const precioNumero = parseFloat(precio);
      // Validación: el precio debe ser un número
      if (isNaN(precioNumero)) {
        this.mostrarAlerta('info', 'El precio debe ser un número válido.');
      } else {
        // Se preparan los datos a enviar al backend
        const datosEnviar = new FormData();
        datosEnviar.append('nombre', nombre.trim());
        datosEnviar.append('precio', precioNumero.toString());
        if (typeof descripcion === 'string') datosEnviar.append('descripcion', descripcion.trim());
        if (typeof descuento === 'string') datosEnviar.append('descuento', descuento);
        datosEnviar.append('visible', visible === 'on' ? 'true' : 'false');
        if (imagen) datosEnviar.append('imagen', imagen);

        console.log('Enviando al backend...');
        // Envío de datos al backend usando el servicio
        this.productosService.crearProducto(datosEnviar).subscribe({
          next: (mensaje) => {
            console.log('Producto creado:', mensaje);
            alert('Producto creado correctamente');
            // Limpia el formulario
            form.reset();
            // Borra previsualización e input de imagen
            this.cancelarImagen();
            this.router.navigate(['/gestion-tienda']);
          },
          error: (err) => {
            console.error('Error al guardar producto:', err);
            this.mostrarAlerta('error', 'Error al guardar producto');
          }
        });
      }
    }
  }
  /**
   * Muestra una previsualización de la imagen seleccionada.
   * @param event Evento de cambio del input file
   */
  previsualizarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const preview = document.getElementById('previewImagen') as HTMLImageElement | null;

    if (file && preview) {
      // Crea una URL temporal para mostrar imagen
      const objectURL = URL.createObjectURL(file);
      preview.src = objectURL;
      // Muestra la imagen
      preview.style.display = 'block';
    } else {
      if (preview) {
        // Oculta si no hay imagen válida
        preview.style.display = 'none';
        preview.src = '';
      }
    }
  }
  /**
   * Cancela la imagen seleccionada, ocultándola y limpiando el input.
   */
  cancelarImagen(): void {
    const input = document.getElementById('imagen') as HTMLInputElement | null;
    const preview = document.getElementById('previewImagen') as HTMLImageElement | null;
    // Limpia el input
    if (input) input.value = '';
    if (preview) {
      // Quita la imagen
      preview.src = '';
      // La oculta
      preview.style.display = 'none';
    }
  }
  /**
   *  Vuelve a la página anterior en el historial.
   */
  volverAtras(): void {
    window.history.back();
  }

  irZonaPrivada(): void {
    window.location.href = '/zona-privada';
  }

  mostrarAlerta(tipo: 'success' | 'error' | 'info', mensaje: string) {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }
}

