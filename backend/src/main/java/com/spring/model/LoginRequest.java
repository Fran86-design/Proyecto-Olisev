package com.spring.model;

/**
 * Clase que representa una solicitud de inicio de sesión (login).
 * 
 * Se utiliza para recibir las credenciales del usuario (nombre de usuario y contraseña)
 * desde el frontend, con el fin de autenticarse en el sistema.
 * 
 * Esta clase se emplea como DTO (Data Transfer Object) en peticiones HTTP POST.
 */

public class LoginRequest {
	
	 // Campo que almacena el nombre de usuario enviado durante el inicio de sesión
	 private String username;
	 // Campo que almacena la contraseña enviada durante el inicio de sesión
	 private String password;

	 // Getters y setters 
	    
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
}

	
