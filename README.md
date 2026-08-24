# 🔖 BookMarkNest - Extensión de Chrome

<div align="center">
  <img src="public/img/banner-boomarknest.png" alt="Gestor de Favoritos Banner" width="100%" />
</div>

> Una extensión de Chrome para la pestaña nueva que convierte la página de inicio predeterminada del navegador en un gestor visual de marcadores enfocado en la organización, la velocidad y una experiencia de usuario fluida.
 
 
---
 
## 🎯 Problema
 
La experiencia nativa de marcadores de Chrome es funcional, pero puede volverse engorrosa al gestionar una gran cantidad de enlaces.
 
Quería una forma más rápida de:
 
* visualizar los marcadores de un vistazo;
* organizarlos en carpetas y subcarpetas;
* buscar instantáneamente;
* reordenar el contenido de forma natural;
* mantener los datos sincronizados entre dispositivos.
Después de probar las soluciones existentes, decidí construir una herramienta alrededor del flujo de trabajo que realmente quería usar.
 
---
 
## 💡 Solución
 
**BookMarkNest** reemplaza la página de pestaña nueva predeterminada de Chrome por un gestor de marcadores a pantalla completa.
 
Las carpetas se convierten en tarjetas visuales, los marcadores permanecen inmediatamente accesibles, y las acciones comunes como buscar, organizar, reordenar y respaldar datos se manejan desde una única interfaz.
 
La aplicación se apoya en `chrome.storage.sync` para la sincronización nativa del navegador, eliminando la necesidad de un backend personalizado o almacenamiento de datos externo.
 
---
 
## ✨ Características principales
 
### 🗂️ Organización
 
* Cuadrícula visual de carpetas con diseño responsivo
* Subcarpetas anidadas
* Crear, renombrar y eliminar carpetas y marcadores
* Eliminación en cascada
* Reordenamiento mediante Drag & Drop
### ⚡ Productividad
 
* Búsqueda de marcadores en tiempo real
* Experiencia personalizada de pestaña nueva
* Acceso instantáneo a carpetas y marcadores
### 💾 Gestión de datos
 
* Sincronización automática entre múltiples dispositivos
* Exportación a JSON
* Importación desde JSON
* Estrategias de Fusión (Merge) y Reemplazo (Replace)
* Sin necesidad de backend externo
### 🎨 Experiencia de usuario
 
* Interfaz responsiva
* Animaciones con GSAP y Framer Motion
* Notificaciones contextuales con Sonner
* Estados interactivos y retroalimentación visual
---
 
## 🛠️ Stack tecnológico
 
| Categoría              | Tecnología                          |
| ----------------------- | ------------------------------------ |
| Framework                | React 19                            |
| Lenguaje                 | TypeScript                          |
| Herramienta de build     | Vite 7                              |
| Gestión de estado        | Zustand 5                           |
| Estilos                  | Tailwind CSS v4                     |
| Drag & Drop              | `@dnd-kit`                          |
| Animación                | GSAP, Framer Motion                 |
| Iconos                   | Lucide React, React Icons           |
| Notificaciones           | Sonner                              |
| API del navegador        | Chrome Extensions API — Manifest V3 |
| Persistencia             | `chrome.storage.sync`               |
 
---
 
# 🏗️ Arquitectura
 
BookMarkNest sigue un enfoque de **Clean Architecture** para mantener la lógica de negocio independiente de React y de las APIs de Chrome.
 
```text
src/
├── core/
│   ├── domain/
│   ├── use-cases/
│   └── ports/
│
├── infrastructure/
│   └── chrome-storage/
│
└── ui/
    ├── components/
    ├── pages/
    └── state/
```
 
El objetivo principal es mantener el dominio independiente de los frameworks externos y de las cuestiones de infraestructura.
 
---
 
## 🧩 Clean Architecture
 
La aplicación se divide en tres capas principales:
 
### `core/`
 
Contiene las entidades del dominio, los casos de uso y los contratos.
 
No tiene ninguna dependencia de React, de las APIs de Chrome ni de otras cuestiones de infraestructura.
 
### `infrastructure/`
 
Contiene las implementaciones de las dependencias externas.
 
Por ejemplo:
 
`ChromeStorageRepository` implementa el contrato `FavoriteRepository` y encapsula la comunicación con `chrome.storage.sync`.
 
### `ui/`
 
Contiene la interfaz de React y la lógica de presentación.
 
La interfaz interactúa con el dominio a través de abstracciones definidas, en lugar de depender directamente del almacenamiento de Chrome.
 
---
 
## 🔌 Patrón Repository
 
El acceso a la persistencia se realiza a través del contrato `FavoriteRepository`.
 
Esta abstracción hace que el mecanismo de almacenamiento sea reemplazable sin acoplar la interfaz ni la lógica de negocio a una implementación específica.
 
Por ejemplo, la aplicación podría evolucionar de:
 
```text
FavoriteRepository
      ↓
ChromeStorageRepository
      ↓
chrome.storage.sync
```
 
a:
 
