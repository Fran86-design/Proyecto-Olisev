/*
* Component: define un componente angular.
* ElementRef: permite acceder directamente a un elemento del dom, un div por ejemplo.
* Renderer2: modifica el dom de forma segura, sin manipular directamente el html.
* VievChild: permite acceder a un elemento del html que tenga una referencia local, '#messagesContainer'.
*/
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';

// da acceso a la URL actual y permite navegar entre rutas de la aplicacion.
import { Router } from '@angular/router';

@Component({
  selector: 'app-chatbox',
  imports: [],
  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.css',
  standalone: true
})
export class ChatboxComponent {
  // cntrola chat abierto o cerrado.
  isOpen = false;

  /* Va a buscar en html el elemento #messagesContainer y lo asigna a esta propiedad.
  * Con static: true angular inicializa la referencia antes que se renderice el html, es decir,
  * tienens acceso desde el principio, incluso antes de que se muestre todo en pantalla.
  */
  @ViewChild('messagesContainer', { static: true })

  /**
   * El ElementRef envuelve el elemento del DOM para acceder a el desde TS
   * El signo ! indica que Angular la inicializará automáticamente, de esta forma no será null ni undefined. non-null assertion operator. Angular va a llenar esta variable con el elemento del html que tenga #messagesContainer
   * HTMLElement especifica que ese elemento será un nodo HTML, no SVG, ni texto, etc.
   */
  messagesContainer!: ElementRef<HTMLElement>;


/**
 * 
 * @param renderer Manipula el DOM, crea elememtos, añade clases, etc.
 * @param router Accede a la URL actual y navegar entre rutas.
 */
  constructor(private renderer: Renderer2, private router: Router) {}

  /**
   * Abre o cierra el chat. Si se abre, agrega un mensaje inicial del asistente.
   */
  toggleChat(): void {
    //Cambia el valor a su opuesto
    this.isOpen = !this.isOpen;
    this.isOpen
      // Si isOpen es true, obtiene un mensaje según la URL y lo muestra como asistente.
      ? this.addMessage(this.getMensajePorRuta(this.router.url), 'asistente')
      // Si isOpen es false se cierra el chat, borra todos los mensajes del contenedor.
      : this.clearMessages();
  }

  /**
   * Elimina todos los elementos hijos dentro del contenedor de mensajes del chat.
   */
  clearMessages(): void {
    // Accede al elemento HTML llamado con #messagesContainer.
    const container = this.messagesContainer.nativeElement;
    // Mientras haya un primer mensaje, lo elimina del DOM.
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  /**
   * Devuelve un mensaje automático del asistente según la URL actual de la aplicación.
   * @param ruta La ruta actual (por ejemplo: '/productos', '/contacto').
   * @returns Un mensaje que corresponde a esa ruta, o uno genérico si no hay coincidencia.
   */
  getMensajePorRuta(ruta: string): string {
     // Objeto que asocia rutas con mensajes personalizados.
    const mensajes: Record<string, string> = {
      '/': 'Asistente: Bienvenido a la página principal. ¿En qué puedo ayudarte?',
      '/productos': 'Asistente: Aquí puedes explorar nuestros productos.',
      '/contacto': 'Asistente: ¿Necesitas ayuda para ponerte en contacto con nosotros?'
    };
    // Devuelve el mensaje correspondiente a la ruta. Si no existe, devuelve un mensaje por defecto.
    return mensajes[ruta] ?? 'Asistente: ¿Cómo puedo ayudarte en esta sección?';
  }

  /**
   * Simula el envío de un mensaje por parte del usuario, y genera una respuesta automática.
   * @param message El mensaje escrito o seleccionado por el usuario.
   */
  sendStep(message: string): void {
    // Muestra el mensaje del usuario en el chat.
    this.addMessage(`Cliente: ${message}`, 'cliente');

     // Objeto con respuestas automáticas asociadas a preguntas comunes.
    const respuestas: Record<string, string> = {
      '¿Cómo uso esta página?': 'Asistente: Usa el menú para navegar entre secciones.',
      'Necesito soporte': 'Asistente: Puedes contactarnos desde la sección "Contacto".'
    };

    // Busca una respuesta al mensaje del usuario. Si no hay coincidencia, muestra una genérica.
    const response = respuestas[message] ?? 'Asistente: No entendí eso. ¿Puedes reformularlo?';
    // Agrega la respuesta al chat como si fuera el asistente.
    this.addMessage(response, 'asistente');
  }

  /**
   * Crea visualmente un mensaje en el contenedor del chat, con hora y clase según sea cliente o asistente.
   * @param text El texto del mensaje a mostrar.
   * @param tipo El tipo de mensaje: 'cliente' o 'asistente'.
   */
  addMessage(text: string, tipo: 'cliente' | 'asistente'): void {
    // Crea un nuevo div donde irá el mensaje.
    const msgElement = this.renderer.createElement('div') as HTMLDivElement;
    // Crea un nodo de texto con el mensaje.
    const msgText = this.renderer.createText(text);
    // Crea un span donde irá la hora del mensaje.
    const timeSpan = this.renderer.createElement('span') as HTMLSpanElement;
    // Obtiene la fecha y hora actuales.
    const now = new Date();
    // Extrae hora y minutos, y los convierte a texto con dos dígitos '09:15.
    const hour = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    // Crea un nodo de texto con la hora formateada.
    const timeText = this.renderer.createText(` ${hour}:${minutes}`);
    // Añade la clase CSS 'timestamp' al span de la hora.
    this.renderer.addClass(timeSpan, 'timestamp');
    // Inserta el texto de la hora dentro del span.
    this.renderer.appendChild(timeSpan, timeText);
    // Añade clases al div del mensaje: 'message' y 'cliente' o 'asistente'.
    this.renderer.addClass(msgElement, 'message');
    this.renderer.addClass(msgElement, tipo);
    // Añade el texto del mensaje y la hora al div del mensaje.
    this.renderer.appendChild(msgElement, msgText);
    this.renderer.appendChild(msgElement, timeSpan);
    // Inserta el div del mensaje completo dentro del contenedor de mensajes.
    this.renderer.appendChild(this.messagesContainer.nativeElement, msgElement);
    // Hace scroll hacia abajo auto para ver el nuevo mensaje.
    this.scrollToBottom();
  }

    /**
     * Hace scroll automático al final del contenedor de mensajes para mostrar el mensaje más reciente.
     */
  scrollToBottom(): void {
    try {
      // Ajusta el scroll para que el contenedor se desplace hasta el final.
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      //Captura un error y lo muestra por consola.
      console.error('Error haciendo scroll', err);
    }
  }
}

