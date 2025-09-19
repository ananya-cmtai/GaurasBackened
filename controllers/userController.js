const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../config/mail');

const otpStore = {}; // { email: { otp, expiresAt, userId (optional) } }

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
      userId: user ? user._id.toString() : null,
    };

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: 'OTP not requested for this email' });

  if (record.expiresAt < Date.now()) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  try {
    if (record.userId) {
      // User exists, so login
      const user = await User.findById(record.userId);

      // Generate JWT token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      delete otpStore[email];
      return res.status(200).json({ message: 'Login successful', token, user });
    } else {
      // User does not exist, so register

      // Password must be provided for registration


    

      const newUser = await User.create({
        
        email,
      
        // phone,
       
      });

      const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      delete otpStore[email];
      return res.status(201).json({ message: 'Registration successful', token, user: newUser });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};
exports.updateProfile = async (req, res) => {
  const userId = req.user._id; // Assuming you're using JWT middleware that sets req.user
  const { name, phone, address,email } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(email && { email }),
          ...(address && { address }),
        },
      },
      { new: true } // return updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};