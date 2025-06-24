import { Component} from '@angular/core';
//librería GSAP, que sirve para animaciones
import gsap from 'gsap';
//plugin ScrollTrigger, que nos permite conectar el scroll con animaciones
import ScrollTrigger from 'gsap/ScrollTrigger';
//Registramos el plugin ScrollTrigger dentro de GSAP para que pueda usarse
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-transforma',
  imports: [],
  templateUrl: './transforma.component.html',
  styleUrl: './transforma.component.css',
  standalone: true
})
export class TransformaComponent {
/**
*Método que vincula el avance del scroll con la reproducción de un video.
*El video avanza o retrocede según cuánto ha hecho scroll el usuario dentro de una sección concreta.  
* @param event Evento disparado por el elemento <video>. 
*/
iniciarScrollVideo(event: Event): void {

  //Obtenemos el elemento video que generó el evento
  const video = event.target as HTMLVideoElement;

  //Busco la section que contiene ese video
  const section = video.closest('section');

  //Si el video y su sección existen, ejecutamos el resto del código
  if (video && section) {
    //Detiene el video para que no se reproduzca automáticamente
    video.pause();

    //Obtenemos la duración del video. Si aún no está disponible, uso 1 por defecto
    const duration: number = video.duration || 1;

    //Tiempo deseado según el progreso del scroll
    let targetTime: number = 0;

    //Tiempo actual del video se actualizará poco a poco hacia targetTime
    let currentTime: number = 0;

    //Indica si la sección está visible en pantalla
    let isActive: boolean = false;

    //Creo un ScrollTrigger que enlaza el scroll con la sección
    ScrollTrigger.create({
      //Elemento que activa el scroll controlado
      trigger: section,
      //Inicia al llegar al top de la pantalla
      start: 'top top',
      //Termina al llegar al final de la sección
      end: 'bottom bottom',
      //Sincronización suave con el scroll
      scrub: true,

      //Activo cuando la sección entra en pantalla de arriba o desde abajo
      //Desactivo cuando la sección sale de pantalla
      onEnter: () => isActive = true,
      onLeave: () => isActive = false,
      onEnterBack: () => isActive = true,
      onLeaveBack: () => isActive = false,

      // Calculo el progreso del scroll y lo convierto en tiempo de video
      onUpdate: (self) => {
        if (isActive) {
          targetTime = self.progress * duration;
        }
      }
    });

    //gsap.ticker para actualizar el video en cada frame (60 veces por segundo)
    gsap.ticker.add(() => {
      //Solo actualizo el video si la sección está activa
      if (!isActive) return;
      // Interpolo el tiempo actual hacia el objetivo con suavidad
      currentTime += (targetTime - currentTime) * 0.5;
      //Si el video está suficientemente cargado, actualizo su tiempo actual
      if (video.readyState >= 3) {
        video.currentTime = currentTime;
      }
    });
  }
}

}

