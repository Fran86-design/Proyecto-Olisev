package com.spring.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spring.model.Factura;

//Declara una interfaz llamada FacturaRepository.
//En Spring Data JPA, las interfaces como esta se usan para acceder a la base de datos.
public interface FacturaRepository extends JpaRepository<Factura, Long> {
	
	// Al extender JpaRepository, esta interfaz hereda métodos para:
    // 	Guardar facturas: save
    // 	Buscar por ID: findById
    // 	Listar todas: findAll()
    //  Eliminar por ID: deleteById
    // 	Y muchas otras operaciones comunes sin tener que escribirlas manualmente.

    // El primer parámetro <Factura> indica la entidad que va a manejar.
    // El segundo parámetro <Long> indica el tipo de la clave primaria de la entidad Factura es de tipo Long.
}
