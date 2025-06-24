package com.spring.repository;

/**
 * Repositorio JPA para la entidad Producto.
 *
 * Esta interfaz proporciona métodos para acceder a los datos de productos en la base de datos,
 * incluyendo funcionalidades comunes como:
 *
 * 	Obtener productos visibles (activos) en el sistema.
 * 	Detectar productos con stock bajo o agotado (menor o igual a una cantidad específica).
 *
 * Utilizado principalmente para la gestión del catálogo de productos y control de inventario.
 */

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.spring.model.Producto;

//Indica que esta interfaz es un componente de repositorio administrado por Spring.
//Permite que Spring la detecte automáticamente para la inyección de dependencias.
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
	// Busca todos los productos cuyo campo "visible" sea true.
    List<Producto> findByVisibleTrue();
    // Busca todos los productos cuyo stock sea menor o igual a la cantidad indicada como parámetro.
    List<Producto> findByStockLessThanEqual(Integer cantidad); 
}