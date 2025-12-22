# 🔀 Configuración de Git - Cherry Skincare

## 📋 Pasos para Configurar Git con Ramas

### 1. Verificar Estado Actual
```bash
git status
```

### 2. Crear/Actualizar .gitignore
Asegúrate de que `.gitignore` incluya:
- `target/` (compilados)
- `uploads/` (imágenes subidas)
- `.idea/` (IntelliJ)
- `*.iml`
- Archivos del sistema

### 3. Agregar Archivos del Proyecto
```bash
# Agregar solo archivos del proyecto
git add pom.xml
git add src/
git add mvnw*
git add .gitignore
git add *.md
```

### 4. Commit Inicial en Main
```bash
git commit -m "Initial commit: Backend completo con panel de admin"
```

### 5. Crear Rama Feature
```bash
# Crear y cambiar a la rama feature
git checkout -b feature

# O si prefieres otro nombre:
git checkout -b feature/desarrollo
```

### 6. Trabajar en la Rama Feature
```bash
# Hacer cambios...
# Luego hacer commits:
git add .
git commit -m "Descripción de los cambios"
```

### 7. Volver a Main
```bash
git checkout main
```

### 8. Fusionar Feature a Main (cuando esté listo)
```bash
git merge feature
```

---

## 🎯 Flujo de Trabajo Recomendado

### Para Desarrollo Diario:
1. Trabajar en `feature`
2. Hacer commits frecuentes
3. Cuando una funcionalidad esté completa, fusionar a `main`

### Para Nuevas Funcionalidades:
1. Crear nueva rama: `git checkout -b feature/nombre-funcionalidad`
2. Desarrollar
3. Commit y push
4. Merge a `main` cuando esté listo

---

## 📝 Comandos Útiles

```bash
# Ver ramas
git branch

# Ver ramas remotas
git branch -a

# Cambiar de rama
git checkout nombre-rama

# Crear nueva rama
git checkout -b nueva-rama

# Ver diferencias entre ramas
git diff main..feature

# Ver historial
git log --oneline --graph --all
```

