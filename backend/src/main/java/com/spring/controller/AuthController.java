package com.spring.controller;

/**
 * Controlador para gestionar la autenticación y administración de usuarios en el sistema.
 *
 * Ruta base: /api
 *
 * Funcionalidades principales:
 * 
 * 	Autenticación:
 *  	POST /login: permite iniciar sesión con username o email y contraseña.
 *
 * 	Registro de usuarios:
 *  	POST /registro-tienda: registra un nuevo usuario con rol "TIENDA".
 *  	POST /registro-fabrica: registra un nuevo usuario con rol "FABRICA", generando un código único y enviando sus credenciales por email.
 *
 * 	Gestión de usuarios:
 *  	PUT /usuarios/{id}: permite actualizar datos del usuario y cambiar contraseña si se desea.
 *  	DELETE /usuarios/{id}: elimina un usuario del sistema.
 *
 * 	Recuperación y regeneración de contraseña:
 *  	POST /recuperar-password: permite a cualquier usuario recuperar su contraseña a través del email.
 *  	PUT /clientes-fabrica/{id}/regenerar-password: genera una nueva contraseña para un usuario tipo "FABRICA" y la envía por correo.
 *
 * 	Consultas:
 *  	GET /clientes-fabrica: obtiene todos los usuarios con rol "FABRICA".
 *  	GET /clientes-tienda: obtiene todos los usuarios con rol "TIENDA".
 *
 * Características adicionales:
 * 		Uso de BCrypt para encriptación de contraseñas.
 * 		Generación de contraseñas y códigos únicos con SecureRandom.
 * 		Integración con EmailService para envío automático de correos.
 * 		Soporte para solicitudes CORS desde frontend (por defecto en localhost:4200).
 */

import java.security.SecureRandom;

import java.util.Map;
import java.util.Optional;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.model.LoginRequest;
import com.spring.model.Usuario;
import com.spring.repository.UsuarioRepository;
import com.spring.service.EmailService;

import org.mindrot.jbcrypt.BCrypt;


/**
 * Get: cuando necesites obtener datos del servidor sin modificarlos.
 * Post: cuando necesites crear un nuevo recurso o realizar una acción que modifique el estado del servidor.
 * Put: cuando necesites actualizar completamente un recurso existente enviando todos sus datos.
 * Delete: cuando necesites eliminar un recurso del servidor mediante su identificador.
 */

/**
 * @PathVariable Long id: Extrae el valor del parámetro {id} de la URL y lo asigna a la variable id como tipo Long.
 * @RequestBody Map<String, Object> datos: Toma el cuerpo JSON de la solicitud y lo convierte en un mapa clave-valor, permitiendo acceder dinámicamente a los datos enviados.
 * @RequestBody: Es una anotación de Spring que indica que el cuerpo (body) de la solicitud HTTP se debe leer y convertir automáticamente en un objeto Java.
 * @PathVariable: Es una anotación de Spring que permite extraer valores directamente desde la URL y asignarlos a parámetros del método.
 */

/**
 * Controlador REST para manejar la autenticación y registro de usuarios.
 * Gestiona operaciones como login, registro de tiendas/fábricas y recuperación de contraseña.
 */
