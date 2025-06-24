package com.spring.repository;

/**
 * Repositorio de la entidad MovimientoStock que extiende JpaRepository para proporcionar operaciones
 * CRUD y consultas personalizadas sobre los registros de movimientos de stock.
 * 
 * Funcionalidades principales:
 * 	Obtener todos los movimientos ordenados por fecha descendente.
 * 	Filtrar movimientos por un rango de fechas.
 * 	Obtener los años únicos en los que hubo movimientos, ordenados de forma descendente.
 * 	Obtener movimientos correspondientes a un año específico, también ordenados de forma descendente.
 * 
 * Utiliza anotaciones de Spring Data JPA como @Query para definir consultas personalizadas
 */

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.spring.model.MovimientoStock;

//Indica que esta interfaz es un componente de repositorio de Spring.
//Se usa para permitir la inyección automática del repositorio donde se necesite.
@Repository
public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Long> {
	// Obtiene todos los movimientos de stock ordenados por fecha descendente (los más recientes primero).
    List<MovimientoStock> findAllByOrderByFechaDesc();
    // Obtiene todos los movimientos de stock cuya fecha esté entre desde y hasta.
    List<MovimientoStock> findByFechaBetween(Date desde, Date hasta);
    
    /**
     * Este método obtiene una lista de años únicos sin repetir a partir de la fecha de los movimientos de stock,
     * ordenados de forma descendente
     * @return una lista de enteros que representan los años en los que hubo movimientos de stock.
     * 
     * DISTINCT YEAR(m.fecha): evita que se repitan los años.  extrae solo el año de la propiedad fecha de la entidad MovimientoStock.
     * FROM MovimientoStock m: Define la entidad MovimientoStock desde donde se van a extraer los datos. m es un alias para referirse a esa entidad dentro de la consulta.
     * ORDER BY YEAR(m.fecha) DESC: Ordena los años obtenidos de forma descendente (DESC), es decir, del más reciente al más antiguo.
     */
    @Query("SELECT DISTINCT YEAR(m.fecha) FROM MovimientoStock m ORDER BY YEAR(m.fecha) DESC")
    // Devuelve una lista de años (tipo Integer) únicos en los que se registraron movimientos de stock.
    List<Integer> findDistinctYears();

    /**
     * Este método recupera todos los registros de movimientos de stock que ocurrieron en un año específico.
     * Los resultados se ordenan de forma descendente por fecha, es decir, del más reciente al más antiguo
     * @param anio el año por el cual se quiere filtrar los movimientos de stock.
     * @return una lista de objetos MovimientoStock que corresponden al año especificado.
     * 
     * SELECT m FROM MovimientoStock m: Selecciona todos los registros m de la entidad MovimientoStock.
     * WHERE YEAR(m.fecha) = :anio: Filtra los movimientos cuyo año en la fecha (m.fecha) sea igual al valor del parámetro :anio.
     */
    @Query("SELECT m FROM MovimientoStock m WHERE YEAR(m.fecha) = :anio ORDER BY m.fecha DESC")
    // Devuelve una lista de objetos MovimientoStock correspondientes al año que se le pase como parámetro.
    List<MovimientoStock> findByAnio(@Param("anio") int anio);

}
