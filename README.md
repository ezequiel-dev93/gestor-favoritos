# 🔖 Gestor de Favoritos — Chrome Extension

> **TL;DR:** Extensión de Chrome que reemplaza la nueva pestaña con un gestor visual de favoritos. Construida con Clean Architecture, principios SOLID y foco en UX fluida. Sincronización nativa sin backend, exportación/importación de datos y Drag & Drop incluidos.

---

## 🎯 El Problema y la Solución

El gestor nativo de favoritos de Chrome es rígido: múltiples clicks para categorizar, sin búsqueda rápida, sin reorganización visual. **Gestor de Favoritos** reemplaza la nueva pestaña del navegador con una interfaz completa en pantalla entera, donde cada carpeta es una tarjeta visible con sus links al instante.

Toda la persistencia se delega a `chrome.storage.sync`, lo que garantiza sincronización automática entre dispositivos sin necesidad de un backend propio ni datos expuestos a terceros.

---

## ✨ Features Principales

- **Nueva Pestaña como app:** cada `Ctrl+T` abre la app directamente en pantalla completa
- **Grid de carpetas:** todas las carpetas y sus favoritos visibles de un vistazo, en grid responsivo auto-fill
- **Drag & Drop:** reordenamiento fluido de favoritos entre carpetas (`@dnd-kit`)
- **Búsqueda real-time:** filtrado instantáneo con debounce de 200ms
- **Exportar / Importar:** backup completo en `.json` con estrategia de merge o reemplazo
- **CRUD completo:** agregar, renombrar y eliminar favoritos y carpetas (con borrado en cascada)
- **Animaciones:** transiciones suaves con GSAP + Framer Motion
- **Notificaciones:** feedback visual contextual con Sonner (`top-right`)
- **Sincronización multi-dispositivo:** persistencia automática vía `chrome.storage.sync`
- **Easter egg:** confeti al hacer click en el link del autor en el footer 🎉

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Core | React 19, TypeScript, Vite 7 |
| Estado global | Zustand 5 |
| Estilos | Tailwind CSS v4 |
| Interacciones | `@dnd-kit`, GSAP, Framer Motion |
| Iconos | Lucide React, React Icons |
| Notificaciones | Sonner |
| Efectos | canvas-confetti |
| Extensión | Chrome Extensions API — Manifest V3 |

---

## 🏗️ Decisiones Técnicas

### Clean Architecture + SOLID

El proyecto aplica arquitectura limpia con tres capas bien delimitadas:

- **`core/`** — Dominio puro. Entidades, casos de uso e interfaces. Sin dependencias de React, Chrome ni ningún framework.
- **`infrastructure/`** — Adaptadores. `ChromeStorageRepository` implementa el contrato `FavoriteRepository` y encapsula toda la asincronía de `chrome.storage.sync`.
- **`ui/`** — Vista. Componentes reactivos que no saben cómo se persisten los datos.

Cada componente tiene **una sola razón para cambiar (SRP)**. Ejemplos concretos:

| Componente | Responsabilidad única |
|------------|----------------------|
| `AppLayout` | Composición del layout (header + toolbar + main) |
| `FoldersGrid` | Renderizado del grid de tarjetas |
| `FolderCard` | Una carpeta con su lista de favoritos |
| `SettingsButton` | Abrir/cerrar el modal de configuración |
| `SettingsModal` | UI de exportar e importar |
| `exportFavorites` | Serializar y descargar el JSON |
| `importFavorites` | Validar y persistir el backup |

### Nueva Pestaña (`chrome_url_overrides`)

En lugar de usar `chrome.sidePanel` (API que limita el ancho y la integración), la app reemplaza la nueva pestaña vía `chrome_url_overrides`. Esto permite:
- UI en pantalla completa sin restricciones de tamaño
- Grid responsivo que aprovecha todo el viewport
- Zero latencia — no hay popup que abrir

### Patrón Repositorio

Todas las operaciones de storage pasan por el contrato `FavoriteRepository`. Esto permite cambiar el backend (ej: de `chrome.storage.sync` a un servidor REST) sin tocar ningún componente de UI.

### Estado con Zustand

Se eligió Zustand sobre la Context API para evitar re-renders en cascada durante operaciones intensivas como el Drag & Drop. El store es el único punto de verdad para `favorites`, `folders`, `selectedFolder` y estados de carga/búsqueda.

### Exportar / Importar

Los use cases `exportFavorites` e `importFavorites` operan directamente sobre el repositorio, sin acoplarse a la UI. La importación soporta dos estrategias:
- **Merge:** agrega solo los favoritos con URLs nuevas (no duplica)
- **Replace:** reemplaza todo el contenido actual

---

## 🚀 Instalación Local

```bash
# 1. Clonar
git clone https://github.com/ezequiel-dev93/gestor-favoritos-chrome-extension.git

# 2. Instalar dependencias
pnpm install

# 3. Build de producción
pnpm run build
```

1. Ir a `chrome://extensions/`
2. Activar **Modo Desarrollador**
3. Click en **Cargar descomprimida** → seleccionar la carpeta `dist/`
4. Abrir una nueva pestaña (`Ctrl+T`) ✅

---

## 🧠 Aprendizajes Clave

- **`chrome.storage.sync` rate limits:** manejo de cuotas y reintentos sin locks bloqueantes
- **Race conditions en DnD:** sincronizar el estado optimista (arrastre en memoria) con la escritura asíncrona en storage garantizando consistencia
- **SOLID en frontend:** aplicar SRP e inversión de dependencias en la capa UI demuestra que la arquitectura limpia no es exclusiva del backend
- **`chrome_url_overrides` vs Side Panel:** la nueva pestaña ofrece un canvas completo sin las restricciones del panel lateral

---

## 📄 Licencia

MIT — libre uso con atribución.

> _Desarrollado convirtiendo una ineficiencia personal en un proyecto de ingeniería con arquitectura formal._
