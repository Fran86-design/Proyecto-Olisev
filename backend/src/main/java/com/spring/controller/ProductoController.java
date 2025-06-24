package com.spring.controller;

/**
 * Controlador para la gestión de productos y pedidos relacionados.
 *
 * Ruta base: /api/productos
 *
 * Funcionalidades principales:
 *
 * 	Productos:
 *   	Listar todos los productos o solo los visibles.
 *   	Crear un nuevo producto con imagen.
 *   	Obtener, actualizar o eliminar un producto por ID.
 *   	Obtener la imagen de un producto.
 *   	Actualizar productos desde Angular mediante un objeto completo (JSON).
 *
 * 	Pedidos:
 *   	Marcar un pedido como enviado.
 *
 * Este controlador también gestiona el almacenamiento de imágenes de productos como binarios (bytes),
 * permitiendo visualizarlas directamente o guardarlas en disco local.
 *
 * Utiliza los repositorios ProductoRepository y PedidoRepository para acceder a los datos persistidos.
 */

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.spring.model.Pedido;
import com.spring.model.Producto;
import com.spring.repository.PedidoRepository;
import com.spring.repository.ProductoRepository;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:4200")
public class ProductoController {
	
	// Inyección del repositorio de pedidos para acceder a datos de pedidos desde la base de datos
	@Autowired
	private PedidoRepository pedidoRepo;
	
	// Inyección del repositorio de productos para acceder a los productos
	@Autowired
    private ProductoRepository productoRepository;
	
	// Ruta local donde se guardarán las imágenes subidas
	private static final String UPLOAD_DIR = "uploads/";
	
	/**
	 * Devuelve la lista completa de productos en la base de datos.
	 * @return Lista de todos los productos.
	 */
	@GetMapping
    public List<Producto> listarProductos() {
		// Recupera todos los productos
        return productoRepository.findAll();
    }
	
	/**
	 * Devuelve sólo los productos que están marcados como visibles.
	 * @return Lista de productos visibles.
	 */
	@GetMapping("/visibles")
	public List<Producto> obtenerProductosVisibles() {
		// Recupera productos donde el campo "visible" es true
	    return productoRepository.findByVisibleTrue();
	}

	/**
	 * Endpoint para crear un nuevo producto.
	 * Recibe datos del producto mediante parámetros del formulario y una imagen.
	 * @param nombre Nombre del producto
	 * @param precio Precio del producto
	 * @param descripcion Descripción del producto
	 * @param descuento Porcentaje de descuento
	 * @param visible Indica si el producto debe mostrarse en el frontend.
	 * @param imagen Archivo de imagen del producto 
	 * @return Respuesta HTTP con mensaje de éxito o error.
	 */
    @PostMapping("/crear")
    public ResponseEntity<String> crearProducto(
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") double precio,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "descuento", required = false) Integer descuento,
            @RequestParam("visible") boolean visible,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) 
    	{
    	// Se crea una nueva instancia de Producto y se asignan los campos recibidos
        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setPrecio(precio);
        producto.setDescripcion(descripcion);
        producto.setDescuento(descuento);
        producto.setVisible(visible);

        // Si se recibió una imagen, se guarda como bytes en el objeto producto
        if (imagen != null && !imagen.isEmpty()) {
            try {
            	// Guarda el contenido de la imagen
                producto.setImagen(imagen.getBytes());
                // Guarda el nombre original del archivo
                producto.setNombreImagen(imagen.getOriginalFilename());
            } catch (IOException e) {
                return ResponseEntity.status(500).body("Error al guardar la imagen");
            }
        }

        productoRepository.save(producto);
        return ResponseEntity.ok("Producto creado correctamente");
    }
    
    /**
     * Elimina un producto según su ID.
     * @param id ID del producto a eliminar
     * @return Respuesta HTTP 200 OK si se elimina, 404 si no se encuentra
     */
    @DeleteMapping("/{id}")
    // Obtiene el ID de la URL
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        ResponseEntity<?> respuesta;

        if (!productoRepository.existsById(id)) {
            respuesta = ResponseEntity.notFound().build();
        } else {
            productoRepository.deleteById(id);
            respuesta = ResponseEntity.ok().build();
        }

