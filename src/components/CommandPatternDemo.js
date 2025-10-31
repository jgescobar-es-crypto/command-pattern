import React, { useState } from 'react';
import { Undo2, Redo2, Play, Pause, RotateCcw, FileText } from 'lucide-react';

// ============================================
// RECEPTOR (RECEIVER) - El objeto que realiza el trabajo real
// ============================================
// El Receptor es el objeto que contiene la lógica de negocio real.
// Es el que realmente ejecuta las operaciones cuando se invocan.
// En el patrón Command, NO llamamos directamente a estos métodos,
// sino que los encapsulamos dentro de objetos Command.
// 
// VENTAJA: El Receptor no conoce nada sobre comandos, undo/redo, o historial.
// Es completamente independiente y reutilizable.
class DocumentEditor {
  constructor() {
    this.content = '';
    this.fontSize = 16;
    this.fontWeight = 'normal';
    this.textColor = '#000000'; // Color por defecto
  }

  // Método que realiza la inserción de texto
  // Esta es la operación "real" que queremos encapsular en un comando
  insertText(text, position) {
    const before = this.content.slice(0, position);
    const after = this.content.slice(position);
    this.content = before + text + after;
  }

  // Método que realiza la eliminación de texto
  // Nota: Este método NO guarda lo que elimina (eso lo hará el comando)
  deleteText(position, length) {
    const before = this.content.slice(0, position);
    const after = this.content.slice(position + length);
    this.content = before + after;
  }

  // Cambia el tamaño de fuente
  changeFontSize(size) {
    this.fontSize = size;
  }

  changeFontWeight(weight) {
    this.fontWeight = weight;
  }

  changeTextColor(color) {
    this.textColor = color;
  }

  // Obtiene el estado actual del editor (para sincronizar UI)
  getState() {
    return {
      content: this.content,
      fontSize: this.fontSize,
      fontWeight: this.fontWeight,
      textColor: this.textColor
    };
  }

  // Restaura el estado completo del editor
  setState(state) {
    this.content = state.content;
    this.fontSize = state.fontSize;
    this.fontWeight = state.fontWeight;
    this.textColor = state.textColor || '#000000';
  }
}

// ============================================
// INTERFAZ COMMAND - Define el contrato común
// ============================================
// Esta es la interfaz base que define QUÉ debe hacer un comando.
// NO define CÓMO lo hace (eso lo hacen las clases concretas).
//
// CONCEPTO CLAVE: Un comando es un objeto que encapsula:
//   1. La acción a realizar (execute)
//   2. Cómo deshacerla (undo)
//   3. Información sobre sí mismo (getDescription)
//
// VENTAJA: Podemos tratar todos los comandos igual (polimorfismo),
// sin importar qué acción específica realizan.
class Command {
  // Método que ejecuta la acción encapsulada
  // Cada comando concreto implementará su propia lógica
  execute() {
    throw new Error('execute() debe ser implementado');
  }

  // Método que revierte la acción ejecutada
  // CONCEPTO CLAVE: Para hacer undo, necesitamos saber el estado anterior.
  // Por eso los comandos guardan información necesaria para revertir.
  undo() {
    throw new Error('undo() debe ser implementado');
  }

  // Devuelve una descripción legible del comando (para historial, logs, etc.)
  getDescription() {
    return 'Comando genérico';
  }
}

// ============================================
// COMANDOS CONCRETOS (CONCRETE COMMANDS)
// ============================================
// Cada comando concreto encapsula una operación específica del Receptor.
// Guarda toda la información necesaria para:
//   - Ejecutar la acción
//   - Deshacerla si es necesario

// Comando para insertar texto
class InsertTextCommand extends Command {
  // El constructor guarda toda la información necesaria para ejecutar y deshacer
  // CONCEPTO: El comando "recuerda" el editor, el texto y la posición
  constructor(editor, text, position) {
    super();
    this.editor = editor;      // Referencia al receptor
    this.text = text;          // El texto a insertar (se guarda para poder deshacer)
    this.position = position;  // Dónde insertarlo
  }

