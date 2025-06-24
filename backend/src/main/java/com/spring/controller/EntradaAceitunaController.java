package com.spring.controller;

/**
 * Controlador que gestiona las entradas de aceituna al sistema.
 * 
 * Ruta base: /api/aceitunas
 * 
 * Funcionalidades clave:
 *
 * 	Registro de entradas:
 *   	Permite registrar nuevas entradas de aceituna vinculadas a un cliente y una campaña.
 *   	Valida la existencia del cliente antes de guardar.
 *
 * 	Consultas:
 *   	Listar entradas por cliente o por campaña.
 *   	Obtener todas las entradas o las campañas únicas disponibles.
 *
 * 	Gestión:
 *   	Actualizar entradas existentes con nuevos datos.
 *   	Eliminar entradas por ID.
 *
 * 	Exportación:
 *   	Generar y descargar en PDF los detalles completos de una entrada específica.
 *
 * 	Endpoints disponibles:
 *   	POST /api/aceitunas: registra una nueva entrada.
 *   	GET /api/aceitunas/cliente/{id}: obtiene entradas de un cliente.
 *   	GET /api/aceitunas/campana/{campana}: entradas de una campaña.
 *   	GET /api/aceitunas: lista todas las entradas.
 *   	GET /api/aceitunas/campanias: campañas registradas (únicas).
 *   	PUT /api/aceitunas/{id}: actualiza una entrada por ID.
 *  	DELETE /api/aceitunas/{id}: elimina una entrada.
 *   	GET /api/aceitunas/{id}/pdf: genera un PDF de la entrada.
 *
 * Repositorios utilizados:
 * 		EntradaAceitunaRepository: para operaciones CRUD sobre entradas.
 * 		UsuarioRepository: para validar y asociar clientes a las entradas.
 *
 * Utiliza la librería iText (Lowagie) para generación de archivos PDF.
 */

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.spring.model.EntradaAceituna;
import com.spring.model.Usuario;
import com.spring.repository.EntradaAceitunaRepository;
import com.spring.repository.UsuarioRepository;

import jakarta.servlet.http.HttpServletResponse;

// Declara que esta clase es un controlador REST que devolverá respuestas JSON.
@RestController
//Establece el prefijo común para todas las rutas del controlador.
@RequestMapping("/api/aceitunas")
//Permite solicitudes desde el frontend 
@CrossOrigin(origins = "http://localhost:4200")
public class EntradaAceitunaController { 
	
	// Indica a Spring que debe inyectar automáticamente una instancia del repositorio EntradaAceitunaRepository.
	// Esta anotación permite usar el repositorio sin necesidad de crear una instancia manualmente
	// Spring busca un bean compatible y lo proporciona al iniciar la aplicación.
	@Autowired 
	// Inyecta automáticamente el repositorio de entradas de aceituna para acceder a la base de datos.
    private EntradaAceitunaRepository entradaRepo;
    
    @Autowired 
    // Inyecta el repositorio de usuarios para poder consultar clientes asociados a la entrada.
    private UsuarioRepository usuarioRepo;
    
    /**
     * Registra una nueva entrada de aceituna.
     * Valida que se proporcione una campaña válida y un cliente existente.
     * @param entrada Objeto EntradaAceituna recibido desde el cuerpo de la solicitud (JSON).
     * @return ResponseEntity con el resultado del registro
     */
    // Define que este método manejará solicitudes HTTP POST a /api/aceitunas (por el @RequestMapping del controlador)
    @PostMapping
    public ResponseEntity<?> registrarEntrada(@RequestBody EntradaAceituna entrada) {
    	// Declara una variable para almacenar la respuesta que se devolverá al final.
        ResponseEntity<?> respuesta;
        // Valida que el campo "campaña" no sea nulo ni esté vacío.
        if (entrada.getCampana() == null || entrada.getCampana().isBlank()) {
            respuesta = ResponseEntity.badRequest().body(Map.of("error", "Campaña no especificada"));
        // Valida que el cliente no sea nulo y que su ID esté presente.
        } else if (entrada.getCliente() == null || entrada.getCliente().getId() == null) {
            respuesta = ResponseEntity.badRequest().body(Map.of("error", "Cliente no especificado"));
        } else {
        	// Busca el cliente por su ID en la base de datos.
        	Optional<Usuario> cliente = usuarioRepo.findById(entrada.getCliente().getId());
        	// Si no se encuentra el cliente, se devuelve un error.
            if (cliente.isEmpty()) {
                respuesta = ResponseEntity.badRequest().body(Map.of("error", "Cliente no válido"));
            } else {
            	// Asocia el cliente obtenido a la entrada y la guarda en la base de datos.
                entrada.setCliente(cliente.get());
                entradaRepo.save(entrada);
                // Devuelve una respuesta exitosa con mensaje.
                respuesta = ResponseEntity.ok(Map.of("mensaje", "Entrada registrada"));
            }
        }
        // Retorna la respuesta generada según el resultado de las validaciones.
        return respuesta;
    }
    
