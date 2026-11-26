# Backend ASP.NET Core 10 + Firestore

La API expone el contrato que consume la PWA:
- `GET /health`
- `GET /api/garments/`
- `GET /api/garments/{id}`
- `POST /api/garments/`
- `PUT /api/garments/{id}` (requiere `baseVersion`)
- `DELETE /api/garments/{id}?baseVersion=N`

## Credenciales

Proyecto Firebase: `yancasaycoc`.

En Render configura estas variables:
- `FIREBASE_PROJECT_ID` = `yancasaycoc`
- `FIREBASE_SERVICE_ACCOUNT_JSON` = contenido completo del JSON de cuenta de servicio (no subirlo a Git)
- `ALLOWED_ORIGINS` = `https://yancasaycoc.web.app,https://yancasaycoc.firebaseapp.com,http://localhost:5500,http://127.0.0.1:5500`

En local puedes usar `GOOGLE_APPLICATION_CREDENTIALS` apuntando al JSON descargado de Firebase Console > Configuración del proyecto > Cuentas de servicio.

## Importante

El backend actual en Render responde en `/` con `API Tienda de Ropa funcionando`. Eso confirma que el servicio está activo, pero no confirma que tenga las rutas `/api/garments/` ni conexión Firestore. Debes desplegar este backend (o adaptar sus rutas a este contrato) para que la PWA sincronice correctamente.

La API de ejemplo aún no incluye Firebase Authentication/validación JWT. Antes de almacenar datos reales o exponerla a usuarios externos, añade autenticación y autorización por usuario/rol. Para Render usa el `Dockerfile` de la raíz del repositorio.
