const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");

router.post("/", async (req, res) => {
  try {
    console.log("Received booking:", req.body);

    const booking = await Booking.create({
      name: req.body.name,
      email: req.body.email,
      service: req.body.service,
    });

    res.status(201).json({
      message: "Booking successful",
      booking,
    });

  } catch (error) {
    console.log("Booking Error:", error.message);

    res.status(500).json({
      message: "Booking failed",
      error: error.message,
    });
  }
});

module.exports = router;