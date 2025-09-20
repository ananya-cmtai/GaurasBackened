
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/OrderModel');
const { createRazorpayOrder } = require('../routes/razorpay');
const crypto = require('crypto');
const Razorpay = require('razorpay');
 exports.createRazorpayOrderController = async (req, res) => {
  try {
    const { total } = req.body;
    if (!total) {
      console.error('Total amount is missing in request body');
      return res.status(400).json({ message: "Amount is required" });
    }

    console.log('Creating Razorpay order with amount:', total);
    const order = await createRazorpayOrder(total);

    if (order) {
      console.log('Order created successfully:', order);
      return res.status(200).json(order);
    } else {
      console.error('Failed to create Razorpay order');
      return res.status(500).json({ message: "Failed to create Razorpay order" });
    }
  } catch (error) {
    console.error('Error in creating Razorpay order:', error);
    return res.status(500).json({ message: "Failed to create Razorpay order", error: error.message });
  }
};

exports.placeOrder = async (req, res) => {
  const { userId, products, totalAmount, deliveryAddress ,  razorpay_order_id,  deliveryFee,
      gst,
      discount,
      razorpay_payment_id,
      razorpay_signature} = req.body;
 if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required Razorpay details." });
    }
    const generated_signature = crypto.createHmac('sha256', "2kA1raBV7KriMGR8EHoQAXY0")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
  try {
    const order = await Order.create({
      user: userId,
      products,
      totalAmount,
      deliveryAddress,
         paymentDetails: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      },
      paymentVerified: true,
       deliveryFee,
      gst,
      discount,
    
    });

    res.status(201).json({ message: 'Order placed', order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to place order', error: err.message });
  }
};

exports.getOrdersByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ user: userId }).populate('products.productId');
 const sortedTOrders = orders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.status(200).json(sortedTOrders);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch orders', error: err.message });
  }
};


const razorpayInstance = new Razorpay({
  key_id: "rzp_test_h7fC45pYvbeKRH",
  key_secret: "2kA1raBV7KriMGR8EHoQAXY0",
});

// Refund function with better error handling


const refundPayment = async (paymentId, amount) => {
  try {
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount,  // Amount in paise (Razorpay expects amount in paise, so multiply by 100)
    });
    return refund;
  } catch (error) {
    console.error('Refund failed for payment ID:', paymentId, error);
    throw new Error(`Refund failed for payment ID: ${paymentId}. Reason: ${error.message}`);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // वैलिड स्टेटस चेक करें
    const validStatuses = ['Pending', 'Completed', 'Cancelled', 'Shipped'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // ऑर्डर अपडेट करें
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = await Order.findById(orderId); 
const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = order.paymentDetails;

    // Generate the signature on the server side using the order_id and payment_id
    const generated_signature = crypto.createHmac('sha256', "2kA1raBV7KriMGR8EHoQAXY0")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    console.log("Generated Signature:", generated_signature);
    console.log("Razorpay Signature:", razorpay_signature);

    // Check if the generated signature matches the one sent by Razorpay
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
    }

    // Handle refund when order is canceled
    if (status === 'Cancelled' && order.paymentVerified && !order.paymentRefunded) {
      try {
        // Set refund status to "Processing"
        order.refundStatus = 'Processing';
        order.refundMessage = 'Refund is being processed...';

        // Save the order before refund to show current processing state
        await order.save();

        // Debug: Log the total amount to be refunded
        console.log('Total to refund (in paise):', order.total * 100);

        // Call Razorpay API to refund the payment (amount should be in paise)
        const refundResponse = await refundPayment(order.paymentDetails.razorpay_payment_id, order.total * 100); // Total in paise

        // If refund is successful, update order details
        order.paymentRefunded = true;
        order.refundStatus = 'Refunded';  // Mark as refunded
        order.refundMessage = 'Refund successful';  // Success message

        // Save the updated order after refund
        await order.save();

        console.log('Refund successful for Order ID:', order._id);
      } catch (refundError) {
        console.error('Refund failed for Order:', order._id, refundError);

        // Handle refund failure
        order.refundStatus = 'Failed';
        order.refundMessage = `Refund failed. Reason: ${refundError.message}`;

        // Save the order with failure status
        await order.save();

        // Send a detailed response to the user with error information
        return res.status(500).json({
          message: "Refund failed. Order status not updated.",
          error: refundError.message,  // Detailed error message for debugging
          orderId: order._id,
        });
      }
    }
  order.status = status;

    // Save the updated order
    await order.save();
    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