        return respuesta;
    }
    
    /**
     * Obtiene un producto por su ID.
     * @param id
     * @return
     */
    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProducto(@PathVariable Long id) {
        ResponseEntity<Producto> respuesta;
        // Busca el producto en la base de datos
        Optional<Producto> productoOpt = productoRepository.findById(id);

        if (productoOpt.isPresent()) {
            respuesta = ResponseEntity.ok(productoOpt.get());
        } else {
            respuesta = ResponseEntity.notFound().build();
        }

        return respuesta;
    }
    
    /**
     * Obtiene la imagen de un producto por su ID.
     * @param id ID del producto
     * @return La imagen en formato binario byte[] con tipo de contenido imagen, o 404 si no se encuentra
     */
    @GetMapping("/imagen/{id}")
    public ResponseEntity<byte[]> obtenerImagen(@PathVariable Long id) {
        ResponseEntity<byte[]> respuesta;
        // Busca el producto en la base de datos	
        Optional<Producto> optional = productoRepository.findById(id);
        // Si el producto existe
        if (optional.isPresent()) {
        	// Obtiene el producto
            Producto producto = optional.get();
            // Obtiene los datos binarios de la imagen
            byte[] datosImagen = producto.getImagen(); 
            // Cabeceras HTTP
            HttpHeaders headers = new HttpHeaders();
            // Define el tipo de contenido como imagen PNG, actualizar JPG
            headers.setContentType(MediaType.IMAGE_PNG); 
            respuesta = new ResponseEntity<>(datosImagen, headers, HttpStatus.OK);
        } else {
            respuesta = ResponseEntity.notFound().build();
        }

        return respuesta;
    }
    
    /**
     * Actualiza los datos de un producto existente.
     * @param id ID del producto a actualizar
     * @param nombre Nuevo nombre del producto
     * @param precio Nuevo precio
     * @param descripcion Descripción
     * @param descuento Descuento
     * @param visible Si el producto está visible o no
     * @param imagen Imagen del producto
     * @return El producto actualizado o un error si no se encuentra o hay fallo al subir imagen
     */
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(
            @PathVariable Long id,
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") double precio,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "descuento", required = false) Integer descuento,
            @RequestParam("visible") boolean visible,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {

        ResponseEntity<Producto> respuesta;
        // Buscar el producto por ID
        Optional<Producto> productoExistenteOpt = productoRepository.findById(id);
        // Si no se encuentra
        if (productoExistenteOpt.isEmpty()) {
            respuesta = ResponseEntity.notFound().build();
        } else {
        	// Obtener el producto encontrado
            Producto producto = productoExistenteOpt.get();
            // Actualiza datos
            producto.setNombre(nombre);
            producto.setPrecio(precio);
            producto.setDescripcion(descripcion);
            producto.setDescuento(descuento);
            producto.setVisible(visible);
            // Si se adjunta una nueva imagen y no está vacía
            if (imagen != null && !imagen.isEmpty()) {
                try {
                	// Genera un nombre único para la imagen con timestamp
                    String nombreArchivo = System.currentTimeMillis() + "_" + imagen.getOriginalFilename();
                    // Ruta donde se guardará la imagen
                    Path rutaImagen = Paths.get(UPLOAD_DIR + nombreArchivo);
                    // Asegura que el directorio existe
                    Files.createDirectories(rutaImagen.getParent());
                    // Guarda el archivo
                    Files.copy(imagen.getInputStream(), rutaImagen, StandardCopyOption.REPLACE_EXISTING);
                    // Guarda los bytes de la imagen en la base de datos
                    producto.setImagen(imagen.getBytes());
                } catch (IOException e) {
                    respuesta = ResponseEntity.status(500).build();
                    return respuesta;
                }
            }
            // Guarda el producto actualizado en la base de datos
            productoRepository.save(producto);
            respuesta = ResponseEntity.ok(producto);
        }

        return respuesta;
    }
    
    /**
     * Marca un pedido como enviado.
     * @param id ID del pedido
     * @return	mensaje de confirmación o error si no se encuentra
     */
    @PutMapping("/{id}/enviar")
    public ResponseEntity<String> marcarPedidoComoEnviado(@PathVariable Long id) {
        ResponseEntity<String> respuesta;

        Optional<Pedido> pedidoOpt = pedidoRepo.findById(id);
        if (pedidoOpt.isEmpty()) {
            respuesta = ResponseEntity.notFound().build();
        } else {
        	// Si se encuentra, se marca como enviado y se guarda
            Pedido pedido = pedidoOpt.get();
            pedido.setEnviado(true); 
            pedidoRepo.save(pedido);
            respuesta = ResponseEntity.ok("Pedido marcado como enviado");
        }

        return respuesta;
    }
    
    /**
     * Actualiza un producto desde Angular
     * @param id ID del producto a actualizar
     * @param productoActualizado Objeto Producto con los nuevos valores
     * @return Producto actualizado o error si no se encuentra
     */
    @PutMapping("/editar/{id}")
    public ResponseEntity<Producto> actualizarProductoDesdeAngular(
            @PathVariable Long id,
            // Objeto enviado en el cuerpo de la solicitud
            @RequestBody Producto productoActualizado) {

        ResponseEntity<Producto> respuesta;

        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isEmpty()) {
            respuesta = ResponseEntity.notFound().build();
        } else {
        	// Si se encuentra, se actualizan los campos necesario
            Producto existente = productoOpt.get();
            existente.setNombre(productoActualizado.getNombre());
            existente.setCategoria(productoActualizado.getCategoria());
            existente.setPrecioCompra(productoActualizado.getPrecioCompra());
            existente.setPrecio(productoActualizado.getPrecio());
            existente.setStock(productoActualizado.getStock());
            // Se guarda el producto actualizado
            productoRepository.save(existente);
            // Se devuelve el producto actualizado
            respuesta = ResponseEntity.ok(existente);
        }

        return respuesta;
    }    
}
