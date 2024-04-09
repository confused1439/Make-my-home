const express = require("express");
const User = require("../model/model.user");
const BlacklistedToken = require("../model/model.blacklistedToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Token not provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.userId = decoded.userId;
    next();
  });
};

// Login route
router.post("/home/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        error: "Username not found in the database",
        alert: {
          type: "danger",
          message: "Username not found, redirecting to signup page...",
        },
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid username or password",
        alert: { type: "warning", message: "Invalid credentials!" },
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const redirectUrl = `/tenant-profile?username=${encodeURIComponent(
      username
    )}`;

    res.status(200).json({
      success: true,
      redirectUrl,
      alert: { type: "success", message: "Login successful!" },
    });
    console.log("Login successful!");
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Signup logic
router.post("/home/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "Username already exists",
        alert: { type: "warning", message: "Choose some other username!" },
      });
    }

    // Validate password (e.g., minimum length, special characters, etc.)
    if (password.length < 7) {
      return res.status(400).json({
        error: "Password too weak!",
        alert: {
          type: "warning",
          message: "Password must be at least 7 characters long",
        },
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance with hashed password
    const newUser = new User({ username, password: hashedPassword });

    // Save the new user to the database
    await newUser.save();

    const redirectUrlForLogin = "/home/login";
    // Successful signup
    res.status(201).json({
      success: true,
      redirectUrlForLogin,
      alert: { type: "success", message: "Account created successful!" },
    });
    console.log("Signup successful!");
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// router.post("/logout", (req, res) => {
//   // Clear the JWT token from the client-side (for example, remove it from local storage)
//   // Here, assuming the JWT token is stored in a cookie named "jwtToken"
//   res.clearCookie("jwtToken");

//   // Redirect the user to the home page
// });

// Logout route
router.post("/logout", async (req, res) => {
  try {
    // Clear the JWT token from the client-side (for example, remove it from local storage)
    // Here, assuming the JWT token is stored in a cookie named "jwtToken"
    // You can replace this with the appropriate logic based on how you handle tokens in your client-side application
    res.clearCookie("jwtToken");

    res.redirect("/");
    // Respond with a success message
    res.status(200);
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = { router };
