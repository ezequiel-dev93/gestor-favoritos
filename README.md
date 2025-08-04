# 🚀 Gestor de Favoritos 

Extensión de Chrome desarrollada con **Vite + React + TypeScript** que permite gestionar tus favoritos de manera visual, ordenada y totalmente personalizada.Pensada para mejorar la experiencia al navegar y organizar tus links importantes en carpetas con soporte **drag & drop**, persistencia entre dispositivos y un **sistema completo CRUD** utilizando la API de Chrome.

## 🧠 Características Principales

- 📁 Gestión de carpetas para organizar favoritos
- ✍️ Renombrar favoritos al guardar o posteriormente
- ➕ Añadir nuevos favoritos desde el navegador
- 🧹 Eliminar favoritos y carpetas
- 🎯 Búsqueda en tiempo real por nombre o carpeta
- 🟦 Drag & drop entre carpetas (DnD Kit)
- 📦 Guardado en `chrome.storage.sync` para mantener datos entre dispositivos
- 💾 Orden de favoritos y carpetas persistente
- 📦 CRUD persistente con chrome.storage.sync
- 🧪 Interfaz con animaciones sutiles (GSAP + Tailwind)
- 💻 Responsive & diseño limpio

## 🗄️ CRUD Persistente con Chrome Storage
El gestor implementa un CRUD completo para favoritos y carpetas utilizando la clase ChromeStorageRepository en la capa de infraestructura. Esto permite:

🔹 Crear: Agregar nuevos favoritos y carpetas, persistiendo los datos en chrome.storage.sync.

🔍 Leer: Obtener todos los favoritos, buscar por carpeta o por ID, y listar carpetas existentes.

✏️ Actualizar: Modificar el título, carpeta o cualquier dato de un favorito.

❌ Eliminar: Borrar favoritos individuales, eliminar todos los favoritos, o eliminar una carpeta (y todos los favoritos asociados a ella).

## 🏗️ Tecnologías Utilizadas

- ⚛️ React + TypeScript
- 🧰 Vite
- 🎨 TailwindCSS
- 🧠 Zustand para estado global
- 📦 Chrome Storage API
- 🧲 DnD Kit para drag and drop
- 🌈 GSAP (TextPlugin y animaciones)
- 🌈 Frame-Motion
- 🍞 Sonner para notificaciones

## 🧾 Instalacón

```bash
# Instalar dependencias
npm install

# Desarrollo con recarga automática
npm run dev

# Build optimizado para producción
npm run build
