# Savings Pocket - Vista Web Embebida

Esta es la capa web del proyecto **Savings Pocket**, diseñada específicamente para ser embebida dentro de la aplicación móvil (React Native) a través de un componente `<WebView>`. Está construida utilizando **React**, **TypeScript**, **Vite** y **TailwindCSS**.

## 🔌 Comunicación Web ↔ Nativo (Bridge)

La característica más importante de este proyecto es su interacción bidireccional con la aplicación móvil anfitriona. Esto se logra mediante la API de `postMessage`.

### 1. Recibir Datos desde el Móvil (Nativo -> Web)
Cuando la aplicación nativa carga la WebView, inyecta un estado inicial con la información de la meta y el historial de depósitos.
En la web, esto se intercepta escuchando el evento global `message`:

```javascript
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'GOAL_DATA') {
    // Actualizar el estado de la UI de la web con los datos de la meta
    setGoal(data.payload);
  }
});
```

### 2. Enviar Datos al Móvil (Web -> Nativo)
Cuando el usuario realiza una acción en la vista web (por ejemplo, confirmar un depósito), la web envía un evento a React Native usando `window.ReactNativeWebView.postMessage`:

```javascript
const handleDeposit = (amount) => {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'DEPOSIT_CONFIRMED',
      payload: {
        amount: amount,
        formattedAmount: `$ ${amount}`
      }
    }));
  }
};
```
De este modo, React Native se entera del depósito, ejecuta la lógica nativa (actualización local, feedback háptico, notificaciones) y posteriormente devuelve el estado actualizado mediante el evento `GOAL_DATA`.

## 🚀 Desarrollo y Despliegue

Este proyecto utiliza **Vite** como entorno de desarrollo y empaquetador (bundler).

### Desarrollo Local
Para probar la interfaz web de manera aislada en tu navegador:
```bash
npm install
npm run dev
```

### Construcción (Build) para Producción
Para compilar la aplicación y generar los estáticos (`HTML/CSS/JS`) optimizados para producción:
```bash
npm run build
```
Esto generará una carpeta `dist/` con los archivos minificados listos para ser desplegados en cualquier proveedor de hosting estático (Vercel, Netlify, S3, Firebase Hosting, etc.).

> **Nota para Integración Móvil:** En un entorno de producción, la URL de la web desplegada (ej. `https://savings-pocket-web.vercel.app`) se configura como la `uri` fuente en el `<WebView>` de React Native, asegurando que los usuarios de la app móvil siempre tengan la última versión de la interfaz web instantáneamente sin requerir actualizaciones de la App Store.
