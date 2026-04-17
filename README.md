# Gestor de Favoritos - Chrome Extension

> Extensión de Chrome orientada a productividad, diseñada con foco en rendimiento extremo y arquitectura desacoplada. Optimiza la gestión de favoritos mediante interacciones fluidas (Drag & Drop) y sincronización nativa sin backend.

## 🎯 El Problema y la Solución
El gestor nativo de favoritos de Chrome suele ser rígido y requiere múltiples clicks para organizar o categorizar enlaces del día a día. 
**Gestor de Favoritos** centraliza este flujo en una interfaz rápida e intuitiva. Permite arrastrar elementos entre carpetas, búsqueda en tiempo real e iteraciones ágiles sin depender de un backend propio; delega toda la responsabilidad de almacenamiento persistente en la robustez de la API `chrome.storage.sync`. Esta decisión mantiene los datos vinculados de forma segura a la cuenta del usuario sin crear un "silo de datos" externo.

## Features Principales
- **Organización Fluida:** Sistema interactivo de *Drag & Drop* para mover favoritos y reordenar carpetas (implementado y optimizado con `@dnd-kit`).
- **Búsqueda Real-time:** Filtrado instantáneo por coincidencia de nombre o carpeta sin latencia perceptible en el renderizado.
- **Sincronización Multi-dispositivo:** Persistencia automática del orden posicional y contenido asociado a la cuenta de Google vinculada en el navegador.
- **UX Cuidada:** Animaciones de estado (usando GSAP + Framer Motion) y feedback visual claro ante acciones de éxito o error (Sonner).
- **Gestión Ágil en Cascada:** Agregado ultrarrápido, edición y borrado recursivo (al eliminar una carpeta, se eliminan referencialmente sus contenidos).

## 🛠️ Stack Tecnológico
- **Core:** React 19, TypeScript, Vite
- **Estado Global:** Zustand
- **Estilos & UI:** Tailwind CSS v4, Lucide Icons
- **Interacciones:** `@dnd-kit` (Drop & Drag logic), GSAP, Framer Motion
- **Infraestructura:** Chrome Extensions API (Manifest V3)

## Decisiones Técnicas y Arquitectura
Este proyecto fue diseñado priorizando la mantenibilidad funcional y el desacoplamiento lógico, aplicando principios de **Arquitectura Limpia (Clean Architecture)** e inspiración en *DDD Light* sobre la capa frontend:

- **Separación Vertical de Responsabilidades (Layering):**
  - `core/`: Contiene las reglas pura del dominio y casos de uso, totalmente agnósticas a componentes React o APIs exclusivas de Chrome.
  - `infrastructure/`: Implementaciones concretas y adaptadores como `ChromeStorageRepository`, encapsulando la asincronía y las cuotas limitantes.
  - `ui/`: Componentes funcionales y reactivos completamente ciegos a la lógica de persistencia.
- **Patrón Repositorio e Inversión de Dependencias:** Empaquetar el uso de la API de Chrome detrás de contratos formales no sólo habilita una testabilidad aislada profunda, sino que permitiría migrar el almacenamiento de la nube corporativa a un stack tradicional (Ej. Node.js + PostgreSQL) sin alterar un solo componente visual.
- **Gestión de Estado de Alto Rendimiento:** Se prescindió de implementaciones pesadas o de la *Context API* nativa integrando **Zustand**. Esto garantiza renders focalizados y previene la sobre-renderización en el árbol del DOM, que era un requerimiento técnico no-negociable para sostener la fluidez a 60fps en interacciones computacionalmente demandantes como el Drag & Drop.
- **Cold Boot Instantáneo:** En una extensión, la latencia al hacer click en el popup debe ser nula. Estructurar el bundle con *Vite* aseguró que la UI impacte la pantalla de modo casi instantáneo.

## Instalación Local (Modo Desarrollo)
Al ser un proyecto frontend empaquetado bajo las convenciones Manifest V3, la puesta en marcha incluye la compilación inyectada a una subcarpeta:

1. Clonar el repositorio fuente:
   ```bash
   git clone https://github.com/ezequiel-dev93/gestor-favoritos.git

2. Instalar  el arbol de dependencias:
   ```bash
   pnpm install
   ```

3. Constuir el empaquetado final para pprodución (/dist):
   ```bash
   pnpm run build
   ```

4. Navegar a Chrome chrome://extensions/ desde el navegador.
5. Habilitar el "Modo Desarrollador" (Developer mode).
6. Hacer clic en "Cargar descomprimida" (Load unpacked).
7. Seleccionar la carpeta /dist.

## Apredisajes y Desafíos
- LifeCycle API: Afrontar cuellos de botella de naturaleza asíncrona frente a la API de Chrome sin reurrir a locks bloqueantes de promesas, debiendo sortear los rate limints intrínsecos del guardadop de sesión del navegador.
- Coherencia y Race Conditions: Resolver y empalmar el estado oiptimista (optimistic UI updates) continuo de arrastre en pantala frente trasacciones lentos ejecutados enm background, garantizando corcordancia matemática entre memoria volatil local y guardado crudo.
- Validez Arquitectónica Frontend: Comprobar sistematicamente en la fase de escalabilidad de aplicar dominio de arquitectura fuera de unn entorno backend es fundamental, otorgando inestimable para agregar robustez visual futura a alta velocidad y bajo technical debt.

## Próximas Mejoras (Roadmap Voluntario)
- Soporte para exportación completa hacia formatos abiertos (JSON, CSV) para promover el backup o portabilidad  de vínculos manual.
- Mecanismo para la importación externa de favoritos para restauraciones o cambio del  account original.

~~~ 
Desarrollado abordando una enefeciencia personal  convertida en un enfoque de Ingeniería y arquitectura formal.
~~~

## 📄 Licencia
Este proyecto se distribuye bajo licencia MIT.


