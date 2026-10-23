const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      index: true,
      maxlength: 20,
      trim: true,
    },
    lastName: {
      type: String,
      maxlength: 20,
      trim: true,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Invalid email address");
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        // A bcrypt hash is stored, so only validate plain-text passwords.
        if (!value.startsWith("$2") && !validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender is not valid");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error(`Invalid photo URL: ${value}`);
        }
      },
    },
    about: {
      type: String,
      maxlength: 300,
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.methods.getJWT = async function () {
  const secret = process.env.JWT_SECRET || process.env.SECREAT_KEY;
  if (!secret) throw new Error("JWT secret is not configured");
  return jwt.sign({ _id: this._id }, secret, { expiresIn: "7d" });
};

userSchema.methods.getValidatePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = { User };
