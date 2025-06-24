import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsaurioBoxComponent } from '../../../components/usuario-box/usaurio-box.component';

@Component({
  selector: 'app-productos-editar',
  imports: [RouterModule, UsaurioBoxComponent],
  templateUrl: './productos-editar.component.html',
  styleUrl: './productos-editar.component.css',
  standalone: true
})
/**
 * Este componente permite editar un producto existente en el sistema.
 * Su propósito principal es cargar los datos del producto desde el backend,
 * rellenar el formulario correspondiente, permitir modificaciones y 
 * guardar los cambios.
 * 
 * Funcionalidades principales:
 *  Obtiene el ID del producto desde la ruta.
 *  Carga los datos del producto desde la API.
 *  Rellena automáticamente el formulario con los datos obtenidos.
 *  Valida los campos antes de enviar.
 *  Permite previsualizar y validar una imagen seleccionada.
 *  Envía los datos actualizados al servidor mediante fetch con FormData.
 */

export class ProductosEditarComponent implements OnInit, AfterViewInit {
  // Referencia al formulario en el DOM
  @ViewChild('formularioProducto', { static: false }) formularioProducto!: ElementRef<HTMLFormElement>;
  // Referencia a la imagen de previsualización
  @ViewChild('previewImagen', { static: false }) previewImagen!: ElementRef<HTMLImageElement>;
  // Referencia al input file
  @ViewChild('inputImagen', { static: false }) inputImagen!: ElementRef<HTMLInputElement>;
  // ID del producto obtenido desde la URL
  productoId!: number;
  // Datos del producto cargados desde el backend
  productoData: any = null;

  alerta = {
    visible: false,
    tipo: 'info',
    mensaje: ''
  };

