import React, { useState } from 'react';
import { FileText, Database, Gamepad2, Zap, Cloud, Monitor, ChevronRight, Code2 } from 'lucide-react';

const scenarios = [
  {
    id: 'editors',
    icon: FileText,
    title: '1. Editores de Texto/Imágenes',
    subtitle: 'Photoshop, Word, VS Code, Figma',
    color: 'from-blue-500 to-cyan-500',
    problems: [
      'Múltiples operaciones complejas sobre el mismo documento',
      'Usuarios esperan poder deshacer cualquier acción',
      'Necesidad de macros y automatización',
      'Historial de cambios para colaboración'
    ],
    whyPerfect: [
      'Cada operación (tipear, formatear, dibujar) es un comando discreto',
      'El estado del documento puede ser modificado y restaurado',
      'Undo/Redo es FUNDAMENTAL para la experiencia de usuario',
      'Comandos compuestos permiten "Acciones" (macros de Photoshop)'
    ],
    architecture: `// ARQUITECTURA REAL
class PhotoshopCommand {
  execute() {}
  undo() {}
  serialize() {} // Para guardar acciones
}

class ApplyFilterCommand extends PhotoshopCommand {
  constructor(layer, filter, params) {
    this.layer = layer;
    this.filter = filter;
    this.params = params;
    this.originalPixels = null;
  }
  
  execute() {
    this.originalPixels = this.layer.getPixelData();
    this.layer.applyFilter(this.filter, this.params);
  }
  
  undo() {
    this.layer.setPixelData(this.originalPixels);
  }
}`,
    realExample: 'VS Code: Cada keystroke, format document, refactor es un comando. El historial permite Ctrl+Z infinito.',
    metrics: 'Photoshop: ~10,000 comandos en historial. VS Code: ~1,000 comandos/sesión promedio.'
  },
  {
    id: 'transactions',
    icon: Database,
    title: '2. Sistemas Transaccionales',
    subtitle: 'Bancos, E-commerce, Bases de Datos',
    color: 'from-green-500 to-emerald-500',
    problems: [
      'Operaciones deben ser atómicas (todo o nada)',
      'Rollback automático en caso de error',
      'Auditoría completa de todas las operaciones',
      'Compensación de transacciones distribuidas'
    ],
    whyPerfect: [
      'Cada operación financiera es un comando transaccional',
      'El método undo() implementa la lógica de compensación',
      'Permite implementar el patrón Saga en microservicios',
      'Historial de comandos = auditoría automática'
    ],
    architecture: `class TransactionalCommand extends Command {
  async execute() {
    try {
      await this.doExecute();
      this.executed = true;
      await this.logAudit();
    } catch (error) {
      await this.undo();
      throw error;
    }
  }
}

class TransferMoneyCommand extends TransactionalCommand {
  constructor(fromAccount, toAccount, amount) {
    super();
    this.from = fromAccount;
    this.to = toAccount;
    this.amount = amount;
  }
  
  async doExecute() {
    this.fromBalance = await this.from.getBalance();
    this.toBalance = await this.to.getBalance();
    
    await this.from.debit(this.amount);
    await this.to.credit(this.amount);
  }
  
  async undo() {
    await this.from.setBalance(this.fromBalance);
    await this.to.setBalance(this.toBalance);
  }
}`,
    realExample: 'Stripe: Cada operación de pago es un comando. MongoDB: Transacciones multi-documento usan este patrón.',
    metrics: 'Sistemas bancarios: 100% operaciones auditadas. Rollback: 0.1-1% de transacciones.'
  },
  {
    id: 'games',
    icon: Gamepad2,
    title: '3. Desarrollo de Videojuegos',
    subtitle: 'Replay Systems, Turn-based Games',
    color: 'from-purple-500 to-pink-500',
    problems: [
      'Necesidad de replay para debugging y esports',
      'Undo en editores de niveles',
      'Sincronización en juegos multijugador',
      'Sistema de "time travel" para debugging'
    ],
    whyPerfect: [
      'Cada input del jugador es un comando serializable',
      'Replay = re-ejecutar secuencia de comandos',
      'Determinismo garantizado (mismo input = mismo resultado)',
      'Eficiente: solo guardar comandos, no todo el estado'
    ],
    architecture: `class GameCommand {
  constructor(tick) {
    this.tick = tick; // Frame number
  }
  
  execute(gameState) {}
  serialize() {}
}

class MovePlayerCommand extends GameCommand {
  constructor(tick, playerId, direction) {
    super(tick);
    this.playerId = playerId;
    this.direction = direction;
  }
  
  execute(gameState) {
    const player = gameState.getPlayer(this.playerId);
    player.move(this.direction);
  }
}

class ReplaySystem {
  constructor() {
    this.commands = [];
  }
  
  record(command) {
    this.commands.push(command.serialize());
  }
  
  replay(initialState) {
    const state = initialState.clone();
    for (const cmdData of this.commands) {
      const cmd = GameCommand.deserialize(cmdData);
      cmd.execute(state);
    }
    return state;
  }
}`,
    realExample: 'StarCraft 2: Replay de 1 hora = ~5MB (solo comandos). Dota 2: Sincronización lockstep.',
    metrics: 'Juegos RTS: ~100 comandos/segundo/jugador. Replay: 0.1% del tamaño de video.'
  },
  {
    id: 'automation',
    icon: Zap,
    title: '4. Automatización y Macros',
    subtitle: 'RPA, Testing, Browser Automation',
    color: 'from-yellow-500 to-orange-500',
    problems: [
      'Secuencias de acciones repetitivas',
      'Scripts reutilizables y compartibles',
      'Testing E2E con pasos discretos',
      'Automatización robusta con recuperación de errores'
    ],
    whyPerfect: [
      'Cada acción es un comando grabable y reproducible',
      'Macros son MacroCommands (composite)',
      'Fácil pause/resume/retry en caso de error',
      'Scripts pueden ser editados como lista de comandos'
    ],
    architecture: `class AutomationCommand {
  constructor() {
    this.retries = 3;
    this.timeout = 5000;
  }
  
  async execute() {
    for (let i = 0; i < this.retries; i++) {
      try {
        return await this.doExecute();
      } catch (error) {
        if (i === this.retries - 1) throw error;
        await this.wait(1000 * (i + 1));
      }
    }
  }
}

class MacroRecorder {
  constructor() {
    this.commands = [];
    this.recording = false;
  }
  
  start() {
    this.recording = true;
    browser.on('click', (target) => {
      this.commands.push(
        new ClickElementCommand(target.selector)
      );
    });
  }
  
  stop() {
    this.recording = false;
    return new MacroCommand(this.commands);
  }
}`,
    realExample: 'Selenium: Cada acción es un comando. UiPath: Flujos como secuencia de comandos.',
    metrics: 'Test suites: 100-1000 comandos/test. Reutilización: 60-80% de comandos compartidos.'
  },
  {
    id: 'distributed',
    icon: Cloud,
    title: '5. Sistemas Distribuidos',
    subtitle: 'Message Queues, Event Sourcing',
    color: 'from-indigo-500 to-blue-500',
    problems: [
      'Procesamiento asíncrono de tareas',
      'Retry logic robusto',
      'Dead letter queues para fallos',
      'Event sourcing y CQRS'
    ],
    whyPerfect: [
      'Comandos son naturalmente serializables para colas',
      'Cada mensaje es un comando a ejecutar',
      'Idempotencia fácil de implementar',
      'Event store = historial de comandos persistido'
    ],
    architecture: `class DistributedCommand {
  constructor() {
    this.id = generateUUID();
    this.attempts = 0;
    this.maxAttempts = 3;
  }
  
  serialize() {
    return JSON.stringify({
      type: this.constructor.name,
      id: this.id,
      data: this.getData()
    });
  }
}

class MessageQueueProcessor {
  async process() {
    const message = await queue.dequeue();
    const command = DistributedCommand.deserialize(message);
    
    try {
      await command.execute();
      await queue.ack(message);
    } catch (error) {
      if (command.attempts >= command.maxAttempts) {
        await deadLetterQueue.enqueue(command);
      } else {
        await queue.retry(command);
      }
    }
  }
}`,
    realExample: 'Kafka: Cada evento es un comando serializado. AWS SQS/Lambda: Mensajes como comandos.',
    metrics: 'Throughput: 10K-1M comandos/seg. Event stores: TB de comandos históricos.'
  },
  {
    id: 'ui',
    icon: Monitor,
    title: '6. Frameworks UI Modernos',
    subtitle: 'Redux, Vuex, State Management',
    color: 'from-red-500 to-rose-500',
    problems: [
      'Gestión predecible del estado',
      'Time-travel debugging',
      'Hot reload sin perder estado',
      'Trazabilidad de cambios en UI'
    ],
    whyPerfect: [
      'Actions de Redux son literalmente comandos',
      'Reducer = execute(), con estado inmutable',
      'DevTools pueden reproducir cualquier secuencia',
      'Middleware = interceptor de comandos'
    ],
    architecture: `// Redux es Command Pattern
const INCREMENT = 'INCREMENT';

function increment(amount) {
  return {
    type: INCREMENT,
    payload: { amount }
  };
}

function counterReducer(state = 0, action) {
  switch (action.type) {
    case INCREMENT:
      return state + action.payload.amount;
    default:
      return state;
  }
}

class Store {
  constructor(reducer) {
    this.reducer = reducer;
    this.state = reducer(undefined, {});
    this.history = [];
  }
  
  dispatch(action) {
    this.history.push({ action, prevState: this.state });
    this.state = this.reducer(this.state, action);
  }
  
  jumpToAction(index) {
    this.state = this.reducer(undefined, {});
    for (let i = 0; i <= index; i++) {
      this.state = this.reducer(
        this.state, 
        this.history[i].action
      );
    }
  }
}`,
    realExample: 'Redux DevTools: Time-travel de cualquier acción. React useReducer es Command Pattern.',
    metrics: 'Apps grandes: 200-500 tipos de acciones. Replay de 1000+ acciones en <100ms.'
  }
];

