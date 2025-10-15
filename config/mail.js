const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Your OTP Code',
    text:  `Dear Customer, your OTP for login/signup is ${otp}. Please do not share it with anyone. - GAURAS ORGANIC DAIRY`,
  };

  await transporter.sendMail(mailOptions);
};
