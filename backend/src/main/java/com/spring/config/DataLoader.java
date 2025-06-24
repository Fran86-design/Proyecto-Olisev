package com.spring.config;

/**
 * Componente de inicialización de datos para la aplicación.
 *
 * Esta clase implementa la interfaz CommandLineRunner, lo que permite ejecutar su método run
 * automáticamente al iniciar la aplicación Spring Boot.
 *
 * Funcionalidad principal:
 * 	Verifica si ya existe un usuario con username "admin".
 * 	Si no existe, crea un usuario administrador por defecto con:
 *     	Usuario: admin
 *     	Contraseña: 1234 (encriptada con BCrypt)
 *     	Rol: ADMIN
 *     	Email: admin@olisev.com
 *     	Nombre: Administrador
 *
 * Utilidad:
 * 	Asegura que el sistema siempre tenga al menos un usuario con permisos de administrador.
 */

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.spring.model.Usuario;
import com.spring.repository.UsuarioRepository;
import org.mindrot.jbcrypt.BCrypt;

//Marca la clase como un componente de Spring.
//Spring la detecta automáticamente y la registra como un bean.
@Component
public class DataLoader implements CommandLineRunner {
	// Repositorio para acceder a la base de datos de usuarios
    private final UsuarioRepository usuarioRepository;
    /**
     * Constructor que inyecta el repositorio de usuarios.
     * @param usuarioRepository el repositorio que permite acceder y manipular los usuarios en la base de datos.
     */
    public DataLoader(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    
    @Override
    /**
     * Método que se ejecuta automáticamente cuando arranca la aplicación.
     * Sirve para cargar datos iniciales si no existen en la base de datos.
     * 
     * (String... args): Este método puede recibir ningún, uno o varios Strings
     */
    public void run(String... args) {
        // Verifica si ya existe un usuario con username 'admin'
        if (usuarioRepository.findByUsername("admin").isEmpty()) {
        	// Crea un nuevo usuario administrador
            Usuario admin = new Usuario();
            admin.setUsername("admin");
            // Encripta la contraseña '1234' usando BCrypt antes de guardarla
            admin.setPassword(BCrypt.hashpw("1234", BCrypt.gensalt())); 
            // Asigna el rol de administrador
            admin.setRol("ADMIN"); 
            // Nombre completo del administrador
            admin.setNombre("Administrador");
            // Correo electrónico del administrador
            admin.setEmail("admin@olisev.com");
            // Guarda el usuario en la base de datos
            usuarioRepository.save(admin);
            System.out.println("Usuario admin creado correctamente");
        } else {
            System.out.println("Usuario admin ya existe");
        }
    }
}
