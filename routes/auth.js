const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

//User Registration
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Unhashed create user
    /*
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
    */
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Check if the password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // For initial testing
    // res.status(200).json({ msg: "Logged in" });

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
