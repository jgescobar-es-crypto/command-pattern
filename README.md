# Patrón Command - Demostración Avanzada

Proyecto completo con ejemplos interactivos del patrón Command en arquitectura de software.

## 🚀 Inicio Rápido

### Opción 1: Con Docker (Recomendado)

```bash
# Desarrollo
docker-compose up

# Producción
docker-compose --profile production up
```

### Opción 2: Local

```bash
npm install
npm start
```

## 📦 Estructura del Proyecto

```
command-pattern-demo/
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── package.json
├── public/
│   └── index.html
└── src/
    ├── index.js
    ├── index.css
    ├── App.js
    └── components/
        ├── CommandPatternDemo.js
        └── CommandScenariosDeep.js
```

## 🐳 Comandos Docker

```bash
# Desarrollo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reconstruir
docker-compose up --build

# Producción
docker-compose --profile production up -d
```

## 🌐 Acceso

- Desarrollo: http://localhost:3000
- Producción: http://localhost:80

## 📚 Características

- ✅ Demo interactivo del patrón Command
- ✅ Sistema de Undo/Redo
- ✅ Historial de comandos
- ✅ Replay de acciones
- ✅ 6 escenarios reales explicados
- ✅ Código de ejemplo completo

## 🛠️ Tecnologías

- React 18
- Tailwind CSS
- Lucide React (iconos)
- Docker & Docker Compose
- Nginx (producción)
