// Define el paquete en el que se encuentra esta clase.
package com.spring;

/**
 * Clase principal del proyecto Olisev Backend.
 *
 * Esta clase arranca la aplicación Spring Boot y sirve como punto de entrada del sistema.
 * 
 * Características destacadas:
 * 	Anotada con @SpringBootApplication: activa la configuración automática, el escaneo de componentes y más.
 * 	Anotada con @EnableAsync: permite ejecutar métodos marcados con @Async en segundo plano (asincronía).
 * 	Contiene el método main que inicia la aplicación con SpringApplication.run().
 *
 * Uso:
 * Ejecutar esta clase como una aplicación Java para iniciar el servidor backend.
 */

//Importa la clase SpringApplication, que se usa para lanzar la aplicación 
import org.springframework.boot.SpringApplication;
//Importa la anotación SpringBootApplication, que marca esta clase como el punto de entrada de una aplicación Spring Boot.
import org.springframework.boot.autoconfigure.SpringBootApplication;
//Importa la anotación EnableAsync, que habilita la ejecución de métodos de forma asíncrona en la aplicación.
import org.springframework.scheduling.annotation.EnableAsync;
//Habilita el soporte para tareas asíncronas (@Async) dentro del proyecto.
//Se utiliza cuando quiero que algunos métodos se ejecuten en segundo plano, sin bloquear el flujo principal del programa.
@EnableAsync
//Marca esta clase como una aplicación Spring Boot.
@SpringBootApplication
//Marca esta clase como una aplicación Spring Boot.
public class OlisevBackendApplication {
	// Método principal que se ejecuta al iniciar la aplicación.
	public static void main(String[] args) {
		// Lanza la aplicación Spring Boot.
		SpringApplication.run(OlisevBackendApplication.class, args);
	}

}
