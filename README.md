# SportMax - Tienda Deportiva

Este paquete contiene la configuración completa de la aplicación web **SportMax**, adaptada para una tienda deportiva.

## Configuración de los servicios

- **API en Render:** `https://sportmax-tienda.onrender.com`
- **Proyecto Firebase:** `sportmax-app-6fe98`
- **PWA con IndexedDB** y Service Worker para funcionamiento offline.

## Qué hace cada capa

1. **IndexedDB** guarda la copia local y la cola offline de cada dispositivo.
2. La **PWA** envía las operaciones al backend en Render cuando hay conexión.
3. El **Backend (ASP.NET Core)** usa Firebase Admin/Google Cloud Firestore para guardar la información central en la colección `garments`.
4. Los dispositivos consultan periódicamente la API (cada 20 segundos) para recoger cambios.

## 1. Firebase

En Firebase Console, proyecto `sportmax-app-6fe98`:
1. Crea/activa Cloud Firestore.
2. Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada.
3. Guarda el JSON de forma segura. **No lo subas al repositorio.**
4. Despliega `firestore.rules` con Firebase CLI si vas a usar reglas para clientes.

## 2. Render

El backend se despliega en Render usando el `Dockerfile` de la raíz del repositorio. 

En Render > Environment agrega:
- `FIREBASE_PROJECT_ID` = `sportmax-app-6fe98`
- `FIREBASE_SERVICE_ACCOUNT_JSON` = JSON completo de la cuenta de servicio
- `ALLOWED_ORIGINS` = `https://sportmax-tienda-1.onrender.com,http://localhost:5500`
- `ASPNETCORE_ENVIRONMENT` = `Production`

Verifica el estado de tu API en:
- `https://sportmax-tienda.onrender.com/health`
- `https://sportmax-tienda.onrender.com/api/garments/`

## 3. Ejecutar localmente

Desde `backend/GestionRopa.Api`:

```powershell
dotnet restore
$env:FIREBASE_PROJECT_ID="sportmax-app-6fe98"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\a\tu\service-account.json"
dotnet run
