const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const publicLeadRoutes = require("./routes/publicLeadRoutes");

const app = express();

const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL].filter(
  Boolean,
);

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/public/leads", publicLeadRoutes);

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Digital Heroes Lead Management API is running",
  });
});

module.exports = app;
