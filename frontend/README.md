# OlisevWeb

Este proyecto fue generado utilizando [Angular CLI](https://github.com/angular/angular-cli) versión 19.2.7.

**OlisevWeb** es una aplicación web frontend desarrollada con Angular. Ofrece una interfaz completa de comercio electrónico con tienda, zonas privadas de administración y componentes dinámicos como un chatbot personalizado. Incluye funcionalidades para navegación de productos, carrito de compras, proceso de pago, gestión de clientes y administración interna de tiendas y fábricas.

## Estructura del proyecto

La aplicación está organizada de forma modular, utilizando enrutamiento Angular con componentes cargados bajo demanda (lazy loading) y protección de rutas privadas. Algunas secciones clave incluyen:

- Páginas públicas: inicio, tienda, catálogo, contacto, blog
- Zonas privadas para administración de tiendas y fábricas
- Chatbox asistente con respuestas contextuales
- Servicio de autenticación (`AuthService`) para control de acceso

## Servidor de desarrollo

Para iniciar un servidor de desarrollo local, ejecuta:

```bash
ng serve
```

Una vez iniciado, abre tu navegador en `http://localhost:4200/`. La aplicación se recargará automáticamente al modificar los archivos fuente.

## Generación de código (scaffolding)

Angular CLI incluye herramientas para generar código automáticamente. Para generar un nuevo componente, ejecuta:

```bash
ng generate component nombre-del-componente
```

Para ver la lista completa de esquemas disponibles (`components`, `directives`, `pipes`, etc.), ejecuta:

```bash
ng generate --help
```

## Integración con backend

Esta aplicación depende de una API backend para funciones como autenticación y gestión de datos (usuarios, productos, pedidos). Asegúrate de que el backend esté corriendo (por ejemplo, en `http://localhost:3000`) para acceder a todas las funcionalidades, especialmente las zonas privadas.

## Compilación del proyecto

Para compilar el proyecto, ejecuta:

```bash
ng build
```

Esto compilará tu aplicación y almacenará los archivos de salida en el directorio `dist/`. Por defecto, la compilación para producción optimiza el rendimiento y la velocidad.

## Ejecución de pruebas unitarias

Para ejecutar pruebas unitarias con el framework [Karma](https://karma-runner.github.io), usa:

```bash
ng test
```

## Pruebas end-to-end (e2e)

Para ejecutar pruebas end-to-end, ejecuta:

```bash
ng e2e
```

Angular CLI no incluye un framework de pruebas e2e por defecto. Puedes elegir el que mejor se adapte a tus necesidades.

## Recursos adicionales

Para más información sobre cómo usar Angular CLI y su documentación de comandos, visita la [referencia oficial de Angular CLI](https://angular.dev/tools/cli).
