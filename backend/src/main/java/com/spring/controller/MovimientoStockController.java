package com.spring.controller;

/**
 * Controlador para la gestión de movimientos de stock y archivos anuales asociados.
 *
 * Ruta base: /api/movimientos
 *
 * Funcionalidades principales:
 *
 * 	Consultar movimientos de stock:
 *   -	Obtener movimientos reales registrados entre fechas (por año).
 *   	Mostrar datos simulados si no hay movimientos reales para un año dado.
 *
 * 	Gestión de archivos de movimientos:
 *   	Crear archivos de movimientos por año (registro lógico en base de datos).
 *   	Consultar lista de años con archivos registrados.
 *   	Eliminar archivos (simulado, sin borrar físicamente).
 *
 * 	Dependencias utilizadas:
 *   	MovimientoStockRepository: para acceder a los registros de stock.
 *   	ArchivoMovimientoRepository: para gestionar los años con archivos asociados.
 */

import com.spring.model.ArchivoMovimiento;
import com.spring.model.MovimientoStock;
import com.spring.repository.ArchivoMovimientoRepository;
import com.spring.repository.MovimientoStockRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.*;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/movimientos")
@CrossOrigin(origins = "*")
public class MovimientoStockController {

	// Inyección del repositorio que gestiona los movimientos de stock
    @Autowired
    private MovimientoStockRepository movimientoRepo;
    
    // Inyección del repositorio que gestiona los archivos por año
    @Autowired
    private ArchivoMovimientoRepository archivoRepo;

    /**
     * Obtiene una lista de los años para los cuales existen archivos de movimientos registrados.
     * @return ResponseEntity con la lista de años ordenados de mayor a menor.
     */
    @GetMapping("/anios")
    public ResponseEntity<List<Integer>> obtenerAniosDeArchivos() {
    	// Recupera todos los archivos, extrae el año de cada uno, los ordena en orden descendente y los coloca en una lista
        List<Integer> anios = archivoRepo.findAll().stream()
        	// Extrae el campo 'anio' de cada objeto ArchivoMovimiento
            .map(ArchivoMovimiento::getAnio)
            // Ordena los años de mayor a menor
            .sorted(Comparator.reverseOrder())
            // Convierte el stream a lista
            .collect(Collectors.toList());
        // Devuelve la lista como respuesta HTTP 200 OK con el contenido JSON
        return ResponseEntity.ok(anios);
    }
    
    /**
     * Devuelve los movimientos de stock correspondientes a un año específico.
     * Si no hay datos reales, se devuelven movimientos simulados para mostrar ejemplo.
     * @param anio Año del que se quieren obtener los movimientos.
     * @return Lista de movimientos reales o simulados si no se encuentran.
     */
    @GetMapping("/por-anio/{anio}")
    public List<MovimientoStock> obtenerPorAnio(@PathVariable int anio) {
    	// Crea el primer día del año
        Calendar inicio = new GregorianCalendar(anio, Calendar.JANUARY, 1);
        // Crea el último día del año
        Calendar fin = new GregorianCalendar(anio, Calendar.DECEMBER, 31);
        // Consulta los movimientos en la base de datos entre esas fechas
        List<MovimientoStock> resultados = movimientoRepo.findByFechaBetween(inicio.getTime(), fin.getTime());
        // Variable para almacenar la respuesta final
        List<MovimientoStock> respuesta;
        // Si no hay resultados, se generan dos movimientos simulados
        if (resultados.isEmpty()) {
            // Simulación de movimientos
            MovimientoStock m1 = new MovimientoStock();
            m1.setFecha(inicio.getTime());
            m1.setTipo("ENTRADA");
            m1.setCantidad(10);

            MovimientoStock m2 = new MovimientoStock();
            m2.setFecha(fin.getTime());
            m2.setTipo("SALIDA");
            m2.setCantidad(5);
            // Se devuelve una lista con los datos simulados
            respuesta = Arrays.asList(m1, m2); // para ver resultados simulados
        } else {
        	// Si hay resultados reales, se devuelven tal cual
            respuesta = resultados;
        }
        // Devuelve la lista resultante
        return respuesta;
    }

    /**
     * Crea un archivo de movimientos para un año específico, si aún no existe.
     * @param anio Año para el cual se desea crear el archivo de movimientos
     * @return ResponseEntity con mensaje de éxito o conflicto si ya existe.
     */
    @PostMapping("/crear-archivo/{anio}")
    public ResponseEntity<String> crearArchivoParaAnio(@PathVariable int anio) {
        ResponseEntity<String> respuesta;
        // Verifica si ya existe un archivo de movimientos con ese año como ID
        if (archivoRepo.existsById(anio)) {
        	 // Si ya existe, devuelve un conflicto HTTP 409
            respuesta = ResponseEntity.status(409).body("Ya existe un archivo para el año " + anio);
        } else {
        	// Si no existe, crea un nuevo archivo y lo guarda
            archivoRepo.save(new ArchivoMovimiento(anio));
            respuesta = ResponseEntity.ok("Archivo del año " + anio + " creado.");
        }

        return respuesta;
    }
    
    /**
     * Elimina un archivo de movimientos correspondiente a un año específico.
     * @param anio Año del archivo de movimientos que se desea eliminar
     * @return ResponseEntity con un mensaje de confirmación simulado.
     */
    @DeleteMapping("/archivos/{anio}")
    public ResponseEntity<String> eliminarArchivo(@PathVariable int anio) {
    	// Devuelve un mensaje de simulación como si el archivo hubiera sido eliminado
        return ResponseEntity.ok("Simulación: archivo de movimientos del año " + anio + " eliminado.");
    }
}