    /**
     * Devuelve la lista de entradas de aceituna asociadas a un cliente específico.
     * @param id ID del cliente del cual se desean obtener las entradas.
     * @return Lista de entradas de aceituna correspondientes al cliente indicado.
     */
    // Define el endpoint GET en /api/aceitunas/cliente/{id}
    @GetMapping("/cliente/{id}")
    // Llama al repositorio para obtener todas las entradas cuyo cliente tenga el ID indicado
    public List<EntradaAceituna> porCliente(@PathVariable Long id) {
        return entradaRepo.findByClienteId(id);
    }
    
    /**
     * Devuelve la lista de entradas de aceituna asociadas a una campaña específica.
     * @param campana Nombre o identificador de la campaña, por ejemplo, 2024.
     * @return Lista de entradas de aceituna registradas en la campaña indicada.
     */
    // Define el endpoint GET en /api/aceitunas/campana/{campana}
    @GetMapping("/campana/{campana}")
    // Busca y devuelve todas las entradas cuya campaña coincida con el valor recibido
    public List<EntradaAceituna> porCampana(@PathVariable String campana) {
        return entradaRepo.findByCampana(campana);
    }

    /**
     * Elimina una entrada de aceituna por su ID.
     * @param id ID de la entrada de aceituna que se desea eliminar.
     * @return ResponseEntity con el resultado del registro
     */
    // Define el endpoint DELETE en /api/aceitunas/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
    	// Verifica si existe una entrada con el ID dado.
        if (!entradaRepo.existsById(id)) return ResponseEntity.notFound().build();
        // Si existe, la elimina de la base de datos.
        entradaRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Obtiene la lista completa de todas las entradas de aceituna registradas en el sistema.
     * @return Lista de todas las entradas de aceituna en la base de datos.
     */
    // Define el endpoint GET en /api/aceitunas
    @GetMapping
    public List<EntradaAceituna> obtenerTodas() {
    	// Llama al repositorio para obtener todas las entradas de aceituna y las devuelve.
        return entradaRepo.findAll();
    }
    
    /**
     * Actualiza los datos de una entrada de aceituna existente, identificada por su ID.
     * También valida que el cliente sea especificado correctamente y que exista.
     * @param id ID de la entrada de aceituna a actualizar.
     * @param nuevaEntrada Objeto con los nuevos datos de la entrada (enviado en el cuerpo de la solicitud).
     * @return ResponseEntity con el resultado del registro
     */
    // Define el endpoint PUT en /api/aceitunas/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarEntrada(@PathVariable Long id, @RequestBody EntradaAceituna nuevaEntrada) {
        ResponseEntity<?> respuesta;
        // Valida que el cliente esté presente y tenga un ID válido
        if (nuevaEntrada.getCliente() == null || nuevaEntrada.getCliente().getId() == null) {
            respuesta = ResponseEntity.badRequest().body(Map.of("error", "Cliente no especificado"));
        } else {
        	// Busca al cliente en la base de datos
            Optional<Usuario> cliente = usuarioRepo.findById(nuevaEntrada.getCliente().getId());

            if (cliente.isEmpty()) {
            	// Si no se encuentra el cliente, devuelve error
                respuesta = ResponseEntity.badRequest().body(Map.of("error", "Cliente no válido"));
            } else {
            	// Si el cliente es válido, busca la entrada y la actualiza si existe
                respuesta = entradaRepo.findById(id).map(entrada -> {
                    entrada.setCliente(cliente.get());
                    entrada.setVariedad(nuevaEntrada.getVariedad());
                    entrada.setTipo(nuevaEntrada.getTipo());
                    entrada.setKilos(nuevaEntrada.getKilos());
                    entrada.setFechaEntrada(nuevaEntrada.getFechaEntrada());
                    entrada.setCocedera(nuevaEntrada.getCocedera());
                    entrada.setFechaCocedera(nuevaEntrada.getFechaCocedera());
                    entrada.setFermentador(nuevaEntrada.getFermentador());
                    entrada.setFechaFermentador(nuevaEntrada.getFechaFermentador());
                    entrada.setGradosSal(nuevaEntrada.getGradosSal());
                    entrada.setGradosSosa(nuevaEntrada.getGradosSosa());
                    entrada.setCampana(nuevaEntrada.getCampana());
                    entrada.setObservaciones(nuevaEntrada.getObservaciones());
                    entrada.setLote(nuevaEntrada.getLote());
                    // Guarda los cambios en la base de datos
                    entradaRepo.save(entrada);
                    return ResponseEntity.ok(Map.of("mensaje", "Entrada actualizada"));
                 // Si no se encuentra la entrada, devuelve 404
                }).orElse(ResponseEntity.notFound().build());
            }
        }

