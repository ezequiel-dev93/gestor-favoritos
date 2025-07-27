## ✅ `ARCHITECTURE` Documentación técnica del proyecto

```
# 🏗️ Arquitectura del Proyecto

Este documento describe cómo está estructurado el proyecto y cómo se organiza el código para facilitar su mantenimiento, escalabilidad y comprensión por parte de otros colaboradores.

📌 Conceptos clave
Zustand se utiliza para manejar el estado de favoritos y carpetas globalmente.

Separación por capas: core/, infrastructure/, y ui/ siguen principios de arquitectura limpia.

DnD Kit permite reordenar elementos visualmente.

Chrome Storage Sync guarda los favoritos y el orden, persistente entre sesiones y dispositivos.

GSAP y TextPlugin dan animaciones suaves al título y componentes claves.

## 📁 Estructura de carpetas

```bash
src/
│
├── core/                    # Lógica de dominio (entidades, casos de uso, utils)
│   └── favorites/
│       ├── entities/
│       ├── useCases/
│       └── utils/
│
├── infrastructure/          # Interacción con almacenamiento, APIs externas, etc
│   └── storage/
│       └── ChromeStorageRepository.ts
│
├── ui/                      # Todo lo relacionado a la vista
│   ├── components/          # Componentes reutilizables (ej: botones, inputs)
│   ├── features/            # Funcionalidades específicas (FavoriteCard, FolderSelector)
│   ├── hooks/               # Hooks personalizados (Zustand stores, lógica visual)
│   ├── layout/              # Header, Footer, Layout general
│   └── pages/               # Páginas o vistas completas (FavoriteManager)
│
├── lib/                     # Librerías externas customizadas (ej: GSAP setup)
│
├── App.tsx                 # Componente principal
├── main.tsx                # Entrada principal del proyecto
└── styles/                 # Tailwind y estilos globales

## ✅ Buenas prácticas
❌ No modificar ChromeStorageRepository.ts directamente. Si se necesita lógica nueva, crear un nuevo useCase.

📦 Mantener las carpetas de core/ y ui/ bien separadas.

🧪 Si se añade una nueva funcionalidad, seguir la convención: core/useCases/..., ui/features/....


## 🛠️ Extensión Chrome
Se usa manifest v3

El build se carga desde la carpeta dist/

## 🧪 Futuras mejoras
 Implementar autenticación o sincronización con cuenta externa

 Exportar/Importar backups manuales
