import { getUserSheetUrl } from './db';
import type { Order } from './db';

const ADMIN_EMAIL = 'FluffyyyBloomss@gmail.com';

/**
 * Helper to send email via Google Sheets Web App Apps Script
 */
const sendEmailViaGoogleSheet = async (recipient: string, subject: string, body: string, isHtml: boolean = false): Promise<boolean> => {
  const url = getUserSheetUrl();
  if (!url) {
    console.warn("No Customer Google Sheets URL configured. Email was not sent.");
    return false;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify({
        action: 'sendEmail',
        recipient,
        subject,
        body,
        isHtml
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.success === true;
    }
    return false;
  } catch (error) {
    console.error("Failed to send email via Google Sheets Apps Script:", error);
    return false;
  }
};

/**
 * Sends order placement email notification to the customer and the admin.
 */
export const sendOrderEmail = async (order: Order): Promise<boolean> => {
  try {
    // 1. Send Beautiful HTML Invoice to Customer
    const customerSubject = `🌸 Order Confirmed #${order.id} - FluffyyyBloomss`;
    const customerHtmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; color: #1f2937;">
        <h2 style="color: #db2777; text-align: center; margin-bottom: 20px;">🌸 Order Confirmed! 🌸</h2>
        <p>Hello <strong>${order.userName}</strong>,</p>
        <p>Thank you for shopping with FluffyyyBloomss! Your order has been successfully placed. Here are your order details:</p>
        
        <div style="background-color: #fdf2f8; padding: 15px; border-radius: 6px; border: 1px solid #fbcfe8; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order ID (Tracking Code):</strong> <span style="font-family: monospace; font-weight: bold; color: #db2777;">${order.id}</span></p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${order.date || new Date().toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'} (${order.paymentStatus || 'Pending'})</p>
        </div>
        
        <h3 style="color: #db2777; border-bottom: 1px solid #fbcfe8; padding-bottom: 5px; margin-top: 25px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
          <thead>
            <tr style="border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 0.9rem; color: #4b5563;">
              <th style="padding: 8px 0;">Product</th>
              <th style="padding: 8px 0; text-align: center;">Qty</th>
              <th style="padding: 8px 0; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr style="border-bottom: 1px solid #f3f4f6; font-size: 0.9rem;">
                <td style="padding: 10px 0; font-weight: 500;">${item.title}</td>
                <td style="padding: 10px 0; text-align: center; color: #4b5563;">${item.quantity}</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 500;">₹${item.price * item.quantity}</td>
              </tr>
            `).join('')}
            <tr style="font-size: 1rem;">
              <td colspan="2" style="padding: 15px 0 5px 0; font-weight: bold; text-align: right;">Total Billing:</td>
              <td style="padding: 15px 0 5px 0; font-weight: bold; text-align: right; color: #db2777;">₹${order.total}</td>
            </tr>
          </tbody>
        </table>
        
        <h3 style="color: #db2777; border-bottom: 1px solid #fbcfe8; padding-bottom: 5px; margin-top: 25px;">Shipping & Customer Details</h3>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 0.9rem; line-height: 1.5;">
          <p style="margin: 3px 0;"><strong>Name:</strong> ${order.userName}</p>
          <p style="margin: 3px 0;"><strong>Email:</strong> ${order.email}</p>
          <p style="margin: 3px 0;"><strong>Phone:</strong> ${order.phone}</p>
          <p style="margin: 3px 0;"><strong>Address:</strong> ${order.address}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">If you have any questions, you can reply directly to this email or contact us at ${ADMIN_EMAIL}.</p>
        <p style="font-size: 13px; color: #db2777; text-align: center; font-weight: bold; margin-top: 10px;">🌸 Thank you for supporting our handcrafted creations! 🌸</p>
      </div>
    `;

    // Send email to Customer
    const sentToCustomer = await sendEmailViaGoogleSheet(order.email, customerSubject, customerHtmlBody, true);

    // 2. Send Simple Notification Alert to Admin
    const adminSubject = `🚨 New Store Order Placed #${order.id}`;
    const adminHtmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937;">
        <h2 style="color: #059669; text-align: center;">New Order Placed!</h2>
        <p>A new order has been received from the storefront. Here is a summary of the order details:</p>
        
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; border: 1px solid #a7f3d0; margin: 20px 0; font-size: 0.9rem;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id}</p>
          <p style="margin: 5px 0;"><strong>Customer Name:</strong> ${order.userName}</p>
          <p style="margin: 5px 0;"><strong>Customer Email:</strong> ${order.email}</p>
          <p style="margin: 5px 0;"><strong>Customer Phone:</strong> ${order.phone}</p>
          <p style="margin: 5px 0;"><strong>Billing Total:</strong> ₹${order.total} (${order.paymentMethod || 'COD'})</p>
        </div>
        
        <p>Log in to your <strong>Admin Dashboard</strong> to view customer details and manage/dispatch this order.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">FluffyyyBloomss Storefront Automation</p>
      </div>
    `;
    
    // Send email to Admin
    await sendEmailViaGoogleSheet(ADMIN_EMAIL, adminSubject, adminHtmlBody, true);

    return sentToCustomer;
  } catch (error) {
    console.error("Failed to send order emails:", error);
    return false;
  }
};

/**
 * Sends delay encouragement email notification to the customer.
 */
export const sendDelayEmail = async (order: Order): Promise<boolean> => {
  try {
    const subject = `✨ A Note of Patience & Positivity - FluffyyyBloomss`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; color: #1f2937;">
        <h2 style="color: #db2777; text-align: center; margin-bottom: 20px;">✨ A Note of Patience & Positivity ✨</h2>
        <p>Hello <strong>${order.userName}</strong>, ❤️</p>
        <p>Your handcrafted creation (Order <strong>#${order.id}</strong>) is taking a bit longer because every flower, stitch, and paint line requires precise detail. We want to thank you with all our heart for your patience.</p>
        <p>Your package is on the way — keep going, stay positive, and look forward to something beautiful! ✨</p>
        
        <div style="background-color: #fdf2f8; padding: 12px; border-radius: 6px; border: 1px solid #fbcfe8; margin: 20px 0; text-align: center; font-size: 0.9rem;">
          <strong>Tracking Code:</strong> <span style="font-family: monospace; font-weight: bold; color: #db2777;">${order.id}</span>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">If you have any questions, feel free to contact us by replying to this email.</p>
        <p style="font-size: 13px; color: #db2777; text-align: center; font-weight: bold; margin-top: 10px;">🌸 FluffyyyBloomss Customer Support 🌸</p>
      </div>
    `;

    return await sendEmailViaGoogleSheet(order.email, subject, htmlBody, true);
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
    const subject = `🌸 Reset Your Password - FluffyyyBloomss`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 8px; color: #1f2937;">
        <h2 style="color: #db2777; text-align: center; margin-bottom: 20px;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your FluffyyyBloomss account. Use the verification code below to complete your reset:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #db2777; background-color: #fdf2f8; padding: 10px 20px; border-radius: 4px; border: 1px dashed #fbcfe8;">
            ${code}
          </span>
        </div>
        <p>This verification code is valid for <strong>10 minutes</strong>. If you did not make this request, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">🌸 Thank you for shopping with FluffyyyBloomss! 🌸</p>
      </div>
    `;

    return await sendEmailViaGoogleSheet(email, subject, htmlBody, true);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
};
