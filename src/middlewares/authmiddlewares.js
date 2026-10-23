const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const jwtSecret = () => process.env.JWT_SECRET || process.env.SECREAT_KEY;

/**
 * Accepts the JWT either from the httpOnly cookie (same-site deployments) or
 * from an `Authorization: Bearer <token>` header (cross-site deployments such
 * as frontend on Vercel + backend on a custom domain, where third-party
 * cookies are blocked by the browser).
 */
const userAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const bearerToken = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return res.status(401).json({ message: "Please log in to continue" });
    }

    const secret = jwtSecret();
    if (!secret) {
      console.error("JWT secret is missing. Set JWT_SECRET in src/.env");
      return res.status(500).json({ message: "Server is not configured correctly" });
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: "User not found. Please log in again" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Session expired. Please log in again" });
  }
};

module.exports = { userAuth };
