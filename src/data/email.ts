import type { Order } from './db';

const TEST_EMAIL = 'FluffyyyBloomss@gmail.com';

// ── CUSTOM EMAIL SENDER CONFIGURATION (FOR PASSWORD RESETS & TRANSACTIONS) ──
// If using Resend (resend.com) to send emails directly to customers from your business email, set these:
const RESEND_API_KEY = ''; // e.g. 're_123456...'
const SENDER_EMAIL = 'FluffyyyBloomss <onboarding@resend.dev>'; // e.g. 'hello@yourbusiness.com'

/**
 * Sends order placement email notification to the test email address.
 */
export const sendOrderEmail = async (order: Order): Promise<boolean> => {
  try {
    const payload = {
      _subject: `🌸 Order Confirmed #${order.id} - FluffyyyBloomss`,
      "14-Digit Tracking Code": order.id,
      "Customer Name": order.userName,
      "Customer Email": order.email,
      "Customer Phone": order.phone,
      "Shipping Address": order.address,
      "Items Ordered": order.items.map(item => `${item.title} x${item.quantity} (₹${item.price})`).join('\n'),
      "Total Billing": `₹${order.total} (${order.paymentMethod || 'Cash on Delivery'}${order.paymentStatus ? ` - ${order.paymentStatus}` : ''})`,
      "_replyto": order.email
    };

    const response = await fetch(`https://formsubmit.co/ajax/${TEST_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    return response.ok;
  } catch (error) {
    console.error("Failed to send order email:", error);
    return false;
  }
};

/**
 * Sends delay encouragement email notification to the test email address.
 */
export const sendDelayEmail = async (order: Order): Promise<boolean> => {
  try {
    const payload = {
      _subject: `✨ A Note of Patience & Positivity - FluffyyyBloomss`,
      "Message": `Hello ${order.userName}! ❤️\n\nYour handcrafted creation (Order #${order.id}) is taking a bit longer because every flower, stitch, and paint line requires precise detail. We want to thank you with all our heart for your patience. Your package is still on the way—keep going, stay positive, and look forward to something beautiful! ✨`,
      "Tracking Code": order.id,
      "Recipient Name": order.userName,
      "Expected Delivery": "Within next few days",
      "Customer Email": order.email
    };

    const response = await fetch(`https://formsubmit.co/ajax/${TEST_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    return response.ok;
  } catch (error) {
    console.error("Failed to send delay email:", error);
    return false;
  }
};

/**
 * Sends a password reset verification code email to the customer.
 */
export const sendPasswordResetEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    if (RESEND_API_KEY) {
      // Send email using Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: SENDER_EMAIL,
          to: email,
          subject: '🌸 Reset Your Password - FluffyyyBloomss',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px;">
              <h2 style="color: #db2777; text-align: center;">Reset Your Password</h2>
              <p>Hello,</p>
              <p>We received a request to reset the password for your FluffyyyBloomss account. Use the verification code below to complete your reset:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #db2777; background-color: #fdf2f8; padding: 10px 20px; border-radius: 4px; border: 1px dashed #fbcfe8;">
                  ${code}
                </span>
              </div>
              <p>This verification code is valid for <strong>10 minutes</strong>. If you did not make this request, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">🌸 Thank you for shopping with FluffyyyBloomss! 🌸</p>
            </div>
          `
        })
      });
      return response.ok;
    } else {
      // Fallback/Testing: Log code to console and use FormSubmit to notify Admin
      console.log(`[PASSWORD RESET OTP] For: ${email} | Code: ${code}`);
      
      const response = await fetch(`https://formsubmit.co/ajax/${TEST_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `🔑 [OTP Demo] Password Reset Request for ${email}`,
          "User Email": email,
          "Verification Code": code,
          "Notice": "This is a demo fallback. Configure RESEND_API_KEY in email.ts to send emails directly to customers from your business address."
        })
      });
      return response.ok;
    }
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
};
