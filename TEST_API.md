# Guía de Pruebas - Cherry Skincare API

## 📋 Requisitos Previos

1. **MySQL instalado y corriendo**
   - Asegúrate de que MySQL esté instalado y el servicio esté corriendo
   - La aplicación creará automáticamente la base de datos `cherry_skincare` si no existe
   - Por defecto usa usuario `root` sin contraseña (ajusta en `application.properties` si es necesario)

2. **Java 17** instalado

3. **Maven** instalado (o usar el wrapper `mvnw` incluido)

## 🚀 Iniciar la Aplicación

### Opción 1: Usando Maven Wrapper (Recomendado)
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

### Opción 2: Usando Maven
```bash
mvn spring-boot:run
```

### Opción 3: Desde tu IDE
- Ejecuta la clase `CherrySkincareApplication.java`

La aplicación estará disponible en: **http://localhost:8080**

## 🧪 Probar los Endpoints

### 1. Registrar un Usuario

**POST** `http://localhost:8080/api/users/register`

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "telefone": "123456789",
  "password": "password123"
}
```

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Juan Pérez\",\"email\":\"juan@example.com\",\"telefone\":\"123456789\",\"password\":\"password123\"}"
```

### 2. Obtener Usuario por ID

**GET** `http://localhost:8080/api/users/{id}`

```bash
curl http://localhost:8080/api/users/1
```

### 3. Crear un Producto

**POST** `http://localhost:8080/api/products`

```json
{
  "name": "Crema Hidratante",
  "description": "Crema hidratante para piel seca",
  "price": 29.99,
  "imageUrl": "https://example.com/crema.jpg",
  "category": "Cremas",
  "stockQuantity": 50,
  "isActive": true
}
```

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Crema Hidratante\",\"description\":\"Crema hidratante para piel seca\",\"price\":29.99,\"imageUrl\":\"https://example.com/crema.jpg\",\"category\":\"Cremas\",\"stockQuantity\":50,\"isActive\":true}"
```

### 4. Obtener Todos los Productos

**GET** `http://localhost:8080/api/products`

```bash
curl http://localhost:8080/api/products
```

### 5. Obtener Producto por ID

**GET** `http://localhost:8080/api/products/{id}`

```bash
curl http://localhost:8080/api/products/1
```

### 6. Buscar Productos por Categoría

**GET** `http://localhost:8080/api/products/category/{category}`

```bash
curl http://localhost:8080/api/products/category/Cremas
```

### 7. Buscar Productos por Nombre

**GET** `http://localhost:8080/api/products/search?q=crema`

```bash
curl "http://localhost:8080/api/products/search?q=crema"
```

### 8. Actualizar un Producto

**PUT** `http://localhost:8080/api/products/{id}`

```json
{
  "name": "Crema Hidratante Premium",
  "description": "Crema hidratante mejorada",
  "price": 39.99,
  "imageUrl": "https://example.com/crema-premium.jpg",
  "category": "Cremas",
  "stockQuantity": 30,
  "isActive": true
}
```

```bash
curl -X PUT http://localhost:8080/api/products/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Crema Hidratante Premium\",\"description\":\"Crema hidratante mejorada\",\"price\":39.99,\"imageUrl\":\"https://example.com/crema-premium.jpg\",\"category\":\"Cremas\",\"stockQuantity\":30,\"isActive\":true}"
```

### 9. Eliminar un Producto (Soft Delete)

**DELETE** `http://localhost:8080/api/products/{id}`

```bash
curl -X DELETE http://localhost:8080/api/products/1
```

### 10. Crear un Pedido

**POST** `http://localhost:8080/api/orders/user/{userId}`

```json
{
  "orderItems": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 29.99,
      "subtotal": 59.98
    },
    {
      "productId": 2,
      "quantity": 1,
      "price": 15.99,
      "subtotal": 15.99
    }
  ],
  "shippingAddress": "Calle Principal 123",
  "shippingCity": "Buenos Aires",
  "shippingPostalCode": "1000",
  "shippingPhone": "123456789"
}
```

```bash
curl -X POST http://localhost:8080/api/orders/user/1 \
  -H "Content-Type: application/json" \
  -d "{\"orderItems\":[{\"productId\":1,\"quantity\":2,\"price\":29.99,\"subtotal\":59.98}],\"shippingAddress\":\"Calle Principal 123\",\"shippingCity\":\"Buenos Aires\",\"shippingPostalCode\":\"1000\",\"shippingPhone\":\"123456789\"}"
```

### 11. Obtener Pedidos de un Usuario

**GET** `http://localhost:8080/api/orders/user/{userId}`

```bash
curl http://localhost:8080/api/orders/user/1
```

### 12. Obtener Todos los Pedidos

**GET** `http://localhost:8080/api/orders`

```bash
curl http://localhost:8080/api/orders
```

### 13. Obtener Pedido por ID

**GET** `http://localhost:8080/api/orders/{id}`

```bash
curl http://localhost:8080/api/orders/1
```

### 14. Actualizar Estado de Pedido

**PUT** `http://localhost:8080/api/orders/{id}/status?status=CONFIRMED`

Estados disponibles: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

```bash
curl -X PUT "http://localhost:8080/api/orders/1/status?status=CONFIRMED"
```

## 🛠️ Usando Postman

1. Importa la colección de Postman (si tienes una)
2. O crea una nueva colección con los endpoints anteriores
3. Asegúrate de configurar:
   - Base URL: `http://localhost:8080`
   - Headers: `Content-Type: application/json`

## 📝 Flujo de Prueba Recomendado

1. **Registrar un usuario** → Obtener el ID del usuario
2. **Crear varios productos** → Obtener los IDs de los productos
3. **Crear un pedido** con los productos creados
4. **Consultar el pedido** creado
5. **Actualizar el estado** del pedido
6. **Verificar que el stock** se redujo correctamente

## ⚠️ Notas Importantes

- La contraseña se encripta automáticamente con BCrypt
- Los productos tienen soft delete (se desactivan, no se eliminan)
- El stock se reduce automáticamente al crear un pedido
- Los precios en los pedidos se guardan al momento de la compra
- Todos los endpoints de productos son públicos (no requieren autenticación)
- Los endpoints de pedidos requieren autenticación (por ahora están abiertos para pruebas)

## 🔍 Verificar que Funciona

Si todo está bien, deberías ver en la consola:
- Mensajes de Hibernate creando las tablas
- La aplicación iniciando en el puerto 8080
- No deberían aparecer errores de conexión a la base de datos

