# Savings Pocket - Arquitectura y Patrones 🏗️

Savings Pocket es una solución híbrida (React Native + Microfrontend Web) diseñada para gestionar metas de ahorro programado.
Este proyecto consta de 3 módulos principales, acoplados mediante patrones arquitectónicos estrictos.

## 1. Arquitectura General y Domain-Driven Design (DDD)

La aplicación móvil (`mobile/`) está construida siguiendo los principios de **Clean Architecture** y **Domain-Driven Design (DDD)**. 
Esto garantiza que la lógica de negocio (el "Core") sea completamente agnóstica de frameworks, librerías externas o detalles de infraestructura (como la base de datos o la interfaz gráfica).

### Estructura de Capas (Layers)
- **Domain (`src/domain/`)**: Contiene la lógica de negocio pura.
  - **Entities**: Objetos con identidad (ej: `SavingsGoal`, `Deposit`).
  - **Value Objects**: Objetos inmutables definidos por sus atributos, que validan reglas de negocio (ej: `Money`, que no permite montos negativos, y `GoalProgress`, que calcula automáticamente porcentajes).
  - **Ports**: Interfaces de repositorios (Repository Pattern). Dictan _qué_ necesita el dominio para persistir datos, pero no _cómo_ se hace.
- **Application (`src/application/`)**: Contiene los **Use Cases** (ej: `MakeDepositUseCase`, `CreateGoalUseCase`). Orquestan las entidades y repositorios.
- **Infrastructure (`src/infrastructure/`)**: Implementaciones concretas de los Ports. Aquí vive `AsyncStorageGoalRepository`, que adapta el `AsyncStorage` de React Native a la interfaz `SavingsGoalRepositoryPort` requerida por el dominio. 
- **Presentation (`src/presentation/`)**: Componentes visuales y navegación (React Native).
- **Store (`src/store/`)**: Estado global con Redux Toolkit, que delega las acciones complejas a los Use Cases.

**¿Por qué DDD?**
El modelo de metas financieras requiere reglas de negocio estrictas (no montos negativos, cálculos precisos de progreso, validación de estados). Al usar DDD, estas reglas se prueban unitariamente sin depender del entorno móvil. Además, usar el **Repository Pattern** e **Inyección de Dependencias** facilita reemplazar AsyncStorage por SQLite o un API remota en el futuro sin tocar el dominio.

## 2. Nueva Arquitectura de React Native (TurboModules)

La librería nativa (`library/`) que maneja funcionalidades dependientes del hardware (formateo de moneda a nivel SO, haptic feedback, notificaciones locales y validación) se implementó usando **TurboModules (C++)** (la Nueva Arquitectura de React Native).

- Se usa **Codegen** (TypeScript) mediante `NativeDepositInput.ts` para asegurar Type-Safety completo entre JS y C++.
- La implementación se hace directamente en Kotlin (`DepositInputModule.kt`) y Objective-C++ (`DepositInput.mm`).

**¿Por qué TurboModules en lugar de Native Modules legacy?**
Los TurboModules permiten invocación sincrónica a través del puente JSI (JavaScript Interface), eliminando la latencia del bridge asíncrono antiguo basado en JSON. Es ideal para funciones rápidas como Haptic Feedback o validaciones síncronas que se disparan conforme el usuario tipea.

## 3. Micro-frontends (WebView Bridge y Adapter Pattern)

Para el detalle interactivo de las metas, no usamos vistas nativas, sino una micro-app web construida en **React y Vite** (carpeta `web/`) que se embebe en un `WebView` de la app móvil.

Para solucionar la comunicación entre capas, implementamos el **Adapter Pattern** en `WebViewBridgeAdapter.ts`.
- **React Native (Host)** orquesta el estado global (Redux) y persistencia. Envía los datos inyectándolos con `postMessage`.
- **Web (Micro-app)** renderiza gráficos hermosos en TailwindCSS, recibe los datos vía `window.addEventListener('message')` y emite eventos (ej: `DEPOSIT_CONFIRMED`) de regreso a la app móvil.

**¿Por qué este patrón?**
Permite que el equipo web itere el diseño y los estilos interactivos del detalle de la meta (desplegando independientemente actualizaciones de UI) sin necesidad de requerir un nuevo release binario (App Store / Play Store) de la aplicación React Native principal.