export default function CommandScenariosDeep() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [showCode, setShowCode] = useState(false);

  const ScenarioIcon = selectedScenario.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎯 Escenarios Perfectos
          </h1>
          <p className="text-xl text-slate-300">
            Análisis profundo de cuándo y por qué usar el Patrón Command
          </p>
        </div>

        {/* Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            const isSelected = selectedScenario.id === scenario.id;
            
            return (
              <button
                key={scenario.id}
                onClick={() => {
                  setSelectedScenario(scenario);
                  setShowCode(false);
                }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-white bg-white/10 scale-105'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${scenario.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {scenario.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {scenario.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detailed View */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 overflow-hidden">
          {/* Header */}
          <div className={`p-6 bg-gradient-to-r ${selectedScenario.color}`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <ScenarioIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {selectedScenario.title}
                </h2>
                <p className="text-white/80">
                  {selectedScenario.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Toggle Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowCode(!showCode)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Code2 className="w-4 h-4" />
                {showCode ? 'Ver Análisis' : 'Ver Código'}
              </button>
            </div>

            {!showCode ? (
              <div className="space-y-6">
                {/* Problems */}
                <div>
                  <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                    <span>🔴</span> Problemas que Resuelve
                  </h3>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedScenario.problems.map((problem, idx) => (
                        <li key={idx} className="text-slate-300 flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <span>{problem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Why Perfect */}
                <div>
                  <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                    <span>✅</span> Por Qué Command es Perfecto
                  </h3>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedScenario.whyPerfect.map((reason, idx) => (
                        <li key={idx} className="text-slate-300 flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Real Example */}
                <div>
                  <h3 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <span>💡</span> Ejemplo Real del Mundo
                  </h3>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-slate-300 leading-relaxed">
                      {selectedScenario.realExample}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h3 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
                    <span>📊</span> Métricas y Datos
                  </h3>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-slate-300 leading-relaxed font-mono text-sm">
                      {selectedScenario.metrics}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
                  <Code2 className="w-6 h-6" />
                  Arquitectura e Implementación
                </h3>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm leading-relaxed">
                    <code>{selectedScenario.architecture}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Table */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              📋 Resumen Comparativo
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Escenario</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Característica</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Complejidad</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white">Editores</td>
                    <td className="py-3 px-4 text-slate-300">Undo/Redo ilimitado</td>
                    <td className="py-3 px-4 text-yellow-400">Media</td>
                    <td className="py-3 px-4 text-green-400">Muy Alto</td>
                  </tr>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white">Transacciones</td>
                    <td className="py-3 px-4 text-slate-300">Rollback/Auditoría</td>
                    <td className="py-3 px-4 text-orange-400">Alta</td>
                    <td className="py-3 px-4 text-green-400">Crítico</td>
                  </tr>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white">Videojuegos</td>
                    <td className="py-3 px-4 text-slate-300">Replay/Sync</td>
                    <td className="py-3 px-4 text-yellow-400">Media</td>
                    <td className="py-3 px-4 text-green-400">Alto</td>
                  </tr>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white">Automatización</td>
                    <td className="py-3 px-4 text-slate-300">Macros/Retry</td>
                    <td className="py-3 px-4 text-green-400">Baja</td>
                    <td className="py-3 px-4 text-green-400">Alto</td>
                  </tr>
                  <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white">Distribuidos</td>
                    <td className="py-3 px-4 text-slate-300">Event Sourcing</td>
                    <td className="py-3 px-4 text-orange-400">Alta</td>
                    <td className="py-3 px-4 text-green-400">Muy Alto</td>
                  </tr>
                  <tr className="hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white">UI Frameworks</td>
                    <td className="py-3 px-4 text-slate-300">Time-travel debug</td>
                    <td className="py-3 px-4 text-yellow-400">Media</td>
                    <td className="py-3 px-4 text-green-400">Alto</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            🎓 Conclusiones Clave
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-bold text-green-400 mb-2">✅ Úsalo cuando:</h3>
              <ul className="text-sm space-y-1 text-slate-300">
                <li>• Necesites deshacer operaciones</li>
                <li>• Requieras auditoría completa</li>
                <li>• Implementes macros o scripts</li>
                <li>• Gestiones transacciones complejas</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-bold text-red-400 mb-2">❌ Evítalo cuando:</h3>
              <ul className="text-sm space-y-1 text-slate-300">
                <li>• Operaciones simples CRUD</li>
                <li>• Memoria muy limitada</li>
                <li>• Latencia crítica</li>
                <li>• No necesites historial</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}