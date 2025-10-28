const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: "rzp_live_RYNXhDJcEf2dUe",
  key_secret: "Dij7h2E6xKQkWh2PjKsXjYLo",
});

const createRazorpayOrder = async (amount, currency = 'INR') => {
  const options = {
    amount: amount * 100, // Convert amount to paise
    currency,
    receipt: "receipt_order_" + Date.now(),
  };

  try {
    // Create Razorpay order
    const order = await razorpayInstance.orders.create(options);
    return order;  // Returning the order object
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error('Failed to create Razorpay order. Please try again.');
  }
};

module.exports = { createRazorpayOrder };
