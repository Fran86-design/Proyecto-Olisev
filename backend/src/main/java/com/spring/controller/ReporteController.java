package com.spring.controller;

/**
 * Controlador para la generación y consulta de reportes de ventas y productos.
 *
 * Este controlador expone múltiples endpoints bajo la ruta "/api/reportes" para:
 *
 * 	Consultar información de ventas:
 *   	Por día, mes y año.
 *   	Detalle de productos vendidos por día, mes o año.
 *   	Productos con bajo stock.
 *
 * 	Generar reportes en formato PDF:
 *   	Resumen de ventas por día, mes y año.
 *   	Listado de productos con bajo stock.
 *
 * 	Gestionar resúmenes anuales:
 *   	Guardar resúmenes anuales en formato JSON.
 *   	Obtener un resumen anual previamente guardado.
 *   	Listar los años disponibles con resumen registrado.
 *
 * Utiliza datos proporcionados por los repositorios PedidoRepository y ProductoRepository,
 * además de bibliotecas como iText (Lowagie) para la creación de documentos PDF y Jackson para manejo de JSON.
 */

import java.util.ArrayList;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;




import java.io.ByteArrayOutputStream;
import java.io.File;
import java.time.LocalDate;
import java.time.format.TextStyle;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.dto.ProductoVentaDetalle;
import com.spring.dto.ResumenAnualDTO;
import com.spring.dto.VentaPorFecha;
import com.spring.model.Pedido;
import com.spring.model.Producto;
import com.spring.repository.PedidoRepository;
import com.spring.repository.ProductoRepository;



@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "http://localhost:4200")
public class ReporteController {

	// Inyecta automáticamente una instancia del repositorio de pedidos
	@Autowired
    private PedidoRepository pedidoRepository;
	
	// Ruta donde se guardarán los archivos resumen anuales en formato JSON
	private static final String RUTA_ARCHIVOS_JSON = "archivos-anuales";
	
	// Inyecta automáticamente una instancia del repositorio de productos
	@Autowired
	private ProductoRepository productoRepository;

	/**
	 * Devuelve la lista de ventas agrupadas por fecha (día).
	 * @return Lista de objetos VentaPorFecha con totales por cada día.
	 */
    @GetMapping("/ventas-por-fecha")
    public List<VentaPorFecha> obtenerVentasPorFecha() {
        return pedidoRepository.obtenerVentasPorFecha();
    }
    
    /**
     * Devuelve la lista de ventas agrupadas por mes (de todos los años).
     * @return Lista de objetos VentaPorFecha con totales por mes.
     */
    @GetMapping("/ventas-por-mes")
    public List<VentaPorFecha> obtenerVentasPorMes() {
        return pedidoRepository.obtenerVentasPorMes();
    }

    /**
     * Devuelve las ventas agrupadas por mes de un año específico.
     * @param anio Año del que se quieren obtener las ventas
     * @return Lista de objetos VentaPorFecha con totales por mes de ese año.
     */
    @GetMapping("/ventas-por-anio")
    public List<VentaPorFecha> obtenerVentasPorAnio(@RequestParam int anio) {
        return pedidoRepository.obtenerVentasPorMesDelAnio(anio);
    }
    
    /**
     * Obtiene las ventas totales del día actual.
     * @return Lista con un objeto VentaPorFecha que representa las ventas del día.
     */
    @GetMapping("/ventas-del-dia")
    public List<VentaPorFecha> obtenerVentasDelDia() {
    	// Obtiene la fecha actual
        LocalDate hoy = LocalDate.now(); 
        // Obtiene todos los pedidos que ya fueron enviados
        List<Pedido> pedidos = pedidoRepository.findByEnviadoTrue(); 

        System.out.println("Hoy: " + hoy);
        System.out.println("Ventas enviadas:");

        for (Pedido p : pedidos) {
            System.out.println(" - Pedido " + p.getId() + " | Fecha: " + p.getFechaPedido() + " | Total: " + p.getTotal());
        }
        // Agrupa y suma los totales de los pedidos cuya fecha sea hoy
        Map<LocalDate, Double> ventasPorDia = pedidos.stream()
        	 // Filtra los pedidos del día
            .filter(p -> p.getFechaPedido().isEqual(hoy))
            .collect(Collectors.groupingBy(
            	// Agrupa por fecha del pedido
            	Pedido::getFechaPedido,
            	// Suma los totales por fecha
                Collectors.summingDouble(Pedido::getTotal)
            ));
        // Convierte el mapa a una lista de objetos VentaPorFecha
        return ventasPorDia.entrySet().stream()
            .map(e -> new VentaPorFecha(e.getKey().toString(), e.getValue()))
            .toList();
    }
   
