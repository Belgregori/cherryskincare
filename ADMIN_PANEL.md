# 🔐 Panel de Administración - Cherry Skincare

## 📋 Funcionalidades Implementadas

El panel de administración permite gestionar completamente la tienda desde el backend. Solo usuarios con rol **ADMIN** pueden acceder a estos endpoints.

### ✅ Gestión de Productos
- ✅ Listar todos los productos (incluyendo inactivos)
- ✅ Ver producto por ID
- ✅ Crear nuevo producto
- ✅ Editar producto existente
- ✅ Eliminar producto (eliminación física)
- ✅ Subir imagen a producto

### ✅ Gestión de Órdenes
- ✅ Listar todas las órdenes
- ✅ Ver orden por ID con información del usuario
- ✅ Cambiar estado de orden (SIN_CONFIRMAR, PAGADO, ENTREGADO)

### ✅ Gestión de Usuarios
- ✅ Listar todos los usuarios registrados
- ✅ Ver usuario por ID
- ✅ Ver número de órdenes por usuario

---

## 🔗 Endpoints del Panel de Admin

**Base URL:** `http://localhost:8080/api/admin`

### 📦 PRODUCTOS

#### 1. Listar Todos los Productos
**GET** `/api/admin/products`

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Crema Hidratante",
    "description": "Crema para piel seca",
    "price": 29.99,
    "imageUrl": "/api/images/abc123.jpg",
    "category": "Cremas",
    "stockQuantity": 50,
    "isActive": true
  }
]
```

#### 2. Obtener Producto por ID
**GET** `/api/admin/products/{id}`

#### 3. Crear Producto
**POST** `/api/admin/products`

**Body (JSON):**
```json
{
  "name": "Serum Vitamina C",
  "description": "Serum antioxidante",
  "price": 45.99,
  "imageUrl": "/api/images/serum.jpg",
  "category": "Serums",
  "stockQuantity": 30,
  "isActive": true
}
```

#### 4. Actualizar Producto
**PUT** `/api/admin/products/{id}`

**Body (JSON):** Mismo formato que crear producto

#### 5. Eliminar Producto
**DELETE** `/api/admin/products/{id}`

⚠️ **Nota:** Esta es una eliminación física (se borra de la base de datos). A diferencia del endpoint público que hace soft delete.

#### 6. Subir Imagen a Producto
**POST** `/api/admin/products/{id}/image`

**Formato:** `multipart/form-data`
**Parámetro:** `file` (archivo de imagen)

---

### 📋 ÓRDENES

#### 1. Listar Todas las Órdenes
**GET** `/api/admin/orders`

**Respuesta:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "userName": "Juan Pérez",
    "userEmail": "juan@example.com",
    "userPhone": "123456789",
    "orderItems": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 29.99,
        "subtotal": 59.98
      }
    ],
    "totalAmount": 59.98,
    "status": "SIN_CONFIRMAR",
    "shippingAddress": "Calle Principal 123",
    "shippingCity": "Buenos Aires",
    "shippingPostalCode": "1000",
    "shippingPhone": "123456789",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

#### 2. Obtener Orden por ID
**GET** `/api/admin/orders/{id}`

#### 3. Cambiar Estado de Orden
**PUT** `/api/admin/orders/{id}/status?status={ESTADO}`

**Estados disponibles:**
- `SIN_CONFIRMAR` - Orden creada pero no confirmada
- `PAGADO` - Orden pagada
- `ENTREGADO` - Orden entregada

**Ejemplo:**
```bash
PUT /api/admin/orders/1/status?status=PAGADO
```

---

### 👥 USUARIOS

#### 1. Listar Todos los Usuarios
**GET** `/api/admin/users`

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "telefone": "123456789",
    "role": "USER",
    "orderCount": 3
  },
  {
    "id": 2,
    "name": "María García",
    "email": "maria@example.com",
    "telefone": "987654321",
    "role": "ADMIN",
    "orderCount": 0
  }
]
```

#### 2. Obtener Usuario por ID
**GET** `/api/admin/users/{id}`

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE - Estado Actual

**Los endpoints de admin están temporalmente abiertos para desarrollo.**

En `SecurityConfig.java` los endpoints están configurados como:
```java
.requestMatchers("/api/admin/**").permitAll()
```

### 🔐 Para Producción

**DEBES implementar autenticación JWT** y cambiar la configuración a:
```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

### 📝 Pasos para Implementar Seguridad Real

1. **Implementar JWT (JSON Web Tokens)**
   - Dependencia: `io.jsonwebtoken:jjwt`
   - Crear `JwtService` para generar y validar tokens
   - Crear filtro `JwtAuthenticationFilter`

2. **Crear endpoint de login**
   - POST `/api/auth/login`
   - Retorna JWT token

3. **Actualizar SecurityConfig**
   - Agregar el filtro JWT
   - Proteger endpoints de admin con `.hasRole("ADMIN")`

4. **Crear usuario admin inicial**
   - Puedes crear manualmente en la base de datos
   - O crear un endpoint de inicialización

---

## 🧪 Ejemplos de Uso

### Crear un Producto (Admin)
```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Crema Hidratante",
    "description": "Crema para piel seca",
    "price": 29.99,
    "category": "Cremas",
    "stockQuantity": 50,
    "isActive": true
  }'
```

### Listar Todas las Órdenes
```bash
curl http://localhost:8080/api/admin/orders
```

### Cambiar Estado de Orden
```bash
curl -X PUT "http://localhost:8080/api/admin/orders/1/status?status=PAGADO"
```

### Listar Todos los Usuarios
```bash
curl http://localhost:8080/api/admin/users
```

---

## 📊 Diferencias con Endpoints Públicos

| Funcionalidad | Endpoint Público | Endpoint Admin |
|--------------|------------------|----------------|
| **Listar productos** | Solo activos | Todos (activos e inactivos) |
| **Eliminar producto** | Soft delete (desactiva) | Hard delete (elimina) |
| **Ver órdenes** | Solo del usuario | Todas las órdenes |
| **Ver usuarios** | Solo propio | Todos los usuarios |
| **Información de órdenes** | Básica | Completa con datos de usuario |

---

## 🎯 Flujo de Trabajo Recomendado

1. **Admin crea productos** usando `/api/admin/products`
2. **Usuarios ven productos** en `/api/products` (solo activos)
3. **Usuarios crean órdenes** usando `/api/orders/user/{userId}`
4. **Admin ve todas las órdenes** en `/api/admin/orders`
5. **Admin cambia estado** de orden cuando se paga/entrega
6. **Admin gestiona usuarios** en `/api/admin/users`

---

## 🚀 Próximos Pasos

1. ✅ Panel de admin implementado
2. ⏳ Implementar autenticación JWT
3. ⏳ Crear endpoint de login
4. ⏳ Proteger endpoints de admin con JWT
5. ⏳ Crear usuario admin inicial

---

## 💡 Notas

- Los estados de orden están simplificados: `SIN_CONFIRMAR`, `PAGADO`, `ENTREGADO`
- El conteo de órdenes por usuario se calcula automáticamente
- Las imágenes se pueden subir tanto desde el endpoint público como desde el de admin
- Todos los cambios se reflejan inmediatamente en la base de datos

