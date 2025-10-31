#!/bin/bash

echo "🚀 Configurando proyecto Command Pattern Demo..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Crear estructura de directorios
echo -e "${BLUE}📁 Creando estructura de directorios...${NC}"
mkdir -p src/components
mkdir -p public

# ============================================
# package.json
# ============================================
echo -e "${BLUE}📦 Creando package.json...${NC}"
cat > package.json << 'EOF'
{
  "name": "command-pattern-demo",
  "version": "1.0.0",
  "description": "Demostración avanzada del patrón Command",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "lucide-react": "^0.263.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

# ============================================
# docker-compose.yml
# ============================================
echo -e "${BLUE}🐳 Creando docker-compose.yml...${NC}"
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  command-pattern-app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: command-pattern-demo
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true
      - WATCHPACK_POLLING=true
    stdin_open: true
    tty: true
    networks:
      - app-network

  command-pattern-prod:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: command-pattern-prod
    ports:
      - "80:80"
    networks:
      - app-network
    profiles:
      - production

networks:
  app-network:
    driver: bridge
EOF

# ============================================
# Dockerfile
# ============================================
echo -e "${BLUE}🐋 Creando Dockerfile...${NC}"
cat > Dockerfile << 'EOF'
# Etapa de desarrollo
FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Etapa de producción
FROM nginx:alpine AS production

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# ============================================
# nginx.conf
# ============================================
echo -e "${BLUE}⚙️  Creando nginx.conf...${NC}"
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
}
EOF

# ============================================
# .dockerignore
# ============================================
echo -e "${BLUE}🚫 Creando .dockerignore...${NC}"
cat > .dockerignore << 'EOF'
node_modules
build
.git
.gitignore
README.md
.env
.DS_Store
npm-debug.log
.vscode
.idea
*.md
.dockerignore
docker-compose.yml
EOF

# ============================================
# .gitignore
# ============================================
echo -e "${BLUE}🚫 Creando .gitignore...${NC}"
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
EOF

# ============================================
# public/index.html
# ============================================
echo -e "${BLUE}🌐 Creando public/index.html...${NC}"
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Demostración avanzada del patrón Command" />
    <title>Patrón Command - Demo Avanzada</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <noscript>Necesitas habilitar JavaScript para ejecutar esta app.</noscript>
    <div id="root"></div>
</body>
</html>
EOF

# ============================================
# src/index.js
# ============================================
echo -e "${BLUE}⚛️  Creando src/index.js...${NC}"
cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# ============================================
# src/index.css
# ============================================
echo -e "${BLUE}🎨 Creando src/index.css...${NC}"
cat > src/index.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}
EOF

# ============================================
# src/App.js
# ============================================
echo -e "${BLUE}⚛️  Creando src/App.js...${NC}"
cat > src/App.js << 'EOF'
import React, { useState } from 'react';
import CommandPatternDemo from './components/CommandPatternDemo';
import CommandScenariosDeep from './components/CommandScenariosDeep';

function App() {
  const [view, setView] = useState('demo');

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            onClick={() => setView('demo')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'demo'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Demo Interactivo
          </button>
          <button
            onClick={() => setView('scenarios')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'scenarios'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Escenarios Detallados
          </button>
        </div>
      </nav>

      {view === 'demo' ? <CommandPatternDemo /> : <CommandScenariosDeep />}
    </div>
  );
}

export default App;
EOF

# ============================================
# Crear archivos placeholder para componentes
# ============================================
echo -e "${BLUE}⚛️  Creando archivos de componentes...${NC}"
cat > src/components/CommandPatternDemo.js << 'EOF'
// TODO: Copiar el código del artifact "command_pattern_demo" aquí
import React from 'react';

export default function CommandPatternDemo() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Command Pattern Demo</h1>
      <p className="text-yellow-400">⚠️ Por favor, copia el código del artifact "command_pattern_demo" a este archivo.</p>
    </div>
  );
}
EOF

cat > src/components/CommandScenariosDeep.js << 'EOF'
// TODO: Copiar el código del artifact "command-scenarios-deep" aquí
import React from 'react';

export default function CommandScenariosDeep() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Escenarios Detallados</h1>
      <p className="text-yellow-400">⚠️ Por favor, copia el código del artifact "command-scenarios-deep" a este archivo.</p>
    </div>
  );
}
EOF

# ============================================
# README.md
# ============================================
echo -e "${BLUE}📖 Creando README.md...${NC}"
cat > README.md << 'EOF'
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

## ⚠️ Paso Importante

**Debes copiar el código de los artifacts a los archivos de componentes:**

1. Copia el código del artifact **"command_pattern_demo"** → `src/components/CommandPatternDemo.js`
2. Copia el código del artifact **"command-scenarios-deep"** → `src/components/CommandScenariosDeep.js`

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
EOF

echo ""
echo -e "${GREEN}✅ Estructura del proyecto creada exitosamente!${NC}"
echo ""
echo -e "${YELLOW}⚠️  PASOS FINALES:${NC}"
echo ""
echo -e "1. Copia el código de los artifacts a los archivos de componentes:"
echo -e "   ${BLUE}src/components/CommandPatternDemo.js${NC}"
echo -e "   ${BLUE}src/components/CommandScenariosDeep.js${NC}"
echo ""
echo -e "2. Levanta el proyecto con Docker:"
echo -e "   ${BLUE}docker-compose up${NC}"
echo ""
echo -e "${GREEN}🌐 La aplicación estará disponible en: http://localhost:3000${NC}"
echo ""