    /**
     * Obtiene una lista de productos cuyo stock está por debajo o igual al límite indicado.
     * @param limite valor máximo de stock para filtrar productos. Por defecto es 5.
     * @return lista de productos con bajo stock.
     */
    @GetMapping("/bajo-stock")
    public List<Producto> obtenerProductosConBajoStock(@RequestParam(defaultValue = "5") int limite) {
    	// Busca y devuelve todos los productos cuyo stock sea menor o igual al valor de 'limite'
    	return productoRepository.findByStockLessThanEqual(limite);
    }
    
    /**
     * Genera un PDF con el resumen de ventas del día actual.
     * @return el archivo PDF como respuesta HTTP.
     */
    @GetMapping("/ventas-dia-pdf")
    public ResponseEntity<byte[]> generarPDFVentasDelDia() {
    	// Llama al metodo pasando dia como parámetro para generar el PDF correspondiente
        return generarPDF("dia");
    }

    /**
     * Genera un PDF con el resumen de ventas del mes actual.
     * @return el archivo PDF como respuesta HTTP.
     */
    @GetMapping("/ventas-mes-pdf")
    public ResponseEntity<byte[]> generarPDFVentasDelMes() {
    	// Llama al mismo método, esta vez con mes para indicar el tipo de resumen
        return generarPDF("mes");
    }

    /**
     * Genera un PDF con el resumen de ventas del año actual.
     * @return archivo PDF como respuesta HTTP.
     */
    @GetMapping("/ventas-anio-pdf")
    public ResponseEntity<byte[]> generarPDFVentasDelAnio() {
        return generarPDF("anio");
    }

    /**
     * Genera un PDF con la lista de productos con bajo stock.
     * @return archivo PDF como respuesta HTTP.
     */
    @GetMapping("/stock-bajo-pdf")
    public ResponseEntity<byte[]> generarPDFStockBajo() {
        return generarPDF("stock");
    }
    
    /**
     * Obtiene el detalle de productos vendidos hoy.
     * @return lista con información de productos vendidos en el día actual.
     */
    @GetMapping("/productos-vendidos-hoy")
    public List<ProductoVentaDetalle> obtenerDetalleVentasHoy() {
    	// Consulta en el repositorio los detalles de productos vendidos específicamente en la fecha de hoy.
        return pedidoRepository.obtenerDetalleProductosDelDia();
    }
    
    /**
     * Devuelve el detalle de productos vendidos en un mes específico
     * @param anio Año para filtrar las ventas.
     * @param mes Mes para filtrar las ventas.
     * @return Lista con los detalles de productos vendidos en ese mes.
     */
    @GetMapping("/productos-vendidos-mes")
    public List<ProductoVentaDetalle> obtenerDetalleVentasMes(
        @RequestParam int anio,
        @RequestParam int mes) {
    	// Consulta al repositorio para obtener detalles de productos vendidos en el mes y año indicados.
        return pedidoRepository.obtenerDetalleProductosDelMes(anio, mes);
    }

    /**
     * Devuelve el detalle de productos vendidos durante todo un año.
     * @param anio Año para filtrar las ventas.
     * @return Lista con los detalles de productos vendidos ese año.
     */
    @GetMapping("/productos-vendidos-anio")
    public List<ProductoVentaDetalle> obtenerDetalleVentasAnio(@RequestParam int anio) {
        return pedidoRepository.obtenerDetalleProductosDelAnio(anio);
    }
    
