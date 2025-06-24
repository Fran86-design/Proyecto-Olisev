package com.spring.controller;

/**
 * Controlador para gestionar la facturación a partir de pedidos.
 * 
 * Ruta base: /api/facturas
 * 
 * Funcionalidades principales:
 *
 * 	Generación de facturas:
 *   	Crear una factura desde un pedido existente.
 *   	Calcula automáticamente el IVA, coste de envío y total final.
 *   	Genera y guarda las líneas de factura con los productos del pedido.
 *
 * 	Consulta y gestión:
 *   	Listar todas las facturas que contienen líneas de detalle.
 *   	Eliminar una factura por su ID.
 *
 * 	Exportación:
 *   	Generar y descargar una factura en formato PDF, con diseño básico y totales calculados.
 *
 * 	Endpoints disponibles:
 *   	POST /api/facturas/desde-pedido/{id}: genera una factura a partir del pedido especificado.
 *   	GET /api/facturas: lista todas las facturas con contenido.
 *   	DELETE /api/facturas/{id}: elimina una factura por ID.
 *   	GET /api/facturas/{id}/pdf: genera y descarga un PDF con los detalles de una factura.
 *
 * 	Dependencias:
 * 		Usa los repositorios de Pedido, Factura y LineaFactura.
 * 		Usa la librería iText (Lowagie) para la generación de archivos PDF.
 */

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.spring.model.Factura;
import com.spring.model.LineaFactura;
import com.spring.model.Pedido;
import com.spring.repository.FacturaRepository;
import com.spring.repository.LineaFacturaRepository;
import com.spring.repository.PedidoRepository;

import jakarta.servlet.http.HttpServletResponse;

//Indica que esta clase es un controlador REST y que todos los métodos devolverán datos normalmente en formato JSON
@RestController
//Establece el prefijo "/api/facturas" para todas las rutas manejadas por este controlador.
@RequestMapping("/api/facturas")
//Permite solicitudes desde el frontend 
@CrossOrigin
public class FacturacionController {
	
	// Inyección automática del repositorio de facturas. Permite acceder a la base de datos de facturas sin crear manualmente una instancia.
    @Autowired
    private FacturaRepository facturaRepository;

    // Inyección automática del repositorio de pedidos. Se usa para consultar o relacionar pedidos al generar facturas.
    @Autowired
    private PedidoRepository pedidoRepository;
    
    // Inyección automática del repositorio de líneas de factura. Permite guardar o consultar los detalles individuales de cada factura.
    @Autowired
    private LineaFacturaRepository lineaFacturaRepository;

    /**
     * Genera una factura a partir de un pedido existente
     * @param id ID del pedido sobre el cual se desea generar la factura.
     * @return ResponseEntity con la factura generada, incluyendo sus líneas de detalle.
     */
    // Ruta: POST /api/facturas/desde-pedido/{id}
    @PostMapping("/desde-pedido/{id}")
    public ResponseEntity<Factura> generarFactura(@PathVariable Long id) {
    	// Busca el pedido por su ID; lanza excepción si no existe
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        // Crea una nueva instancia de factura		
        Factura factura = new Factura();
        // Asigna la fecha actual
        factura.setFecha(LocalDate.now());
        // Asocia el pedido a la factura
        factura.setPedido(pedido);
        // Usa la misma dirección del pedido
        factura.setDireccion(pedido.getDireccion());

        // Calcula valores
        // Total bruto del pedido
        double total = pedido.getTotal();
        // IVA fijo del 21%
        double iva = 0.21;
        // Coste de envío fijo
        double envio = 2.50;
        // Total final con IVA y envío
        double totalConIva = total * (1 + iva) + envio;
        // Asigna los valores a la factura
        factura.setTotal(total);
        factura.setIva(iva);
        factura.setCosteEnvio(envio);
        factura.setTotalConIva(totalConIva);
        // Guarda la factura en la base de datos
        Factura guardada = facturaRepository.save(factura);
        // Genera las líneas de factura a partir de los detalles del pedido
        List<LineaFactura> lineas = pedido.getDetalles().stream().map(detalle -> {
            LineaFactura lf = new LineaFactura();
            // Asocia cada línea con la factura recién guardada
            lf.setFactura(guardada);
            lf.setNombreProducto(detalle.getNombreProducto());
            lf.setCantidad(detalle.getCantidad());
            lf.setPrecioUnitario(detalle.getPrecioUnitario());
            return lf;
        }).toList();
        // Guarda todas las líneas de factura
        lineaFacturaRepository.saveAll(lineas);
        // Asocia las líneas a la factura antes de devolverla
        guardada.setLineas(lineas);
        // Devuelve la factura completa en la respuesta
        return ResponseEntity.ok(guardada);
    }

