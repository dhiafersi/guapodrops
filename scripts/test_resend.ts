import { sendOrderNotification } from '../src/lib/resend';

async function run() {
    console.log('[DEBUG] Starting manual Resend test...');
    try {
        const result = await sendOrderNotification({
            orderId: 'TEST_MANUAL_' + Date.now(),
            customerName: 'Test Admin',
            customerEmail: 'admin@guapo.drop',
            totalAmount: 1337,
            items: [{
                name: 'Hyper-Fluid Sneakers',
                quantity: 1,
                priceAtTime: 1337
            }]
        });
        console.log('[DEBUG] Result:', result);
    } catch (e) {
        console.error('[DEBUG] FATAL ERROR:', e);
    }
}

run();
