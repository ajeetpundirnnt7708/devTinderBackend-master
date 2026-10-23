/**
 * Vercel serverless entry point.
 *
 * Vercel rewrites every request to this function (see vercel.json) and Express
 * handles the routing. The MongoDB connection is reused between warm
 * invocations instead of opening a new one on every request.
 */
const mongoose = require("mongoose");
const app = require("../src/app");
const { connectDb } = require("../src/config/database");

let connectionPromise = null;

const ensureDatabase = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();

  if (!connectionPromise) {
    connectionPromise = connectDb().finally(() => {
      connectionPromise = null;
    });
  }

  return connectionPromise;
};

module.exports = async (req, res) => {
  await ensureDatabase();
  return app(req, res);
};
