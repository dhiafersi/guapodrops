import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
    name: string;
    quantity: number;
    priceAtTime: number;
}

interface OrderNotificationData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    items: OrderItem[];
}

export async function sendOrderNotification(data: OrderNotificationData) {
    const adminEmail = process.env.ADMIN_EMAIL || 'dhiafersi@gmail.com';
    console.log(`[RESEND_DEBUG] Sending email for Order: ${data.orderId} to: ${adminEmail}`);

    if (!process.env.RESEND_API_KEY) {
        console.warn('[RESEND_DEBUG] RESEND_API_KEY is not set. Skipping.');
        return;
    }

    try {
        const { data: res, error } = await resend.emails.send({
            from: 'Guapo Drops <onboarding@resend.dev>', // Resend default testing email
            to: adminEmail,
            subject: `New Order Received: ${data.orderId}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333;">New Order Alert!</h2>
                    <p><strong>Order ID:</strong> ${data.orderId}</p>
                    <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
                    <hr style="border: 0; border-top: 1px solid #eee;" />
                    <h3>Items:</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${data.items.map(item => `
                            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                <strong>${item.name}</strong> x ${item.quantity} - ${item.priceAtTime} TND
                            </li>
                        `).join('')}
                    </ul>
                    <p style="font-size: 18px; font-weight: bold; margin-top: 20px;">
                        Total Amount: ${data.totalAmount} TND
                    </p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
                        This is an automated notification from Guapo Shop.
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('[RESEND_DEBUG] Error details:', error);
            throw new Error(`RESEND_ERROR: ${JSON.stringify(error)}`);
        }

        console.log(`[RESEND_DEBUG] Email sent successfully: ${res?.id}`);
        return { success: true, data: res };
    } catch (err) {
        console.error('[RESEND_DEBUG] Internal error during send:', err);
        throw err;
    }
}
