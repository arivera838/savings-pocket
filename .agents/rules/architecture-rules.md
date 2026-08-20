# Reglas de Arquitectura — Savings Pocket

## Reglas de Capas DDD (Obligatorias)

### 1. Domain Layer (`domain/`)
- **NUNCA** importar desde `infrastructure/`, `presentation/`, `store/`, o `application/`
- Las entidades son clases/types puros sin efectos secundarios
- Los ports son interfaces TypeScript (contratos, no implementaciones)
- Los Value Objects son inmutables y validados en construcción
- Los Enums representan estados finitos del dominio

### 2. Application Layer (`application/`)
- Solo puede importar desde `domain/`
- Los Use Cases reciben dependencias (repositories) por inyección en constructor
- Cada Use Case tiene una única responsabilidad (SRP)
- Retornan resultados tipados, nunca lanzan excepciones no controladas

### 3. Infrastructure Layer (`infrastructure/`)
- Puede importar desde `domain/` para implementar ports
- **NUNCA** importar desde `presentation/` o `store/`
- Cada repository implementa exactamente un port de `domain/ports/`
- Los adapters traducen entre formatos externos y entidades del dominio

### 4. Presentation Layer (`presentation/`)
- Puede importar desde `domain/`, `store/`, y `application/`
- **NUNCA** importar directamente desde `infrastructure/`
- Los componentes usan hooks de Redux para acceder al estado
- La navegación se centraliza en `navigation/`

### 5. Store Layer (`store/`)
- Puede importar desde `domain/` y `application/`
- **NUNCA** importar desde `infrastructure/` o `presentation/`
- Cada slice tiene sus selectores memoizados correspondientes
- Los async thunks delegan a Use Cases, no contienen lógica de negocio

## Convenciones de Nombrado

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Entidad | PascalCase | `SavingsGoal.ts` |
| Value Object | PascalCase | `Money.ts` |
| Port | PascalCase + `.port.ts` | `SavingsGoalRepository.port.ts` |
| Repository | PascalCase + `Repository.ts` | `AsyncStorageGoalRepository.ts` |
| Use Case | PascalCase + `UseCase.ts` | `CreateGoalUseCase.ts` |
| Slice | camelCase + `Slice.ts` | `goalsSlice.ts` |
| Selector | camelCase + `Selectors.ts` | `goalSelectors.ts` |
| Screen | PascalCase + `Screen.tsx` | `GoalListScreen.tsx` |
| Component | PascalCase + `.tsx` | `GoalCard.tsx` |
| Test | original + `.test.ts(x)` | `goalsSlice.test.ts` |

## Reglas de Documentación

- Todo cambio arquitectónico **DEBE** reflejarse en el README maestro
- Cada nuevo patrón de diseño **DEBE** incluir su justificación ("por qué")
- La librería `library/` mantiene su propio README independiente
- Los diagramas Mermaid se actualizan cuando cambia el flujo de datos

## Reglas de Testing

- Todo slice DEBE tener tests del reducer (estado inicial + cada acción)
- Todo use case DEBE tener test de caso exitoso + caso de error
- Los componentes críticos DEBEN tener render tests
- La cobertura mínima objetivo es 80%
