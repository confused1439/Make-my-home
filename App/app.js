// Load environment variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const jwtSecret = process.env.JWT_SECRET;

const app = express();
const PORT = 3000;
// Import the router and middleware
const { router } = require("./router");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database connected successfully!");
  })
  .catch((err) => {
    console.log("Failed to connect!");
  });

// Define the protected route handler
const protectedRouteHandler = (req, res) => {
  // Your logic for handling the protected route goes here
  res.status(200).json({ message: "Protected route accessed successfully" });
};

// Apply the middleware to protected routes
app.use("/protected-route", protectedRouteHandler);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../pages")));
app.use(express.static(path.join(__dirname, "../pictures")));
app.use(express.static(path.join(__dirname, "../style")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/index.html"));
});

// Serve login/signup pages
app.get("/home/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/login.html"));
});

app.get("/home/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/signup.html"));
});

app.get("/tenant-profile", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/tenant.profile.html"));
});

// Route for handling login/signup requests
app.use(router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