```text
FavoriteRepository
      ↓
ApiRepository
      ↓
REST API
```
 
sin requerir cambios en la capa de interfaz.
 
---
 
## 🧠 Gestión de estado
 
La aplicación utiliza **Zustand** como única fuente de verdad para el estado del cliente.
 
Gestiona:
 
* carpetas;
* marcadores;
* carpeta seleccionada;
* estados de carga;
* estado de búsqueda;
* interacciones de Drag & Drop.
Se eligió Zustand para mantener la gestión de estado ligera y evitar la propagación innecesaria de renders durante interacciones intensivas.
 
---
 
## 🧭 Pestaña nueva de Chrome
 
BookMarkNest utiliza `chrome_url_overrides` para reemplazar la página de pestaña nueva predeterminada de Chrome.
 
Este enfoque proporciona:
 
* acceso completo al viewport;
* diseños responsivos sin las restricciones de un panel lateral;
* acceso directo a la aplicación;
* una experiencia fluida con `Ctrl + T`.
---
 
# ⚙️ Desafíos técnicos
 
### Límites de `chrome.storage.sync`
 
La extensión funciona dentro de las cuotas de sincronización de Chrome, lo que requiere un manejo cuidadoso de las escrituras, los reintentos y la persistencia asíncrona.
 
### Estado optimista frente a persistencia asíncrona
 
Las interacciones de Drag & Drop actualizan la interfaz de inmediato, mientras que la persistencia ocurre de forma asíncrona.
 
La implementación necesita mantener consistentes el estado optimista del cliente y el estado persistido.
 
### Condiciones de carrera
 
Las interacciones concurrentes pueden producir escrituras conflictivas, particularmente durante operaciones rápidas de Drag & Drop.
 
La estrategia de sincronización de almacenamiento se diseñó para evitar escrituras obsoletas y preservar el orden esperado.
 
### Aplicando SOLID en el Frontend
 
La arquitectura separa las responsabilidades entre componentes y casos de uso, en lugar de colocar la lógica de la aplicación directamente dentro de los componentes de React.
 
Por ejemplo:
 
| Componente / Caso de uso | Responsabilidad                      |
| -------------------------- | -------------------------------------- |
| `AppLayout`                 | Composición de la aplicación          |
| `FoldersGrid`                | Renderizado de la cuadrícula de carpetas |
| `FolderCard`                 | Presentación de carpetas y marcadores |
| `SettingsModal`              | Interfaz de importación/exportación   |
| `exportFavorites`            | Serialización del respaldo            |
| `importFavorites`            | Validación y persistencia del respaldo |
 
---
 
# 📦 Importación y exportación de datos
 
BookMarkNest ofrece funcionalidad de respaldo y restauración basada en JSON.
 
Se admiten dos estrategias de importación:
 
### Fusión (Merge)
 
Agrega marcadores con URLs nuevas evitando duplicados.
 
### Reemplazo (Replace)
 
Reemplaza la estructura actual de marcadores con los datos importados.
 
La implementación se maneja a nivel de caso de uso/repositorio, en lugar de estar acoplada a la interfaz.
 
---
 
# 🚀 Desarrollo local
 
## Requisitos previos
 
* Node.js
* pnpm
* Google Chrome
## Instalación
 
```bash
git clone https://github.com/ezequiel-dev93/gestor-favoritos.git
cd gestor-favoritos
pnpm install
```
 
## Build
 
```bash
pnpm run build
```
 
## Cargar la extensión
 
1. Abrí `chrome://extensions/`
2. Activá el **Modo de desarrollador**
3. Hacé clic en **Cargar sin empaquetar**
4. Seleccioná el directorio `dist/` generado
5. Abrí una nueva pestaña de Chrome
---
 
# 📁 Estructura del proyecto
 
```text
src/
├── core/
│   ├── domain/
│   ├── use-cases/
│   └── ports/
│
├── infrastructure/
│   └── chrome-storage/
│
└── ui/
    ├── components/
    ├── pages/
    └── state/
```
 
La estructura sigue el mismo principio arquitectónico en todo el proyecto: **mantener las reglas de negocio independientes de los detalles del framework y de la infraestructura.**
 
---
 
# 📚 Qué demuestra este proyecto
 
BookMarkNest es intencionalmente más que un experimento de interfaz.
 
Demuestra:
 
* Arquitectura frontend con límites claros
* Desarrollo en React con tipado seguro
* Gestión de estado para interacciones complejas
* Desarrollo de extensiones de navegador con Manifest V3
* Persistencia basada en el patrón Repository
* Sincronización de datos asíncrona
* Consistencia de estado en Drag & Drop
* Diseño UX responsivo
* Diseño de animaciones e interacciones
* Separación entre dominio, infraestructura y presentación
---
 
## 📄 Licencia
 
Licencia MIT.
 
Libre para usar, modificar y distribuir con atribución.
 
---
 
<div align="center">
**Construido a partir de un problema personal de productividad, convertido en un proyecto de ingeniería frontend orientado a producción.**
 
</div>
