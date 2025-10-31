const fs = require('fs');
const path = require('path');

// Iconos SVG inline para reemplazar lucide-react
const icons = {
  Undo2: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
  Redo2: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>',
  Play: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  Pause: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
  RotateCcw: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
  FileText: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 5H8"/></svg>',
  Database: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
  Gamepad2: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>',
  Zap: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  Cloud: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
  Monitor: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  ChevronRight: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  Code2: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>'
};

// Función para reemplazar imports y iconos
function processCode(code, filePath) {
  let processed = code;
  
  // Eliminar imports de React (ya está en CDN)
  processed = processed.replace(/^import\s+.*?from\s+['"]react['"];?\s*/gm, '');
  
  // Eliminar imports de react-dom
  processed = processed.replace(/^import\s+.*?from\s+['"]react-dom['"];?\s*/gm, '');
  
  // Eliminar import de index.css
  processed = processed.replace(/^import\s+['"].*?index\.css['"];?\s*/gm, '');
  
  // Eliminar imports de lucide-react (los iconos ya están declarados arriba)
  processed = processed.replace(/^import\s+{([^}]+)}\s+from\s+['"]lucide-react['"];?\s*/gm, '');
  
  // Eliminar imports de componentes locales (ya estarán definidos antes)
  processed = processed.replace(/^import\s+(\w+)\s+from\s+['"]\.\/components\/(\w+)['"];?\s*/gm, '');
  
  // Eliminar export default y dejar solo la función/componente
  processed = processed.replace(/export\s+default\s+/g, '');
  
  // Limpiar líneas en blanco múltiples (pero no eliminar líneas con código válido)
  processed = processed.replace(/\n{3,}/g, '\n\n');
  
  // Eliminar solo líneas que sean exportaciones de funciones o componentes al final
  // NO eliminar variables o expresiones dentro del código
  // Solo eliminar si la línea contiene solo un identificador seguido opcionalmente por punto y coma
  // Y está seguida por una línea que comienza con comentario o está al final
  processed = processed.replace(/^(\s*)([A-Z][a-zA-Z0-9]*)\s*;?\s*$/gm, (match, indent, name) => {
    // Solo eliminar si está completamente alineado al margen izquierdo (probablemente export)
    // o si es un nombre que podría ser un export default
    if (indent === '' && /^(CommandPatternDemo|CommandScenariosDeep|App)$/.test(name)) {
      return '';
    }
    return match;
  });
  
  return processed.trim();
}

// Leer archivos
const indexCss = fs.readFileSync(path.join(__dirname, 'src/index.css'), 'utf8');
const indexJs = fs.readFileSync(path.join(__dirname, 'src/index.js'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, 'src/App.js'), 'utf8');
const commandDemo = fs.readFileSync(path.join(__dirname, 'src/components/CommandPatternDemo.js'), 'utf8');
const commandScenarios = fs.readFileSync(path.join(__dirname, 'src/components/CommandScenariosDeep.js'), 'utf8');

// Procesar archivos
const processedIndexJs = processCode(indexJs, 'index.js');
const processedAppJs = processCode(appJs, 'App.js');
const processedCommandDemo = processCode(commandDemo, 'CommandPatternDemo.js');
const processedCommandScenarios = processCode(commandScenarios, 'CommandScenariosDeep.js');

// Crear HTML standalone
const standaloneHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Demostración avanzada del patrón Command" />
    <title>Patrón Command - Demo Avanzada</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- React y ReactDOM desde CDN -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <!-- Babel Standalone para transpilar JSX -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <style>
${indexCss}
    </style>
</head>
<body>
    <noscript>Necesitas habilitar JavaScript para ejecutar esta app.</noscript>
    <div id="root"></div>
    
    <script type="text/babel">
        const { useState } = React;
        
        // ============================================
        // COMPONENTES DE ICONOS (reemplazo de lucide-react)
        // ============================================
${Object.keys(icons).map(iconName => `
        const ${iconName} = ({ className = '', style, ...props }) => {
            return React.createElement('span', {
                className: className,
                style: { display: 'inline-flex', alignItems: 'center', ...style },
                dangerouslySetInnerHTML: { __html: \`${icons[iconName]}\` },
                ...props
            });
        };`).join('\n')}
        
        // ============================================
        // CommandPatternDemo Component
        // ============================================
${processedCommandDemo}
        
        // ============================================
        // CommandScenariosDeep Component
        // ============================================
${processedCommandScenarios}
        
        // ============================================
        // App Component
        // ============================================
${processedAppJs}
        
        // ============================================
        // Inicialización
        // ============================================
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
            React.createElement(React.StrictMode, null,
                React.createElement(App)
            )
        );
    </script>
</body>
</html>`;

// Guardar archivo
fs.writeFileSync(path.join(__dirname, 'index-standalone.html'), standaloneHTML, 'utf8');
console.log('✅ Archivo index-standalone.html generado exitosamente!');
console.log('📁 Abre el archivo index-standalone.html en tu navegador');

