import EventEmitter from 'events';

export class SerialManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.baudRate = options.baudRate || 115200;
    this.preferredPort = options.preferredPort || null;
    this.interMotorDelayMs = options.interMotorDelayMs || 1000; // Delay to prevent 12V current spikes
    this.motorRunDurationMs = options.motorRunDurationMs || 2400; // Standard 360-degree rotation time
    this.timeoutDurationMs = options.timeoutDurationMs || 5000; // 5s timeout protection

    this.port = null;
    this.parser = null;
    this.isMockMode = true; // Default fallback to mock until physical port connected
    this.isConnected = false;
    this.activePortPath = null;
    this.reconnectTimer = null;
    this.forceJamSlot = null; // For simulated testing of jam error handling

    // Command Queue State
    this.queue = [];
    this.isProcessingQueue = false;
    this.currentOperation = null;
    this.operationTimeoutTimer = null;

    // Buffer for line reading
    this.incomingBuffer = '';
  }

  async initialize() {
    console.log('[SerialManager] Initializing hardware bridge...');
    await this.scanAndConnect();
  }

  async scanAndConnect() {
    try {
      const serialPortModule = await import('serialport').catch(() => null);
      if (!serialPortModule) {
        console.log('[SerialManager] serialport module not present. Using Mock Hardware Mode.');
        this.enableMockMode();
        return;
      }

      const { SerialPort } = serialPortModule;
      const ports = await SerialPort.list();
      console.log(`[SerialManager] Available Serial Ports:`, ports.map(p => `${p.path} (${p.manufacturer || 'Generic'})`));

      // Try to find ESP32 or Silicon Labs / CH340 / FTDI or preferred port
      const targetPort = ports.find(p => 
        (this.preferredPort && p.path === this.preferredPort) ||
        (p.manufacturer && /espressif|silicon|ch340|ftdi|arduino/i.test(p.manufacturer)) ||
        (p.vendorId && ['10c4', '1a86', '0403', '303a'].includes(p.vendorId.toLowerCase()))
      );

      if (targetPort) {
        console.log(`[SerialManager] Attempting connection to ESP32 on ${targetPort.path}...`);
        this.connectToPort(targetPort.path, SerialPort);
      } else {
        console.log('[SerialManager] No physical ESP32 detected on serial ports. Running in High-Fidelity Mock Hardware Mode.');
        this.enableMockMode();
        this.scheduleAutoReconnect();
      }
    } catch (err) {
      console.warn(`[SerialManager] Serial scan error: ${err.message}. Running Mock Mode.`);
      this.enableMockMode();
      this.scheduleAutoReconnect();
    }
  }

  connectToPort(portPath, SerialPortClass) {
    try {
      this.port = new SerialPortClass({
        path: portPath,
        baudRate: this.baudRate,
        autoOpen: true
      });

      this.port.on('open', () => {
        this.isConnected = true;
        this.isMockMode = false;
        this.activePortPath = portPath;
        console.log(`[SerialManager] Connected to physical ESP32 on ${portPath} @ ${this.baudRate}bps.`);
        this.emit('status', this.getStatus());
      });

      this.port.on('data', (data) => {
        this.handleRawData(data);
      });

      this.port.on('close', () => {
        console.warn(`[SerialManager] Serial port ${portPath} closed.`);
        this.handleDisconnect();
      });

      this.port.on('error', (err) => {
        console.error(`[SerialManager] Serial port error:`, err.message);
        this.handleDisconnect();
      });
    } catch (err) {
      console.error(`[SerialManager] Failed to instantiate SerialPort on ${portPath}:`, err.message);
      this.enableMockMode();
      this.scheduleAutoReconnect();
    }
  }

  handleDisconnect() {
    this.isConnected = false;
    this.activePortPath = null;
    this.port = null;
    this.enableMockMode();
    this.emit('status', this.getStatus());
    this.scheduleAutoReconnect();
  }

  scheduleAutoReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setInterval(async () => {
      if (!this.isConnected) {
        try {
          const serialPortModule = await import('serialport').catch(() => null);
          if (serialPortModule) {
            const { SerialPort } = serialPortModule;
            const ports = await SerialPort.list();
            const target = ports.find(p => 
              (p.manufacturer && /espressif|silicon|ch340|ftdi|arduino/i.test(p.manufacturer)) ||
              (p.vendorId && ['10c4', '1a86', '0403', '303a'].includes(p.vendorId.toLowerCase()))
            );
            if (target) {
              console.log(`[SerialManager] ESP32 plugged in! Auto-connecting to ${target.path}...`);
              clearInterval(this.reconnectTimer);
              this.reconnectTimer = null;
              this.connectToPort(target.path, SerialPort);
            }
          }
        } catch {
          // Keep background polling
        }
      }
    }, 4000);
  }

  enableMockMode() {
    this.isMockMode = true;
    this.isConnected = true;
    this.activePortPath = 'MOCK_EMULATOR (Virtual ESP32 Bridge)';
    console.log('[SerialManager] Virtual ESP32 Hardware Emulator Active (Safe Mock Mode).');
    this.emit('status', this.getStatus());
  }

  handleRawData(buffer) {
    this.incomingBuffer += buffer.toString('utf-8');
    let newlineIndex;
    while ((newlineIndex = this.incomingBuffer.indexOf('\n')) !== -1) {
      const line = this.incomingBuffer.substring(0, newlineIndex).trim();
      this.incomingBuffer = this.incomingBuffer.substring(newlineIndex + 1);
      if (line) {
        this.processIncomingLine(line);
      }
    }
  }

  processIncomingLine(line) {
    try {
      const packet = JSON.parse(line);
      console.log(`[SerialManager] RX <-`, packet);
      this.handleHardwarePacket(packet);
    } catch {
      console.log(`[SerialManager] RX (raw debug) <- ${line}`);
    }
  }

  handleHardwarePacket(packet) {
    if (!this.currentOperation) return;

    const { status, slot } = packet;

    if (slot !== this.currentOperation.slotId) {
      console.warn(`[SerialManager] Received packet for slot ${slot}, but currently processing ${this.currentOperation.slotId}`);
      return;
    }

    if (status === 'ACK') {
      console.log(`[SerialManager] Slot ${slot} Dispense ACK received. Coil rotating.`);
      this.emit('item_progress', {
        slotId: slot,
        state: 'ROTATING',
        step: this.currentOperation.stepIndex,
        total: this.currentOperation.totalSteps
      });
    } else if (status === 'SUCCESS') {
      this.clearOperationTimeout();
      console.log(`[SerialManager] Slot ${slot} Dispense SUCCESS confirmed by drop sensor!`);
      this.emit('item_progress', {
        slotId: slot,
        state: 'DROPPED',
        step: this.currentOperation.stepIndex,
        total: this.currentOperation.totalSteps
      });
      const resolve = this.currentOperation.resolve;
      this.currentOperation = null;
      resolve({ success: true, slotId: slot });
    } else if (status === 'ERROR_JAM') {
      this.clearOperationTimeout();
      console.error(`[SerialManager] Slot ${slot} Hardware reported MOTOR_JAM / Drop Sensor Timeout!`);
      const reject = this.currentOperation.reject;
      this.currentOperation = null;
      reject(new Error(`Hardware Jam detected on Slot #${slot}`));
    }
  }

  /**
   * Enqueues an order's items for sequential dispensing.
   * Sequential execution prevents current overload on the 12V vending power supply.
   */
  async enqueueDispenseItems(items, transactionId) {
    // items is an array of { slotId, quantity, productName }
    const dispenseSteps = [];
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        dispenseSteps.push({
          slotId: item.slotId,
          productName: item.productName || `Slot #${item.slotId}`,
          unitIndex: i + 1,
          unitTotal: item.quantity,
          transactionId
        });
      }
    }

    return new Promise((resolve, reject) => {
      this.queue.push({
        transactionId,
        steps: dispenseSteps,
        resolve,
        reject
      });

      console.log(`[SerialManager] Enqueued transaction ${transactionId} with ${dispenseSteps.length} items. Queue depth: ${this.queue.length}`);
      this.emit('status', this.getStatus());
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessingQueue || this.queue.length === 0) return;
    this.isProcessingQueue = true;

    const currentBatch = this.queue.shift();
    const { transactionId, steps, resolve, reject } = currentBatch;
    const results = [];

    console.log(`[SerialManager] Starting dispense batch for Transaction: ${transactionId} (${steps.length} sequential items)`);

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Notify frontend about which item is starting
        this.emit('dispense_step_start', {
          transactionId,
          stepIndex: i + 1,
          totalSteps: steps.length,
          slotId: step.slotId,
          productName: step.productName
        });

        // Trigger the motor command and await ACK + SUCCESS
        const result = await this.executeSingleDispense(step.slotId, i + 1, steps.length);
        results.push(result);

        // Notify step completion
        this.emit('dispense_step_complete', {
          transactionId,
          stepIndex: i + 1,
          totalSteps: steps.length,
          slotId: step.slotId,
          productName: step.productName,
          success: result.success
        });

        // Safe inter-motor cooldown delay to prevent inrush current spikes
        if (i < steps.length - 1) {
          console.log(`[SerialManager] Inter-motor cooldown (${this.interMotorDelayMs}ms) to protect 12V rail...`);
          await new Promise(r => setTimeout(r, this.interMotorDelayMs));
        }
      }

      this.isProcessingQueue = false;
      this.emit('batch_complete', { transactionId, results });
      resolve({ transactionId, results, success: true });
      this.processQueue();
    } catch (err) {
      console.error(`[SerialManager] Dispense batch failed:`, err.message);
      this.isProcessingQueue = false;
      this.emit('batch_error', { transactionId, error: err.message });
      reject(err);
      this.processQueue();
    }
  }

  executeSingleDispense(slotId, stepIndex, totalSteps) {
    return new Promise((resolve, reject) => {
      this.currentOperation = {
        slotId,
        stepIndex,
        totalSteps,
        resolve,
        reject
      };

      const packet = {
        command: 'DISPENSE',
        slot: slotId,
        duration_ms: this.motorRunDurationMs
      };

      console.log(`[SerialManager] TX -> ${JSON.stringify(packet)}`);

      if (this.isMockMode) {
        this.simulateMockDispense(slotId, stepIndex, totalSteps, resolve, reject);
        return;
      }

      // Physical SerialPort transmission
      const payload = JSON.stringify(packet) + '\n';
      this.port.write(payload, (err) => {
        if (err) {
          this.currentOperation = null;
          return reject(new Error(`Failed to write to serial port: ${err.message}`));
        }

        // Set 5-second timeout protection
        this.operationTimeoutTimer = setTimeout(() => {
          console.error(`[SerialManager] ⚠️ TIMEOUT: ESP32 failed to respond within ${this.timeoutDurationMs}ms for Slot #${slotId}`);
          this.currentOperation = null;
          this.emit('timeout', { slotId });
          reject(new Error(`Motor timeout on Slot #${slotId}. Marked as potentially jammed.`));
        }, this.timeoutDurationMs);
      });
    });
  }

  simulateMockDispense(slotId, stepIndex, totalSteps, resolve, reject) {
    // Check if slot is forced to jam for testing
    if (this.forceJamSlot === slotId) {
      setTimeout(() => {
        this.emit('item_progress', { slotId, state: 'ROTATING', step: stepIndex, total: totalSteps });
      }, 400);

      setTimeout(() => {
        this.currentOperation = null;
        this.emit('item_progress', { slotId, state: 'JAMMED', step: stepIndex, total: totalSteps });
        reject(new Error(`Simulated physical jam on Slot #${slotId}`));
      }, 1800);
      return;
    }

    // Step 1: ACK simulation (Coil starts rotating)
    setTimeout(() => {
      this.emit('item_progress', { slotId, state: 'ROTATING', step: stepIndex, total: totalSteps });
    }, 350);

    // Step 2: Coil rotating & microswitch detection (1800ms)
    setTimeout(() => {
      this.emit('item_progress', { slotId, state: 'DROPPING', step: stepIndex, total: totalSteps });
    }, 1800);

    // Step 3: Infrared drop beam confirmed & motor stopped
    setTimeout(() => {
      this.emit('item_progress', { slotId, state: 'DROPPED', step: stepIndex, total: totalSteps });
      this.currentOperation = null;
      resolve({ success: true, slotId, mock: true });
    }, 2400);
  }

  clearOperationTimeout() {
    if (this.operationTimeoutTimer) {
      clearTimeout(this.operationTimeoutTimer);
      this.operationTimeoutTimer = null;
    }
  }

  setForceJam(slotId) {
    this.forceJamSlot = slotId;
    console.log(`[SerialManager] Testing: Forced Jam set for slot ${slotId}`);
  }

  getStatus() {
    return {
      connected: this.isConnected,
      isMock: this.isMockMode,
      activePort: this.activePortPath,
      queueLength: this.queue.length,
      isProcessing: this.isProcessingQueue,
      currentSlot: this.currentOperation ? this.currentOperation.slotId : null,
      baudRate: this.baudRate
    };
  }
}

export const serialManager = new SerialManager();
