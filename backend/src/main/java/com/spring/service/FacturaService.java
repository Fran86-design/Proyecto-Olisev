package com.spring.service;

/**
 * Servicio encargado de gestionar las operaciones relacionadas con la entidad Factura.
 *
 * Funcionalidades principales:
 *
 * 	Obtener todas las facturas registradas en el sistema.
 * 	Guardar una nueva factura o actualizar una existente.
 * 	Buscar una factura por su ID.
 * 	Eliminar una factura por su ID.
 *
 * Este servicio actúa como capa intermedia entre el controlador y el repositorio.
 *
 * Utiliza el repositorio FacturaRepository para realizar operaciones CRUD sobre la base de datos.
 */

import java.util.List;

import org.springframework.stereotype.Service;

import com.spring.model.Factura;
import com.spring.repository.FacturaRepository;

//Marca esta clase como un componente de servicio de Spring, lo que permite inyectarla donde sea necesario.
@Service
public class FacturaService {

	// Dependencia al repositorio de Factura para realizar operaciones con la base de datos.
    private final FacturaRepository facturaRepository;
    
    /**
     * Constructor que recibe el repositorio de facturas e inyecta la dependencia.
     * @param facturaRepository el repositorio que se usará para acceder a los datos de facturas.
     */
    public FacturaService(FacturaRepository facturaRepository) {
        this.facturaRepository = facturaRepository;
    }

    /**
     * Obtiene todas las facturas registradas en la base de datos.
     * @return una lista con todas las facturas existentes.
     */
    public List<Factura> listarTodas() {
    	// Usa el método de JPA para traer todas las facturas.
        return facturaRepository.findAll();
    }

    /**
     * Guarda una factura nueva o actualiza una existente.
     * @param factura la entidad Factura a guardar o actualizar.
     * @return la factura guardada (con ID asignado si era nueva).
     */
    public Factura guardar(Factura factura) {
    	// Inserta o actualiza la factura.
        return facturaRepository.save(factura);
    }

    /**
     * Busca una factura por su ID.
     * @param id el identificador de la factura.
     * @return la factura encontrada o null si no existe.
     */
    public Factura obtenerPorId(Long id) {
    	// Devuelve la factura o null si no se encuentra.
        return facturaRepository.findById(id).orElse(null);
    }

    /**
     * Elimina una factura por su ID.
     * @param id el identificador de la factura a eliminar
     */
    public void eliminar(Long id) {
    	// Elimina la factura con el id dado.
        facturaRepository.deleteById(id);
    }
}

