# 13 — Autenticación Completa: JWT + Refresh Tokens + Roles

## Objetivo

Implementar un sistema de autenticación production-ready con access tokens de corta duración, refresh tokens y un sistema de roles con permisos granulares.

## Contexto

Mejoramos el sistema del ejercicio 07. Los access tokens ahora expiran en 15 minutos, y los clientes pueden renovarlos con un refresh token (7 días) sin volver a hacer login.

## Flujo de autenticación

```
1. POST /auth/login
   → access_token (15min) + refresh_token (7d)

2. Petición autenticada:
   Header: Authorization: Bearer <access_token>

3. Access token expirado:
   POST /auth/refresh  { refreshToken: "..." }
   → nuevo access_token

4. POST /auth/logout   { refreshToken: "..." }
   → invalida el refresh token
```

## Tareas

### Tarea 1 — Refresh tokens (`src/db/tokens.js`)
Guarda los refresh tokens en BD (MySQL o MongoDB, elige uno):
- `saveRefreshToken(userId, token, expiresAt)`
- `findRefreshToken(token)` → devuelve el token o null
- `deleteRefreshToken(token)`
- `deleteAllUserTokens(userId)` → para logout de todos los dispositivos

### Tarea 2 — Endpoints de auth renovados
- `POST /auth/register`
- `POST /auth/login` → devuelve `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` → renueva el access token
- `POST /auth/logout` → invalida el refresh token actual
- `POST /auth/logout-all` → invalida todos los tokens del usuario (requiere auth)

### Tarea 3 — Sistema de roles y permisos (`src/middlewares/authorize.js`)
```js
// Uso:
router.delete('/articles/:id', requireAuth, authorize('admin', 'editor'), controller.remove);
```
- `authorize(...roles)` → 403 si `req.user.role` no está en la lista
- Crea un middleware `isOwnerOrAdmin(Model, paramKey)` que comprueba que el recurso pertenece al usuario

### Tarea 4 — Seguridad adicional
- Limita a 5 intentos de login fallidos por IP en 15 minutos (usa el rate limiter del ejercicio 12)
- Hashea los refresh tokens antes de guardarlos en BD

## Estructura esperada

```
13-api-auth-complete/
├── src/
│   ├── db/
│   │   ├── connection.js
│   │   └── tokens.js        ← Tarea 1
│   ├── middlewares/
│   │   ├── auth.js          (requireAuth)
│   │   ├── authorize.js     ← Tarea 3
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── auth.js          ← Tarea 2
│   └── app.js
├── tests/
│   ├── auth.test.js
│   ├── refresh.test.js
│   └── roles.test.js
└── package.json
```

## Variables de entorno

```
MONGODB_URI=mongodb://localhost:27017/blog
JWT_ACCESS_SECRET=access_secret_key
JWT_REFRESH_SECRET=refresh_secret_key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

## Criterios de evaluación

- [ ] Los access tokens expiran en 15 minutos
- [ ] El refresh token está hasheado en BD
- [ ] Logout invalida el refresh token (no puede usarse de nuevo)
- [ ] `authorize('admin')` devuelve 403 a un usuario con role 'user'
- [ ] Los tests cubren el flujo completo de refresh
