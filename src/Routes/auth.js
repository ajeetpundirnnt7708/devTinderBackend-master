const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const express = require("express");
const bcrypt = require("bcryptjs");

const authRouter = express.Router();
const { User } = require("../models/user");
const { userAuth } = require("../middlewares/authmiddlewares");
const { validateSignup } = require("../utils/validation");

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  // SameSite=None requires HTTPS and allows the cookie to be used when the
  // frontend (Vercel) and the API (custom domain) are on different sites.
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body || {};

    if (!emailId || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ emailId: String(emailId).toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.getValidatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = await user.getJWT();
    res.cookie("token", token, cookieOptions());

    // `token` is also returned so the frontend can keep working when browsers
    // block third-party cookies.
    return res.status(200).json({
      message: "Logged in successfully",
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password, age, gender, about, skills, photoUrl } =
      req.body || {};

    validateSignup(req);

    const existingUser = await User.findOne({
      emailId: String(emailId).toLowerCase().trim(),
    });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      emailId,
      password: hashPassword,
      age,
      gender,
      about,
      skills,
      photoUrl,
    });

    const token = await user.getJWT();
    res.cookie("token", token, cookieOptions());

    return res.status(201).json({
      message: "Account created successfully",
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

authRouter.delete("/deleteuser", userAuth, async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ message: "User id is required" });

    if (id !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own account" });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: `Something went wrong: ${error.message}` });
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({ message: "Logged out successfully" });
});

module.exports = { authRouter };