  // Ejecuta la acción real delegando al Receptor
  // Este es el "execute" del patrón: encapsula la llamada al receptor
  execute() {
    this.editor.insertText(this.text, this.position);
  }

  // Deshace la acción: elimina el texto que insertamos
  // Para deshacer, necesitamos saber qué texto insertamos y dónde
  undo() {
    this.editor.deleteText(this.position, this.text.length);
  }

  getDescription() {
    return `Insertar: "${this.text.substring(0, 20)}${this.text.length > 20 ? '...' : ''}"`;
  }
}

// Comando para eliminar texto
class DeleteTextCommand extends Command {
  constructor(editor, position, length) {
    super();
    this.editor = editor;
    this.position = position;
    this.length = length;
    // CONCEPTO CLAVE: Guardamos el texto eliminado ANTES de eliminarlo
    // porque una vez eliminado, no podríamos recuperarlo para el undo
    this.deletedText = '';
  }

  execute() {
    // PASO CRÍTICO: Primero guardamos lo que vamos a eliminar
    // Esto es necesario porque una vez que llamamos a deleteText(),
    // el texto ya no existe y no podríamos recuperarlo para undo()
    this.deletedText = this.editor.content.slice(this.position, this.position + this.length);
    // Ahora sí eliminamos
    this.editor.deleteText(this.position, this.length);
  }

  // Para deshacer una eliminación, simplemente reinsertamos el texto guardado
  undo() {
    this.editor.insertText(this.deletedText, this.position);
  }

  getDescription() {
    return `Eliminar: "${this.deletedText.substring(0, 20)}${this.deletedText.length > 20 ? '...' : ''}"`;
  }
}

// Comando para cambiar el tamaño de fuente
class ChangeFontSizeCommand extends Command {
  constructor(editor, newSize) {
    super();
    this.editor = editor;
    this.newSize = newSize;
    // CONCEPTO CLAVE: Guardamos el valor ANTERIOR antes de cambiarlo
    // Esto es esencial para poder hacer undo
    this.oldSize = editor.fontSize;
  }

  execute() {
    this.editor.changeFontSize(this.newSize);
  }

  // Para deshacer, simplemente restauramos el valor anterior que guardamos
  undo() {
    this.editor.changeFontSize(this.oldSize);
  }

  getDescription() {
    return `Tamaño: ${this.oldSize}px → ${this.newSize}px`;
  }
}

// Comando para cambiar el peso de fuente
class ChangeFontWeightCommand extends Command {
  constructor(editor, newWeight) {
    super();
    this.editor = editor;
    this.newWeight = newWeight;
    // CONCEPTO CLAVE: Guardamos el valor ANTERIOR antes de cambiarlo
    // Esto es esencial para poder hacer undo
    this.oldWeight = editor.fontWeight;
  }

  execute() {
    this.editor.changeFontWeight(this.newWeight);
  }

  // Para deshacer, simplemente restauramos el valor anterior que guardamos
  undo() {
    this.editor.changeFontWeight(this.oldWeight);
  }

  getDescription() {
    return `Peso: ${this.oldWeight} → ${this.newWeight}`;
  }
}

// ============================================
// NUEVO COMANDO - Ejemplo de EXTENSIBILIDAD
// ============================================
// Este es un ejemplo de cómo el patrón Command permite agregar
// nuevas funcionalidades SIN modificar código existente.
//
// SOLO necesitamos:
// 1. Agregar el método en el Receptor (DocumentEditor.changeTextColor)
// 2. Crear una nueva clase Command (ChangeTextColorCommand)
// 3. Usarlo en el componente React
//
// NO necesitamos modificar:
// - CommandInvoker (funciona con cualquier Command)
// - Comandos existentes (InsertTextCommand, DeleteTextCommand, etc.)
// - La interfaz Command (es polimórfica)
//
// ESTO ES EXTENSIBILIDAD: Open/Closed Principle
// "Abierto para extensión, cerrado para modificación"
class ChangeTextColorCommand extends Command {
  constructor(editor, newColor) {
    super();
    this.editor = editor;
    this.newColor = newColor;
    // Guardamos el color anterior para poder hacer undo
    this.oldColor = editor.textColor;
  }

