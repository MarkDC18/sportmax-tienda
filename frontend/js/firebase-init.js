// Inicialización del SDK web de Firebase con los datos del proyecto yancasaycoc.
// Las escrituras de inventario se realizan por la API Render, nunca con credenciales
// administrativas desde el navegador.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const app = initializeApp(window.APP_CONFIG.FIREBASE);
const auth = getAuth(app);
window.firebaseApp = app;
window.firebaseAuth = auth;
window.dispatchEvent(new Event("firebase-ready"));
