package com.spring.controller;

/**
 * Controlador para la gestión del inventario y los movimientos de stock.
 *
 * Ruta base: /api/inventario
 *
 * Funcionalidades principales:
 *
 * 	Inventario:
 *   	Obtener el listado completo de productos.
 *   	Actualizar información de un producto (nombre, precio, stock, etc.).
 *   	Registrar entradas o salidas manuales de stock desde el frontend.
 *
 *	Movimientos de stock:
 *   	Registrar automáticamente una entrada cuando se incrementa el stock desde una actualización de producto.
 *   	Consultar el historial completo de movimientos, ordenado por fecha descendente.
 *
 * 	Endpoints destacados:
 *   	GET /api/inventario: lista todos los productos del sistema.
 *   	PUT /api/inventario/productos/{id}: actualiza un producto, registrando entrada si aplica.
 *   	POST /api/inventario/entrada: registra una entrada manual de stock.
 *   	POST /api/inventario/salida: registra una salida manual de stock.
 *   	GET /api/inventario/movimientos: obtiene todos los movimientos registrados.
 *
 * Utiliza los repositorios ProductoRepository y MovimientoStockRepository para acceder a la base de datos.
 */

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.dto.MovimientoStockDTO;
import com.spring.model.MovimientoStock;
import com.spring.model.Producto;
import com.spring.repository.MovimientoStockRepository;
import com.spring.repository.ProductoRepository;

@RestController
@RequestMapping("/api/inventario")
//Permite solicitudes CORS desde cualquier origen
@CrossOrigin(origins = "*")
public class InventarioController {
	
	// Inyecta automáticamente el bean de MovimientoStockRepository desde el contenedor de Spring.
	@Autowired
	private MovimientoStockRepository movimientoRepository;
	
	
	// Inyecta el repositorio de productos para consultar el inventario.
	@Autowired
    private ProductoRepository productoRepository;
	
	/**
	 * Obtiene la lista completa de productos registrados en el inventario.
	 * @return Lista de todos los productos disponibles.
	 */
    @GetMapping
    public List<Producto> getInventario() {
    	// Devuelve todos los productos registrados en la base de datos (inventario completo).
        return productoRepository.findAll();
    }

    /**
     * Actualiza los datos de un producto, y si hay un aumento de stock,
     * registra el movimiento como una entrada manual.
     * @param id ID del producto a actualizar.
     * @param productoActualizado Objeto con los nuevos datos del producto.
     * @return ResponseEntity con el producto actualizado o error si no se encuentra.
     */
    // Define la ruta: PUT /api/inventario/productos/{id}
    @PutMapping("/productos/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto productoActualizado) {
        ResponseEntity<Producto> respuesta;
        // Busca el producto existente por ID
        Optional<Producto> opt = productoRepository.findById(id);

        if (opt.isEmpty()) {
        	 // Si no se encuentra, devuelve 404 Not Found
            respuesta = ResponseEntity.notFound().build();
        } else {
            Producto existente = opt.get();
            // Calcula la diferencia entre el nuevo stock y el actual
            int diferenciaStock = productoActualizado.getStock() - existente.getStock();
            // Si el nuevo stock es mayor, se registra como entrada manual
            if (diferenciaStock > 0) {
                MovimientoStock entrada = new MovimientoStock();
                entrada.setProducto(existente);
                entrada.setCantidad(diferenciaStock);
                // Tipo de movimiento
                entrada.setTipo("ENTRADA_MANUAL");
                // Fecha actual
                entrada.setFecha(new Date());
                // Guarda el movimiento en la base de datos
                movimientoRepository.save(entrada);
            }

            // Actualiza los datos del producto
            existente.setStock(productoActualizado.getStock());
            existente.setPrecio(productoActualizado.getPrecio());
            existente.setPrecioCompra(productoActualizado.getPrecioCompra());
            existente.setNombre(productoActualizado.getNombre());
            existente.setCategoria(productoActualizado.getCategoria());
            existente.setFechaActualizacionStock(productoActualizado.getFechaActualizacionStock());
            // Guarda los cambios del producto
            productoRepository.save(existente);
            // Devuelve el producto actualizado con HTTP 200 OK
            respuesta = ResponseEntity.ok(existente);
        }
        // Retorna la respuesta final
        return respuesta;
    }
    
