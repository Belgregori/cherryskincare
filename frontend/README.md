# Cherry Skincare - Frontend

Frontend de la aplicación Cherry Skincare desarrollado con React y Vite.

## 🚀 Inicio Rápido

### Instalar dependencias
```bash
npm install
```

### Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Compilar para producción
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── pages/          # Páginas de la aplicación
│   ├── services/       # Servicios para comunicación con API
│   ├── components/     # Componentes reutilizables
│   ├── App.jsx         # Componente principal
│   └── main.jsx        # Punto de entrada
├── public/             # Archivos estáticos
└── package.json        # Dependencias y scripts
```

## 🔧 Configuración

El frontend está configurado para conectarse al backend en `http://localhost:8080` mediante un proxy configurado en `vite.config.js`.

## 📦 Dependencias Principales

- **React** - Biblioteca de UI
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP para peticiones a la API
- **Vite** - Build tool y dev server

