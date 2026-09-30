import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './db.js';
import { serialManager } from './hardware/serialManager.js';
import catalogRoutes from './routes/catalog.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import systemRoutes from './routes/system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets (product graphics and icons)
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Create HTTP and WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WebSocket] Kiosk Client connected. Total active connections: ${clients.size}`);

  // Send initial handshake state
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    timestamp: Date.now(),
    hardware: serialManager.getStatus()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch {
      // Ignore non-json
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WebSocket] Client disconnected. Total active connections: ${clients.size}`);
  });

  ws.on('error', (err) => {
    console.warn(`[WebSocket] Client error:`, err.message);
  });
});

export function broadcastEvent(type, payload = {}) {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: Date.now()
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Wire SerialManager events to real-time WebSocket stream
serialManager.on('dispense_step_start', (data) => {
  broadcastEvent('DISPENSING_PROGRESS', {
    ...data,
    state: 'STARTING'
  });
});

serialManager.on('item_progress', (data) => {
  broadcastEvent('DISPENSING_PROGRESS', data);
});

serialManager.on('dispense_step_complete', (data) => {
  broadcastEvent('DISPENSE_STEP_COMPLETE', data);
});

serialManager.on('status', (data) => {
  broadcastEvent('HARDWARE_STATUS', data);
});

// API Routes
app.use('/api/catalog', catalogRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/system', systemRoutes);

// Health check root
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AeroVend Kiosk Backend' });
});

// Initialize database & hardware
try {
  initDatabase();
  serialManager.initialize();
} catch (err) {
  console.error('Fatal initialization error:', err);
}

server.listen(PORT, () => {
  console.log(`🚀 AeroVend Kiosk Backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server streaming on ws://localhost:${PORT}`);
});
