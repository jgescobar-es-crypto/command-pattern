<?php
namespace App\Models;

class Order {
    public $id;
    public $status;
}
namespace App\Commands;
// ============================================
// INTERFAZ COMMAND - Define el contrato
// ============================================
interface Command
{
    public function execute(): void;
}

// ============================================
// SERVICIO ORDER - Implementa la lógica de negocio (receiver)
// ============================================
namespace App\Services;
use App\Models\Order;
class OrderService
{
    public function confirm(Order $order)
    {
        $order->status = 'confirmed';
        $order->save();

        Log::info("Orden {$order->id} confirmada.");
    }

    public function cancel(Order $order)
    {
        $order->status = 'cancelled';
        $order->save();

        Log::info("Orden {$order->id} cancelada.");
    }
}

// ============================================
// COMANDO CONFIRM ORDER - Implementa el comando (command)
// ============================================
namespace App\Commands;

use App\Models\Order;
use App\Services\OrderService;

class ConfirmOrderCommand implements Command
{
    public function __construct(
        private OrderService $service,
        private Order $order
    ) {}

    public function execute(): void
    {
        $this->service->confirm($this->order);
    }
}


// ============================================
// COMANDO CANCEL ORDER - Implementa el comando (command)
// ============================================
namespace App\Commands;

use App\Models\Order;
use App\Services\OrderService;

class CancelOrderCommand implements Command
{
    public function __construct(
        private OrderService $service,
        private Order $order
    ) {}

    public function execute(): void
    {
        $this->service->cancel($this->order);
    }
}

// ============================================
// INVOKER - Maneja la ejecución de comandos (invoker)
// ============================================
namespace App\Commands;

class CommandInvoker
{
    private array $commands = [];

    public function addCommand(Command $command)
    {
        $this->commands[] = $command;
    }

    public function executeAll()
    {
        foreach ($this->commands as $command) {
            $command->execute();
        }

        $this->commands = []; // Limpia después de ejecutar
    }
}


// ============================================
// CONTROLADOR ORDER - Maneja las peticiones HTTP
// ============================================
namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderService;
use App\Commands\{
    ConfirmOrderCommand,
    CancelOrderCommand,
    CommandInvoker
};

class OrderController extends Controller
{
    public function updateStatus($id)
    {
        $order = Order::findOrFail($id);
        $service = new OrderService();

        // Crear comandos
        $confirmCommand = new ConfirmOrderCommand($service, $order);
        $cancelCommand = new CancelOrderCommand($service, $order);

        // Invoker
        $invoker = new CommandInvoker();
        $invoker->addCommand($confirmCommand);
        $invoker->addCommand($cancelCommand); // Podrías tener múltiples acciones

        // Ejecutar todos los comandos
        $invoker->executeAll();

        return response()->json(['message' => 'Comandos ejecutados correctamente']);
    }
}