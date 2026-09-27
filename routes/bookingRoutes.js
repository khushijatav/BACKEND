const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Booking = require("../models/Booking");

// Helper to validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/bookings - Get all bookings with optional query filter
router.get("/", async (req, res) => {
  try {
    const { status, service, counselor, search } = req.query;
    const filter = {};

    if (status && status !== "All") filter.status = status;
    if (service && service !== "All") filter.service = new RegExp(service, "i");
    if (counselor && counselor !== "All") filter.counselor = new RegExp(counselor, "i");
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
      ];
    }

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Fetch Bookings Error:", error.message);
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
});

// GET /api/bookings/:id - Single booking details
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error("Fetch Booking Error:", error.message);
    res.status(500).json({ message: "Error fetching booking", error: error.message });
  }
});

// POST /api/bookings - Create new booking
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, service, counselor, date, time, mode, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Your name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "A valid email address is required." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email format." });
    }
    if (!service || !service.trim()) {
      return res.status(400).json({ message: "Please select a service for your session." });
    }

    const booking = await Booking.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      service: service.trim(),
      counselor: counselor && counselor.trim() ? counselor.trim() : "Any Available Counselor",
      date: date || new Date().toISOString().split("T")[0],
      time: time || "10:00 AM",
      mode: mode || "Online Video",
      notes: notes ? notes.trim() : "",
      status: "Pending",
    });

    res.status(201).json({
      message: "Session booked successfully! Our team will contact you shortly to confirm.",
      booking,
    });
  } catch (error) {
    console.error("Booking Creation Error:", error.message);
    res.status(500).json({
      message: "Failed to book session",
      error: error.message,
    });
  }
});

// PATCH /api/bookings/:id/status - Update booking status
router.patch("/:id/status", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    const { status } = req.body;
    if (!["Pending", "Confirmed", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Status updated successfully", booking });
  } catch (error) {
    console.error("Update Booking Status Error:", error.message);
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
});

// DELETE /api/bookings/:id - Delete a booking
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete Booking Error:", error.message);
    res.status(500).json({ message: "Failed to delete booking", error: error.message });
  }
});

module.exports = router;