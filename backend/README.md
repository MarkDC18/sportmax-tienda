# Backend ASP.NET Core 10 + Firestore - SportMax

La API expone el contrato que consume la PWA para la tienda deportiva SportMax:
- `GET /health`
- `GET /api/garments/`
- `GET /api/garments/{id}`
- `POST /api/garments/`
- `PUT /api/garments/{id}` (requiere `baseVersion`)
- `DELETE /api/garments/{id}?baseVersion=N`

## Credenciales

Proyecto Firebase: `sportmax-app-6fe98`.

En Render configura estas variables:
- `FIREBASE_PROJECT_ID` = `sportmax-app-6fe98`
- `FIREBASE_SERVICE_ACCOUNT_JSON` = contenido completo del JSON de cuenta de servicio (no subirlo a Git)
- `ALLOWED_ORIGINS` = `https://sportmax-tienda-1.onrender.com,http://localhost:5500`

En local puedes usar `GOOGLE_APPLICATION_CREDENTIALS` apuntando al JSON descargado de Firebase Console > Configuración del proyecto > Cuentas de servicio.

## Importante

El backend actual en Render responde en `/` con `API Tienda Deportiva SportMax funcionando`. 

La API de ejemplo aún no incluye Firebase Authentication/validación JWT. Antes de almacenar datos reales o exponerla a usuarios externos, añade autenticación y autorización por usuario/rol. Para Render usa el `Dockerfile` de la raíz del repositorio.
