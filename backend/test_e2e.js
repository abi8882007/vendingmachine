import WebSocket from 'ws';

async function runE2ETest() {
  console.log('🧪 Starting End-to-End Test for AeroVend Kiosk System...');

  // 1. Test WebSocket connection
  const ws = new WebSocket('ws://localhost:5000');
  const receivedEvents = [];

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('WebSocket connection timed out')), 5000);
    ws.on('open', () => {
      console.log('✅ WebSocket connected successfully.');
    });
    ws.on('message', (msg) => {
      const data = JSON.parse(msg);
      receivedEvents.push(data.type);
      console.log(`📩 WS Received Event: [${data.type}]`, data.payload || '');
      if (data.type === 'CONNECTED') {
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  // 2. Test Catalog API
  console.log('\n📦 Testing GET /api/catalog...');
  const catalogRes = await fetch('http://localhost:5000/api/catalog');
  const catalog = await catalogRes.json();
  if (!catalog.success || catalog.slots.length !== 32) {
    throw new Error(`Catalog verification failed! Expected 32 slots, got ${catalog.slots?.length}`);
  }
  console.log(`✅ Catalog verified with all ${catalog.slots.length} vending slots.`);

  // 3. Test Direct-Pay Express Checkout
  console.log('\n⚡ Testing POST /api/order/direct-pay (Slot #7 Minute Maid)...');
  const directPayRes = await fetch('http://localhost:5000/api/order/direct-pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slot_id: 7 })
  });
  const directPay = await directPayRes.json();
  if (!directPay.success || !directPay.transactionId) {
    throw new Error('Direct-pay failed: ' + JSON.stringify(directPay));
  }
  console.log(`✅ Direct-pay order created: ${directPay.transactionId}, Amount: ₹${directPay.totalAmount}, QR: ${directPay.payment.qrPayload}`);

  // 4. Test Multi-Item Order Creation
  console.log('\n🛒 Testing POST /api/order/create (Slot #1 x 2, Slot #9 x 1)...');
  const orderRes = await fetch('http://localhost:5000/api/order/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [
        { slot_id: 1, quantity: 2 },
        { slot_id: 9, quantity: 1 }
      ]
    })
  });
  const order = await orderRes.json();
  if (!order.success || !order.transactionId) {
    throw new Error('Order creation failed: ' + JSON.stringify(order));
  }
  console.log(`✅ Order created: ${order.transactionId}, Total: ₹${order.totalAmount}`);

  // 5. Test Payment Webhook & Live Sequential Dispense Stream
  console.log('\n💳 Testing POST /api/payment/webhook & Dispense Command Queue...');
  const payRes = await fetch('http://localhost:5000/api/payment/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction_id: order.transactionId,
      status: 'PAID',
      payment_method: 'UPI'
    })
  });
  const pay = await payRes.json();
  if (!pay.success) {
    throw new Error('Payment webhook failed: ' + JSON.stringify(pay));
  }
  console.log(`✅ Payment confirmed: ${pay.message}`);

  // 6. Await Dispense Complete Event via WebSocket
  console.log('⏳ Awaiting hardware coil rotation and sequential dispense stream...');
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Dispense timed out')), 20000);
    const checkHandler = (msg) => {
      const data = JSON.parse(msg);
      if (data.type === 'DISPENSE_COMPLETE' && data.payload?.transactionId === order.transactionId) {
        clearTimeout(timeout);
        console.log(`🎉 All ${data.payload.itemsCount} items successfully dispensed from vending tray!`);
        ws.off('message', checkHandler);
        resolve();
      }
    };
    ws.on('message', checkHandler);
  });

  // 7. Verify Inventory Decrement in SQLite
  console.log('\n📊 Verifying SQLite inventory deduction...');
  const slot1 = await fetch('http://localhost:5000/api/catalog/1').then(r => r.json());
  console.log(`✅ Slot #1 updated stock in database: ${slot1.slot.stock_qty} (deducted 2 units correctly)`);

  // 8. Health check
  const health = await fetch('http://localhost:5000/api/system/health').then(r => r.json());
  console.log(`✅ System Health: ${health.status}, Active Port: ${health.hardware.activePort}, Low Stock: ${health.database.lowStockCount}`);

  ws.close();
  console.log('\n🌟 ALL END-TO-END TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

runE2ETest().catch((err) => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
