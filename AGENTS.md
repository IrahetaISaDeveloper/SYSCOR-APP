# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# Estructura del monorepo

Este repo contiene **dos apps Expo independientes** que comparten código:

```
apps/customer/    App de clientes  (slug syscor-app-clientes,  com.syscor.clientes)
apps/employee/    App de empleados (slug syscor-app-empleados, com.syscor.empleados)
packages/shared/  Código común: auth, apiClient, componentes, theme, navegación
```

Se usan **npm workspaces**. Instalar siempre desde la raíz con `npm install`.

## Levantar cada app

```bash
npm run customer          # o: npm start --workspace @syscor/app-customer
npm run employee
npm run customer:android
npm run employee:android
```

## Reglas al escribir código

- Lo que usen **ambas** apps va en `packages/shared` y se importa como
  `@syscor/shared/src/<ruta>` (por ejemplo `@syscor/shared/src/context/AuthContext`).
- Una app **nunca** importa de la otra. Si hace falta compartir algo, se mueve a `packages/shared`.
- `packages/shared` no debe importar nada de `apps/`.
- Cada app tiene su propio `assets/`; los assets usados por `packages/shared` viven en `packages/shared/assets`.
- Expo SDK 52+ configura Metro solo para monorepos: no hace falta `metro.config.js`.

## Backend / API

La URL del backend está en un único lugar: `packages/shared/src/config/env.js`.
Todo pasa por `apiClient` (axios con `withCredentials`), no uses `fetch` con URLs propias.

Para apuntar a un backend local, crea un `.env.local` en la carpeta de la app:

```bash
# apps/customer/.env.local  (o apps/employee/.env.local)
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api   # emulador de Android
```

Hay que reiniciar Metro con `--clear` después de cambiar un `.env.local`.