//Marca la clase como un controlador REST. Devuelve automáticamente respuestas JSON.
@RestController
// Prefijo común para todas las rutas manejadas por este controlador.
@RequestMapping("/api")
//Permite solicitudes CORS desde la URL del frontend
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
	// Repositorio para acceder a los datos de usuarios.
    private final UsuarioRepository usuarioRepository;
    // Servicio para enviar correos electrónicos.
    private final EmailService emailService;
    /**
     * Constructor de la clase AuthController.
     * @param usuarioRepository Repositorio de acceso a datos de usuarios.
     * @param emailService Servicio para envío de correos electrónicos.
     */
    public AuthController(UsuarioRepository usuarioRepository, EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
    }
    
    /**
     * Actualiza los datos de un usuario existente, incluyendo su contraseña.
     * @param id ID del usuario que se desea actualizar.
     * @param datos Mapa con los nuevos datos del usuario (nombre, email, teléfono, dirección, etc.).
     *              Puede incluir "passwordActual" y "nuevaPassword" si se desea cambiar la contraseña.
     * @return ResponseEntity con el resultado de la operación: 404 si el usuario no existe. 403 si la contraseña actual es incorrecta. 200 si se actualiza correctamente, devolviendo el usuario actualizado. 
     */
    // Define el endpoint HTTP PUT en /api/usuarios/{id}
    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Map<String, Object> datos) {
    	 // Variable para almacenar la respuesta final del método.
    	ResponseEntity<?> respuesta;
    	// Busca al usuario por ID en la base de datos.
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty()) {
        	// Si no se encuentra el usuario, responde con 404 Not Found
            respuesta = ResponseEntity.notFound().build();
        } else {
        	// Obtiene el usuario desde el Optional.
            Usuario usuario = usuarioOpt.get();
            
            // Actualiza los campos del usuario con los valores enviados en el mapa "datos".
            usuario.setNombre((String) datos.get("nombre"));
            usuario.setEmail((String) datos.get("email"));
            usuario.setTelefono((String) datos.get("telefono"));
            usuario.setDireccion((String) datos.get("direccion"));
            
            // Obtiene las contraseñas del cuerpo de la petición.
            String actual = (String) datos.get("passwordActual");
            String nueva = (String) datos.get("nuevaPassword");

            if (nueva != null && !nueva.isBlank()) {
            	 // Si se quiere cambiar la contraseña, verifica que se haya proporcionado la contraseña actual
            	// y que esta sea correcta comparándola con la almacenada (encriptada con BCrypt).
                if (actual == null || !BCrypt.checkpw(actual, usuario.getPassword())) {
                	// Si la contraseña actual es incorrecta, devuelve 403 Forbidden.
                	respuesta = ResponseEntity.status(403).body("\u274C Contrase\u00f1a actual incorrecta");
                } else {
                	 // Si es correcta, encripta la nueva contraseña y la guarda.
                    usuario.setPassword(BCrypt.hashpw(nueva, BCrypt.gensalt()));
                    // Guarda el usuario actualizado en la base de datos.
                    usuarioRepository.save(usuario);
                 // Devuelve el usuario actualizado.
                    respuesta = ResponseEntity.ok(usuario);
                }
            } else {
            	// Si no se desea cambiar la contraseña, simplemente guarda los demás cambios.
                usuarioRepository.save(usuario);
                respuesta = ResponseEntity.ok(usuario);
            }
        }
        // Devuelve la respuesta correspondiente según el flujo anterior.
        return respuesta;
    }
    
    /**
     * Registra un nuevo usuario con rol "TIENDA".
     * @param usuario Objeto Usuario recibido en el cuerpo de la solicitud. Debe contener username, email y password.
     * @return ResponseEntity con el resultado del registro
     */
    // Endpoint que expone la ruta POST /api/registro-tienda
    @PostMapping("/registro-tienda")
    public ResponseEntity<String> registrarUsuario(@RequestBody Usuario usuario) {
        ResponseEntity<String> respuesta;
    
        // Verifica si falta alguno de los campos obligatorios: username, password o email.
        boolean datosInvalidos = usuario.getUsername() == null || usuario.getPassword() == null || usuario.getEmail() == null;
        // Verifica si el username ya está registrado en la base de datos.
        boolean usuarioExiste = usuarioRepository.findByUsername(usuario.getUsername()).isPresent();
        // Verifica si el correo electrónico ya está registrado en la base de datos.
        boolean correoExiste = usuarioRepository.findByEmail(usuario.getEmail()).isPresent();

        if (datosInvalidos) {
        	// Si hay datos inválidos, responde con 400 Bad Request.
            respuesta = ResponseEntity.badRequest().body("Usuario, contraseña o correo inválido");
        } else if (usuarioExiste) {
        	// Si el nombre de usuario ya existe, responde con 409 Conflict.
            respuesta = ResponseEntity.status(409).body("Usuario ya existente");
        } else if (correoExiste) {
        	 // Si el correo electrónico ya existe, responde con 409 Conflict.
            respuesta = ResponseEntity.status(409).body("Correo ya registrado");
        } else {
        	// Si los datos están correctos y no hay conflictos:
        	// Se encripta la contraseña con BCrypt.
            usuario.setPassword(BCrypt.hashpw(usuario.getPassword(), BCrypt.gensalt()));
            // Se asigna el rol de "TIENDA" al nuevo usuario.
            usuario.setRol("TIENDA");
            // Se guarda el nuevo usuario en la base de datos.
            usuarioRepository.save(usuario);
            // Se devuelve una respuesta 200 OK con un mensaje de éxito.
            respuesta = ResponseEntity.ok("Usuario registrado correctamente");
        }

        return respuesta;
    }
    
    /**
     * Registra un nuevo usuario con rol "FABRICA". Se genera automáticamente un código único como username,
     * se encripta la contraseña y se envía por correo electrónico.
     * @param usuario Usuario recibido desde el cuerpo de la solicitud. Debe incluir al menos la contraseña y el email.
     * @return ResponseEntity con el resultado del registro
     */
    @PostMapping("/registro-fabrica")
    public ResponseEntity<Map<String, String>> registrarClienteFabrica(@RequestBody Usuario usuario) {
        ResponseEntity<Map<String, String>> respuesta;

        if (usuario.getPassword() == null) {
        	// Si no se proporciona contraseña, responde con 400 Bad Request.
            respuesta = ResponseEntity.badRequest().body(Map.of("error", "Contraseña inválida"));
        } else {
        	// Genera un código único para el usuario (usado como username), y verifica que no esté en uso.
            String codigo;
            do {
            	// Método auxiliar para generar códigos únicos.
                codigo = generarCodigoFabrica();
            } while (usuarioRepository.findByUsername(codigo).isPresent());
            // Asigna el código como username.
            usuario.setUsername(codigo);
            // Guarda la contraseña original para enviarla por correo.
            String originalPassword = usuario.getPassword();
            // Encripta la contraseña antes de guardarla.
            usuario.setPassword(BCrypt.hashpw(originalPassword, BCrypt.gensalt()));
            // Asigna el rol de "FABRICA" al nuevo usuario.
            usuario.setRol("FABRICA");
            // Guarda el usuario en la base de datos.
            usuarioRepository.save(usuario);
            // Prepara el contenido del correo.
            String asunto = "Acceso al sistema de fábrica";
            String cuerpo = "Hola " + usuario.getNombre() + ",\n\n" +
                            "Email: " + usuario.getEmail() + "\n" +
                            "Contraseña: " + originalPassword + "\n" +
                            "Código de acceso: " + usuario.getUsername() + "\n\n" +
                            "Puedes acceder desde: http://localhost:4200";
            // Envía el correo con los datos de acceso al usuario.
            emailService.enviarEmail(usuario.getEmail(), asunto, cuerpo);
            // Retorna una respuesta 200 OK con un mensaje de éxito.
            respuesta = ResponseEntity.ok(Map.of("mensaje", "Cliente fábrica registrado correctamente"));
        }

        return respuesta;
    }
    
    /**
     * Autentica a un usuario utilizando su username o email, y contraseña.
     * @param request Objeto que contiene las credenciales del usuario (username/email y password).
     * @return ResponseEntity con el resultado del registro
     */
    // Define el endpoint POST en /api/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        ResponseEntity<?> respuesta;
     // Busca el usuario por username.
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(request.getUsername());
        if (usuarioOpt.isEmpty()) {
        	// Si no se encuentra por username, intenta buscar por email.
            usuarioOpt = usuarioRepository.findByEmail(request.getUsername());
        }

        if (usuarioOpt.isEmpty()) {
        	// Si no se encuentra ningún usuario, devuelve 401 Unauthorized.
            respuesta = ResponseEntity.status(401).body("Credenciales incorrectas");
        } else {
            Usuario usuario = usuarioOpt.get();
            // Verifica si la contraseña almacenada está en formato BCrypt.
            boolean esBCrypt = usuario.getPassword().startsWith("$2a$") || usuario.getPassword().startsWith("$2b$");
            // Valida la contraseña dependiendo del formato (BCrypt o texto plano).
            boolean credencialesValidas = esBCrypt
                    ? BCrypt.checkpw(request.getPassword(), usuario.getPassword())
                    : usuario.getPassword().equals(request.getPassword());

            if (!credencialesValidas) {
            	 // Si la contraseña es incorrecta, devuelve 401 Unauthorized.
                respuesta = ResponseEntity.status(401).body("Credenciales incorrectas");
            } else {
            	// Si las credenciales son válidas, oculta la contraseña antes de responder.
                usuario.setPassword(null);
                // Devuelve el usuario autenticado.
                respuesta = ResponseEntity.ok(usuario);
            }
        }

        return respuesta;
    }
    
    /**
     * Obtiene la lista de todos los usuarios con rol "FABRICA".
     * @return ResponseEntity con una lista de usuarios cuyo rol es "FABRICA" y código HTTP 200 OK.
     */
    // Define el endpoint GET en /api/clientes-fabrica
    @GetMapping("/clientes-fabrica")
    public ResponseEntity<?> obtenerClientesFabrica() {
    	// Devuelve una respuesta HTTP 200 OK con el contenido en el cuerpo.
        return ResponseEntity.ok(
        	// Obtiene todos los usuarios de la base de datos. Convierte la lista a un stream para aplicar operaciones funcionales.
            usuarioRepository.findAll().stream() 
            				 // Filtra solo aquellos con rol "FABRICA", ignorando mayúsculas/minúsculas.
                             // u es un nombre temporal para cada Usuario mientras se procesa el stream.
            				 .filter(u -> "FABRICA".equalsIgnoreCase(u.getRol()))
                             // Convierte el resultado filtrado de nuevo a lista.
                             .toList()
        );
    }
    
    /**
     * Regenera una nueva contraseña para un cliente de tipo "FABRICA", la guarda encriptada,
     * y envía la nueva contraseña por correo electrónico
     * @param id ID del usuario (cliente fábrica) al que se le desea regenerar la contraseña.
     * @return ResponseEntity con el resultado del registro
     */
    @PutMapping("/clientes-fabrica/{id}/regenerar-password")
    public ResponseEntity<?> regenerarPassword(@PathVariable Long id) {
    	// Busca al usuario en la base de datos por su ID.
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        // Si el usuario no existe, responde con 404 Not Found.
        if (usuarioOpt.isEmpty()) return ResponseEntity.notFound().build();
        // Obtiene el usuario desde el Optional.
        Usuario usuario = usuarioOpt.get();
        // Genera una nueva contraseña aleatoria y segura de 10 caracteres.
        String nuevaPassword = generarPasswordFuerte(10);
        // Encripta la nueva contraseña con BCrypt y la asigna al usuario.
        usuario.setPassword(BCrypt.hashpw(nuevaPassword, BCrypt.gensalt()));
        // Guarda el usuario actualizado en la base de datos.
        usuarioRepository.save(usuario);
        // Prepara el asunto y cuerpo del correo con la nueva contraseña.
        String asunto = "Tu nueva contrase\u00f1a para acceder al sistema";
        String cuerpo = "Hola " + usuario.getNombre() + ",\n\nTu nueva contrase\u00f1a es:\n\n" +
                        nuevaPassword + "\n\nPor favor, c\u00e1mbiala al iniciar sesi\u00f3n.";
        // Envía el correo al usuario con la nueva contraseña.
        emailService.enviarEmail(usuario.getEmail(), asunto, cuerpo);
        // Devuelve una respuesta 200 OK con mensaje de confirmación.
        return ResponseEntity.ok("Contrase\u00f1a regenerada y enviada por email");
    }
    
    /**
     * Genera un código aleatorio único para un usuario con rol "FABRICA".
     * El código tiene el formato "FAB" seguido de un número de 4 dígitos aleatorio (entre 1000 y 9999).
     * @return String con el código generado, por ejemplo: "FAB1234".
     */
    private String generarCodigoFabrica() {
    	// Genera un número aleatorio entre 1000 y 9999:
        // Math.random() genera un valor entre 0.0 y 1.0
        // Multiplicado por 9000 da un rango entre 0 y 8999.999...
        // Sumando 1000, obtenemos valores entre 1000 y 9999.999...
    	// Concatena el prefijo "FAB" con el número aleatorio.
        return "FAB" + ((int) (Math.random() * 9000) + 1000);
    }
    
    /**
     * Genera una contraseña aleatoria y segura con una longitud especificada.
     * @param longitud Número de caracteres que debe tener la contraseña generada.
     * @return tring con la contraseña aleatoria generada.
     */
    private String generarPasswordFuerte(int longitud) {
    	// Cadena de caracteres permitidos en la contraseña.
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        // Generador de números aleatorios seguro para uso criptográfico.
        SecureRandom random = new SecureRandom();
        // Usado para construir la contraseña final carácter por carácter.
        StringBuilder sb = new StringBuilder();
        // Genera la contraseña carácter por carácter, eligiendo aleatoriamente de la cadena `chars`.
        for (int i = 0; i < longitud; i++) {
        	// Número aleatorio entre 0 y chars.length() - 1
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        // Retorna la contraseña como string.
        return sb.toString();
    }
    
    /**
     * Elimina un usuario por su ID.
     * @param id ID del usuario que se desea eliminar.
     * @return ResponseEntity con el resultado del registro
     */
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
    	// Verifica si el usuario existe por ID. Si no existe, devuelve 404 Not Found.
        if (!usuarioRepository.existsById(id)) return ResponseEntity.notFound().build();
        // Si existe, elimina el usuario de la base de datos.
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Obtiene la lista de usuarios con rol "TIENDA".
     * @return ResponseEntity con 200 OK y la lista de usuarios tipo "TIENDA".
     */
    @GetMapping("/clientes-tienda")
    public ResponseEntity<?> obtenerClientesTienda() {
    	// Devuelve una respuesta HTTP 200 OK con la lista en el cuerpo.
        return ResponseEntity.ok(
        	// Obtiene todos los usuarios de la base de datos.
        	// Inicia un stream sobre la lista.
            usuarioRepository.findAll().stream()
            				  // Filtra solo usuarios con rol "TIENDA".
                             .filter(u -> "TIENDA".equalsIgnoreCase(u.getRol()))
                             // Convierte el resultado filtrado a una lista.
                             .toList()
        );
    }
    
    /**
     * Permite a un usuario recuperar su contraseña usando su dirección de correo electrónico.
     * Se genera una nueva contraseña aleatoria, se actualiza en la base de datos y se envía por email.
     * @param request Mapa que debe contener la clave "email" con la dirección de correo del usuario.
     * @return ResponseEntity con el resultado del registro
     */
    @PostMapping("/recuperar-password")
    public ResponseEntity<Map<String, String>> recuperarPassword(@RequestBody Map<String, String> request) {
        ResponseEntity<Map<String, String>> respuesta;
        // Obtiene el valor del campo "email" desde el mapa del cuerpo de la solicitud.
        String email = request.get("email");
        // Verifica que el email no esté vacío o sea nulo.
        if (email == null || email.isBlank()) {
            respuesta = ResponseEntity.badRequest().body(Map.of("error", "El email es obligatorio."));
        } else {
        	 // Busca un usuario con ese email en la base de datos.
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            if (usuarioOpt.isEmpty()) {
            	// Si no se encuentra el usuario, responde con 404 Not Found.
                respuesta = ResponseEntity.status(404).body(Map.of("error", "No existe ninguna cuenta con ese email."));
            } else {
                Usuario usuario = usuarioOpt.get();
                // Genera una nueva contraseña aleatoria segura.
                String nuevaPassword = generarPasswordFuerte(10);
                // Encripta la nueva contraseña y la asigna al usuario.
                usuario.setPassword(BCrypt.hashpw(nuevaPassword, BCrypt.gensalt()));

                try {
                	// Guarda el usuario con la nueva contraseña en la base de datos.
                    usuarioRepository.save(usuario);
                    // Construye el asunto y cuerpo del correo.
                    String asunto = "Recuperación de contraseña";
                    String cuerpo = "Hola " + usuario.getNombre() + ",\n\n" +
                                    "Tu nueva contraseña temporal es: " + nuevaPassword + "\n\n" +
                                    "Te recomendamos cambiarla después de iniciar sesión.";
                    // Envía el correo con la nueva contraseña.
                    emailService.enviarEmail(email, asunto, cuerpo);
                    respuesta = ResponseEntity.ok(Map.of("mensaje", "Se ha enviado una nueva contraseña a tu correo."));
                } catch (Exception e) {
                    e.printStackTrace();
                    respuesta = ResponseEntity.status(500).body(Map.of("error", "No se pudo completar la recuperación."));
                }
            }
        }

        return respuesta;
    }
}