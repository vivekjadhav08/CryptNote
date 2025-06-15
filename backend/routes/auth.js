const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const ResetToken = require('../models/ResetToken');


require('dotenv').config(); // for using .env variables

const JWT_SECRET = "ViVeK@08$";

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

    //If there are error, return bad request and error
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        res
          .status(400)
          .json({
            success,
            error: "Please try to login with correct credentials",
          });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        res
          .status(400)
          .json({
            success,
            error: "Please try to login with correct credentials",
          });
      }
      //For Generate token using id and JWT Secret
      const data = {
        user: {
          id: user.id,
        },
      };
      var authToken = jwt.sign(data, JWT_SECRET);
      // res.json(user)
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send(success, "Internal Server Error");
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

//ROUTE 4 : FORGOT PASSWORD - Send Email Link
router.post('/forgotpassword', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log('User found:', user);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Delete existing token if any
    await ResetToken.findOneAndDelete({ userId: user._id });

    // Save new token with expiry
    await new ResetToken({
      userId: user._id,
      token: hashedToken,
      expireAt: Date.now() + 1000 * 60 * 15, // 15 minutes
    }).save();

    const resetURL = `http://192.168.31.158:1001/resetpassword/${token}`;

    // Email setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Reset Your Password',
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetURL}">${resetURL}</a>
             <p>This link will expire in 15 minutes.</p>`,
    });

    res.json({ message: 'Reset password link sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// RESET PASSWORD - Handle password update
router.post('/resetpassword/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const resetToken = await ResetToken.findOne({
      token: hashedToken,
      expireAt: { $gt: Date.now() },
    });

    if (!resetToken) return res.status(400).json({ error: 'Invalid or expired token' });

    const user = await User.findById(resetToken.userId);
    if (!user) return res.status(400).json({ error: 'User no longer exists' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();

    await resetToken.deleteOne();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
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


module.exports = router;
