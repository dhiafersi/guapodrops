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
    const adminEmailStr = process.env.ADMIN_EMAIL || 'fersidhia9@gmail.com';
    const adminEmails = adminEmailStr.split(',').map(email => email.trim());
    
    console.log(`[RESEND_DEBUG] Sending email for Order: ${data.orderId} to: ${adminEmailStr}`);

    if (!process.env.RESEND_API_KEY) {
        console.warn('[RESEND_DEBUG] RESEND_API_KEY is not set. Skipping.');
        return;
    }

    try {
        const { data: res, error } = await resend.emails.send({
            from: 'Guapo Drops <onboarding@resend.dev>',
            to: adminEmails,
            subject: `🚨 ACQUISITION_INITIALIZED: ${data.orderId}`,
            html: `
                <div style="background-color: #0f0f11; color: #f0f0f0; font-family: 'Courier New', Courier, monospace; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #CCFF00; border-radius: 8px; box-shadow: 0 0 20px rgba(204, 255, 0, 0.15);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #CCFF00; font-size: 24px; margin: 0; letter-spacing: 4px; border-bottom: 2px solid #CCFF00; display: inline-block; padding-bottom: 5px;">NEW_ORDER_DETECTED</h1>
                    </div>
                    
                    <div style="background: rgba(188, 0, 255, 0.05); padding: 20px; border-left: 3px solid #BC00FF; margin-bottom: 30px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #BC00FF;">Status: <span style="color: #f0f0f0;">Awaiting Verification</span></p>
                        <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #BC00FF;">ID: <span style="color: #f0f0f0;">${data.orderId}</span></p>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #00f2ff; border-bottom: 1px solid #00f2ff/20; padding-bottom: 5px; text-transform: uppercase; font-size: 16px;">Target Asset Details:</h3>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                            <thead>
                                <tr style="text-align: left; font-size: 12px; color: #888; text-transform: uppercase;">
                                    <th style="padding-bottom: 10px;">Item</th>
                                    <th style="padding-bottom: 10px;">Qty</th>
                                    <th style="padding-bottom: 10px;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.items.map(item => `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 12px 0; font-weight: bold; color: #fff;">${item.name}</td>
                                        <td style="padding: 12px 0;">x${item.quantity}</td>
                                        <td style="padding: 12px 0; color: #CCFF00;">${item.priceAtTime} TND</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div style="background: rgba(0, 242, 255, 0.05); padding: 20px; border: 1px solid rgba(0, 242, 255, 0.2); border-radius: 4px;">
                        <h3 style="color: #00f2ff; margin-top: 0; text-transform: uppercase; font-size: 14px;">Operator Info:</h3>
                        <p style="margin: 5px 0; font-size: 13px;">Name: <span style="color: #fff;">${data.customerName}</span></p>
                        <p style="margin: 5px 0; font-size: 13px;">Protocol: <span style="color: #fff;">${data.customerEmail}</span></p>
                    </div>

                    <div style="margin-top: 30px; text-align: right;">
                        <p style="font-size: 12px; color: #888; margin-bottom: 5px; text-transform: uppercase;">Total Acquisition Cost</p>
                        <p style="font-size: 32px; font-weight: bold; color: #CCFF00; margin: 0;">${data.totalAmount} <span style="font-size: 16px;">TND</span></p>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #444; text-align: center; text-transform: uppercase; letter-spacing: 2px;">
                        Guapo Shop Network // Secure Transmission
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
