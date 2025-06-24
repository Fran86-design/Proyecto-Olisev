package com.spring.service;

/**
 * Servicio responsable del envío de correos electrónicos en la aplicación.
 *
 * Utiliza el componente JavaMailSender de Spring para enviar mensajes de texto plano.
 * 
 * Funcionalidades principales:
 * 
 * 	Enviar correos electrónicos de forma asíncrona para no bloquear el hilo principal.
 * 	Definir destinatario, asunto, contenido y remitente de forma dinámica.
 *
 * El envío se realiza mediante la configuración definida en application.properties,
 * y el método está preparado para ejecutarse en segundo plano gracias a la anotación @Async.
 */

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

//Indica que esta clase es un componente de servicio gestionado por Spring.
@Service
//Permite que se inyecte donde se necesite, como en controladores.
public class EmailService {
	
	// Inyecta automáticamente una instancia del componente JavaMailSender,
	// que se encarga de enviar correos electrónicos mediante la configuración definida en application.properties o application.yml.
	@Autowired 
	private JavaMailSender mailSender;
	
	/**
	 * Envía un correo electrónico de forma asíncrona.
	 * @param to dirección de correo del destinatario.
	 * @param subject asunto del correo.
	 * @param text contenido (cuerpo) del mensaje.
	 */
	// Marca este método como asíncrono. Spring ejecutará este método en un hilo separado,
	// lo que evita bloquear la ejecución principal mientras se envía el correo.
	@Async
	public void enviarEmail(String to, String subject, String text) {
		// Crea una instancia de un mensaje de texto simple (sin HTML ni adjuntos).
        SimpleMailMessage mensaje = new SimpleMailMessage();
        // Establece el destinatario del correo.
        mensaje.setTo(to);
        // Establece el asunto del correo.
        mensaje.setSubject(subject);
        // Establece el contenido del mensaje (texto plano).
        mensaje.setText(text);
        // Establece el remitente del correo
        mensaje.setFrom("isco86.4@gmail.com");
        // Envía el correo utilizando el componente JavaMailSender.
        mailSender.send(mensaje);
    }
}

