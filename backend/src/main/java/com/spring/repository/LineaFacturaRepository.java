package com.spring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.spring.model.LineaFactura;

//Esta interfaz define un repositorio para manejar operaciones con la entidad LineaFactura.
public interface LineaFacturaRepository extends JpaRepository<LineaFactura, Long> {
	
	// <LineaFactura, Long> indica:
    // 	 La entidad gestionada es LineaFactura.
    //   Su clave primaria (ID) es de tipo Long.
}