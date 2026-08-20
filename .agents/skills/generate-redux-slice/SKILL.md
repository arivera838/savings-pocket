---
name: generate-redux-slice
description: >-
  Genera un slice completo de Redux Toolkit para una entidad dada.
  Incluye: state interface, initial state, reducers, async thunks,
  selectors memoizados, y archivo de tests unitarios.
  Trigger: cuando el usuario pida crear un nuevo slice, feature state,
  o módulo de Redux para el proyecto savings-pocket.
---

# Generate Redux Slice

## Cuándo activar este skill
- El usuario pide crear un nuevo slice de Redux
- El usuario menciona "nuevo estado", "nueva feature", "agregar estado global"
- El usuario quiere agregar una entidad al store

## Flujo de ejecución

### Paso 1: Recopilar información
Solicitar al usuario:
1. **Nombre de la entidad** (ej: `Goal`, `Deposit`, `User`)
2. **Propiedades de la entidad** con sus tipos TypeScript
3. **Operaciones CRUD** necesarias (create, read, update, delete)
4. **¿Necesita async thunks?** (operaciones asíncronas)

### Paso 2: Generar archivos

#### 2.1 State Interface y Slice (`mobile/src/store/slices/{entity}Slice.ts`)
```typescript
// Template de generación:
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// 1. Definir la interface del estado
interface {Entity}State {
  entities: {Entity}[];
  selectedEntity: {Entity} | null;
  loading: boolean;
  error: string | null;
}

// 2. Estado inicial
const initialState: {Entity}State = {
  entities: [],
  selectedEntity: null,
  loading: false,
  error: null,
};

// 3. Async Thunks (si aplica)
export const fetch{Entity}s = createAsyncThunk(
  '{entity}/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Llamar al use case correspondiente
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// 4. Slice con reducers
const {entity}Slice = createSlice({
  name: '{entity}',
  initialState,
  reducers: {
    set{Entity}s: (state, action: PayloadAction<{Entity}[]>) => {
      state.entities = action.payload;
    },
    add{Entity}: (state, action: PayloadAction<{Entity}>) => {
      state.entities.push(action.payload);
    },
    update{Entity}: (state, action: PayloadAction<{Entity}>) => {
      const index = state.entities.findIndex(e => e.id === action.payload.id);
      if (index !== -1) state.entities[index] = action.payload;
    },
    remove{Entity}: (state, action: PayloadAction<string>) => {
      state.entities = state.entities.filter(e => e.id !== action.payload);
    },
    setSelected{Entity}: (state, action: PayloadAction<{Entity} | null>) => {
      state.selectedEntity = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetch{Entity}s.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetch{Entity}s.fulfilled, (state, action) => {
        state.loading = false;
        state.entities = action.payload;
      })
      .addCase(fetch{Entity}s.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  set{Entity}s,
  add{Entity},
  update{Entity},
  remove{Entity},
  setSelected{Entity},
  clearError,
} = {entity}Slice.actions;

export default {entity}Slice.reducer;
```

#### 2.2 Selectors (`mobile/src/store/selectors/{entity}Selectors.ts`)
```typescript
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const select{Entity}State = (state: RootState) => state.{entity};

export const selectAll{Entity}s = createSelector(
  [select{Entity}State],
  ({entity}State) => {entity}State.entities
);

export const select{Entity}Loading = createSelector(
  [select{Entity}State],
  ({entity}State) => {entity}State.loading
);

export const select{Entity}Error = createSelector(
  [select{Entity}State],
  ({entity}State) => {entity}State.error
);

export const selectSelected{Entity} = createSelector(
  [select{Entity}State],
  ({entity}State) => {entity}State.selectedEntity
);

export const select{Entity}ById = (id: string) =>
  createSelector(
    [selectAll{Entity}s],
    (entities) => entities.find(e => e.id === id) ?? null
  );

export const select{Entity}Count = createSelector(
  [selectAll{Entity}s],
  (entities) => entities.length
);
```

#### 2.3 Tests (`mobile/src/store/__tests__/{entity}Slice.test.ts`)
```typescript
import reducer, {
  set{Entity}s,
  add{Entity},
  update{Entity},
  remove{Entity},
  setSelected{Entity},
  clearError,
} from '../slices/{entity}Slice';

describe('{entity}Slice', () => {
  const initialState = {
    entities: [],
    selectedEntity: null,
    loading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle add{Entity}', () => {
    const entity = { id: '1', /* ...props */ };
    const state = reducer(initialState, add{Entity}(entity));
    expect(state.entities).toHaveLength(1);
    expect(state.entities[0]).toEqual(entity);
  });

  it('should handle remove{Entity}', () => {
    const stateWithEntity = { ...initialState, entities: [{ id: '1' }] };
    const state = reducer(stateWithEntity, remove{Entity}('1'));
    expect(state.entities).toHaveLength(0);
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Something failed' };
    const state = reducer(stateWithError, clearError());
    expect(state.error).toBeNull();
  });
});
```

### Paso 3: Registrar en Store
Actualizar `mobile/src/store/store.ts` para importar y registrar el nuevo reducer:
```typescript
import {entity}Reducer from './slices/{entity}Slice';

// Agregar al configureStore.reducer:
{entity}: {entity}Reducer,
```

### Paso 4: Actualizar README
Agregar en la sección "Estado Global (Redux Toolkit)" del README:
- Nombre del slice
- Propiedades del estado
- Acciones disponibles
- Selectores disponibles

### Paso 5: Verificación
- Ejecutar `npm test -- --testPathPattern={entity}Slice` para validar tests
- Verificar que TypeScript compila sin errores

## Reglas
- Siempre usar `PayloadAction<T>` para tipado fuerte
- Siempre generar selectores memoizados con `createSelector`
- Siempre generar tests unitarios con cobertura completa del reducer
- Nombres de archivos en camelCase: `{entity}Slice.ts`, `{entity}Selectors.ts`
- Exportar acciones como named exports, reducer como default export
