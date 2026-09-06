const express = require("express");

const router = express.Router();

const Counselor = require("../models/Counselor");

// Get all counselors
router.get("/", async (req, res) => {
  try {
    const counselors = await Counselor.find();

    res.json(counselors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Add counselor
router.post("/", async (req, res) => {
  try {
    const counselor = new Counselor(req.body);

    await counselor.save();

    res.status(201).json(counselor);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;