  execute() {
    this.editor.changeTextColor(this.newColor);
  }

  undo() {
    this.editor.changeTextColor(this.oldColor);
  }

  getDescription() {
    return `Color: ${this.oldColor} → ${this.newColor}`;
  }
}

// ============================================
// MACRO COMMAND - Comando compuesto
// ============================================
// Un MacroCommand es un comando que contiene otros comandos.
// Permite ejecutar múltiples comandos como si fueran uno solo.
//
// CASOS DE USO:
//   - Secuencias de operaciones comunes (ej: "Formatear documento")
//   - Transacciones (ejecutar todos o ninguno)
//   - Scripts de operaciones
//
// CONCEPTO: Demuestra el poder del patrón - podemos componer comandos
// porque todos implementan la misma interfaz (polimorfismo).
class MacroCommand extends Command {
  constructor(commands, description = 'Macro') {
    super();
    this.commands = commands;      // Array de comandos a ejecutar
    this.description = description;
  }

  // Ejecuta todos los comandos en orden
  execute() {
    this.commands.forEach(cmd => cmd.execute());
  }

  // CONCEPTO CLAVE: Deshacer en orden INVERSO
  // Si ejecutamos: cmd1 -> cmd2 -> cmd3
  // Para deshacer correctamente: undo3 -> undo2 -> undo1
  // Esto asegura que el estado vuelva exactamente al inicial
  undo() {
    // Deshacer en orden inverso
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  getDescription() {
    return this.description;
  }
}

// ============================================
// INVOKER - Maneja la ejecución de comandos
// ============================================
// El Invoker es el "coordinador" del patrón Command.
// Sus responsabilidades:
//   1. Ejecutar comandos
//   2. Mantener un historial para undo/redo
//   3. Controlar el flujo de comandos
//
// CONCEPTO CLAVE: El Invoker NO conoce qué hace cada comando específico,
// solo sabe que pueden ejecutarse y deshacerse (polimorfismo).
// Esto permite desacoplar completamente la lógica de negocio.
class CommandInvoker {
  constructor() {
    // Array que mantiene el historial completo de comandos ejecutados
    this.history = [];
    // Índice que apunta a la posición actual en el historial
    // -1 = ningún comando ejecutado, 0 = primer comando, etc.
    this.currentIndex = -1;
  }

  // Ejecuta un comando y lo agrega al historial
  execute(command) {
    // CASO ESPECIAL: Si el usuario hizo undo y luego ejecuta un nuevo comando,
    // eliminamos los comandos "futuros" porque ya no son válidos.
    // Ejemplo: [cmd1, cmd2, cmd3] -> undo() -> undo() -> [cmd1, X, X]
    // Si ahora ejecuto cmd4, el historial queda: [cmd1, cmd4]
    // Esto es como una "bifurcación" en Git.
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Ejecutar el comando (delega al comando, que delega al receptor)
    command.execute();
    // Agregar al historial
    this.history.push(command);
    // Avanzar el índice
    this.currentIndex++;
  }

  // Deshace el último comando ejecutado
  undo() {
    if (this.canUndo()) {
      // Llamar a undo() del comando actual
      this.history[this.currentIndex].undo();
      // Retroceder el índice (ahora apunta al comando anterior)
      this.currentIndex--;
    }
  }

  // Re-ejecuta un comando que fue deshecho
  redo() {
    if (this.canRedo()) {
      // Avanzar primero el índice al siguiente comando
      this.currentIndex++;
      // Re-ejecutar ese comando
      this.history[this.currentIndex].execute();
    }
  }

  // Verifica si podemos deshacer (hay comandos ejecutados)
  canUndo() {
    return this.currentIndex >= 0;
  }

