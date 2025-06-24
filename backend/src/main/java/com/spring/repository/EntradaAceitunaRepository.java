package com.spring.repository;

/**
 * Repositorio de acceso a datos para la entidad EntradaAceituna.
 *
 * Esta interfaz permite realizar operaciones CRUD y consultas personalizadas
 * sobre los registros de entrada de aceitunas.
 *
 * Métodos personalizados:
 *   findByClienteId: busca entradas por el ID del cliente.
 *   findByCampana: filtra por campaña (año o nombre).
 *   findDistinctCampanias: devuelve una lista de campañas únicas existentes en la base de datos.
 */

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
//Importa la clase EntradaAceituna, que representa la entidad que será gestionada por este repositorio.
import com.spring.model.EntradaAceituna;

//Define la interfaz del repositorio para EntradaAceituna.
//Extiende JpaRepository, lo que proporciona métodos CRUD sin necesidad de implementarlos manualmente.
public interface EntradaAceitunaRepository extends JpaRepository<EntradaAceituna, Long> {
	// Busca todas las entradas de aceituna que pertenecen a un cliente específico (por su ID).
    List<EntradaAceituna> findByClienteId(Long id);
    // Devuelve todas las entradas asociadas a una campaña específica.
    List<EntradaAceituna> findByCampana(String campaña);
    
    /**
     * Este método obtiene todas las campañas únicas que existen en los registros de entrada de aceituna.
     * @return Una lista de nombres de campañas sin duplicados.
     */
    // "SELECT DISTINCT" asegura que no se repitan campañas.
    // "e.campana" accede al campo "campana" de cada objeto EntradaAceituna.
    // La consulta busca dentro de la entidad EntradaAceituna, no directamente en la tabla SQL.
    @Query("SELECT DISTINCT e.campana FROM EntradaAceituna e")
    // Método que ejecuta la consulta anterior y devuelve una lista de campañas únicas (tipo String).
    List<String> findDistinctCampanias();
}
