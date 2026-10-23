const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const express = require("express");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const profileRouter = express.Router();
const { User } = require("../models/user");
const { userAuth } = require("../middlewares/authmiddlewares");

const ALLOWED_UPDATE = [
  "firstName",
  "lastName",
  "photoUrl",
  "about",
  "gender",
  "age",
  "skills",
];

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  return res.status(200).json({ message: req.user.toJSON() });
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const data = { ...(req.body || {}) };

    if (!Object.keys(data).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    if (data.skills !== undefined) {
      if (!Array.isArray(data.skills)) {
        return res.status(400).json({ message: "Skills must be an array of strings" });
      }
      data.skills = data.skills.map((skill) => String(skill).trim()).filter(Boolean);
      if (data.skills.length > 10) {
        return res.status(400).json({ message: "Skills cannot be more than 10" });
      }
    }

    if (data.age !== undefined) {
      data.age = Number(data.age);
      if (Number.isNaN(data.age) || data.age < 18) {
        return res.status(400).json({ message: "Age must be a number greater than or equal to 18" });
      }
    }

    const isUpdateAllowed = Object.keys(data).every((key) => ALLOWED_UPDATE.includes(key));
    if (!isUpdateAllowed) {
      return res.status(400).json({ message: "Update not allowed" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, data, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: `${user.firstName}, your profile was updated successfully`,
      user: user.toJSON(),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

profileRouter.patch("/profile/updatePassword", userAuth, async (req, res) => {
  try {
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ message: "Please enter a strong password" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(400).json({ message: `Something went wrong: ${error.message}` });
  }
});

module.exports = { profileRouter };