  // Verifica si podemos rehacer (hay comandos deshechos después del actual)
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  // Obtiene una representación del historial para la UI
  // 'isActive' indica si el comando está actualmente aplicado
  getHistory() {
    return this.history.map((cmd, idx) => ({
      description: cmd.getDescription(),
      // Un comando está activo si su índice <= currentIndex
      // Ejemplo: si currentIndex = 2, entonces comandos 0, 1, 2 están activos
      isActive: idx <= this.currentIndex
    }));
  }

  // Limpia todo el historial
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  // Obtiene los comandos activos (para replay)
  getActiveCommands() {
    return this.history.slice(0, this.currentIndex + 1);
  }
}

// ============================================
// COMPONENTE REACT - Orquesta el patrón Command
// ============================================
// Este componente demuestra cómo usar el patrón Command en la práctica:
//   1. Crea instancias del Receptor y del Invoker
//   2. Crea comandos concretos cuando el usuario realiza acciones
//   3. Delega la ejecución al Invoker
//   4. Actualiza la UI basándose en el estado del Receptor
//
// FLUJO TÍPICO:
//   Usuario hace clic -> Se crea un comando -> Invoker.execute() 
//   -> Comando.execute() -> Receptor hace el trabajo -> UI se actualiza
export default function CommandPatternDemo() {
  // Instancias persistentes (no se recrean en cada render)
  const [editor] = useState(() => new DocumentEditor());   // El Receptor
  const [invoker] = useState(() => new CommandInvoker());  // El Invoker
  
  // Estado para sincronizar la UI con el editor
  const [editorState, setEditorState] = useState(editor.getState());
  const [history, setHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isReplaying, setIsReplaying] = useState(false);

  // Actualiza la UI leyendo el estado del editor y del historial
  const updateUI = () => {
    setEditorState({ ...editor.getState() });
    setHistory(invoker.getHistory());
  };

  // Maneja la inserción de texto
  // PATRÓN EN ACCIÓN:
  //   1. Crear un comando concreto (InsertTextCommand)
  //   2. Pasarlo al Invoker para ejecutarlo
  //   3. El Invoker lo ejecuta y lo guarda en el historial
  //   4. Actualizamos la UI
  const handleInsertText = () => {
    if (inputText.trim()) {
      // Crear el comando concreto, pasando el receptor y los parámetros
      const cmd = new InsertTextCommand(editor, inputText, editor.content.length);
      // El Invoker se encarga de ejecutarlo y guardarlo en historial
      invoker.execute(cmd);
      setInputText('');
      updateUI();
    }
  };

  // Maneja la eliminación del último bloque de texto
  const handleDeleteLast = () => {
    if (editor.content.length > 0) {
      // Crear comando de eliminación
      const cmd = new DeleteTextCommand(editor, editor.content.length - 10, Math.min(10, editor.content.length));
      invoker.execute(cmd);
      updateUI();
    }
  };

  // Maneja el cambio de tamaño de fuente
  const handleChangeFontSize = (size) => {
    // Crear comando de cambio de tamaño
    const cmd = new ChangeFontSizeCommand(editor, size);
    invoker.execute(cmd);
    updateUI();
  };

  // Maneja el cambio de peso de fuente
  const handleChangeFontWeight = (weight) => {
    // Crear comando de cambio de peso
    const cmd = new ChangeFontWeightCommand(editor, weight);
    invoker.execute(cmd);
    updateUI();
  };

  // NUEVO HANDLER - Ejemplo de extensibilidad
  // Agregamos esta funcionalidad SIN modificar código existente
  const handleChangeTextColor = (color) => {
    const cmd = new ChangeTextColorCommand(editor, color);
    invoker.execute(cmd);
    updateUI();
  };

  // Demuestra el uso de MacroCommand (comandos compuestos)
  // CONCEPTO: Podemos crear comandos que contienen otros comandos
  const handleFormatText = () => {
    // Crear múltiples comandos que queremos ejecutar juntos
    const commands = [
      new InsertTextCommand(editor, '\n=== TEXTO FORMATEADO ===\n', editor.content.length),
      new ChangeFontSizeCommand(editor, 20)
    ];
    // Envolverlos en un MacroCommand (se ejecutan como uno solo)
    const macro = new MacroCommand(commands, 'Formato especial');
    // Ejecutar el macro - internamente ejecuta todos los comandos
    invoker.execute(macro);
    updateUI();
  };

  // Deshace el último comando ejecutado
  // El Invoker se encarga de llamar a undo() del comando actual
  const handleUndo = () => {
    invoker.undo();
    updateUI();
  };

  // Re-ejecuta un comando que fue deshecho
  const handleRedo = () => {
    invoker.redo();
    updateUI();
  };

  // Limpia el historial y resetea el editor
  const handleClear = () => {
    invoker.clear();
    editor.setState({ content: '', fontSize: 16, fontWeight: 'normal', textColor: '#000000' });
    updateUI();
  };

  // Reproduce el historial de comandos paso a paso
  // Demuestra cómo podemos "reproducir" una secuencia de comandos
  // CASO DE USO: Logs de auditoría, replay de acciones, etc.
  const replayHistory = async () => {
    if (history.length === 0) return;
    
    setIsReplaying(true);
    
    // Guardar los comandos activos ANTES de limpiar
    const activeCommands = invoker.getActiveCommands();
    
    // Limpiar el estado actual
    editor.setState({ content: '', fontSize: 16, fontWeight: 'normal', textColor: '#000000' });
    invoker.clear();
    updateUI();
    
    // Re-ejecutar cada comando con un delay para visualización
    for (let i = 0; i < activeCommands.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Crear una copia del comando para re-ejecutarlo
      // Nota: En un caso real, los comandos deberían ser clonables o inmutables
      // Por simplicidad, re-ejecutamos directamente desde el historial guardado
      const cmd = activeCommands[i];
      
      // Recrear el comando con los mismos parámetros
      // Esto funciona porque los comandos guardan toda la info necesaria
      invoker.execute(cmd);
      updateUI();
    }
    
    setIsReplaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Patrón Command
          </h1>
          <p className="text-xl text-purple-200">
            Sistema de Editor con Undo/Redo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Panel del Editor */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Editor de Documento
              </h2>
            </div>

            {/* Controles */}
            <div className="space-y-4 mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInsertText()}
                  placeholder="Escribe algo..."
                  className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleInsertText}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Insertar
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleDeleteLast}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Eliminar últimos 10
                </button>
                <button
                  onClick={() => handleChangeFontSize(20)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Grande (20px)
                </button>
                <button
                  onClick={() => handleChangeFontSize(16)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Normal (16px)
                </button>
                <button
                  onClick={() => handleChangeFontWeight('bold')}
                  className={`px-4 py-2 ${
                    editorState.fontWeight === 'bold'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white rounded-lg transition-colors`}
                >
                  Negrita
                </button>
                <button
                  onClick={() => handleChangeFontWeight('normal')}
                  className={`px-4 py-2 ${
                    editorState.fontWeight === 'normal'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white rounded-lg transition-colors`}
                >
                  Normal
                </button>
                {/* NUEVOS BOTONES - Ejemplo de extensibilidad */}
                <button
                  onClick={() => handleChangeTextColor('#ef4444')}
                  className={`px-4 py-2 ${
                    editorState.textColor === '#ef4444'
                      ? 'bg-red-700 hover:bg-red-800'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white rounded-lg transition-colors`}
                >
                  Rojo
                </button>
                <button
                  onClick={() => handleChangeTextColor('#3b82f6')}
                  className={`px-4 py-2 ${
                    editorState.textColor === '#3b82f6'
                      ? 'bg-blue-700 hover:bg-blue-800'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white rounded-lg transition-colors`}
                >
                  Azul
                </button>
                <button
                  onClick={() => handleChangeTextColor('#10b981')}
                  className={`px-4 py-2 ${
                    editorState.textColor === '#10b981'
                      ? 'bg-green-700 hover:bg-green-800'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white rounded-lg transition-colors`}
                >
                  Verde
                </button>
                <button
                  onClick={() => handleChangeTextColor('#000000')}
                  className={`px-4 py-2 ${
                    editorState.textColor === '#000000'
                      ? 'bg-gray-700 hover:bg-gray-800'
                      : 'bg-gray-600 hover:bg-gray-700'
                  } text-white rounded-lg transition-colors`}
                >
                  Negro
                </button>
                <button
                  onClick={handleFormatText}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Macro: Formato
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  disabled={!invoker.canUndo()}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Undo2 className="w-4 h-4" />
                  Deshacer
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!invoker.canRedo()}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Redo2 className="w-4 h-4" />
                  Rehacer
                </button>
              </div>
            </div>

            {/* Vista del documento */}
            <div className="bg-white rounded-lg p-4 min-h-[200px]">
              <div
                style={{
                  fontSize: `${editorState.fontSize}px`,
                  fontWeight: editorState.fontWeight,
                  color: editorState.textColor
                }}
                className="whitespace-pre-wrap break-words"
              >
                {editorState.content || 'El documento está vacío...'}
              </div>
            </div>

            <div className="mt-4 text-sm text-purple-200">
              Tamaño: {editorState.fontSize}px | Peso: {editorState.fontWeight} | Color: {editorState.textColor} | Caracteres: {editorState.content.length}
            </div>
          </div>

          {/* Panel de Historial */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                Historial de Comandos
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={replayHistory}
                  disabled={isReplaying || history.length === 0}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  {isReplaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  Reproducir
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-auto">
              {history.length === 0 ? (
                <div className="text-center text-purple-300 py-8">
                  No hay comandos en el historial
                </div>
              ) : (
                history.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      item.isActive
                        ? 'bg-purple-600/30 border-purple-400'
                        : 'bg-gray-600/30 border-gray-500'
                    } transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-mono text-sm">
                        {idx + 1}. {item.description}
                      </span>
                      {!item.isActive && (
                        <span className="text-xs text-gray-400">
                          (deshecho)
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Documentación */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            📚 Documentación del Patrón Command
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            <div>
              <h3 className="text-xl font-bold text-purple-300 mb-2">✅ Cuándo Usarlo</h3>
              <ul className="space-y-2 text-sm text-purple-100">
                <li>• Necesitas deshacer/rehacer operaciones</li>
                <li>• Quieres parametrizar objetos con acciones</li>
                <li>• Necesitas encolar operaciones (job queues)</li>
                <li>• Requieres auditoría de operaciones</li>
                <li>• Implementar macros o transacciones</li>
                <li>• Desacoplar invocador de receptor</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-red-300 mb-2">❌ Cuándo NO Usarlo</h3>
              <ul className="space-y-2 text-sm text-red-100">
                <li>• Operaciones simples sin historial</li>
                <li>• Alto costo de memoria por historial</li>
                <li>• Rendimiento crítico (overhead)</li>
                <li>• Comandos no reversibles fácilmente</li>
                <li>• Sistema muy simple sin necesidad</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-green-300 mb-2">🎯 Ventajas</h3>
              <ul className="space-y-2 text-sm text-green-100">
                <li>• Desacoplamiento total</li>
                <li>• Undo/Redo incorporado</li>
                <li>• Extensible (nuevos comandos)</li>
                <li>• Comandos compuestos (macros)</li>
                <li>• Registro de operaciones</li>
                <li>• Single Responsibility Principle</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-yellow-300 mb-2">⚠️ Desventajas</h3>
              <ul className="space-y-2 text-sm text-yellow-100">
                <li>• Muchas clases pequeñas</li>
                <li>• Consumo de memoria (historial)</li>
                <li>• Complejidad adicional</li>
                <li>• Difícil undo en operaciones complejas</li>
                <li>• Overhead en operaciones simples</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}