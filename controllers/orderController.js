
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
  const { userId, products, totalAmount, deliveryAddress ,  razorpay_order_id,  deliveryFee,paymentMode,
      gst,
      discount,
      razorpay_payment_id,
      razorpay_signature} = req.body;
      if(paymentMode==="Razorpay"){
 if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required Razorpay details." });
    }
    const generated_signature = crypto.createHmac('sha256', "Dij7h2E6xKQkWh2PjKsXjYLo")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
  }
  try {
    const order = await Order.create({
      user: userId,
      products,
      totalAmount,
      deliveryAddress,paymentMode,
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
  key_id: "rzp_live_RYNXhDJcEf2dUe",
  key_secret: "Dij7h2E6xKQkWh2PjKsXjYLo",
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

    // Valid statuses
    const validStatuses = ['Pending', 'Delivered', 'Cancelled', 'Accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Fetch order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Fetch user
    const user = await User.findById(order.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Razorpay signature verification
    if (order.paymentMode === "Razorpay" && order.paymentVerified) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = order.paymentDetails;

      if (razorpay_signature) {
        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
          .update(razorpay_order_id + "|" + razorpay_payment_id)
          .digest('hex');

        if (generated_signature !== razorpay_signature) {
          return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
        }
      }
    }

    // Handle refund for Razorpay
    if (status === 'Cancelled' && order.paymentVerified && !order.paymentRefunded && order.paymentMode === "Razorpay") {
      try {
        order.refundStatus = 'Processing';
        order.refundMessage = 'Refund is being processed...';
        await order.save();

        const refundResponse = await refundPayment(order.paymentDetails.razorpay_payment_id, order.total * 100);

        order.paymentRefunded = true;
        order.refundStatus = 'Refunded';
        order.refundMessage = 'Refund successful';
        await order.save();
        console.log('Razorpay refund successful for Order ID:', order._id);

      } catch (refundError) {
        console.error('Refund failed for Order:', order._id, refundError);
        order.refundStatus = 'Failed';
        order.refundMessage = `Refund failed. Reason: ${refundError.message}`;
        await order.save();
        return res.status(500).json({
          message: "Refund failed. Order status not updated.",
          error: refundError.message,
          orderId: order._id,
        });
      }
    }

    // Handle refund for Wallet
    if (status === 'Cancelled' && order.paymentVerified && !order.paymentRefunded && order.paymentMode === "Wallet") {
      try {
        order.refundStatus = 'Processing';
        order.refundMessage = 'Refund is being processed...';
        await order.save();

        const refundAmount = order.total;
        user.wallet.balance += refundAmount;
        user.wallet.transactions.push({
          type: 'Credit',
          amount: refundAmount,
          description: 'Refund for cancelled order',
          source: 'Order Refund',
          orderId: order._id,
          paymentMode: 'Wallet',
          paymentVerified: true,
        });
        await user.save();

        order.paymentRefunded = true;
        order.refundStatus = 'Refunded';
        order.refundMessage = 'Refund successful';
        await order.save();
        console.log('Wallet refund successful for Order ID:', order._id);

      } catch (refundError) {
        console.error('Refund failed for Order:', order._id, refundError);
        order.refundStatus = 'Failed';
        order.refundMessage = `Refund failed. Reason: ${refundError.message}`;
        await order.save();
        return res.status(500).json({
          message: "Refund failed. Order status not updated.",
          error: refundError.message,
          orderId: order._id,
        });
      }
    }

    // Update order status
    order.status = status;

    // Referral bonus logic
    if (status === 'Delivered') {
      const deliveredOrders = await Order.find({ user: user._id, status: 'Delivered' });
      if (deliveredOrders.length === 1 && user.referredBy) {
        const referrer = await User.findOne({ referCode: user.referredBy });
        if (referrer) {
          referrer.wallet.balance += 100;
          referrer.wallet.transactions.push({
            type: 'Credit',
            amount: 100,
            description: `Referral reward for ${user.email}`,
            source: 'Referral Program',
            paymentMode: 'Wallet',
            paymentVerified: true,
            orderId: order._id,
          });
          await referrer.save();
          console.log(`₹100 referral credited to ${referrer.email}`);
        }
      }
    }

    // Save final order
    await order.save();

    res.status(200).json({
      message: 'Order status updated successfully',
      order, // Return the fully updated order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


exports.assignDeliveryBoyToOrder = async (req, res) => {
  const { orderId, deliveryBoyId } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.deliveryBoy = deliveryBoyId;

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: 'Delivery boy assigned successfully',
      data: updatedOrder,
    });

  } catch (error) {
    console.error('Error assigning delivery boy:', error);
    return res.status(500).json({
      success: false,
      message: 'Error assigning delivery boy',
      error: error.message,
    });
  }
};

exports.getOrdersByDeliveryBoy = async (req, res) => {
  const deliveryBoyId = req.user._id;

  try {
    const orders = await Order.find({ deliveryBoy: deliveryBoyId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('user', 'name email phone') // Optional: populate user info
      .populate('deliveryBoy', 'name email phone'); // Optional: populate delivery boy info

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find order by ID and populate 'user' field (assuming it's a reference)
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ message: 'Failed to get order', error: error.message });
  }
};

exports.getOrdersAllUser = async (req, res) => {


  try {
    const orders = await Order.find().populate('products.productId');
 const sortedTOrders = orders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.status(200).json(sortedTOrders);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch orders', error: err.message });
  }
};
