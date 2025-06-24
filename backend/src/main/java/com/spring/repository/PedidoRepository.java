package com.spring.repository;

/**
 * Repositorio JPA para la entidad Pedido.
 *
 * Esta interfaz proporciona métodos personalizados y automáticos para consultar pedidos,
 * ventas y detalles de productos relacionados, tanto a nivel general como filtrado por fecha.
 * 
 * Funcionalidades principales:
 * 
 * 	Búsquedas básicas:
 * 		Obtener pedidos enviados o no enviados.
 * 		Filtrar pedidos por email o nombre del cliente.
 * 
 * 	Consultas por fecha:
 * 		Obtener pedidos realizados en un año específico.
 * 		Contar la cantidad de pedidos por año.
 * 		Verificar si hay ventas registradas en un año.
 * 
 * 	Reportes de ventas:
 * 		Agrupadas por día, mes o año (total de ventas).
 * 		Agrupadas por mes dentro de un año específico.
 * 
 * 	Detalle de productos vendidos:
 * 		Por día actual.
 * 		Por mes y año específicos.
 * 		Por año completo, ordenados por cantidad vendida.
 *
 * Utiliza consultas JPQL y funciones nativas (como DATE_FORMAT, YEAR, MONTH) para realizar agrupamientos
 * y filtrados por fecha de forma flexible.
 *
 * Los resultados se devuelven en forma de DTOs como VentaPorFecha y ProductoVentaDetalle
 * para ser usados fácilmente en reportes.
 */

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.spring.dto.ProductoVentaDetalle;
import com.spring.dto.VentaPorFecha;
import com.spring.model.Pedido;

