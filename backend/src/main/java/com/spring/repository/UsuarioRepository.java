package com.spring.repository;

/**
 * Repositorio JPA para la entidad Usuario.
 *
 * Esta interfaz proporciona acceso a operaciones CRUD y consultas personalizadas
 * relacionadas con los usuarios del sistema.
 * 
 * Funcionalidades principales:
 * 
 * 	Búsqueda de usuarios por nombre de usuario (username).
 * 	Búsqueda de usuarios por dirección de correo electrónico (email).
 *
 * Ambos métodos devuelven un Optional<Usuario>, lo cual permite manejar de forma segura
 * la posibilidad de que el usuario no exista.
 *
 * Al extender JpaRepository, hereda métodos estándar como save, findById, findAll, deleteById, etc.,
 * lo que facilita la gestión de usuarios en la base de datos.
 */

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spring.model.Usuario;

//Define una interfaz que actúa como repositorio para la entidad Usuario.
public interface UsuarioRepository extends JpaRepository<Usuario, Long>{
	
	// Busca un usuario por su nombre de usuario (username).
	// Devuelve un Optional<Usuario> que puede contener el usuario si existe, o estar vacío si no se encuentra.
	Optional<Usuario> findByUsername(String username);
	// Busca un usuario por su dirección de email.
    // También devuelve un Optional<Usuario> por la misma razón: el usuario puede no existir.
	Optional<Usuario> findByEmail(String email);

}

