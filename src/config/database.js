const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const mongoose = require("mongoose");

const connectDb = async () => {
  const uri = process.env.DATABASE_URL;

  if (!uri) {
    console.error(
      "DATABASE_URL is missing. Add it to src/.env (or to the environment variables of your host)."
    );
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Database connected successfully");
  } catch (error) {
    // Never log the connection string: it contains the database password.
    console.error("Database connection failed:", error.message);
    console.error(
      "Check DATABASE_URL. Special characters in the password must be URL-encoded (for example @ -> %40)."
    );
  }
};

module.exports = { connectDb };