// Repositorio de Spring Data JPA para la entidad Pedido.
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
	
	// Busca todos los pedidos que ya han sido enviados (donde el campo 'enviado' es true).
	List<Pedido> findByEnviadoTrue();
	// Busca todos los pedidos que aún no han sido enviados (donde el campo 'enviado' es false).
	List<Pedido> findByEnviadoFalse();
	// Busca todos los pedidos asociados a un email específico.
	List<Pedido> findByEmail(String email);
	// Busca todos los pedidos según el nombre del cliente
	List<Pedido> findByNombreCliente(String username);
	
	/**
	 * Obtiene todos los pedidos realizados en un año específico.
	 * @param anio el año por el cual se desea filtrar los pedidos (se extrae de la fecha del pedido).
	 * @return lista de objetos Pedido que fueron realizados en el año indicado.
	 * 
	 * SELECT p FROM Pedido p: selecciona todos los pedidos (p) de la entidad Pedido.
	 * WHERE YEAR(p.fechaPedido) = :anio: filtra los pedidos cuyo año en la fechaPedido coincide con el parámetro recibido (:anio).
	 */
	@Query("SELECT p FROM Pedido p WHERE YEAR(p.fechaPedido) = :anio")
	// Método que ejecuta la consulta definida arriba y devuelve los pedidos del año especificado.
	List<Pedido> findByFechaPedidoYear(@Param("anio") int anio);
	
	/**
	 * Cuenta la cantidad total de pedidos realizados en un año específico.
	 * @param anio el año por el cual se desea contar los pedidos (extraído de la fecha del pedido).
	 * @return un valor long que representa la cantidad de pedidos realizados en ese año
	 * 
	 * SELECT COUNT(p) FROM Pedido p: cuenta la cantidad total de registros (pedidos) en la entidad Pedido.
	 * WHERE YEAR(p.fechaPedido) = :anio: filtra los pedidos cuyo año en el campo fechaPedido coincide con el valor del parámetro :anio.
	 */
	@Query("SELECT COUNT(p) FROM Pedido p WHERE YEAR(p.fechaPedido) = :anio")
	// Ejecuta la consulta y devuelve la cantidad total de pedidos realizados en el año especificado.
	long countByAnio(@Param("anio") int anio);
	
	/**
	 * Recupera un resumen de ventas agrupado por fecha. 
	 * Cada objeto de resultado contiene la fecha del pedido y la suma total de ventas realizadas en esa fecha.
	 * @return una lista de objetos VentaPorFecha, cada uno con fechaPedido: la fecha de los pedidos, total: la suma de los importes de todos los pedidos en esa fecha.
	 * 
	 * SELECT new com.spring.dto.VentaPorFecha(p.fechaPedido, SUM(p.total)): crea una nueva instancia del DTO VentaPorFecha con la fecha y el total de ventas por fecha.
	 * FROM Pedido p: se trabaja sobre la entidad Pedido.
	 * GROUP BY p.fechaPedido: agrupa los pedidos por fecha para poder sumar los totales por cada día.
	 * ORDER BY p.fechaPedido ASC: ordena los resultados de forma ascendente según la fecha
	 */
	@Query("SELECT new com.spring.dto.VentaPorFecha(p.fechaPedido, SUM(p.total)) " +
	"FROM Pedido p GROUP BY p.fechaPedido ORDER BY p.fechaPedido ASC")
	// Devuelve una lista de objetos VentaPorFecha que representan la suma de ventas por cada día.
	List<VentaPorFecha> obtenerVentasPorFecha();
	
	/**
	 * Recupera un resumen de ventas agrupado por mes (formato 'YYYY-MM').
	 * Cada objeto del resultado contiene el mes (como string) y el total de ventas realizadas en ese mes.	
	 * @return una lista de objetos VentaPorFecha. El primer parámetro representa el mes en formato "YYYY-MM", el segundo parámetro es la suma de los totales de pedidos en ese mes.
	 * 
	 * SELECT new com.spring.dto.VentaPorFecha: Crea instancias del DTO VentaPorFecha con los datos seleccionados.
	 * FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m'): Usa la función nativa de MySQL DATE_FORMAT para extraer el año y mes de la fecha del pedido,  devolviéndolo como una cadena en el formato "2024-06", por ejemplo.
	 * SUM(p.total): Suma el valor total de los pedidos para cada mes.
	 * GROUP BY FUNCTION('DATE_FORMAT',: Agrupa los resultados por mes para sumar correctamente.
	 * ORDER BY FUNCTION('DATE_FORMAT',: Ordena los resultados cronológicamente por mes en orden ascendente.
	 */
	@Query("SELECT new com.spring.dto.VentaPorFecha(FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m'), SUM(p.total)) " +
		       "FROM Pedido p GROUP BY FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m') ORDER BY FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m')")
	// Devuelve una lista de objetos VentaPorFecha con las ventas agrupadas por mes (formato YYYY-MM).
	List<VentaPorFecha> obtenerVentasPorMes();

	/**
	 * Recupera un resumen de ventas agrupado por año.
	 * Cada objeto del resultado contiene el año y la suma total de ventas realizadas en ese año.
	 * @return una lista de objetos VentaPorFecha. El primer parámetro representa el año (como entero), el segundo parámetro es la suma de los importes totales de pedidos realizados en ese año.
	 * 
	 * SELECT new com.spring.dto.VentaPorFecha(...): Crea instancias del DTO VentaPorFecha con los datos agrupados por año.
	 * FUNCTION('YEAR', p.fechaPedido): Usa la función de base de datos para extraer el año de la fecha del pedido.
	 * SUM(p.total): Suma el total de ventas por cada año.
	 * GROUP BY FUNCTION('YEAR', p.fechaPedido): Agrupa los pedidos por año para calcular la suma anual.
	 * ORDER BY FUNCTION('YEAR', p.fechaPedido): Ordena los resultados cronológicamente por año (de menor a mayor).
	 */
	@Query("SELECT new com.spring.dto.VentaPorFecha(FUNCTION('YEAR', p.fechaPedido), SUM(p.total)) " +
	"FROM Pedido p GROUP BY FUNCTION('YEAR', p.fechaPedido) ORDER BY FUNCTION('YEAR', p.fechaPedido)")
	// Devuelve una lista de objetos VentaPorFecha con las ventas agrupadas por año.
	List<VentaPorFecha> obtenerVentasPorAnio();
	
	/**
	 * Recupera un resumen de los productos vendidos en el día actual.
	 * Por cada producto, se indica cuántas unidades se han vendido.
	 * @return una lista de objetos ProductoVentaDetalle. El primer parámetro es el nombre del producto, el segundo parámetro es la cantidad total vendida de ese producto hoy.
	 * 
	 * SELECT new com.spring.dto.ProductoVentaDetalle(lp.nombreProducto, SUM(lp.cantidad)): Crea instancias del DTO ProductoVentaDetalle con el nombre del producto y la cantidad total vendida.
	 * FROM Pedido p JOIN p.detalles lp:Se hace un JOIN entre la entidad Pedido y su lista de detalles (lp) para acceder a cada producto vendido.
	 * WHERE FUNCTION('DATE', p.fechaPedido) = CURRENT_DATE: Filtra los pedidos cuya fecha (sin hora) sea igual a la fecha actual del sistema. Se usa FUNCTION('DATE', ...) para ignorar la hora y comparar solo por día.
	 * GROUP BY lp.nombreProducto: Agrupa los resultados por nombre de producto para sumar la cantidad vendida por cada uno.
	 */
	@Query("SELECT new com.spring.dto.ProductoVentaDetalle(lp.nombreProducto, SUM(lp.cantidad)) " +
		       "FROM Pedido p JOIN p.detalles lp " +
		       "WHERE FUNCTION('DATE', p.fechaPedido) = CURRENT_DATE " +
		       "GROUP BY lp.nombreProducto")
	// Devuelve una lista de productos con sus cantidades vendidas en el día actual.
	List<ProductoVentaDetalle> obtenerDetalleProductosDelDia();
	
	/**
	 * Recupera un resumen de los productos vendidos en un mes y año específicos.
	 * Por cada producto, se indica cuántas unidades fueron vendidas en ese período.
	 * @param anio el año del cual se quieren obtener las ventas.
	 * @param mes el mes dentro del año indicado
	 * @return una lista de objetos ProductoVentaDetalle. El primer parámetro es el nombre del producto, el segundo parámetro es la cantidad total vendida de ese producto en el mes especificado.
	 * 
	 * SELECT new com.spring.dto.ProductoVentaDetalle(lp.nombreProducto, SUM(lp.cantidad)): Crea instancias del DTO ProductoVentaDetalle con nombre del producto y cantidad total.
	 * FROM Pedido p JOIN p.detalles lp: Se une la entidad Pedido con su lista de detalles (lp) para acceder a cada producto vendido.
	 * WHERE FUNCTION('YEAR', p.fechaPedido) = :anio AND FUNCTION('MONTH', p.fechaPedido) = :mes: Filtra los pedidos según el año y el mes proporcionados como parámetros.
	 * GROUP BY lp.nombreProducto: Agrupa los resultados por nombre del producto para poder sumar la cantidad vendida por producto.
	 */
	@Query("SELECT new com.spring.dto.ProductoVentaDetalle(lp.nombreProducto, SUM(lp.cantidad)) " +
		       "FROM Pedido p JOIN p.detalles lp " +
		       "WHERE FUNCTION('YEAR', p.fechaPedido) = :anio AND FUNCTION('MONTH', p.fechaPedido) = :mes " +
		       "GROUP BY lp.nombreProducto")
	// Devuelve una lista de productos y la cantidad total vendida por cada uno en el mes y año indicados.
	List<ProductoVentaDetalle> obtenerDetalleProductosDelMes(@Param("anio") int anio, @Param("mes") int mes);
	
	/**
	 * Recupera un resumen de los productos vendidos en un año específico, ordenados por cantidad vendida de mayor a menor.
	 * @param anio el año del cual se desea obtener el resumen de productos vendidos
	 * @return una lista de objetos ProductoVentaDetalle. El primer parámetro es el nombre del producto, el segundo parámetro es la cantidad total vendida de ese producto en el año especificado.
	 * 
	 * SELECT new com.spring.dto.ProductoVentaDetalle(...): Crea instancias del DTO ProductoVentaDetalle con los campos nombre del producto y suma de cantidades vendidas.
	 * FROM Pedido p JOIN p.detalles l: Se hace un join entre la entidad Pedido y su lista de detalles (l) para acceder a cada producto vendido.
	 * WHERE YEAR(p.fechaPedido) = :anio: Filtra los pedidos para incluir solo los que pertenecen al año indicado.
	 * GROUP BY l.nombreProducto: Agrupa los resultados por nombre de producto, permitiendo hacer la suma de unidades vendidas por producto.
	 * ORDER BY SUM(l.cantidad) DESC: Ordena los productos de forma descendente según la cantidad total vendida (más vendidos primero). 
	 */
	@Query("""
		    SELECT new com.spring.dto.ProductoVentaDetalle(
		        l.nombreProducto, SUM(l.cantidad)
		    )
		    FROM Pedido p
		    JOIN p.detalles l
		    WHERE YEAR(p.fechaPedido) = :anio
		    GROUP BY l.nombreProducto
		    ORDER BY SUM(l.cantidad) DESC
		""")
	// Devuelve un listado de productos vendidos en el año especificado, ordenado de mayor a menor según cantidad.
	List<ProductoVentaDetalle> obtenerDetalleProductosDelAnio(@Param("anio") int anio);
	
	/**
	 * Obtiene un resumen de ventas agrupadas por mes dentro de un año específico.
	 * @param anio el año del cual se quiere obtener el total de ventas mensuales (por ejemplo, 2025).
	 * @return una lista de objetos VentaPorFecha. El primer parámetro es un String que representa el mes en formato "YYYY-MM", el segundo parámetro es la suma total de ventas (p.total) realizadas durante ese mes.
	 * 
	 * SELECT new com.spring.dto.VentaPorFecha(...): Crea una instancia del DTO VentaPorFecha con los campos (mes, totalVentas).
	 * FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m'):  Usa la función de la base de datos para convertir la fecha a formato "YYYY-MM" (año y mes).
	 * WHERE FUNCTION('YEAR', p.fechaPedido) = :anio: Filtra los pedidos para que solo se incluyan los del año especificado.
	 * GROUP BY FUNCTION('DATE_FORMAT', ...): Agrupa los pedidos por mes para sumar las ventas por cada uno.
	 * ORDER BY FUNCTION('DATE_FORMAT', ...): Ordena los resultados cronológicamente por mes
	 */
	@Query("""
		    SELECT new com.spring.dto.VentaPorFecha(
		        FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m'),
		        SUM(p.total)
		    )
		    FROM Pedido p
		    WHERE FUNCTION('YEAR', p.fechaPedido) = :anio
		    GROUP BY FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m')
		    ORDER BY FUNCTION('DATE_FORMAT', p.fechaPedido, '%Y-%m')
		""")
	// Devuelve una lista de objetos VentaPorFecha con las ventas mensuales del año especificado.
	List<VentaPorFecha> obtenerVentasPorMesDelAnio(@Param("anio") int anio);
	
	/**
	 * Verifica si existen ventas registradas en un año específico.
	 * @param anio el año que se desea consultar
	 * @return true si existe al menos un pedido realizado en ese año; false en caso contrario.
	 * 
	 * SELECT COUNT(p) > 0 FROM Pedido p: cuenta cuántos pedidos hay en total para el año indicado y devuelve true si el total es mayor a 0.
	 * WHERE YEAR(p.fechaPedido) = :anio: filtra los pedidos para que solo se cuenten los que tienen fecha en el año especificado. 
	 */
	@Query("SELECT COUNT(p) > 0 FROM Pedido p WHERE YEAR(p.fechaPedido) = :anio")
	// Devuelve true si existe al menos un pedido en el año especificado; de lo contrario, false.
	boolean existeVentasEnAnio(@Param("anio") int anio);
} 



