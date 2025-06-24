package com.spring.controller;

/**
 * Controlador para la gestión completa de pedidos en el sistema.
 * 
 * Ruta base: /api/pedidos
 *
 * Funcionalidades principales:
 *
 * 	Gestión de pedidos:
 *   	Crear nuevos pedidos con líneas asociadas y control de stock.
 *   	Listar todos los pedidos o filtrarlos por estado (enviados/no enviados), año o cliente.
 *   	Eliminar o actualizar un pedido existente.
 *   	Marcar pedidos como enviados o pagados.
 *
 * 	Generación de archivos:
 *   	Generar y devolver archivos PDF con detalles de pedidos.
 *   	Crear, listar y eliminar archivos de texto asociados a pedidos por año.
 *
 * 	Estadísticas y reportes:
 *   	Obtener productos vendidos por mes y año.
 *
 * 	Integraciones:
 *   	Acceso a datos relacionados con productos (ProductoRepository) y movimientos de stock (MovimientoStockRepository).
 *
 * Utiliza clases de modelo como Pedido, Producto, LineaPedido  y MovimientoStock,
 * junto a bibliotecas como iText para generación de PDFs y java.nio.file para manejo de archivos.
 */

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Stream;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.spring.dto.ProductoVentaDetalle;
import com.spring.model.LineaPedido;
import com.spring.model.MovimientoStock;
import com.spring.model.Pedido;
import com.spring.model.Producto;
import com.spring.repository.MovimientoStockRepository;
import com.spring.repository.PedidoRepository;
import com.spring.repository.ProductoRepository;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class pedidoController {
	
	// Inyección automática de dependencias: Spring busca una instancia de PedidoRepository y la inyecta aquí.// Inyección automática de dependencias: Spring busca una instancia de PedidoRepository y la inyecta aquí.
    @Autowired
    private PedidoRepository pedidoRepo;
    
    // Inyección automática de dependencias para acceder a productos desde la base de datos.
    @Autowired
    private ProductoRepository productoRepository;
    
    // Inyección automática de dependencias para registrar o consultar movimientos de stock.
    @Autowired
    private MovimientoStockRepository movimientoRepository;

    /**
     * Crea un nuevo pedido con sus líneas, ajusta el stock y registra salidas.
     * @param pedido Objeto Pedido recibido en el cuerpo de la solicitud.
     * @return El pedido guardado con ID y código anual asignados.
     */
    // Mapea peticiones HTTP POST a esta función.
    @PostMapping
    // Recibe un pedido en formato JSON.
    public Pedido crearPedido(@RequestBody Pedido pedido) {
    	// Asigna la fecha actual al pedido.
        pedido.setFechaPedido(LocalDate.now());
        // Verifica si hay líneas de pedido.
        if (pedido.getDetalles() != null) {
        	// Itera sobre cada línea.
            for (LineaPedido linea : pedido.getDetalles()) {
            	// Establece la relación con el pedido padre.
                linea.setPedido(pedido);
                // Si se especificó un producto.
                if (linea.getProductoId() != null) {
                	// Busca el producto.
                    Optional<Producto> opt = productoRepository.findById(linea.getProductoId());
                    // Si existe el producto:
                    if (opt.isPresent()) {
                        Producto producto = opt.get();
                        // Asocia el producto a la línea.
                        linea.setProducto(producto);
                        // Resta del stock.
                        producto.setStock(producto.getStock() - linea.getCantidad());
                        // Guarda el nuevo stock.
                        productoRepository.save(producto);
                        // Registra la salida de stock.
                        MovimientoStock salida = new MovimientoStock();
                        salida.setProducto(producto);
                        salida.setCantidad(linea.getCantidad());
                        salida.setTipo("SALIDA");
                        salida.setFecha(new Date());
                        // Guarda el movimiento.
                        movimientoRepository.save(salida);
                    } else {
                    	// Error si no existe.
                        throw new RuntimeException("Producto no encontrado con ID: " + linea.getProductoId());
                    }
                }
            }
        }
        // Calcula el total sumando (precio unitario × cantidad) de cada línea.
        double total = pedido.getDetalles().stream()
                .mapToDouble(linea -> linea.getPrecioUnitario() * linea.getCantidad())
                .sum();
        // Asigna el total calculado al pedido.
        pedido.setTotal(total);
        // Año actual.
        int anio = LocalDate.now().getYear();
        // Número de pedidos del año.
        long contador = pedidoRepo.countByAnio(anio);
        // Genera un código único para el año, ej: 2025-12
        pedido.setCodigoAnual(anio + "-" + (contador + 1));
        // Guarda el pedido completo en la base de datos y lo devuelve.
        return pedidoRepo.save(pedido);
    }

    /**
     * Elimina un pedido por su ID si existe.
     * @param id ID del pedido a eliminar.
     * @return 204 No Content si se elimina correctamente, 404 si no existe.
     */
    @DeleteMapping("/{id}")
    // El ID se toma desde la URL.
    public ResponseEntity<?> eliminarPedido(@PathVariable Long id) {
        ResponseEntity<?> respuesta;
        // Verifica si el pedido existe en la base de datos.
        if (!pedidoRepo.existsById(id)) {
        	// Si no existe
            respuesta = ResponseEntity.notFound().build();
        } else {
        	// Si existe, lo elimina.
            pedidoRepo.deleteById(id);
         // Devuelve 200 OK 
            respuesta = ResponseEntity.ok().build();
        }

        return respuesta;
    }
    
    /**
     * Devuelve una lista con todos los pedidos almacenados.
     * @return Lista de todos los pedidos.
     */
    @GetMapping
    public List<Pedido> obtenerTodosLosPedidos() {
    	// Recupera y retorna todos los pedidos de la base de datos.
        return pedidoRepo.findAll();
    }

    /**
     * Marca un pedido como enviado.
     * @param id ID del pedido a actualizar.
     * @return 200 OK si se actualiza correctamente, 404 Not Found si no existe.
     */
    @PutMapping("/{id}/enviar")
    public ResponseEntity<String> marcarPedidoComoEnviado(@PathVariable Long id) {
    	// Busca el pedido por ID
    	return pedidoRepo.findById(id)
    			// Si se encuentra, entra en este bloque
                .map(pedido -> {
                	// Marca el pedido como enviado
                    pedido.setEnviado(true);
                    // Guarda el cambio en la base de datos
                    pedidoRepo.save(pedido);
                    return ResponseEntity.ok("Pedido marcado como enviado");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lista todos los pedidos que ya han sido marcados como enviados.
     * @return Lista de pedidos con el campo enviado en true.
     */
    @GetMapping("/enviados")
    public List<Pedido> listarEnviados() {
    	// Retorna todos los pedidos cuyo campo enviado sea true
        return pedidoRepo.findByEnviadoTrue();
    }

    /**
     * Devuelve la lista de pedidos que aún no han sido enviados
     * @return Lista de objetos Pedido con enviado = false.
     */
    @GetMapping("/no-enviados")
    public List<Pedido> listarNoEnviados() {
    	// Busca en la base de datos todos los pedidos no enviados
        return pedidoRepo.findByEnviadoFalse();
    }

    /**
     * Devuelve la lista de pedidos filtrados por año de la fecha del pedido.
     * @param anio Año a filtrar
     * @return Lista de pedidos realizados en ese año
     */
    @GetMapping("/anio/{anio}")
    public List<Pedido> listarPorAnio(@PathVariable int anio) {
    	// Busca pedidos por año utilizando una consulta personalizada
        return pedidoRepo.findByFechaPedidoYear(anio);
    }

    /**
     *  Marca un pedido como pagado, registrando también la fecha de pago.
     * @param id ID del pedido a actualizar.
     * @return Respuesta HTTP con mensaje de éxito o error si no se encuentra el pedido.
     */
    @PutMapping("/{id}/pagar")
    public ResponseEntity<String> marcarComoPagado(@PathVariable Long id) {
        ResponseEntity<String> respuesta;
        // Busca el pedido por ID
        Optional<Pedido> pedidoOpt = pedidoRepo.findById(id);
        // Si el pedido existe
        if (pedidoOpt.isPresent()) {
        	// Se obtiene el objeto Pedido
            Pedido pedido = pedidoOpt.get();
            // Se marca como pagado
            pedido.setPagado(true);
            // Se asigna la fecha actual como fecha de pago
            pedido.setFechaPago(LocalDate.now());
            // Se guarda la actualización en la base de datos
            pedidoRepo.save(pedido);

            respuesta = ResponseEntity.ok("Pedido marcado como pagado");
        } else {
            respuesta = ResponseEntity.notFound().build();
        }

        return respuesta;
    }

    /**
     * Genera un archivo PDF con los detalles de un pedido.
     * @param id ID del pedido.
     * @return Respuesta HTTP con el PDF en formato de bytes o un error si no se encuentra o falla la generación.
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> generarPDF(@PathVariable Long id) {
        ResponseEntity<byte[]> respuesta;
        // Busca el pedido por ID
        Optional<Pedido> pedidoOpt = pedidoRepo.findById(id);

        if (pedidoOpt.isEmpty()) {
            respuesta = ResponseEntity.notFound().build();
        } else {
        	// Obtiene el pedido
            Pedido pedido = pedidoOpt.get();
            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            	// Crea un documento PDF en memoria usando un flujo de bytes
                Document document = new Document();
                // Asocia el documento al flujo de salida
                PdfWriter.getInstance(document, baos);
                // Abre el documento para empezar a escribir cont
                document.open();

                document.add(new Paragraph("Pedido Nº" + pedido.getId()));
                document.add(new Paragraph("Cliente: " + pedido.getNombreCliente()));
                document.add(new Paragraph("Dirección: " + pedido.getDireccion()));
                document.add(new Paragraph("Fecha: " + pedido.getFechaPedido()));
                document.add(new Paragraph("Total: " + pedido.getTotal() + " €"));
                document.add(new Paragraph(" "));
                // Añade el listado de productos del pedido
                for (LineaPedido linea : pedido.getDetalles()) {
                    document.add(new Paragraph(
                            linea.getNombreProducto() + " - " + linea.getCantidad() + " x " + linea.getPrecioUnitario() + " €"
                    ));
                }
                // Cierra el documento
                document.close();
                // Configura las cabeceras para que el navegador descargue el PDF
                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "inline; filename=pedido_" + id + ".pdf");
                // Devuelve la respuesta HTTP con el PDF generado
                respuesta = ResponseEntity.ok()
                        .headers(headers)
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(baos.toByteArray());

            } catch (Exception e) {
                respuesta = ResponseEntity.status(500).build();
            }
        }

        return respuesta;
    }

    /**
     * Crea un archivo de texto para un año específico si no existe.
     * @param anio El año para el cual se crea el archivo.
     * @return Una respuesta con el estado del proceso.
     */
    @PostMapping("/crear-archivo/{anio}")
    public ResponseEntity<String> crearArchivoParaAnio(@PathVariable int anio) {
        ResponseEntity<String> respuesta;
        // Define la ruta donde se guardará el archivo
        Path archivo = Paths.get("archivos", "pedidos_" + anio + ".txt");
        try {
        	// Crea el directorio "archivos" si no existe
            Files.createDirectories(archivo.getParent());
            // Si el archivo aún no existe, lo crea con un contenido básico
            if (!Files.exists(archivo)) {
                Files.writeString(archivo, "Archivo de pedidos para " + anio);
            }

            respuesta = ResponseEntity.ok("Archivo creado");
        } catch (IOException e) {
            respuesta = ResponseEntity.status(500).body("Error al crear archivo");
        }

        return respuesta;
    }
    
    /**
     * Devuelve una lista de años para los que existen archivos de pedidos.
     * @return Lista de años en los que hay archivos generados.
     */
    @GetMapping("/archivos")
    public ResponseEntity<List<Integer>> obtenerArchivosPorAnio() {
        ResponseEntity<List<Integer>> respuesta;
        // Ruta al directorio donde se almacenan los archivos
        Path dir = Paths.get("archivos");
        // Si el directorio no existe, devuelve una lista vacía
        if (!Files.exists(dir)) {
            respuesta = ResponseEntity.ok(new ArrayList<>());
        } else {
        	// Filtra y procesa los archivos que coinciden con el patrón esperado
            try (Stream<Path> stream = Files.list(dir)) {
                List<Integer> anios = stream
                		// Obtiene el nombre del archivo
                        .map(p -> p.getFileName().toString())
                        // Solo los que cumplen el formato
                        .filter(n -> n.startsWith("pedidos_") && n.endsWith(".txt"))
                        // Elimina texto adicional
                        .map(n -> n.replace("pedidos_", "").replace(".txt", ""))
                        // Convierte a entero
                        .map(Integer::parseInt)
                        // Ordena del más reciente al más antiguo
                        .sorted(Comparator.reverseOrder())
                        .toList();
                // Respuesta con los años encontrados
                respuesta = ResponseEntity.ok(anios);
            } catch (IOException e) {
                respuesta = ResponseEntity.status(500).build();
            }
        }

        return respuesta;
    }

    /**
     * Elimina el archivo correspondiente al año dado, si existe.
     * @param anio Año del archivo a eliminar.
     * @return Mensaje indicando éxito o fallo al eliminar el archivo.
     */
    @DeleteMapping("/archivos/{anio}")
    public ResponseEntity<String> eliminarArchivo(@PathVariable int anio) {
        ResponseEntity<String> respuesta;
        // Construye la ruta del archivo a eliminar: pedidos_2024.pdf por ejempl
        Path path = Paths.get("pedidos_" + anio + ".pdf");

        try {
        	// Intenta eliminar el archivo si existe
            Files.deleteIfExists(path);
            respuesta = ResponseEntity.ok("Archivo eliminado");
        } catch (IOException e) {
            respuesta = ResponseEntity.status(500).body("No se pudo eliminar el archivo");
        }

        return respuesta;
    }

    /**
     * Devuelve una lista de productos vendidos en un mes y año específicos.
     * @param anio Año de las ventas.
     * @param mes Mes de las ventas
     * @return Lista de detalles de productos vendidos.
     */
    @GetMapping("/productos-vendidos-mes")
    public List<ProductoVentaDetalle> obtenerDetalleVentasMes(@RequestParam int anio, @RequestParam int mes) {
    	// Llama al repositorio para obtener los productos vendidos en ese periodo
    	return pedidoRepo.obtenerDetalleProductosDelMes(anio, mes);
    }

    /**
     * Actualiza los datos básicos de un pedido existente.
     * @param id ID del pedido que se quiere actualizar.
     * @param pedidoActualizado Objeto con los nuevos datos del pedido.
     * @return Pedido actualizado o error si no se encuentra.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Pedido> actualizarPedido(@PathVariable Long id, @RequestBody Pedido pedidoActualizado) {
        ResponseEntity<Pedido> respuesta;
        // Busca el pedido en la base de datos por su ID
        Optional<Pedido> pedidoOpt = pedidoRepo.findById(id);
        // Si existe, se actualizan los datos del pedido
        if (pedidoOpt.isPresent()) {
            Pedido pedido = pedidoOpt.get();
            pedido.setNombreCliente(pedidoActualizado.getNombreCliente());
            pedido.setDireccion(pedidoActualizado.getDireccion());
            pedido.setEmail(pedidoActualizado.getEmail());
            pedido.setTelefono(pedidoActualizado.getTelefono());
            // Guarda cambios
            pedidoRepo.save(pedido);

            respuesta = ResponseEntity.ok(pedido);
        } else {
            respuesta = ResponseEntity.notFound().build();
        }

        return respuesta;
    }

    /**
     * Obtiene todos los pedidos hechos por un cliente según su email.
     * @param email Dirección de correo electrónico del cliente.
     * @return Lista de pedidos hechos por ese cliente.
     */
    @GetMapping("/cliente")
    public List<Pedido> getPedidosPorCliente(@RequestParam String email) {
    	// Busca todos los pedidos que coincidan con el email dado
        return pedidoRepo.findByEmail(email);
    }
}