  constructor(private route: ActivatedRoute, private router: Router) {}
  //Obtiene el ID del producto desde la URL y carga sus datos.
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.productoId = parseInt(id, 10);
      this.cargarProducto();
    } else {
      this.router.navigate(['/gestion-tienda/productos']);
    }
  }
  /**
   * Se utiliza para rellenar el formulario si los datos ya están cargados.
   */
  ngAfterViewInit(): void {
    if (this.productoData) {
      setTimeout(() => this.rellenarFormulario(this.productoData), 100);
    }
  }
  /**
   * Carga el producto desde el backend utilizando su ID.
   */
  cargarProducto(): void {
    fetch(`http://localhost:8080/api/productos/${this.productoId}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('No se pudo cargar el producto');
      }
      return res.json();
    })
    .then(producto => {
      this.productoData = producto;

      if (this.formularioProducto) {
        this.rellenarFormulario(producto);
      }

      if (producto.imagen && this.previewImagen) {
        this.previewImagen.nativeElement.src = `http://localhost:8080/uploads/${producto.imagen}`;
        this.previewImagen.nativeElement.style.display = 'block';
      }
    })
    .catch(err => {
      console.error(err);
      this.mostrarAlerta('error', 'Error al cargar producto');
      this.router.navigate(['/gestion-tienda/productos']);
    });
  }
  /**
   * Rellena los campos del formulario con los datos del producto.
   * @param producto Objeto con los datos del producto
   */
  rellenarFormulario(producto: any): void {
    const setValueById = (id: string, value: any, isCheckbox = false) => {
      const element = document.getElementById(id);
      if (element) {
        if (isCheckbox) {
          (element as HTMLInputElement).checked = Boolean(value);
        } else {
          (element as HTMLInputElement | HTMLTextAreaElement).value = value?.toString() || '';
        }
      }
    };

    setTimeout(() => {
      setValueById('nombre', producto.nombre);
      setValueById('precio', producto.precio);
      setValueById('descripcion', producto.descripcion);
      setValueById('descuento', producto.descuento);
      setValueById('visible', producto.visible, true);

      if (producto.imagen && this.previewImagen) {
        setTimeout(() => {
          this.previewImagen.nativeElement.src = `http://localhost:8080/uploads/${producto.imagen}`;
          this.previewImagen.nativeElement.style.display = 'block';
        }, 100);
      }
    }, 50);
  }
  /**
   * Previsualiza la imagen seleccionada desde el input file.
   * @param event Evento de cambio del input
   */
  previsualizarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

      if (tiposPermitidos.includes(file.type)) {
        const maxSize = 5 * 1024 * 1024;

        if (file.size <= maxSize) {
          const objectURL = URL.createObjectURL(file);
          this.previewImagen.nativeElement.src = objectURL;
          this.previewImagen.nativeElement.style.display = 'block';
        } else {
          this.cancelarImagen();
          this.mostrarAlerta('warning', 'La imagen no puede superar los 5MB');
        }
      } else {
        this.cancelarImagen();
        this.mostrarAlerta('warning', 'Solo se permiten archivos de imagen (JPEG, PNG, GIF)');
      }
    } else {
      this.cancelarImagen();
    }
  }
  /**
   * Cancela la selección de imagen, ocultando la previsualización y limpiando el input.
   */
  cancelarImagen(): void {
    if (this.previewImagen) this.previewImagen.nativeElement.style.display = 'none';
    if (this.inputImagen) this.inputImagen.nativeElement.value = '';
  }
  /**
   * Guarda los cambios realizados en el formulario enviando los datos al servidor.
   * @param event Evento de submit del formulario
   */
  guardarCambios(event: Event): void {
    event.preventDefault();

    if (this.formularioProducto) {
      const form = this.formularioProducto.nativeElement;
      const formData = new FormData(form);

      const nombre = formData.get('nombre') as string;
      const precio = formData.get('precio') as string;
      const descripcion = formData.get('descripcion') as string;
      const descuento = formData.get('descuento') as string;
      const visible = formData.get('visible') as string;
      const imagen = formData.get('imagen') as File;

      if (!nombre?.trim()) {
        this.mostrarAlerta('warning', 'El nombre es obligatorio');
      } else if (!precio?.trim()) {
        this.mostrarAlerta('warning', 'El precio es obligatorio');
      } else {
        const precioNumero = parseFloat(precio);
        if (isNaN(precioNumero) || precioNumero < 0) {
          this.mostrarAlerta('warning', 'Precio inválido');
        } else {
          let descuentoNumero = 0;
          let continuar = true;

          if (descuento?.trim()) {
            descuentoNumero = parseFloat(descuento);
            if (isNaN(descuentoNumero) || descuentoNumero < 0 || descuentoNumero > 100) {
              this.mostrarAlerta('warning', 'El descuento debe ser entre 0 y 100');
              continuar = false;
            }
          }

          if (continuar) {
            const envio = new FormData();
            envio.append('nombre', nombre.trim());
            envio.append('precio', precioNumero.toString());
            envio.append('descripcion', descripcion || '');
            envio.append('descuento', descuentoNumero.toString());
            envio.append('visible', visible === 'on' ? 'true' : 'false');
            if (imagen && imagen.size > 0) envio.append('imagen', imagen);

            const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            if (submitButton) {
              submitButton.disabled = true;
              submitButton.textContent = 'Guardando...';
            }

            fetch(`http://localhost:8080/api/productos/${this.productoId}`, {
              method: 'PUT',
              body: envio
            })
              .then(res => {
                if (!res.ok) throw new Error('Error al actualizar el producto');
                return res.json();
              })
              .then(() => {
                this.mostrarAlerta('success', 'Producto actualizado correctamente');
                setTimeout(() => this.router.navigate(['/gestion-tienda/productos']), 1000);
              })
              .catch(err => {
                console.error(err);
                this.mostrarAlerta('error', ' ' + err.message);
              })
              .finally(() => {
                if (submitButton) {
                  submitButton.disabled = false;
                  submitButton.textContent = 'Guardar Cambios';
                }
              });
          }
        }
      }
    }
  }
  /**
   * Redirige a la lista de productos.
   */
  volverAtras(): void {
    this.router.navigate(['/gestion-tienda/productos']);
  }

  irZonaPrivada(): void {
    this.router.navigate(['/zona-privada']);
  }

  mostrarAlerta(tipo: 'success' | 'error' | 'warning' | 'info', mensaje: string): void {
    this.alerta = { visible: true, tipo, mensaje };
    setTimeout(() => this.alerta.visible = false, 3000);
  }
}