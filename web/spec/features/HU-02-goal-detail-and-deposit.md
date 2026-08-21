# Feature: Detalles de la Meta y Abonos Web (HU-02)

## Historia de Usuario
**"Como usuario quiero abrir el detalle de una meta, que se renderiza dentro de un webView, y poder abonar."**

## Criterios de Aceptación
1. El detalle de la meta (nombre, monto actual, monto objetivo) debe renderizarse correctamente recibiendo los datos desde la app nativa mediante el evento `GOAL_DATA`.
2. El formulario de abono debe permitir ingresar montos numéricos válidos.
3. Al hacer clic en "Abonar", se debe emitir un mensaje (`DEPOSIT_CONFIRMED`) hacia la app nativa con la información del abono.
4. La UI web debe mostrar el listado actualizado de los abonos (`DEPOSITS_DATA`) cuando sean suministrados por la aplicación nativa al recibir respuestas exitosas del store global.

## Detalles Técnicos de Implementación
- **Componentes UI:** El resumen muestra una barra de progreso dinámica. El historial se renderiza como una lista.
- **Comunicación Nativa:** Emplea `window.ReactNativeWebView.postMessage` para enviar datos y escucha eventos globales en el objeto `window` o `document`.
