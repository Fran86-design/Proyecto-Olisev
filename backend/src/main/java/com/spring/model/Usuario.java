package com.spring.model;

/**
 * Clase que representa a un usuario del sistema.
 * 
 * Esta entidad almacena información básica del usuario como su nombre, credenciales de acceso,
 * información de contacto y datos adicionales como NIF o finca.
 * 
 * El campo rol define el tipo de usuario (por ejemplo, "TIENDA", "ADMIN", etc.).
 * Además, al incluir la anotación @JsonInclude(JsonInclude.Include.NON_NULL), se omiten los campos
 * nulos al convertir el objeto a JSON, lo que hace más limpia y eficiente la respuesta enviada al cliente.
 * 
 * Esta clase se mapea a una tabla en la base de datos mediante JPA, con id como clave primaria auto-generada.
 */

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

//Esta anotación indica que, al convertir este objeto a JSON, se ignorarán los campos que sean null.
//Es útil para reducir el tamaño de la respuesta y evitar enviar datos innecesarios.
@JsonInclude(JsonInclude.Include.NON_NULL)
@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Nombre de usuario utilizado para iniciar sesión.
    private String username;  
    // Contraseña del usuario
    private String password;  
    // Nombre real del usuario.
    private String nombre;
    private String email;
    private String direccion;
    private String telefono;
    
    private String apellidos;
    private String nif;
    // Nombre o referencia de la finca si el usuario es proveedor.
    private String finca;
    // Rol del usuario dentro del sistema
    private String rol = "TIENDA"; 
    
    // Getters y setters

    public String getApellidos() {
		return apellidos;
	}
    
	public void setApellidos(String apellidos) {
		this.apellidos = apellidos;
	}
	
	public String getNif() {
		return nif;
	}
	
	public void setNif(String nif) {
		this.nif = nif;
	}
	
	public String getFinca() {
		return finca;
	}
	
	public void setFinca(String finca) {
		this.finca = finca;
	}
	
    public Long getId() { 
    	return id; 
    }
    
    public void setId(Long id) { 
    	this.id = id; 
    }

    public String getUsername() { 
    	return username; 
    }
    public void setUsername(String username) { 
    	this.username = username; 
    }

    public String getPassword() { 
    	return password; 
    }
    public void setPassword(String password) {
    	this.password = password; 
    }

    public String getNombre() { 
    	return nombre; 
    }
    public void setNombre(String nombre) { 
    	this.nombre = nombre; 
    }

    public String getEmail() { 
    	return email; 
    }
    
    public void setEmail(String email) {
    	this.email = email; 
    }

    public String getDireccion() { 
    	return direccion; 
    }
    
    public void setDireccion(String direccion) { 
    	this.direccion = direccion; 
    }

    public String getTelefono() { 
    	return telefono; 
    }
    
    public void setTelefono(String telefono) { 
    	this.telefono = telefono; 
    }

    public String getRol() {
    	return rol; 
    }
    
    public void setRol(String rol) { 
    	this.rol = rol; 
    }
}