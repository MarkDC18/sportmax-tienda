# tienda deportiva — configuración con tus servicios

Este paquete se ajustó a:
- API Render: `https://apellidosynombres.onrender.com`
- Firebase project: `yancasaycoc`
- PWA con IndexedDB y Service Worker para instalación en Windows, Android y iOS.

## Qué replica cada capa

1. IndexedDB guarda la copia local y la cola offline de cada dispositivo.
2. La PWA envía las operaciones al backend Render cuando hay conexión.
3. El backend ASP.NET Core usa Firebase Admin/Google Cloud Firestore para guardar la información central en la colección `garments`.
4. Los dispositivos consultan periódicamente la API (cada 20 segundos) para recoger cambios de otros dispositivos.

No se escribe directamente en Firestore desde el navegador: así las credenciales administrativas permanecen en el servidor. El objeto Firebase Web config se usa para inicializar el SDK web y preparar Firebase Authentication.

## 1. Firebase

En Firebase Console, proyecto `yancasaycoc`:
1. Crea/activa Cloud Firestore.
2. Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada.
3. Guarda el JSON de forma segura. No lo subas al repositorio ni lo pongas en `frontend/`.
4. Despliega `firestore.rules` con Firebase CLI si vas a usar reglas para clientes. El backend Admin SDK utiliza permisos IAM y no depende de estas reglas.

## 2. Render

El endpoint raíz de tu servicio fue comprobado y responde `API Tienda de Ropa funcionando`. Para que el starter funcione, Render también debe desplegar las rutas del backend de esta carpeta.

En Render > Environment agrega:
- `FIREBASE_PROJECT_ID` = `yancasayc`
- `FIREBASE_SERVICE_ACCOUNT_JSON` = JSON completo de la cuenta de servicio
- `ALLOWED_ORIGINS` = `https://yancasayc.web.app,https://yancasayc.firebaseapp.com,http://localhost:5500,http://127.0.0.1:5500`
- `ASPNETCORE_ENVIRONMENT` = `Production`

En Render crea/actualiza un Web Service con Runtime **Docker**, usando el `Dockerfile` de la raíz del repositorio. El contenedor escucha en el puerto `PORT` que Render proporciona.

Después verifica:
- `https://apellidosynombres.onrender.com/health`
- `https://apellidosynombres.onrender.com/api/garments/`

## 3. Datos ficticios

Con el backend actualizado y funcionando, abre PowerShell desde la raíz del proyecto y ejecuta:

```powershell
.\scripts\seed-demo.ps1
```

El script inserta ocho prendas ficticias en la API y, por tanto, en Firestore. No lo ejecutes repetidamente porque creará duplicados.

## 4. Ejecutar localmente

Desde `backend/GestionRopa.Api`:

```powershell
dotnet restore
$env:FIREBASE_PROJECT_ID="yancasaycoc"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Firebase\service-account.json"
dotnet run
```

Si ejecutas el backend local, cambia temporalmente `frontend/js/config.js`:

```js
API_BASE_URL: "http://localhost:5000"
```

Usa la URL exacta que muestre `dotnet run`; puede ser `http://localhost:xxxx` o `https://localhost:xxxx`.

Para servir frontend local, desde `frontend` ejecuta por ejemplo:

```powershell
python -m http.server 5500
```

El modo PWA/offline completo requiere localhost para desarrollo o HTTPS en despliegue. `file://` no sirve para probar Service Worker.

## 5. Firebase Hosting

Instala Firebase CLI, inicia sesión y selecciona el proyecto:

```powershell
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only hosting
```

El `firebase.json` publica la carpeta `frontend`.

## 6. Instalar

- Windows: Edge/Chrome > menú > Instalar aplicación.
- Android: Chrome > Instalar aplicación / Añadir a pantalla de inicio.
- iPhone: Safari > Compartir > Añadir a pantalla de inicio.

## Limitaciones y seguridad

- La PWA sincroniza al abrirse, al volver a primer plano, al recuperar conexión y mediante sondeo periódico. Background Sync no está disponible de forma uniforme en todos los navegadores.
- Los conflictos HTTP 409 se conservan localmente y se marcan para revisión; no se sobrescriben automáticamente.
- Esta versión base no incluye autenticación JWT/Firebase Authentication aplicada a cada endpoint. No uses datos reales ni publiques el CRUD sin añadir autorización.
- El código de ejemplo define la colección `garments`; si tu backend actual utiliza otro nombre de colección o campos diferentes, hay que adaptar el repositorio.
- El frontend usa el contrato `/api/garments/`. Si tu API actual tiene rutas diferentes, adapta `frontend/js/sync-manager.js` o despliega estas rutas.
