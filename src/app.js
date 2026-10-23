const path = require("path");
// Load the .env file that lives next to this file (src/.env), not the one in
// the folder npm was started from.
require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { connectDb } = require("./config/database");
const { authRouter } = require("./Routes/auth");
const { profileRouter } = require("./Routes/profile");
const { requestRouter } = require("./Routes/request");
const { userRouter } = require("./Routes/user");

const PORT = process.env.PORT || 3000;
const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

/**
 * Allowed browser origins. Anything listed in CLIENT_ORIGINS (comma separated)
 * is accepted, plus local dev servers and Vercel preview deployments of the
 * DevTinder frontend. This is what was causing the red CORS error in DevTools:
 * the app was opened on https://dev-tinder-master.vercel.app but the backend
 * only allowed https://dev-tinder.site.
 */
const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "https://dev-tinder.site",
  "https://www.dev-tinder.site",
];

const allowedOrigins = new Set(
  (process.env.CLIENT_ORIGINS
    ? process.env.CLIENT_ORIGINS.split(",")
    : defaultOrigins
  )
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean)
);

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // curl / mobile apps / server-to-server
  const clean = origin.replace(/\/$/, "");
  if (allowedOrigins.has(clean)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) return true;
  // Any local network address during development (e.g. http://192.168.1.5:5173)
  if (process.env.NODE_ENV !== "production" && /^https?:\/\/[\w.-]+(:\d+)?$/.test(clean)) {
    return true;
  }
  // Preview + production deployments on Vercel for this project.
  return /^https:\/\/(dev-tinder|devtinder)[a-z0-9-]*\.vercel\.app$/.test(clean);
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "DevTinder API is running",
    version: "1.0.0",
  });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// The API is mounted at both `/` and `/api` so that a frontend configured with
// either https://dev-tinder.site or https://dev-tinder.site/api keeps working.
const routers = [authRouter, profileRouter, requestRouter, userRouter];
routers.forEach((router) => app.use("/", router));
routers.forEach((router) => app.use("/api", router));

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Central error handler (CORS rejections, malformed JSON, unexpected errors).
app.use((err, req, res, next) => {
  console.error("[API ERROR]", err.message);
  if (res.headersSent) return next(err);
  if (err.message && err.message.includes("not allowed by CORS")) {
    return res.status(403).json({ message: err.message });
  }
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server",
  });
});

const startServer = async () => {
  await connectDb();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

// Only listen when this file is executed directly (`npm start`).
// On Vercel the app is imported by api/index.js instead.
if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
