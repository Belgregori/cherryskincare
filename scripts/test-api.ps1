# Script de Prueba para Cherry Skincare API
# Ejecutar en PowerShell

$baseUrl = "http://localhost:8080"

Write-Host "=== Pruebas de Cherry Skincare API ===" -ForegroundColor Green
Write-Host ""

# 1. Registrar Usuario
Write-Host "1. Registrando usuario..." -ForegroundColor Yellow
$userBody = @{
    name = "Juan Pérez"
    email = "juan@example.com"
    telefone = "123456789"
    password = "password123"
} | ConvertTo-Json

try {
    $userResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/register" -Method Post -Body $userBody -ContentType "application/json"
    $userId = $userResponse.id
    Write-Host "✓ Usuario creado con ID: $userId" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al crear usuario: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# 2. Crear Producto 1
Write-Host "2. Creando producto 1..." -ForegroundColor Yellow
$product1Body = @{
    name = "Crema Hidratante"
    description = "Crema hidratante para piel seca"
    price = 29.99
    imageUrl = "https://example.com/crema.jpg"
    category = "Cremas"
    stockQuantity = 50
    isActive = $true
} | ConvertTo-Json

try {
    $product1Response = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Post -Body $product1Body -ContentType "application/json"
    $product1Id = $product1Response.id
    Write-Host "✓ Producto 1 creado con ID: $product1Id" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al crear producto 1: $_" -ForegroundColor Red
}

Write-Host ""

# 3. Crear Producto 2
Write-Host "3. Creando producto 2..." -ForegroundColor Yellow
$product2Body = @{
    name = "Serum Vitamina C"
    description = "Serum antioxidante con vitamina C"
    price = 45.99
    imageUrl = "https://example.com/serum.jpg"
    category = "Serums"
    stockQuantity = 30
    isActive = $true
} | ConvertTo-Json

try {
    $product2Response = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Post -Body $product2Body -ContentType "application/json"
    $product2Id = $product2Response.id
    Write-Host "✓ Producto 2 creado con ID: $product2Id" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al crear producto 2: $_" -ForegroundColor Red
}

Write-Host ""

# 4. Obtener Todos los Productos
Write-Host "4. Obteniendo todos los productos..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get
    Write-Host "✓ Productos encontrados: $($products.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al obtener productos: $_" -ForegroundColor Red
}

Write-Host ""

# 5. Crear Pedido
Write-Host "5. Creando pedido..." -ForegroundColor Yellow
$orderBody = @{
    orderItems = @(
        @{
            productId = $product1Id
            quantity = 2
            price = 29.99
            subtotal = 59.98
        },
        @{
            productId = $product2Id
            quantity = 1
            price = 45.99
            subtotal = 45.99
        }
    )
    shippingAddress = "Calle Principal 123"
    shippingCity = "Buenos Aires"
    shippingPostalCode = "1000"
    shippingPhone = "123456789"
} | ConvertTo-Json -Depth 10

try {
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/api/orders/user/$userId" -Method Post -Body $orderBody -ContentType "application/json"
    $orderId = $orderResponse.id
    Write-Host "✓ Pedido creado con ID: $orderId" -ForegroundColor Green
    Write-Host "  Total: $($orderResponse.totalAmount)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error al crear pedido: $_" -ForegroundColor Red
}

Write-Host ""

# 6. Obtener Pedidos del Usuario
Write-Host "6. Obteniendo pedidos del usuario..." -ForegroundColor Yellow
try {
    $orders = Invoke-RestMethod -Uri "$baseUrl/api/orders/user/$userId" -Method Get
    Write-Host "✓ Pedidos encontrados: $($orders.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al obtener pedidos: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Pruebas completadas ===" -ForegroundColor Green