    /**
     * Registra una entrada manual de stock para un producto.
     * @param movimiento Objeto que contiene el ID del producto y la cantidad a ingresar.
     * @return ResponseEntity con un mensaje de éxito o error si el producto no existe.
     */
    // Define el endpoint POST en /api/inventario/entrada
    @PostMapping("/entrada")
    public ResponseEntity<?> registrarEntrada(@RequestBody MovimientoStockDTO movimiento) {
        ResponseEntity<?> respuesta;
        // Busca el producto en la base de datos usando el ID recibido en el DTO
        Optional<Producto> productoOpt = productoRepository.findById(movimiento.getProductoId());

        if (productoOpt.isEmpty()) {
        	// Si no se encuentra el producto, devuelve 404 Not Found
            respuesta = ResponseEntity.notFound().build();
        } else {
            Producto producto = productoOpt.get();
            // Suma la cantidad enviada al stock actual del producto
            producto.setStock(producto.getStock() + movimiento.getCantidad());
            // Guarda los cambios del producto actualizado
            productoRepository.save(producto);
            // Registra el movimiento de entrada en la tabla de movimientos
            MovimientoStock registro = new MovimientoStock();
            // Producto afectado
            registro.setProducto(producto);
            // Cantidad de entrada
            registro.setCantidad(movimiento.getCantidad());
            // Tipo de movimiento
            registro.setTipo("ENTRADA");
            // Fecha actual
            registro.setFecha(new Date());
            // Guarda el movimiento
            movimientoRepository.save(registro);

            respuesta = ResponseEntity.ok("Entrada registrada correctamente");
        }

        return respuesta;
    }

    /**
     * Registra una salida manual de stock para un producto.
     * @param movimiento Objeto DTO que contiene el ID del producto y la cantidad a retirar.
     * @return ResponseEntity con mensaje de éxito, error por stock insuficiente o error si el producto no existe.
     */
    // Define el endpoint POST en /api/inventario/salida
    @PostMapping("/salida")
    public ResponseEntity<?> registrarSalida(@RequestBody MovimientoStockDTO movimiento) {
        ResponseEntity<?> respuesta;
        // Busca el producto correspondiente por ID
        Optional<Producto> productoOpt = productoRepository.findById(movimiento.getProductoId());

        if (productoOpt.isEmpty()) {
            respuesta = ResponseEntity.notFound().build();
        } else {
            Producto producto = productoOpt.get();
            // Verifica si hay suficiente stock para realizar la salida
            if (producto.getStock() < movimiento.getCantidad()) {
            	// Si no hay stock suficiente, devuelve un error 400 Bad Request
                respuesta = ResponseEntity.badRequest().body("Stock insuficiente para salida");
            } else {
            	// Descuenta la cantidad indicada del stock actual
                producto.setStock(producto.getStock() - movimiento.getCantidad());
                // Guarda el nuevo estado del producto
                productoRepository.save(producto);

                MovimientoStock registro = new MovimientoStock();
                registro.setProducto(producto);
                registro.setCantidad(movimiento.getCantidad());
                registro.setTipo("SALIDA");
                registro.setFecha(new Date());
                movimientoRepository.save(registro);

                respuesta = ResponseEntity.ok("Salida registrada correctamente");
            }
        }

        return respuesta;
    }
    
    /**
     * Devuelve todos los movimientos de stock registrados, ordenados desde el más reciente al más antiguo.
     * @return Lista de objetos MovimientoStock ordenados por fecha descendente.
     */
    // Define el endpoint GET en /api/inventario/movimientos
    @GetMapping("/movimientos")
    public List<MovimientoStock> getMovimientos() {
    	// Llama al repositorio para obtener todos los movimientos, ordenados por fecha descendente
        return movimientoRepository.findAllByOrderByFechaDesc();
    }
}
