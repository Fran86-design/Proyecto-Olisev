/**
 * ApplicationConfig: Tipo que define la configuración general de una aplicación Angular standalone.
 * importProvidersFrom: ermite importar módulos tradicionales (basados en NgModule) dentro de una app standalone.
 * provideZoneChangeDetection: Configura cómo Angular detecta y responde a los cambios del DOM y eventos
 */
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
// Proveedor para configurar el enrutamiento de la app
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
// Proveedor para habilitar el cliente HTTP (HttpClientModule) en aplicaciones standalone
import { provideHttpClient } from '@angular/common/http';
// Módulo para habilitar animaciones (necesario para Angular Material y animaciones en general)
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
/**
 * Objeto de configuración principal para la aplicación Angular.
 * Este reemplaza al tradicional AppModule en aplicaciones standalone.
 */
export const appConfig: ApplicationConfig = {
  
  providers: [
    // Configura cómo Angular detecta los cambios de zona
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Registra las rutas de la aplicación (definidas en app.routes.ts).
    provideRouter(routes),
    // Habilita el uso de HttpClient para hacer peticiones HTTP a APIs REST.
    provideHttpClient(),
    // Importa el módulo de animaciones para que funcionen las transiciones, efectos de Angular Material, y animaciones CSS definidas con Angular.
    importProvidersFrom(BrowserAnimationsModule) 
  ]
};
