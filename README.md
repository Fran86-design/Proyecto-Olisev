# Proyecto Olisev

**Proyecto Full Stack** de gestión de tienda de aceite de oliva desarrollado con **Angular** (frontend), **Spring Boot** (backend) y **MySQL** (base de datos). Permite gestionar productos, pedidos, facturación, reportes, usuarios y clientes, tanto desde el lado de la tienda como desde la fábrica.

---

## Estructura del proyecto

```
Proyecto-Olisev/
├── frontend/       Aplicación Angular (interfaz de usuario)
├── backend/        API REST con Spring Boot
└── db/             Script SQL de la base de datos (olisev.sql)
```

---

## Tecnologías utilizadas

- **Angular** — SPA del lado del cliente
- **Spring Boot** — API REST del lado del servidor
- **MySQL** — Base de datos relacional
- **Maven** — Gestión de dependencias del backend
- **Node.js / npm** — Gestión de paquetes del frontend

---

## Requisitos previos

Antes de ejecutar este proyecto, necesitas tener instalado en tu máquina:

- Node.js y Angular CLI (`npm install -g @angular/cli`)
- Java JDK 17 o superior
- Maven
- MySQL Server
- MySQL Workbench (opcional)

---

## Instalación y ejecución

### 1. Clona el repositorio

```bash
git clone https://github.com/Fran86-design/Proyecto-Olisev.git
cd Proyecto-Olisev
```

### 2. Configura la base de datos (MySQL)

1. Abre MySQL Workbench o tu cliente SQL favorito.
2. Crea una base de datos llamada `olisev`.
3. Ejecuta el script `db/olisev.sql` para importar estructura y datos.

```sql
CREATE DATABASE olisev;
USE olisev;
-- Luego ejecuta el contenido de olisev.sql
```

---

### 3. Ejecutar el backend (Spring Boot)

1. Entra a la carpeta `backend/`
2. Edita el archivo `src/main/resources/application.properties` y ajusta las credenciales:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/olisev
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
```

3. Luego ejecuta el servidor:

```bash
mvn spring-boot:run
```

La API estará disponible en:  
`http://localhost:8080/`

---

### 4. Ejecutar el frontend (Angular)

1. Entra a la carpeta `frontend/`
2. Instala dependencias:

```bash
npm install
```

3. Inicia el servidor de desarrollo:

```bash
ng serve
```

La app se abrirá en el navegador en:  
`http://localhost:4200/`

---

## Funcionalidades

- Login y registro de usuarios
- Gestión de productos, pedidos e inventario
- Facturación y reportes
- Gestión de usuarios y zonas privadas
- Visualización multimedia (videos, imágenes)
- Roles: Cliente, Tienda, Fábrica

---

## Capturas (opcional)

Puedes agregar imágenes aquí, por ejemplo:

```markdown
![Pantalla principal](frontend/public/home/arbol.png)
![Zona privada](frontend/public/zona_privada/gestion_fabrica.png)
```

---

## Licencia

Este proyecto es de uso libre para fines educativos y personales. Si lo reutilizas, por favor menciona al autor original.

---

## Autor

**Fran86-design**  
🔗 GitHub: [https://github.com/Fran86-design](https://github.com/Fran86-design)
