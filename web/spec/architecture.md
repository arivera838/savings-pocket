# Web Module Architecture

## 1. Introducción
El módulo `web` es una micro-aplicación construida con React y Vite. Su propósito principal es ser empaquetada como un único archivo estático (`index.html`) para ser embebida dentro del componente `WebView` de la aplicación móvil (React Native).

## 2. Arquitectura y Estructura
La aplicación sigue una arquitectura de componentes funcionales en React.

```text
web/
├── index.html        # Punto de entrada de la aplicación
├── vite.config.ts    # Configuración de Vite (incluye vite-plugin-singlefile)
└── src/
    ├── App.tsx       # Componente principal y lógica de negocio
    ├── main.tsx      # Inicialización de React (ReactDOM.createRoot)
    └── index.css     # Estilos globales (Tailwind CSS)
```

## 3. Funciones y Componentes Principales

### `App.tsx`
Actúa como el cerebro de la micro-aplicación y maneja la vista del detalle de la meta de ahorro.

**Funciones y Hooks:**
- `useEffect` (Inicialización): 
  - Envía el evento `WEB_READY` a React Native para indicar que está lista para recibir datos.
  - Registra los event listeners (`window.addEventListener('message', ...)`) para recibir mensajes desde iOS y Android.
- `handleMessage` / `handleDocumentMessage`: Analizan el payload JSON enviado por React Native para actualizar el estado local (`setGoal`, `setDeposits`).
- `sendToNative(type, payload)`: Utiliza `window.ReactNativeWebView.postMessage` para enviar eventos hacia la capa nativa.
- `handleAmountChange`: Formatea y valida el valor ingresado en el input del abono.
- `handleDeposit`: Dispara el evento `DEPOSIT_CONFIRMED` hacia la aplicación nativa cuando el usuario intenta hacer un abono.

## 4. Patrón de Integración
- **Adapter / Bridge:** Se comunica estrictamente vía el protocolo de mensajes de `react-native-webview`. No realiza peticiones HTTP directas ni almacena datos persistentes; depende 100% de la aplicación móvil para recibir el estado y guardar los cambios.
