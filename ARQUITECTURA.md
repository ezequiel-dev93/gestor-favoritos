# 🏗️ Arquitectura — Gestor de Favoritos

Documento técnico de referencia. Describe la estructura, capas, contratos y convenciones del proyecto.

---

## Principios aplicados

| Principio | Aplicación concreta |
|-----------|-------------------|
| **Single Responsibility (S)** | Cada componente/use case tiene una sola razón para cambiar |
| **Open/Closed (O)** | Nuevas features se agregan sin modificar código existente |
| **Dependency Inversion (D)** | UI y use cases dependen de `FavoriteRepository` (interfaz), no de `ChromeStorageRepository` (implementación) |

---

## Capas del sistema

```
┌──────────────────────────────────────────────────┐
│                    ui/                           │  ← Componentes React (solo vista)
├──────────────────────────────────────────────────┤
│                   core/                          │  ← Dominio puro (sin dependencias externas)
│          entities · useCases · utils             │
├──────────────────────────────────────────────────┤
│              infrastructure/                     │  ← Adaptadores de storage
│          ChromeStorageRepository                 │
└──────────────────────────────────────────────────┘
         ↑ Solo fluye hacia arriba (DIP)
```

**Regla clave:** `ui/` puede importar de `core/`. `core/` nunca importa de `ui/` ni de `infrastructure/`.

---

## 📁 Estructura de carpetas

```
src/
│
├── core/
│   └── favorites/
│       ├── entities/
│       │   ├── Favorite.ts            # Entidad: { id, url, title, folder, icon? }
│       │   ├── FolderNode.ts          # Entidad árbol + funciones: find, remove, flatten
│       │   ├── addFolderNode.ts       # Mutación inmutable del árbol
│       │   └── types.ts
│       │
│       ├── repositories/
│       │   └── FavoriteRepository.ts  # Contrato (interfaz) del storage
│       │
│       └── useCases/                  # Un archivo = un caso de uso (SRP)
│           ├── addFavorite.ts
│           ├── deleteFavorite.ts
│           ├── deleteFolders.ts
│           ├── existsFavoriteByUrl.ts
│           ├── exportFavorites.ts     # Serializa + descarga JSON backup
│           ├── getFavoritesByFolder.ts
│           ├── importFavorites.ts     # Valida + persiste con estrategia merge/replace
│           ├── searchFavorites.ts
│           ├── updateFavorite.ts
│           ├── updateFolderNode.ts
│           └── useAllFavorites.ts
│
├── infrastructure/
│   └── storage/
│       └── ChromeStorageRepository.ts # Implementa FavoriteRepository con chrome.storage.sync
│
├── ui/
│   ├── components/                    # Componentes atómicos reutilizables
│   │   ├── AsidePanel.tsx             # Archivado — usado en versión Side Panel (referencia)
│   │   ├── FloatingOpenButton.tsx
│   │   ├── Footer.tsx                 # Incluye efecto confeti en link del autor
│   │   ├── Header.tsx                 # Logo + título animado con GSAP
│   │   ├── IconButton.tsx
│   │   ├── Modal.tsx                  # Modal genérico reutilizable (portal)
│   │   └── Search.tsx                 # Input con debounce + animación de apertura
│   │
│   ├── features/                      # Funcionalidades completas (SRP por feature)
│   │   ├── AddFavoriteForm/
│   │   ├── AddFavoriteModal/
│   │   ├── AddFolderModal/
│   │   ├── DroppableFolderNode/       # Árbol de carpetas con DnD
│   │   ├── FavoriteCard/              # Tarjeta individual de favorito (con DnD handle)
│   │   ├── FavoriteDndContext/        # Proveedor DnD — maneja dragEnd y movimiento entre carpetas
│   │   ├── FavoritesList/             # Lista sortable de favoritos
│   │   ├── FolderExplorerModal/
│   │   ├── FoldersGrid/
│   │   │   ├── FolderCard.tsx         # SRP: una carpeta + su lista de favoritos + acciones hover
│   │   │   └── FoldersGrid.tsx        # SRP: grid responsivo de FolderCards
│   │   └── Settings/
│   │       ├── SettingsButton.tsx     # SRP: botón flotante ⚙️ (esquina inferior derecha)
│   │       └── SettingsModal.tsx      # SRP: UI de exportar e importar
│   │
│   ├── hooks/
│   │   ├── useFavoritesStore.ts       # Store Zustand — fuente de verdad global
│   │   ├── useFolderNode.ts           # Lógica de toggle/selección de un nodo de carpeta
│   │   └── useDroppableFolderNode.ts  # Composición de useFolderNode + handleDelete
│   │
│   └── layouts/
│       ├── AppLayout.tsx              # SRP: composición del layout (header + toolbar + main)
│       └── Sidebar.tsx                # Archivado — sidebar del layout anterior (referencia)
│
├── pages/
│   └── FavoriteManager.tsx            # DnD context + FavoriteList para una carpeta
│
├── lib/
│   └── gsap.ts                        # Setup de GSAP con TextPlugin
│
├── styles/
│   └── index.css                      # Base CSS: Tailwind + variables de tema + viewport full
│
├── App.tsx                            # Raíz: renderiza AppLayout
└── main.tsx                           # Entry point de React
```

