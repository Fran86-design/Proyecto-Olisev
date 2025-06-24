package com.spring.repository;

/**
 * Repositorio de acceso a datos para la entidad ArchivoMovimiento.
 *
 * Extiende JpaRepository, lo que permite realizar operaciones CRUD (crear, leer, actualizar, eliminar)
 * sin necesidad de implementar métodos manualmente.
 *
 * El tipo de entidad gestionada es ArchivoMovimiento y su clave primaria es de tipo Integer.
 *
 * Este repositorio será utilizado por los controladores para interactuar con la base de datos.
 */

//Importa la clase ArchivoMovimiento, que es la entidad que va a gestionar con esta interfaz.
import com.spring.model.ArchivoMovimiento;
//Importa JpaRepository, una interfaz de Spring Data JPA que proporciona métodos CRUD ya implementados.
import org.springframework.data.jpa.repository.JpaRepository;

//Esta interfaz actúa como repositorio para la entidad ArchivoMovimiento.
//JpaRepository<ArchivoMovimiento, Integer> significa que trabajamos con objetos de tipo ArchivoMovimiento,
//cuya clave primaria (ID) es de tipo Integer.
public interface ArchivoMovimientoRepository extends JpaRepository<ArchivoMovimiento, Integer> {}
