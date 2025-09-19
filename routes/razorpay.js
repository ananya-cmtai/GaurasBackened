const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: "rzp_test_h7fC45pYvbeKRH",
  key_secret: "2kA1raBV7KriMGR8EHoQAXY0",
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
