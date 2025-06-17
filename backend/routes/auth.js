const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const ResetToken = require("../models/ResetToken");

require("dotenv").config(); // for using .env variables
const JWT_SECRET = process.env.JWT_SECRET;
const LIVE_URL = process.env.REACT_APP_API_LIVE_URL;

//ROUTE 1 : Create User Endpoint: api/auth/createuser No login req
router.post(
  "/createuser",
  [
    body("name", "Enter Valid Name").isLength({ min: 3 }),
    body("email", "Enter Valid Email").isEmail(),
    body("password", "Password Must be 5 Characters").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      //  Only check by email
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success, error: "Email Already Exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: { id: user.id },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error("Error creating user:", error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 2:Login Endpoint: api/auth/login No login req
router.post(
  "/login",
  [
    body("email", "Enter Valid Email").isEmail(),
    body("password", "Password Cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({
            success,
            error: "Please try to login with correct credentials",
          });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({
            success,
            error: "Please try to login with correct credentials",
          });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      // const JWT_SECRET = process.env.JWT_SECRET; // <-- Make sure this line exists
      const authToken = jwt.sign(data, JWT_SECRET);

      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);

//ROUTE 3 :Get User  Endpoint: api/auth/getuser  login required
router.post("/getuser", fetchuser, async (req, res) => {
  const errors = validationResult(req);
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4 : FORGOT PASSWORD - Send Email Link
router.post("/forgotpassword", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Delete any existing token
    await ResetToken.findOneAndDelete({ userId: user._id });

    // Save new reset token with expiry
    await new ResetToken({
      userId: user._id,
      token: hashedToken,
      expireAt: Date.now() + 1000 * 60 * 15, // 15 minutes
    }).save();

    const resetURL = `${LIVE_URL}/resetpassword/${token}`;

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Crypt Note" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Reset Your Crypt Note Password",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2 style="color:#4CAF50;">Crypt Note</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the link below to set a new one:</p>
          <a href="${resetURL}" style="display:inline-block;background:#4CAF50;color:#fff;padding:10px 20px;margin-top:10px;text-decoration:none;border-radius:5px;">Reset Password</a>
          <p>This link is valid for <strong>15 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br/>
          <p>– The Crypt Note Team</p>
        </div>
      `,
    });

    res.json({ message: "Reset password link sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// RESET PASSWORD - Handle password update
router.post("/resetpassword/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const resetToken = await ResetToken.findOne({
      token: hashedToken,
      expireAt: { $gt: Date.now() },
    });

    if (!resetToken)
      return res.status(400).json({ error: "Invalid or expired token" });

    const user = await User.findById(resetToken.userId);
    if (!user) return res.status(400).json({ error: "User no longer exists" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();

    await resetToken.deleteOne();

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ROUTE 5: Update user details - PUT: /api/auth/updateuser - Login required
router.put("/updateuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, password } = req.body;

    const updates = {};
    if (name) updates.name = name;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      updates.password = secPass;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, updatedUser });
  } catch (error) {
    console.error("Update user error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 6: Delete user account - DELETE: /api/auth/deleteuser - Login required
router.delete("/deleteuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, message: "User account deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 7: Send 6-digit OTP via email - POST: /api/auth/sendotp
const OtpToken = require('../models/OtpToken'); 
router.post(
  "/sendotp",
  [body("email", "Enter a valid email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ success: false, error: "Email already registered" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SENDER_EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Crypt Note" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: "Crypt Note Signup OTP Verification",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5">
            <h2 style="color:#4CAF50;">Crypt Note</h2>
            <p>Hello,</p>
            <p>Your OTP for signing up to <strong>Crypt Note</strong> is:</p>
            <h2 style="letter-spacing:4px;">${otp}</h2>
            <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          </div>
        `,
      });

      await OtpToken.deleteMany({ email });
      await new OtpToken({ email, otp }).save();

      res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
      console.error("Signup OTP error:", err.message);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);


// ROUTE 8: Verify OTP - POST: /api/auth/verifyotp
router.post(
  "/verifyotp",
  [
    body("email", "Enter a valid email").isEmail(),
    body("otp", "OTP must be a 6-digit code").isLength({ min: 6, max: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, otp } = req.body;

    try {
      const record = await OtpToken.findOne({ email });

      if (!record) {
        return res
          .status(400)
          .json({ success: false, error: "OTP expired or not found." });
      }

      if (record.otp !== otp) {
        return res.status(400).json({ success: false, error: "Invalid OTP." });
      }

      // OTP matched - delete it
      await OtpToken.deleteOne({ _id: record._id });

      res.json({ success: true, message: "OTP verified successfully." });
    } catch (err) {
      console.error("Verify OTP error:", err.message);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);

// ROUTE 9: Check if email exists - POST: /api/auth/checkemail
router.post('/checkemail', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