---

## Flujo de datos

```
chrome.storage.sync
       ↕
ChromeStorageRepository   ← implementa FavoriteRepository
       ↕
   use cases              ← operan sobre la interfaz (DIP)
       ↕
 useFavoritesStore        ← Zustand: fuente de verdad de la UI
       ↕
   Componentes React      ← solo leen/disparan acciones del store
```

---

## Decisiones de arquitectura importantes

### Nueva pestaña (`chrome_url_overrides`)
La app reemplaza `chrome://newtab/` en lugar de usar Side Panel. Permite UI en pantalla completa sin restricciones de ancho. El `background.js` está vacío — Chrome maneja el routing automáticamente.

### Repositorio como contrato
`FavoriteRepository.ts` define el contrato. `ChromeStorageRepository.ts` lo implementa. Si mañana se migra a un backend REST, solo cambia la implementación — ningún componente de UI ni use case necesita modificarse.

### Store Zustand centralizado
Un único `useFavoritesStore` maneja todo el estado global. Zustand garantiza renders selectivos (solo el componente que suscribe al slice que cambió), crítico para mantener 60fps durante Drag & Drop.

### Export/Import en el dominio
`exportFavorites` e `importFavorites` viven en `core/useCases/` — no en la UI. La UI solo orquesta: llama al use case, muestra el resultado. Si se cambia el formato de backup (ej: agregar CSV), solo cambia el use case.

### DnD + validación de carpeta destino
`FavoriteDndContext` valida el drop sobre carpetas usando `flattenFolderPaths` para construir todos los paths válidos. Si `overId` no coincide con ningún path conocido, el drop se ignora — evitando favoritos con `folder` inválido.

---

## Convenciones

| Regla | Detalle |
|-------|---------|
| Un use case = un archivo | `core/useCases/addFavorite.ts`, no un archivo con 10 funciones |
| No instanciar repos en componentes | Solo el store y los use cases crean `ChromeStorageRepository` |
| Tipado estricto | Sin `any`. Type guards explícitos en `importFavorites.ts` |
| Keys únicas en listas | Usar el path completo `[...path, node.name].join("/")`, no solo `node.name` |
| Errores descriptivos | Los use cases lanzan `Error` con mensajes legibles, no solo re-throw |

---

## Extensión Chrome — Manifest V3

```jsonc
{
  "manifest_version": 3,
  "permissions": ["storage"],             // solo storage — sin permisos innecesarios
  "chrome_url_overrides": {
    "newtab": "index.html"                // reemplaza la nueva pestaña
  },
  "background": {
    "service_worker": "background.js"     // vacío — no se necesita lógica de apertura
  }
}
```

El `dist/` generado por Vite se carga directamente en Chrome desde `chrome://extensions/`.
