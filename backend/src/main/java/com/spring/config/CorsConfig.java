package com.spring.config;

/**
 * Configuración global de CORS (Cross-Origin Resource Sharing) para la API REST.
 *
 * Esta clase define una política CORS que permite a aplicaciones frontend, como Angular,
 * realizar peticiones HTTP al backend de Spring Boot cuando se ejecutan en dominios distintos.
 *
 * Características configuradas:
 * 	Habilita CORS solo para las rutas que comienzan con "/api/**".
 * 	Permite solicitudes desde el origen "http://localhost:4200".
 * 	Permite métodos HTTP: GET, POST, PUT, DELETE y OPTIONS.
 * 	Acepta cualquier encabezado en la solicitud.
 */

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//Indica que esta clase es una clase de configuración.
//Spring detectará automáticamente esta clase y aplicará sus configuraciones.
@Configuration
public class CorsConfig {
	// Declara un bean de tipo WebMvcConfigurer que personaliza el comportamiento de Spring MVC.
	@Bean
    public WebMvcConfigurer corsConfigurer() {
		// Retorna una implementación anónima de WebMvcConfigurer.
        return new WebMvcConfigurer() {
        	// Sobrescribe el método addCorsMappings, donde se configuran las reglas de CORS.
            @Override
            public void addCorsMappings(CorsRegistry registry) {
            	// Define que las rutas que empiezan con /api/** aceptarán solicitudes desde ciertos orígenes.
                registry.addMapping("/api/**")
                		// Permite solicitudes solo desde http://localhost:4200
                        .allowedOrigins("http://localhost:4200") // Angular frontend
                        // Especifica qué métodos HTTP están permitidos
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        // Permite cualquier encabezado en las solicitudes
                        .allowedHeaders("*");
            }
        };
    }
}

/* Cors: medida de seguridad del navegador, evita que una web pueda hacer peticiones a otro servidor diferente, a menos que lo permita.
 * 
 * WebMvcConfigurer: es una interfaz que te permite personalizar el comportamiento web de tu aplicación Spring, como CORS, rutas, y formatos.
 * 
 * .allowedOrigins: Para permitir o restringir qué aplicaciones pueden comunicarse con tu backend.
 * 
 * Bean: le dice a Spring que cree y administre un objeto para que esté disponible en toda la aplicación.
 * 
 * @Override: indica que estás reescribiendo un método que ya existe en una clase o interfaz padre.
 * */