    /**
     * Genera un archivo PDF con información de ventas o productos con bajo stock,
     * dependiendo del valor de tipo proporcionado.
     * @param tipo Puede ser dia, mes, anio o stock.
     * @return PDF generado como array de bytes dentro de un ResponseEntity.
     */    
    private ResponseEntity<byte[]> generarPDF(String tipo) {
        try {
        	// Flujo de salida para capturar el contenido del PDF
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            // Crea un nuevo documento PDF
            Document doc = new Document();
            PdfWriter.getInstance(doc, baos);
            doc.open();
            // Define la fuente del título
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            // Define el título del reporte según el tipo
            String titulo = switch (tipo) {
                case "dia" -> "Ventas del Día";
                case "mes" -> "Ventas por Mes";
                case "anio" -> "Ventas por Año";
                case "stock" -> "Productos con Bajo Stock";
                default -> "Reporte";
            };
            // Agrega el título al documento
            doc.add(new Paragraph(titulo, titleFont));
            doc.add(new Paragraph(" ")); // espacio

            PdfPTable table;

            switch (tipo) {
                case "dia", "mes" -> {
                	// Filtra las ventas por fecha actual (día o mes)
                    List<VentaPorFecha> ventas = switch (tipo) {
                        case "dia" -> pedidoRepository.obtenerVentasPorFecha().stream()
                            .filter(v -> v.getFecha().startsWith(LocalDate.now().toString()))
                            .toList();
                        case "mes" -> pedidoRepository.obtenerVentasPorMes().stream()
                            .filter(v -> v.getFecha().startsWith(LocalDate.now().toString().substring(0, 7)))
                            .toList();
                        default -> List.of();
                    };
                    // Tabla de resumen de ventas
                    table = new PdfPTable(2);
                    table.setWidthPercentage(100);
                    table.addCell("Fecha");
                    table.addCell("Total (€)");

                    for (VentaPorFecha v : ventas) {
                        table.addCell(v.getFecha());
                        table.addCell(String.format("%.2f", v.getTotal()));
                    }

                    doc.add(table);
                    doc.add(new Paragraph(" "));
                    // Productos vendidos ese día o mes
                    List<ProductoVentaDetalle> productos = switch (tipo) {
                        case "dia" -> pedidoRepository.obtenerDetalleProductosDelDia();
                        case "mes" -> pedidoRepository.obtenerDetalleProductosDelMes(
                                        LocalDate.now().getYear(), LocalDate.now().getMonthValue());
                        default -> List.of();
                    };

                    if (!productos.isEmpty()) {
                        doc.add(new Paragraph("Productos Vendidos", titleFont));
                        doc.add(new Paragraph(" "));

                        PdfPTable prodTable = new PdfPTable(2);
                        prodTable.setWidthPercentage(100);
                        prodTable.addCell("Producto");
                        prodTable.addCell("Cantidad");

                        for (ProductoVentaDetalle p : productos) {
                            prodTable.addCell(p.getNombreProducto());
                            prodTable.addCell(String.valueOf(p.getCantidadVendida()));
                        }

                        doc.add(prodTable);
                    }
                }

                case "anio" -> {
                    int anio = LocalDate.now().getYear();

                    // Obtener ventas por mes del año actual
                    List<VentaPorFecha> ventas = pedidoRepository.obtenerVentasPorMes().stream()
                        .filter(v -> v.getFecha().startsWith(anio + "-"))
                        .toList();

                    table = new PdfPTable(2);
                    table.setWidthPercentage(100);
                    table.addCell("Mes");
                    table.addCell("Total (€)");

                    for (int m = 1; m <= 12; m++) {
                        String mm = String.format("%02d", m);
                        String key = anio + "-" + mm;
                        double totalMes = ventas.stream()
                            .filter(v -> v.getFecha().equals(key))
                            .mapToDouble(VentaPorFecha::getTotal)
                            .findFirst()
                            .orElse(0.0);

                        table.addCell(mm + "/" + anio);
                        table.addCell(String.format("%.2f", totalMes));
                    }

                    doc.add(table);
                    doc.add(new Paragraph(" "));

                    // Detalle mensual de productos
                    for (int m = 1; m <= 12; m++) {
                        List<ProductoVentaDetalle> productosMes = pedidoRepository.obtenerDetalleProductosDelMes(anio, m);

                        doc.add(new Paragraph("Productos vendidos en " +
                            LocalDate.of(anio, m, 1).getMonth().getDisplayName(TextStyle.FULL, new Locale("es", "ES")),
                            titleFont));
                        doc.add(new Paragraph(" "));

                        PdfPTable prodTable = new PdfPTable(2);
                        prodTable.setWidthPercentage(100);
                        prodTable.addCell("Producto");
                        prodTable.addCell("Cantidad");

                        if (productosMes.isEmpty()) {
                            prodTable.addCell("Ninguno");
                            prodTable.addCell("0");
                        } else {
                            for (ProductoVentaDetalle p : productosMes) {
                                prodTable.addCell(p.getNombreProducto());
                                prodTable.addCell(String.valueOf(p.getCantidadVendida()));
                            }
                        }

                        doc.add(prodTable);
                        doc.add(new Paragraph(" "));
                    }
                }

                case "stock" -> {
                	// Productos con bajo stock (5 o menos)
                    List<Producto> productos = productoRepository.findByStockLessThanEqual(5);
                    table = new PdfPTable(3);
                    table.setWidthPercentage(100);
                    table.addCell("Producto");
                    table.addCell("Stock");
                    table.addCell("ID");

                    for (Producto p : productos) {
                        table.addCell(p.getNombre());
                        table.addCell(String.valueOf(p.getStock()));
                        table.addCell(String.valueOf(p.getId()));
                    }

                    doc.add(table);
                }

                default -> {
                	// Tipo de reporte no válido
                    doc.add(new Paragraph("No se reconoce el tipo de reporte."));
                }
            }
            // Cierra el documento
            doc.close();
            // Encabezados HTTP para devolver el PDF
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "reporte-" + tipo + ".pdf");

            return new ResponseEntity<>(baos.toByteArray(), headers, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Guarda en un archivo JSON el resumen anual de ventas.
     * @param resumen Objeto que contiene los datos del resumen anual a guardar.
     * @return ResponseEntity indicando si la operación fue exitosa o si ocurrió un error.
     */
    @PostMapping("/guardar-resumen-anual")
    public ResponseEntity<String> guardarResumenAnual(@RequestBody ResumenAnualDTO resumen) {
        System.out.println("Guardando resumen para el año: " + resumen.anio);
        ResponseEntity<String> respuesta;

        try {
        	// Crea el directorio donde se guardarán los archivos si no existe
            File dir = new File(RUTA_ARCHIVOS_JSON);
            if (!dir.exists()) dir.mkdirs();
            // Define la ruta del archivo que se va a guardar, ej: resumen-2025.json
            File archivo = new File(dir, "resumen-" + resumen.anio + ".json");
            // Usa ObjectMapper para convertir el objeto a formato JSON y guardarlo en disco
            ObjectMapper mapper = new ObjectMapper();
            mapper.writeValue(archivo, resumen);

            respuesta = ResponseEntity.ok("Resumen guardado");
        } catch (Exception e) {
            respuesta = new ResponseEntity<>("Error al guardar", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return respuesta;
    }
    
    /**
     * Obtiene el resumen anual de ventas almacenado en un archivo JSON.
     * @param anio Año para el cual se desea obtener el resumen.
     * @return ResponseEntity con el resumen si existe, o un estado de error si no.
     */
    @GetMapping("/resumen-anual")
    public ResponseEntity<ResumenAnualDTO> obtenerResumenAnual(@RequestParam int anio) {
    	// Declaración de la respuesta que se devolverá
    	ResponseEntity<ResumenAnualDTO> respuesta;

        try {
        	// Se construye la ruta del archivo correspondiente al año solicitado
            File archivo = new File(RUTA_ARCHIVOS_JSON, "resumen-" + anio + ".json");
            // Si el archivo no existe, se devuelve una respuesta 404 (no encontrado)
            if (!archivo.exists()) {
                respuesta = new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else {
            	// Si el archivo existe, se convierte su contenido JSON a un objeto DTO
                ObjectMapper mapper = new ObjectMapper();
                ResumenAnualDTO resumen = mapper.readValue(archivo, ResumenAnualDTO.class);

                respuesta = ResponseEntity.ok(resumen);
            }

        } catch (Exception e) {
            respuesta = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return respuesta;
    }
    
    /**
     * Devuelve una lista de años para los cuales existen archivos de resumen anual.
     * @return Lista de años en los que se ha guardado un resumen anual.
     */
    @GetMapping("/resumenes-anuales")
    public ResponseEntity<List<Integer>> listarResumenesAnuales() {
    	// Declaración de la variable para la respuesta HTTP
    	ResponseEntity<List<Integer>> respuesta;
    	// Carpeta donde se almacenan los archivos de resumen anual
        File carpeta = new File(RUTA_ARCHIVOS_JSON);
        // Verifica si la carpeta no existe o no es un directorio válido
        if (!carpeta.exists() || !carpeta.isDirectory()) {
        	// Devuelve un 404 si no se encuentra la carpeta
            respuesta = new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
        	// Filtra los archivos cuyo nombre comienza con "resumen-" y termina con ".json"
            File[] archivos = carpeta.listFiles((dir, name) -> name.startsWith("resumen-") && name.endsWith(".json"));
            // Si ocurre un error al listar los archivos, se devuelve un 500
            if (archivos == null) {
                respuesta = new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            } else {
            	// Lista para almacenar los años extraídos de los nombres de los archivos
                List<Integer> anios = new ArrayList<>();

                for (File archivo : archivos) {
                	// Ejemplo: resumen-2025.json
                    String nombre = archivo.getName(); 
                    try {
                    	// Elimina el prefijo y la extensión para quedarse solo con el año
                        String sinExtension = nombre.replace("resumen-", "").replace(".json", "");
                        // Convierte el año a número
                        anios.add(Integer.parseInt(sinExtension));
                     // Ignora archivos con nombres que no contienen un año válido
                    } catch (NumberFormatException ignored) {
                        
                  }
                }
                // Ordena la lista de años en orden descendente
                anios.sort(Comparator.reverseOrder()); 
                // Devuelve la lista de años con código 200 OK
                respuesta = ResponseEntity.ok(anios);
            }
        }

        return respuesta;
    }
}
