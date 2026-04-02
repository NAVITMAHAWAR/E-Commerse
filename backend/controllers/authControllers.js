const JWT = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const sendEmail = require("../services/email");
const admin = require("../config/firebaseAdmin");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });
    }

    const existUser = await User.findOne({ email: email });

    if (existUser) {
      res.status(400).json({ message: "User already exists " });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedpassword,
    });

    res.status(201).json({
      message: "User registered successfully ✌️",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check for missing fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });
    }

    // user find karna
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // password match karna
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Token generate karna

    const token = JWT.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "10d" },
    );

    res.status(200).json({
      message: "User logged in successfully 👌",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email || !validator.isEmail(email)) {
//       return res.status(400).json({ message: "Valid email is required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       // Security ke liye same message (existence leak na ho)
//       return res.status(200).json({
//         message: "If this email exists, a reset link has been sent.",
//       });
//     }

//     // 1. Random secure token generate
//     const resetToken = crypto.randomBytes(32).toString("hex");

//     // 2. Hash kar ke store (DB leak hone pe bhi safe)
//     user.resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

//     await user.save({ validateBeforeSave: false });

//     // 3. Reset link (frontend route)
//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

//     // 4. Email bhejo
//     const message = `
//       <h2>Password Reset Request</h2>
//       <p>Hello ${user.name},</p>
//       <p>Click the link below to reset your password:</p>
//       <a href="${resetUrl}" style="padding:10px 20px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">Reset Password</a>
//       <p>This link will expire in 30 minutes.</p>
//       <p>If you didn't request this, please ignore this email.</p>
//       <p>Regards,<br>Your App Team</p>
//     `;

//     try {
//       await sendEmail({
//         email: user.email,
//         subject: "Reset Your Password",
//         message,
//       });

//       res.status(200).json({
//         message: "Reset link sent to your email successfully.",
//       });
//     } catch (emailErr) {
//       console.error(emailErr);
//       user.resetPasswordToken = undefined;
//       user.resetPasswordExpire = undefined;
//       await user.save({ validateBeforeSave: false });

//       return res.status(500).json({ message: "Email could not be sent" });
//     }
//   } catch (error) {
//     console.error("Forgot password error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Input validation
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email address is required",
      });
    }

    // 2. User find karo (case-insensitive email)
    const user = await User.findOne({ email: email.toLowerCase() });

    // Security: user na mile to bhi same generic message (timing attack se bachne ke liye)
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with this email exists, a password reset link has been sent.",
      });
    }

    // 3. Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 4. Update user with reset token & expiry (30 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    // validateBeforeSave: false → pre-save hook skip nahi karna chahiye, lekin yahan password nahi change ho raha
    await user.save({ validateBeforeSave: false });

    // 5. Reset URL banao
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // 6. Modern, responsive & professional email template
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
  <style>
    body { margin:0; padding:0; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background:#f4f7fa; color:#1f2937; }
    .container { max-width:600px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding:40px 30px; text-align:center; color:white; }
    .header h1 { margin:0; font-size:28px; font-weight:600; }
    .content { padding:40px 30px; line-height:1.7; font-size:16px; }
    .button { display:inline-block; margin:30px 0; padding:14px 36px; background:#4f46e5; color:white !important; text-decoration:none; font-weight:600; font-size:16px; border-radius:8px; }
    .button:hover { background:#4338ca; }
    .footer { background:#f8fafc; padding:30px; text-align:center; font-size:14px; color:#6b7280; border-top:1px solid #e5e7eb; }
    .footer a { color:#4f46e5; text-decoration:none; }
    @media (max-width:600px) { .content, .header { padding:30px 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    
    <div class="content">
      <p>Hello <strong>${user.name || "there"}</strong>,</p>
      
      <p>We received a request to reset the password for your account.</p>
      
      <p style="text-align:center; margin:35px 0;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>
      
      <p>This secure link will expire in <strong>30 minutes</strong>.</p>
      
      <p>If you didn’t request this reset, your account is still safe — just ignore this email.</p>
      
      <p style="margin-top:30px;">
        Best regards,<br>
        <strong>Your App Team</strong><br>
        <a href="${process.env.FRONTEND_URL || "https://yourapp.com"}">${process.env.FRONTEND_URL?.replace("https://", "") || "yourapp.com"}</a>
      </p>
    </div>

    <div class="footer">
      <p style="margin:0 0 10px 0;">Button not working? Copy-paste this link:</p>
      <p style="word-break:break-all; font-size:14px; color:#4f46e5; margin:0 0 20px 0;">
        ${resetUrl}
      </p>
      <p style="font-size:13px; margin:0;">
        © ${new Date().getFullYear()} Your App Name. All rights reserved.<br>
        <a href="#">Privacy Policy</a> • <a href="#">Contact Us</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // 7. Email bhejo
    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Your Password - Action Required",
        message: emailHtml,
      });

      return res.status(200).json({
        success: true,
        message:
          "Password reset link sent to your email. Please check your inbox (and spam folder).",
      });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);

      // Rollback token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};
// ------------------ New: Reset Password ------------------
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash incoming token to match DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password (pre-save hook hash karega)
    console.log("Resetting password for user", user.email);
    console.log("New password set to", password);
    user.password = password;
    user.markModified("password");
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    try {
      await user.save();
      console.log("Password reset successful for user", user.email);
    } catch (saveError) {
      console.error("Error saving user during password reset", saveError);
      throw saveError;
    }

    res.status(200).json({
      message: "Password reset successful! You can now login.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  console.log(
    "Received ID Token:",
    idToken ? "Yes (length: " + idToken.length + ")" : "No",
  );

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("Decoded Token:", decodedToken.email);
    const { uid, email, name, picture } = decodedToken;

    // Find or create user in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId: uid,
        name: name || "Google User",
        email,
        picture,
        // Add role, etc. if needed
      });
    }

    // Generate your own JWT
    const token = JWT.sign(
      { id: user._id, email: user.email, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Verify Error Details:", error.code, error.message);
    res
      .status(401)
      .json({ message: "Token verification failed", error: error.message });
  }
};

module.exports = {
  register,
  loginUser,
  forgotPassword,
  resetPassword,
  googleLogin,
};
