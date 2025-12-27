# Cherry Skincare - Tienda Online

Aplicación web completa para el emprendimiento Cherry Skincare, con backend en Spring Boot y frontend en React.

## Estructura del Proyecto

```
cherry-skincare/
├── backend/          # Backend Spring Boot
│   ├── src/
│   ├── pom.xml
│   └── ...
├── frontend/         # Frontend React
│   ├── src/
│   ├── package.json
│   └── ...
├── docs/             # Documentación del proyecto
│   ├── ADMIN_PANEL.md
│   ├── GIT_SETUP.md
│   ├── IMAGENES.md
│   └── TEST_API.md
├── scripts/          # Scripts de prueba
│   ├── test-api.ps1
│   └── test-admin.ps1
└── README.md
```

## Requisitos

- Java 17 o superior
- Maven 3.6+
- Node.js 16+ y npm
- MySQL 8.0+

## Configuración y Ejecución

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Configurar la base de datos en `src/main/resources/application.properties`:
   - Ajustar URL, usuario y contraseña de MySQL

3. Ejecutar el backend:
```bash
mvn spring-boot:run
```

El backend estará disponible en `http://localhost:8080`

### Frontend

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias (solo la primera vez):
```bash
npm install
```

3. Ejecutar el frontend:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## Funcionalidades

### Usuarios
- Registro e inicio de sesión
- Visualización de productos
- Carrito de compras (próximamente)
- Realizar pedidos (próximamente)

### Administradores
- Panel de administración
- Gestión de productos (agregar, editar, eliminar)
- Gestión de órdenes
- Gestión de usuarios

## Tecnologías

### Backend
- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- MySQL
- JWT para autenticación

### Frontend
- React 19
- React Router DOM
- Axios
- Vite

## Desarrollo

El proyecto está organizado en dos carpetas principales:
- `backend/`: Contiene todo el código del backend Spring Boot
- `frontend/`: Contiene todo el código del frontend React

Cada parte puede ejecutarse independientemente desde su respectiva carpeta.

