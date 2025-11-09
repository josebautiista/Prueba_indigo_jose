# Prueba_indigo_jose

Prueba técnica (Full‑Stack):

- Frontend: React + Vite + TypeScript + Tailwind
- Backend: .NET 8 + Entity Framework Core + SQL Server

## Requisitos

Antes de empezar instala:

- [.NET 8 SDK](https://dotnet.microsoft.com/)
- [Node.js (v22+)](https://nodejs.org/)
- (Opcional) dotnet-ef: `dotnet tool install --global dotnet-ef`

Recomendado: Visual Studio 2022 o superior para desarrollo full‑stack (workload: **ASP.NET and web development**).

---

## Configuración rápida

1. Clonar el repositorio y abrir la solución

```powershell
git clone https://github.com/josebautiista/Prueba_indigo_jose
cd prueba_indigo_jose
code . # o abre la solución en Visual Studio
```

2. Instalar dependencias del cliente

```powershell
cd ./prueba_indigo_jose.client
npm install
```

Crea `.env` en la carpeta del cliente para variables (ej: `VITE_REACT_APP_URL_API=https://localhost:7035/api`).

---

## Base de datos y migraciones

Para aplicar las migraciones incluidas en el proyecto:

```powershell
cd C:\Users\joseb\source\repos\prueba_indigo_jose\prueba_indigo_jose.Server
dotnet ef database update
```

---

## Ejecutar desde Visual Studio

Opción recomendada (dos terminales integradas):

1. Abre `prueba_indigo_jose.sln` en Visual Studio.
2. Restaura paquetes NuGet.
3. En la sección del cliente (`prueba_indigo_jose.client`) ejecuta el script `dev` desde `package.json` (Task Runner Explorer o terminal integrada).
4. Marca `prueba_indigo_jose.Server` como proyecto de inicio y presiona F5 para arrancar el backend.

Notas útiles:

- Migraciones: usa `Update-Database` desde `Package Manager Console`.
- Variables de entorno: puedes añadirlas en `Debug` > `Environment Variables` para el proyecto `prueba_indigo_jose.Server`.
- Swagger UI disponible en desarrollo (`/swagger`) — recuerda pegar el token Bearer para probar endpoints protegidos.

---

## Autenticación (JWT)

- `POST /api/Auth/login` → recibe `{ username, password }` y devuelve `{ token, refreshToken }`.
- `POST /api/Auth/register` → registra un usuario (dev).
- Usa `Authorization: Bearer <token>` para llamadas protegidas.
- Nota: se configuró una política global para requerir autenticación por defecto; solo `Auth` permite `AllowAnonymous`.

---

## Desarrollo y pruebas

- Probar sin token debe devolver `401` en endpoints protegidos.
- Puedes usar Swagger o Postman para probar flujos de login/refresh.

Usuario de ejemplo de login:

username: admin
pass: Admin123#

---
