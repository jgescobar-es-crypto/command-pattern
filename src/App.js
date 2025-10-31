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
