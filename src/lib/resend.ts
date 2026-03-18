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
        console.log(`[RESEND_DEBUG] Email loop starting for ${adminEmails.length} recipients...`);
        
        for (const email of adminEmails) {
            try {
                console.log(`[RESEND_DEBUG] Dispatching to: ${email}`);
                    const { data: res, error } = await resend.emails.send({
                    from: 'Guapo Drops <onboarding@resend.dev>',
                    to: [email],
                    subject: `New Order: ${data.orderId}`,
                    html: `
                        <div style="background-color: #0f0f11; color: #f0f0f0; font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #BC00FF; border-radius: 12px; box-shadow: 0 0 30px rgba(188, 0, 255, 0.1);">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #CCFF00; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">New Order Received</h1>
                                <p style="color: #888; font-size: 12px; margin-top: 5px; font-family: monospace;">ID: ${data.orderId}</p>
                            </div>
                            
                            <div style="background: rgba(255, 255, 255, 0.03); padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid rgba(255, 255, 255, 0.05);">
                                <h3 style="color: #BC00FF; margin-top: 0; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Customer Details</h3>
                                <p style="margin: 10px 0 5px 0; font-size: 15px;"><strong>Name:</strong> ${data.customerName}</p>
                                <p style="margin: 0; font-size: 15px;"><strong>Email:</strong> ${data.customerEmail}</p>
                            </div>

                            <div style="margin-bottom: 30px;">
                                <h3 style="color: #BC00FF; border-bottom: 1px solid rgba(188, 0, 255, 0.2); padding-bottom: 8px; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Order Summary</h3>
                                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                                    <thead>
                                        <tr style="text-align: left; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px;">
                                            <th style="padding-bottom: 12px;">Product</th>
                                            <th style="padding-bottom: 12px; text-align: center;">Qty</th>
                                            <th style="padding-bottom: 12px; text-align: right;">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${data.items.map(item => `
                                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                                <td style="padding: 15px 0; font-weight: 500; color: #fff;">${item.name}</td>
                                                <td style="padding: 15px 0; text-align: center; color: #888;">${item.quantity}</td>
                                                <td style="padding: 15px 0; text-align: right; color: #CCFF00; font-family: monospace; font-weight: bold;">${item.priceAtTime} TND</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>

                            <div style="margin-top: 30px; padding: 20px; background: rgba(204, 255, 0, 0.05); border-radius: 8px; text-align: right; border: 1px solid rgba(204, 255, 0, 0.1);">
                                <p style="font-size: 12px; color: #888; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Total Amount</p>
                                <p style="font-size: 36px; font-weight: bold; color: #CCFF00; margin: 5px 0 0 0;">${data.totalAmount} <span style="font-size: 18px; font-weight: normal; color: #888;">TND</span></p>
                            </div>

                            <div style="margin-top: 40px; text-align: center; color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                                guapo drops &copy; ${new Date().getFullYear()} // all rights reserved
                            </div>
                        </div>
                    `,
                });

                if (error) {
                    console.error(`[RESEND_DEBUG] Failed for ${email}:`, error);
                } else {
                    console.log(`[RESEND_DEBUG] Success for ${email}: ${res?.id}`);
                }
            } catch (err) {
                console.error(`[RESEND_DEBUG] Exception for ${email}:`, err);
            }
        }
        return { success: true };
    } catch (err) {
        console.error('[RESEND_DEBUG] Internal failure during loop:', err);
        throw err;
    }
}
