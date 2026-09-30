import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'vending_machine.db');

export let db;

try {
  db = new Database(DB_PATH, { verbose: null });
} catch (err) {
  console.warn('better-sqlite3 failed, falling back to node:sqlite', err.message);
  const { DatabaseSync } = await import('node:sqlite');
  db = new DatabaseSync(DB_PATH);
}

export function initDatabase() {
  // Integrity & Power-Loss Protection
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Schema creation
  db.exec(`
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
  `);

  seedDefaultSlots();
  console.log('✅ SQLite Database initialized with WAL mode & 32 slots seeded.');
}

const SEED_PRODUCTS = [
  // Row 1: Chips (1-6) - Exactly matching reference image Row 1
  { slot_id: 1, product_name: "Lay's Classic", category: 'Chips', price: 30, stock_qty: 12, image_url: '/assets/products/lays-classic.svg', is_active: 1 },
  { slot_id: 2, product_name: "Lay's Masala", category: 'Chips', price: 30, stock_qty: 14, image_url: '/assets/products/lays-masala.svg', is_active: 1 },
  { slot_id: 3, product_name: 'Doritos Nacho Cheese', category: 'Chips', price: 40, stock_qty: 10, image_url: '/assets/products/doritos.svg', is_active: 1 },
  { slot_id: 4, product_name: 'Kurkure Masala Munch', category: 'Chips', price: 30, stock_qty: 15, image_url: '/assets/products/kurkure.svg', is_active: 1 },
  { slot_id: 5, product_name: 'Cheetos Crunchy', category: 'Chips', price: 40, stock_qty: 8, image_url: '/assets/products/cheetos.svg', is_active: 1 },
  { slot_id: 6, product_name: 'Pringles Original', category: 'Chips', price: 60, stock_qty: 6, image_url: '/assets/products/pringles.svg', is_active: 1 },

  // Row 2: Chocolates (7-12) - Exactly matching reference image Row 2
  { slot_id: 7, product_name: 'KitKat', category: 'Chocolates', price: 25, stock_qty: 16, image_url: '/assets/products/kitkat.svg', is_active: 1 },
  { slot_id: 8, product_name: 'Snickers', category: 'Chocolates', price: 30, stock_qty: 12, image_url: '/assets/products/snickers.svg', is_active: 1 },
  { slot_id: 9, product_name: "M&M's Peanut", category: 'Chocolates', price: 40, stock_qty: 10, image_url: '/assets/products/mms.svg', is_active: 1 },
  { slot_id: 10, product_name: 'Cadbury Dairy Milk', category: 'Chocolates', price: 30, stock_qty: 14, image_url: '/assets/products/dairymilk.svg', is_active: 1 },
  { slot_id: 11, product_name: '5 Star', category: 'Chocolates', price: 20, stock_qty: 15, image_url: '/assets/products/5star.svg', is_active: 1 },
  { slot_id: 12, product_name: 'Perk', category: 'Chocolates', price: 20, stock_qty: 15, image_url: '/assets/products/perk.svg', is_active: 1 },

  // Row 3: Drinks (13-18) - Exactly matching reference image Row 3
  { slot_id: 13, product_name: 'Coca-Cola', category: 'Drinks', price: 40, stock_qty: 12, image_url: '/assets/products/coke.svg', is_active: 1 },
  { slot_id: 14, product_name: 'Pepsi', category: 'Drinks', price: 40, stock_qty: 10, image_url: '/assets/products/pepsi.svg', is_active: 1 },
  { slot_id: 15, product_name: 'Fanta', category: 'Drinks', price: 40, stock_qty: 10, image_url: '/assets/products/fanta.svg', is_active: 1 },
  { slot_id: 16, product_name: 'Sprite', category: 'Drinks', price: 40, stock_qty: 12, image_url: '/assets/products/sprite.svg', is_active: 1 },
  { slot_id: 17, product_name: 'Mountain Dew', category: 'Drinks', price: 40, stock_qty: 8, image_url: '/assets/products/dew.svg', is_active: 1 },
  { slot_id: 18, product_name: 'Limca', category: 'Drinks', price: 40, stock_qty: 10, image_url: '/assets/products/limca.svg', is_active: 1 },

  // Row 4: Biscuits & Extra Snacks (19-24)
  { slot_id: 19, product_name: 'Oreo Vanilla', category: 'Biscuits', price: 35, stock_qty: 10, image_url: '/assets/products/oreo.svg', is_active: 1 },
  { slot_id: 20, product_name: 'Parle-G Gold', category: 'Biscuits', price: 15, stock_qty: 20, image_url: '/assets/products/parleg.svg', is_active: 1 },
  { slot_id: 21, product_name: 'Britannia Bourbon', category: 'Biscuits', price: 25, stock_qty: 12, image_url: '/assets/products/bourbon.svg', is_active: 1 },
  { slot_id: 22, product_name: 'Dark Fantasy', category: 'Biscuits', price: 40, stock_qty: 8, image_url: '/assets/products/darkfantasy.svg', is_active: 1 },
  { slot_id: 23, product_name: 'Good Day Butter', category: 'Biscuits', price: 30, stock_qty: 14, image_url: '/assets/products/goodday.svg', is_active: 1 },
  { slot_id: 24, product_name: 'Hide & Seek', category: 'Biscuits', price: 35, stock_qty: 10, image_url: '/assets/products/hideseek.svg', is_active: 1 },

  // Slots 25-32: High-Demand Replenishment Slots
  { slot_id: 25, product_name: "Lay's Classic", category: 'Chips', price: 30, stock_qty: 10, image_url: '/assets/products/lays-classic.svg', is_active: 1 },
  { slot_id: 26, product_name: 'Doritos Nacho Cheese', category: 'Chips', price: 40, stock_qty: 8, image_url: '/assets/products/doritos.svg', is_active: 1 },
  { slot_id: 27, product_name: 'KitKat', category: 'Chocolates', price: 25, stock_qty: 12, image_url: '/assets/products/kitkat.svg', is_active: 1 },
  { slot_id: 28, product_name: 'Snickers', category: 'Chocolates', price: 30, stock_qty: 10, image_url: '/assets/products/snickers.svg', is_active: 1 },
  { slot_id: 29, product_name: 'Coca-Cola', category: 'Drinks', price: 40, stock_qty: 10, image_url: '/assets/products/coke.svg', is_active: 1 },
  { slot_id: 30, product_name: 'Sprite', category: 'Drinks', price: 40, stock_qty: 10, image_url: '/assets/products/sprite.svg', is_active: 1 },
  { slot_id: 31, product_name: 'Oreo Vanilla', category: 'Biscuits', price: 35, stock_qty: 8, image_url: '/assets/products/oreo.svg', is_active: 1 },
  { slot_id: 32, product_name: 'Britannia Bourbon', category: 'Biscuits', price: 25, stock_qty: 10, image_url: '/assets/products/bourbon.svg', is_active: 1 }
];

export function reseedDatabase() {
  const upsert = db.prepare(`
    INSERT INTO slots (slot_id, product_name, category, price, stock_qty, image_url, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slot_id) DO UPDATE SET
      product_name = excluded.product_name,
      category = excluded.category,
      price = excluded.price,
      stock_qty = excluded.stock_qty,
      image_url = excluded.image_url,
      is_active = excluded.is_active
  `);

  for (const item of SEED_PRODUCTS) {
    upsert.run(item.slot_id, item.product_name, item.category, item.price, item.stock_qty, item.image_url, item.is_active);
  }
  console.log('✅ Reseeded 32 slots with Snack Spot reference catalog');
}

function seedDefaultSlots() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM slots').get();
  if (countRow && countRow.count >= 18) {
    // Check if first slot matches Snack Spot
    const first = db.prepare('SELECT product_name FROM slots WHERE slot_id = 1').get();
    if (first && first.product_name === "Lay's Classic") {
      return;
    }
  }

  reseedDatabase();
}
