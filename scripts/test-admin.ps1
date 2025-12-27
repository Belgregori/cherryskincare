# Script de Prueba para Panel de Administración
# Ejecutar en PowerShell después de iniciar la aplicación

$baseUrl = "http://localhost:8080"

Write-Host "=== Pruebas del Panel de Administración ===" -ForegroundColor Green
Write-Host ""

# 1. Crear Producto desde Admin
Write-Host "1. Creando producto desde panel admin..." -ForegroundColor Yellow
$productBody = @{
    name = "Crema Hidratante Premium"
    description = "Crema hidratante de alta calidad para todo tipo de piel"
    price = 39.99
    category = "Cremas"
    stockQuantity = 100
    isActive = $true
} | ConvertTo-Json

try {
    $productResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/products" -Method Post -Body $productBody -ContentType "application/json"
    $productId = $productResponse.id
    Write-Host "✓ Producto creado con ID: $productId" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al crear producto: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# 2. Listar Todos los Productos (Admin)
Write-Host "2. Listando todos los productos (admin)..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/admin/products" -Method Get
    Write-Host "✓ Productos encontrados: $($products.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al listar productos: $_" -ForegroundColor Red
}

Write-Host ""

# 3. Actualizar Producto
Write-Host "3. Actualizando producto..." -ForegroundColor Yellow
$updateBody = @{
    name = "Crema Hidratante Premium Actualizada"
    description = "Descripción actualizada"
    price = 44.99
    category = "Cremas"
    stockQuantity = 90
    isActive = $true
} | ConvertTo-Json

try {
    $updatedProduct = Invoke-RestMethod -Uri "$baseUrl/api/admin/products/$productId" -Method Put -Body $updateBody -ContentType "application/json"
    Write-Host "✓ Producto actualizado. Nuevo precio: $($updatedProduct.price)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al actualizar producto: $_" -ForegroundColor Red
}

Write-Host ""

# 4. Listar Todas las Órdenes
Write-Host "4. Listando todas las órdenes..." -ForegroundColor Yellow
try {
    $orders = Invoke-RestMethod -Uri "$baseUrl/api/admin/orders" -Method Get
    Write-Host "✓ Órdenes encontradas: $($orders.Count)" -ForegroundColor Green
    if ($orders.Count -gt 0) {
        Write-Host "  Primera orden - Estado: $($orders[0].status), Total: $($orders[0].totalAmount)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Error al listar órdenes: $_" -ForegroundColor Red
}

Write-Host ""

# 5. Cambiar Estado de Orden (si existe)
if ($orders -and $orders.Count -gt 0) {
    $orderId = $orders[0].id
    Write-Host "5. Cambiando estado de orden $orderId a PAGADO..." -ForegroundColor Yellow
    try {
        $updatedOrder = Invoke-RestMethod -Uri "$baseUrl/api/admin/orders/$orderId/status?status=PAGADO" -Method Put
        Write-Host "✓ Estado actualizado a: $($updatedOrder.status)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Error al actualizar estado: $_" -ForegroundColor Red
    }
} else {
    Write-Host "5. No hay órdenes para actualizar" -ForegroundColor Yellow
}

Write-Host ""

# 6. Listar Todos los Usuarios
Write-Host "6. Listando todos los usuarios..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Get
    Write-Host "✓ Usuarios encontrados: $($users.Count)" -ForegroundColor Green
    foreach ($user in $users) {
        Write-Host "  - $($user.name) ($($user.email)) - Órdenes: $($user.orderCount)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Error al listar usuarios: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Pruebas del panel admin completadas ===" -ForegroundColor Green