        return respuesta;
    }
    
    /**
     * Obtiene la lista de campañas únicas registradas en las entradas de aceituna.
     * @return Lista de nombres de campaña distintos existentes en la base de datos.
     */
    // Define el endpoint GET en /api/aceitunas/campanias
    @GetMapping("/campanias")
    public List<String> obtenerCampanias() {
    	// Llama al repositorio para obtener campañas únicas o distintas sin duplicados
        return entradaRepo.findDistinctCampanias();
    }
    
    /**
     * Genera un archivo PDF con los detalles de una entrada de aceituna y lo envía como descarga al cliente.
     * @param id ID de la entrada de aceituna que se desea exportar a PDF
     * @param response Objeto HttpServletResponse para configurar la respuesta HTTP y escribir el archivo PDF.
     * @throws IOException Si ocurre un error al escribir el PDF en el flujo de salida.
     */
    // Define el endpoint GET en /api/aceitunas/{id}/pdf
    @GetMapping("/{id}/pdf")
    public void generarPDF(@PathVariable Long id, HttpServletResponse response) throws IOException {
    	// Busca la entrada por su ID
    	Optional<EntradaAceituna> entradaOpt = entradaRepo.findById(id);
    	// Si no se encuentra, establece el código de respuesta HTTP como 404 Not Found
        if (entradaOpt.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        } else {
        	// Si la entrada existe, se obtiene y se procede a generar el PDF
            EntradaAceituna entrada = entradaOpt.get();
            // Configura el tipo de contenido y el nombre del archivo descargable
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=entrada_" + id + ".pdf");
            // Crea un documento PDF utilizando iText
            Document documento = new Document();
            PdfWriter.getInstance(documento, response.getOutputStream());
            documento.open();
            // Fuente para el título del documento
            Font tituloFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            documento.add(new Paragraph("Detalles de Entrada Nº " + entrada.getId(), tituloFont));
            documento.add(new Paragraph(" ")); // Espacio
            // Fuente para el contenido normal del documento
            Font normal = new Font(Font.HELVETICA, 12);
            // Agrega información detallada al PDF
            documento.add(new Paragraph("Cliente: " + entrada.getCliente().getNombre() + " " + entrada.getCliente().getApellidos(), normal));
            documento.add(new Paragraph("Campaña: " + entrada.getCampana(), normal));
            documento.add(new Paragraph("Lote: " + entrada.getLote(), normal));
            documento.add(new Paragraph("Variedad: " + entrada.getVariedad(), normal));
            documento.add(new Paragraph("Tipo: " + entrada.getTipo(), normal));
            documento.add(new Paragraph("Kilos: " + entrada.getKilos(), normal));
            documento.add(new Paragraph("Fecha Entrada: " + entrada.getFechaEntrada().format(DateTimeFormatter.ISO_DATE), normal));
            documento.add(new Paragraph("Cocedera: " + entrada.getCocedera(), normal));
            documento.add(new Paragraph("Fermentador: " + entrada.getFermentador(), normal));
            documento.add(new Paragraph("Grados Sal: " + entrada.getGradosSal(), normal));
            documento.add(new Paragraph("Grados Sosa: " + entrada.getGradosSosa(), normal));
            documento.add(new Paragraph("Observaciones: " + entrada.getObservaciones(), normal));
            // Cierra el documento y finaliza la escritura
            documento.close();
        }
    }
}