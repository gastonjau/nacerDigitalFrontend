# GitHub Profile Explorer

Frontend en **Next.js** que consulta un backend **NestJS** (`GET /user/:username`) y muestra información de perfiles de GitHub. Al cargar, prioriza el perfil de `gastonjau` y permite buscar cualquier usuario con una experiencia de búsqueda en vivo.

## Características

- **Búsqueda con debounce dinámico**: el delay se adapta a la longitud del texto (más corto cuanto más completo está el username), evitando requests innecesarios mientras se escribe.
- **Cancelación de requests**: usa `AbortController` para invalidar pedidos obsoletos cuando el usuario sigue tipeando.
- **Perfil inicial precargado**: `gastonjau` se obtiene en el servidor para un primer render sin flicker.
- **Proxy interno**: el cliente llama a `/api/user/:username` y Next.js reenvía al backend NestJS definido en `BACKEND_URL`.
- **UI responsive** con avatar, stats (repos, followers, following, gists) y datos adicionales del perfil.

### Debounce dinámico

| Longitud del username | Delay |
| --- | --- |
| vacío | `0 ms` |
| 1–2 caracteres | `500 ms` |
| 3–5 caracteres | `350 ms` |
| 6+ caracteres | `220 ms` |

Implementación en `src/hooks/useDebouncedValue.ts`.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Vitest + React Testing Library + Testing Library User Event
- Backend esperado: NestJS con `GET /user/:username`

## Requisitos

- Node.js 20+
- Backend NestJS corriendo y accesible (por defecto `http://localhost:3024`)

## Configuración

```bash
cp .env.example .env
```

Variables:

```env
BACKEND_URL=http://localhost:3024
```

## Scripts

```bash
npm install
npm run dev        # desarrollo → http://localhost:3000
npm run build      # build de producción
npm run start      # servir build
npm run lint       # ESLint
npm run test       # Vitest en modo watch
npm run test:run   # Vitest una sola vez (CI)
```

## Arquitectura relevante

```text
src/
├── app/
│   ├── api/user/[username]/route.ts   # Proxy al backend NestJS
│   └── page.tsx                       # Precarga inicial de gastonjau
├── components/
│   └── ProfileExplorer.tsx            # Input + debounce + render del perfil
├── hooks/
│   └── useDebouncedValue.ts           # Debounce dinámico
└── lib/
    ├── backend.ts                     # Lectura de BACKEND_URL
    └── types.ts                       # Contrato del perfil
```

Flujo de búsqueda:

1. El usuario escribe en el input.
2. `useDebouncedValue` espera según la longitud del texto.
3. Se hace `fetch` a `/api/user/:username`.
4. El route handler consulta `${BACKEND_URL}/user/:username`.
5. Se actualiza la UI con el perfil (o un error claro).

## Testing

La suite unitaria está pensada para cubrir la lógica crítica de búsqueda y el contrato con el backend.

```bash
npm run test:run
```

### Qué se testea

| Área | Archivo | Cobertura |
| --- | --- | --- |
| Debounce dinámico | `src/hooks/useDebouncedValue.test.ts` | delays por longitud, actualización diferida y cancelación de timers |
| Backend URL | `src/lib/backend.test.ts` | validación de env y normalización de trailing slash |
| API proxy | `src/app/api/user/[username]/route.test.ts` | 200, 400, 404 y 502 |
| UI de búsqueda | `src/components/ProfileExplorer.test.tsx` | perfil inicial, búsqueda con debounce, errores e input vacío |

Stack de testing:

- **Vitest** como test runner
- **React Testing Library** para comportamiento de UI
- **jsdom** como environment
- Fakes de timers para el debounce y mocks de `fetch` para el proxy/UI

## Endpoint consumido

El frontend **no** llama a la API de GitHub directamente. Usa el endpoint NestJS:

```http
GET /user/:username
```

Ejemplo de respuesta esperada:

```json
{
  "username": "gastonjau",
  "name": "Gaston Jaurena",
  "bio": null,
  "avatarUrl": "https://avatars.githubusercontent.com/u/132623094?v=4",
  "profileUrl": "https://github.com/gastonjau",
  "publicRepos": 29,
  "followers": 6,
  "following": 6,
  "publicGists": 0,
  "company": null,
  "location": null,
  "blog": null,
  "twitterUsername": null,
  "createdAt": "2023-05-04T22:42:31Z"
}
```

## Autor

Gaston Jaurena ([@gastonjau](https://github.com/gastonjau))
