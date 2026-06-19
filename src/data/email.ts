import type { Order } from './db';

const TEST_EMAIL = 'FluffyyyBloomss@gmail.com';

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
