const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../config/mail');
const generateReferCode = require('../config/generateReferCode');
const otpStore = {}; // { email: { otp, expiresAt, userId (optional) } }

const axios = require('axios'); // Axios SMS API call ke liye




const isEmailFormat = (value) => {
  if (!value) return false;
  const v = value.toString();
  return v.includes('@') && v.includes('.');
};

function normalizePhone(phone) {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, ''); // remove all non-digits

  // if number starts with 0 or +91, remove it
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits; // always return plain 10-digit mobile number
}


exports.sendOtp = async (req, res) => {
  const rawInput = req.body.email; // frontend always sends under `email`
  if (!rawInput) return res.status(400).json({ message: 'Email or phone number is required' });

  const isEmail = isEmailFormat(rawInput);
  const identifierKey = isEmail ? rawInput.trim().toLowerCase() : normalizePhone(rawInput);

  // validate normalized phone quick check
  const isMobile = !isEmail && /^[6-9]\d{9}$/.test(identifierKey);

  try {
    // Find user by appropriate field
    const user = isEmail ? await User.findOne({ email: identifierKey }) : await User.findOne({ phone: identifierKey });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[identifierKey] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      userId: user ? user._id.toString() : null,
      isEmail,
    };

    if (isEmail) {
      // send email
      await sendOTPEmail(identifierKey, otp);
    } else {
      if (!isMobile) {
        console.warn('sendOtp: phone normalization produced invalid number:', identifierKey);
        return res.status(400).json({ message: 'Invalid phone number' });
      }

      const smsText = `Dear Customer, your OTP for login/signup is ${otp}. Please do not share it with anyone. - GAURAS ORGANIC DAIRY`;

      const smsUrl = `https://amazesms.in/api/pushsms?user=${process.env.AMAZE_USER_ID}&authkey=${process.env.AMAZE_SMS_KEY}&sender=${process.env.SENDER_ID}&mobile=${identifierKey}&text=${encodeURIComponent(smsText)}&entityid=${process.env.DLT_ENTITY_ID}&templateid=${process.env.DLT_TEMPLATE_ID}`;

      // call SMS provider
      await axios.get(smsUrl);
    }

    console.log('OTP stored for:', identifierKey, otpStore[identifierKey]);
    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('sendOtp Error:', error);
    return res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};


exports.verifyOtp = async (req, res) => {
  const { email: rawInput, otp, role, referredBy, oneSignalPlayerId } = req.body;
  if (!rawInput) return res.status(400).json({ message: 'Email/phone required' });

  const isEmail = isEmailFormat(rawInput);
  const identifierKey = isEmail ? rawInput.trim().toLowerCase() : normalizePhone(rawInput);

  // ✅ Bypass OTP for a specific email
  const bypassEmail = "ananyanamdev2005@gmail.com"; // <-- replace with the email you want to bypass
  const isBypassUser = isEmail && identifierKey === bypassEmail.toLowerCase();

  // Debug logs (optional)
  console.log('verifyOtp: looking up key:', identifierKey);
  console.log('verifyOtp: current otpStore keys:', Object.keys(otpStore));
  console.log('verifyOtp: isBypassUser:', isBypassUser);

  // Skip OTP validation if it's the bypass email
  if (!isBypassUser) {
    const record = otpStore[identifierKey];
    if (!record) {
      return res.status(400).json({ message: 'OTP not requested for this email/phone' });
    }

    if (record.expiresAt < Date.now()) {
      delete otpStore[identifierKey];
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
  }

  try {
    // If user already exists
    let user = await User.findOne({
      $or: [{ email: identifierKey }, { phone: identifierKey }]
    });

    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      if (!isBypassUser) delete otpStore[identifierKey];
      return res.status(200).json({ message: 'Login successful', token, user });
    } else {
      // Create new user
      const newUserData = {
        role,
        referCode: generateReferCode(identifierKey),
        referredBy: referredBy || null,
        oneSignalPlayerId,
      };

      if (isEmail) newUserData.email = identifierKey;
      else newUserData.phone = identifierKey;

      const newUser = await User.create(newUserData);
      const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      if (!isBypassUser) delete otpStore[identifierKey];
      return res.status(201).json({ message: 'Registration successful', token, user: newUser });
    }
  } catch (error) {
    console.error('verifyOtp Error:', error);
    return res.status(500).json({ message: 'Error verifying OTP', error: error.message });
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