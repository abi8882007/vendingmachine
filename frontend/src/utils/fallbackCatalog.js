export const FALLBACK_SLOTS = [
  // Row 1: Chips (1-6)
  { slot_id: 1, product_name: "Lay's Classic", category: 'Chips', price: 30, stock_qty: 12, image_url: '/assets/products/lays-classic.svg', is_active: 1 },
  { slot_id: 2, product_name: "Lay's Masala", category: 'Chips', price: 30, stock_qty: 14, image_url: '/assets/products/lays-masala.svg', is_active: 1 },
  { slot_id: 3, product_name: 'Doritos Nacho Cheese', category: 'Chips', price: 40, stock_qty: 10, image_url: '/assets/products/doritos.svg', is_active: 1 },
  { slot_id: 4, product_name: 'Kurkure Masala Munch', category: 'Chips', price: 30, stock_qty: 15, image_url: '/assets/products/kurkure.svg', is_active: 1 },
  { slot_id: 5, product_name: 'Cheetos Crunchy', category: 'Chips', price: 40, stock_qty: 8, image_url: '/assets/products/cheetos.svg', is_active: 1 },
  { slot_id: 6, product_name: 'Pringles Original', category: 'Chips', price: 60, stock_qty: 6, image_url: '/assets/products/pringles.svg', is_active: 1 },

  // Row 2: Chocolates (7-12)
  { slot_id: 7, product_name: 'KitKat', category: 'Chocolates', price: 25, stock_qty: 16, image_url: '/assets/products/kitkat.svg', is_active: 1 },
  { slot_id: 8, product_name: 'Snickers', category: 'Chocolates', price: 30, stock_qty: 12, image_url: '/assets/products/snickers.svg', is_active: 1 },
  { slot_id: 9, product_name: "M&M's Peanut", category: 'Chocolates', price: 40, stock_qty: 10, image_url: '/assets/products/mms.svg', is_active: 1 },
  { slot_id: 10, product_name: 'Cadbury Dairy Milk', category: 'Chocolates', price: 30, stock_qty: 14, image_url: '/assets/products/dairymilk.svg', is_active: 1 },
  { slot_id: 11, product_name: '5 Star', category: 'Chocolates', price: 20, stock_qty: 15, image_url: '/assets/products/5star.svg', is_active: 1 },
  { slot_id: 12, product_name: 'Perk', category: 'Chocolates', price: 20, stock_qty: 15, image_url: '/assets/products/perk.svg', is_active: 1 },

  // Row 3: Drinks (13-18)
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