    /**
     * Devuelve una lista de todas las facturas que tienen al menos una línea asociada.
     * @return Lista de facturas con contenido (es decir, que contienen líneas de detalle).
     */
    // Define el endpoint GET en /api/facturas
    @GetMapping
    public List<Factura> listarFacturas() {
    	// Obtiene todas las facturas de la base de datos, luego filtra aquellas que tienen líneas
        return facturaRepository.findAll().stream()
        	 // Excluye facturas sin líneas
            .filter(f -> f.getLineas() != null && !f.getLineas().isEmpty())
             // Convierte el resultado filtrado en una lista
            .collect(Collectors.toList());
    }
    
    /**
     * Elimina una factura existente por su ID.
     * @param id ID de la factura que se desea eliminar.
     * @return ResponseEntity con 204 No Content si la eliminación fue exitosa.
     */
    // Define el endpoint DELETE en /api/facturas/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarFactura(@PathVariable Long id) {
    	// Elimina la factura con el ID proporcionado 
        facturaRepository.deleteById(id);
        // Devuelve una respuesta 204 No Content
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Genera un archivo PDF con los detalles de una factura específica y lo envía como descarga al cliente.
     * @param id ID de la factura que se desea exportar a PDF.
     * @param response Objeto HttpServletResponse para configurar la respuesta y escribir el archivo PDF.
     */
    @GetMapping("/{id}/pdf")
    public void descargarFacturaPdf(@PathVariable Long id, HttpServletResponse response) {
        Factura factura = facturaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Factura no encontrada"));

        try {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=factura_" + id + ".pdf");

            Document document = new Document();
            PdfWriter.getInstance(document, response.getOutputStream());
            document.open();

            // Título
            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            Paragraph title = new Paragraph("Factura #" + factura.getId(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" ")); // espacio

            // Datos del cliente
            document.add(new Paragraph("Fecha: " + factura.getFecha()));
            document.add(new Paragraph("Cliente: " + factura.getPedido().getNombreCliente()));
            document.add(new Paragraph("Dirección: " + factura.getDireccion()));
            document.add(new Paragraph(" "));

            // Tabla de productos
            PdfPTable tabla = new PdfPTable(4);
            tabla.setWidthPercentage(100);
            tabla.addCell("Producto");
            tabla.addCell("Cantidad");
            tabla.addCell("Precio Unitario (€)");
            tabla.addCell("Total (€)");

            for (LineaFactura linea : factura.getLineas()) {
                tabla.addCell(linea.getNombreProducto());
                tabla.addCell(String.valueOf(linea.getCantidad()));
                tabla.addCell(String.format("%.2f", linea.getPrecioUnitario()));
                double totalLinea = linea.getCantidad() * linea.getPrecioUnitario();
                tabla.addCell(String.format("%.2f", totalLinea));
            }

            document.add(tabla);
            document.add(new Paragraph(" "));

            // Totales
            double subtotal = factura.getTotal();
            double iva = factura.getIva() != null ? factura.getIva() : 0;
            double envio = factura.getCosteEnvio() != null ? factura.getCosteEnvio() : 0;
            double totalConIva = factura.getTotalConIva() != null ? factura.getTotalConIva() : 0;

            document.add(new Paragraph("Subtotal: " + String.format("%.2f", subtotal) + " €"));
            document.add(new Paragraph("IVA (" + (iva * 100) + "%): " + String.format("%.2f", subtotal * iva) + " €"));
            document.add(new Paragraph("Coste de envío: " + String.format("%.2f", envio) + " €"));
            document.add(new Paragraph("Total: " + String.format("%.2f", totalConIva) + " €"));

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF", e);
        }
    }
}