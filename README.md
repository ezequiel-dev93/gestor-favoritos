# Gestor de Favoritos – Chrome Extension

Gestor de Favoritos es una extensión de Google Chrome diseñada para ayudarte a **organizar, guardar y gestionar enlaces de forma simple y eficiente**, directamente desde tu navegador.

El objetivo principal del proyecto es ofrecer una herramienta liviana, clara y orientada a productividad, evitando la complejidad innecesaria de los gestores tradicionales de favoritos.

---

## 🚀 🧠 Características Principales

- 📁 Gestión de carpetas para organizar favoritos
- ✍️ Renombrar favoritos al guardar o posteriormente
- ➕ Añadir nuevos favoritos desde el navegador
- 🧹 Eliminar favoritos y carpetas
- 🎯 Búsqueda en tiempo real por nombre o carpeta
- 🟦 Drag & drop entre carpetas (DnD Kit)
- 📦 Guardado en `chrome.storage.sync` para mantener datos entre dispositivos
- 💾 Orden de favoritos y carpetas persistente
- 📦 CRUD persistente con chrome.storage.sync
- 🧪 Interfaz con animaciones sutiles (GSAP + Frame-Motion + Tailwind)
- 💻 Responsive & diseño limpio

---

🗄️ CRUD Persistente con Chrome Storage
El gestor implementa un CRUD completo para favoritos y carpetas utilizando la clase ChromeStorageRepository en la capa de infraestructura. Esto permite:

🔹 Crear: Agregar nuevos favoritos y carpetas, persistiendo los datos en chrome.storage.sync.

🔍 Leer: Obtener todos los favoritos, buscar por carpeta o por ID, y listar carpetas existentes.

✏️ Actualizar: Modificar el título, carpeta o cualquier dato de un favorito.

❌ Eliminar: Borrar favoritos individuales, eliminar todos los favoritos, o eliminar una carpeta (y todos los favoritos asociados a ella).

---


## 🧠 Filosofía del proyecto

Esta extensión está pensada como un **producto en evolución**, priorizando:

* Simplicidad y claridad de uso
* Código mantenible y escalable
* Uso responsable de datos (sin tracking invasivo)
* Iteraciones pequeñas y mejoras continuas

---

## 🧩 Tecnologías utilizadas

* 🧰 Vite
* ⚛️ React + TypeScript
* 🎨 TailwindCSS
* 🧠 Zustand para estado global
* 🧲 DnD Kit para drag and drop
* 🌈 GSAP + Frame-Motion
* 🍞 Sonner Notificación
* 📦 Chrome Extensions API (Manifest V3)
* 📦 Chrome Storage API

---

## 📦 Instalación (modo desarrollo)

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/ezequiel-dev93/gestor-favoritos.git
   ```

2. Abrir Google Chrome y navegar a:

   ```
   chrome://extensions
   ```

3. Activar **Developer mode** (modo desarrollador)

4. Seleccionar **Load unpacked**

5. Elegir la carpeta raíz del proyecto

La extensión quedará cargada y lista para usar.

---

## 🛠️ Desarrollo y estructura del proyecto

Estructura general del proyecto:

* `manifest.json` – Configuración principal de la extensión
* `popup.html` – Interfaz de usuario
* `popup.js` – Lógica principal de la extensión
* `styles.css` – Estilos
* `icons/` – Íconos de la extensión

El estado de los favoritos se gestiona mediante `chrome.storage`, garantizando persistencia y buen rendimiento.

---

## 🔐 Privacidad y datos

Gestor de Favoritos:

* **No recolecta datos personales**
* **No envía información a servidores externos**
* Utiliza únicamente almacenamiento local del navegador

La privacidad del usuario es una prioridad del proyecto.

---

## 📈 Roadmap (próximas funcionalidades)

* Exportación de favoritos (JSON / CSV)
* Importación de favoritos
* Mejoras en la organización (búsqueda y filtros)
* Optimización de experiencia de usuario

El roadmap puede evolucionar en función del feedback de los usuarios.

---

## 🐞 Reporte de errores y sugerencias

Si encontrás un bug o tenés una idea para mejorar la extensión:

* Abrí un issue en el repositorio
* Describí el problema o sugerencia de la forma más clara posible

Toda contribución o feedback es bienvenida.

---

## 📄 Licencia

Este proyecto se distribuye bajo licencia MIT.

---

## 📌 Estado del proyecto

El proyecto se encuentra en **desarrollo activo** y se actualiza de forma iterativa.
