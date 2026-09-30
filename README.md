# AeroVend Kiosk 32X — Full-Stack Smart Vending Machine System

A complete, production-grade, offline-capable kiosk application designed for a 32-slot smart vending machine running on an x86 Linux PC with an ESP32 hardware motor controller, embedded SQLite (WAL mode), real-time WebSockets, and a modern touch-optimized React/Vite SPA frontend.

---

## 🏗️ Architecture Overview

```
                                +-----------------------------+
                                |  1080p/4K Touchscreen Kiosk |
                                |   (Chromium Kiosk Mode)     |
                                +--------------+--------------+
                                               |
                                        HTTP & WebSockets
                                               |
                                               v
+-----------------------------------------------------------------------------------------+
| Local Node.js Backend Service (x86 Linux / Ubuntu / Debian)                             |
|                                                                                         |
|  +-----------------------+   +------------------------+   +---------------------------+ |
|  | Express REST Endpoints|   | WebSocket Event Stream |   | SQLite WAL Mode DB        | |
|  |  • /api/catalog       |   |  • CART_UPDATED        |   |  • slots (1-32)           | |
|  |  • /api/order/create  |   |  • PAYMENT_RECEIVED    |   |  • transactions           | |
|  |  • /api/order/direct  |   |  • DISPENSING_PROGRESS |   |  • transaction_items      | |
|  |  • /api/payment/webhook   |  • DISPENSE_COMPLETE   |   | (Power-Loss Protection)   | |
|  +-----------+-----------+   +-----------+------------+   +---------------------------+ |
|              |                           ^                                              |
|              +-------------+-------------+                                              |
|                            v                                                            |
|              +----------------------------------------+                                 |
|              | SerialManager Hardware Interface       |                                 |
|              |  • Ordered Dispense Command Queue      |                                 |
|              |  • 12V Inrush Current Spike Protection |                                 |
|              |  • 5s Timeout Protection & Auto-Reconnect                                |
|              |  • High-Fidelity Mock Mode Fallback    |                                 |
|              +-------------------+--------------------+                                 |
+----------------------------------|------------------------------------------------------+
                                   | USB Serial (115200 Baud)
                                   v
+-----------------------------------------------------------------------------------------+
| ESP32 Microcontroller Subsystem                                                         |
|  • I2C Expander 1 (PCF8575 @ 0x20) -> Relays 1-16 -> 12V Spiral Motors (Slots 1-16)    |
|  • I2C Expander 2 (PCF8575 @ 0x21) -> Relays 17-32 -> 12V Spiral Motors (Slots 17-32)  |
|  • Active-Low Infrared Drop Sensor (GPIO 19 Break Beam Interrupt)                       |
+-----------------------------------------------------------------------------------------+
```

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- Node.js v18+ (tested on Node v20/v22/v24)
- npm v9+

### 1. Start the Backend Server
```bash
cd backend
npm install
node server.js
```
- REST API runs on: `http://localhost:5000`
- WebSocket server runs on: `ws://localhost:5000`
- SQLite database initializes automatically with WAL mode: `backend/vending_machine.db`
- Auto-detects ESP32 on USB serial ports. If none is connected, activates the **Safe Mock Hardware Mode**.

### 2. Start the Kiosk Frontend
```bash
cd frontend
npm install
npm run dev
```
- Kiosk Web App opens on: `http://localhost:3000`
- Optimized for 1080p and 4K fullscreen touch displays.

### 3. Run Automated End-to-End Test Suite
```bash
cd backend
node test_e2e.js
```
Runs a complete simulated test verifying:
1. WebSocket handshake and hardware status broadcasting
2. 32-slot catalog verification
3. Express "Direct Pay" single-item 1-click checkout
4. Multi-item cart checkout with QR payload generation
5. Payment webhook processing & inventory decrement
6. Sequential hardware coil motor queue execution with cooldown intervals
7. Drop sensor verification and transaction completion

---

## 🔌 Hardware Wiring & ESP32 Pinout

The ESP32 communicates with the Host PC via USB Serial (`/dev/ttyUSB0` or `COMx`) at **115200 baud**.

| ESP32 Pin | Connected Component | Function |
| :--- | :--- | :--- |
| **GPIO 21 (SDA)** | PCF8575 #1 & #2 SDA | I2C Data (4.7kΩ pull-up to 3.3V) |
| **GPIO 22 (SCL)** | PCF8575 #1 & #2 SCL | I2C Clock (4.7kΩ pull-up to 3.3V) |
| **GPIO 19** | Optical Drop Beam Sensor | Active-Low Hardware Interrupt (Falling edge) |
| **GPIO 2** | Onboard LED | Hardware Activity Heartbeat |
| **GND** | Relay Board & Sensors GND | Common Ground Reference |

### I2C Address Mapping
- **PCF8575 #1 (`0x20`):** Relays 1 to 16 controlling Coils 1–16 (Cold Drinks & Savory Chips).
- **PCF8575 #2 (`0x21`):** Relays 17 to 32 controlling Coils 17–32 (Chocolates & Healthy Energy Bars).

### Motor Current Spike Protection
Spiral motors draw an inductive inrush surge upon startup. The backend `SerialManager` implements an ordered **Dispense Queue** with an inter-motor cooldown interval (`interMotorDelayMs: 1000`) ensuring only one motor runs at a time, protecting the 12V 10A power rail from voltage drops.

---

## 📡 Serial Protocol Bridge (ESP32 <-> Host PC)

All packets are formatted as JSON terminated by a newline (`\n`):

### Host PC to ESP32:
```json
{"command": "DISPENSE", "slot": 7, "duration_ms": 2500}
```

### ESP32 to Host PC:
1. **Immediate Acknowledgment:**
   ```json
   {"status": "ACK", "slot": 7}
   ```
2. **Dispense Success (Drop Beam Confirmed):**
   ```json
   {"status": "SUCCESS", "slot": 7}
   ```
3. **Jam or Timeout Detected:**
   ```json
   {"status": "ERROR_JAM", "slot": 7}
   ```

---

## 🗄️ Database Architecture (SQLite with WAL Mode)

### Zero Power-Loss Corruption Guarantee
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
```

### Schema
```sql
CREATE TABLE IF NOT EXISTS slots (
  slot_id INTEGER PRIMARY KEY CHECK(slot_id BETWEEN 1 AND 32),
  product_name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  price REAL NOT NULL,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  dispense_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT NOT NULL,
  slot_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY(transaction_id) REFERENCES transactions(transaction_id),
  FOREIGN KEY(slot_id) REFERENCES slots(slot_id)
);
```

---

## 🖥️ Production Kiosk Deployment (Ubuntu / Debian x86)

To lock the machine into a dedicated kiosk appliance on startup:

### 1. Backend Systemd Service (`/etc/systemd/system/aerovend-backend.service`)
```ini
[Unit]
Description=AeroVend Vending Machine Backend Service
After=network.target

[Service]
Type=simple
User=kiosk
WorkingDirectory=/home/kiosk/vending-machine-kiosk/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production PORT=5000

[Install]
WantedBy=multi-user.target
```

### 2. Autostart Chromium in Borderless Fullscreen Kiosk Mode
Add to `~/.config/openbox/autostart` or `/etc/xdg/lxsession/LXDE/autostart`:
```bash
# Disable screensaver and power management
xset s off
xset s noblank
xset -dpms

# Hide mouse cursor when inactive
unclutter -idle 0.1 -root &

# Launch Chromium locked to Kiosk
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --check-for-update-interval=31536000 \
  --app=http://localhost:3000
```
