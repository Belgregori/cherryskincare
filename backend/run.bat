@echo off
REM Script para ejecutar el backend con variables de entorno configuradas

REM Configurar variables de entorno
set DB_PASSWORD=romipass1
set JWT_SECRET=cherrySkincareSecretKey2024SuperSecureKeyForJWTTokenGeneration

echo Variables de entorno configuradas
echo Iniciando aplicacion...
echo.

REM Ejecutar la aplicación
mvn spring-boot:run
