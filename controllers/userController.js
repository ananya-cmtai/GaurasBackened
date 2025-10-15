const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../config/mail');
const generateReferCode = require('../config/generateReferCode');
const otpStore = {}; // { email: { otp, expiresAt, userId (optional) } }

const axios = require('axios'); // Axios SMS API call ke liye



const isEmailFormat = (value) => value.includes('@') && value.includes('.com');

exports.sendOtp = async (req, res) => {
  const { email } = req.body; // This is either an email OR phone number
  if (!email) return res.status(400).json({ message: 'Email or phone number is required' });

  const isEmail = isEmailFormat(email);
  const identifier = isEmail ? { email } : { phone: email };

  try {
    const user = await User.findOne(identifier);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      userId: user ? user._id.toString() : null,
    };

    if (isEmail) {
      await sendOTPEmail(email, otp);
    } else {
      const smsText = `Dear Customer, your OTP for login/signup is ${otp}. Please do not share it with anyone. - GAURAS ORGANIC DAIRY`;

      const smsUrl = `https://amazesms.in/api/pushsms?user=${process.env.AMAZE_USER_ID}&authkey=${process.env.AMAZE_SMS_KEY}&sender=${process.env.SENDER_ID}&mobile=${email}&text=${encodeURIComponent(smsText)}&entityid=${process.env.DLT_ENTITY_ID}&templateid=${process.env.DLT_TEMPLATE_ID}`;

      await axios.get(smsUrl);
    }

    console.log('OTP sent:', otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP Send Error:', error.message);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};


exports.verifyOtp = async (req, res) => {
  const { email, otp, role, referredBy, oneSignalPlayerId } = req.body;

  if (!email || !otp) return res.status(400).json({ message: 'Email/phone and OTP required' });

  const isEmail = isEmailFormat(email);
  const identifier = isEmail ? { email } : { phone: email };

  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: 'OTP not requested for this email/phone' });

  if (record.expiresAt < Date.now()) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  try {
    if (record.userId) {
      // Existing user: login
      const user = await User.findById(record.userId);
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      delete otpStore[email];
      return res.status(200).json({ message: 'Login successful', token, user });
    } else {
      // New user: register
      const newUser = await User.create({
        ...(isEmail ? { email } : { phone: email }),
        role,
        referCode: generateReferCode(email),
        referredBy: referredBy || null,
        oneSignalPlayerId,
      });

      const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      delete otpStore[email];
      return res.status(201).json({ message: 'Registration successful', token, user: newUser });
    }
  } catch (error) {
    console.error('Verify OTP Error:', error.message);
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
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id; // From JWT middleware

    const user = await User.findById(userId).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};
 exports.saveFCMtoken=async(req, res)=>{
   const { userId, fcmToken } = req.body;
  if (!userId || !fcmToken) return res.status(400).json({ message: 'Missing userId or fcmToken' });

  try {
    const updatedUser = await User.findByIdAndUpdate(
  userId,
  { fcmToken },
  { new: true }
);
console.log('Updated user:', updatedUser);

    res.json({ message: 'FCM token saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
 }