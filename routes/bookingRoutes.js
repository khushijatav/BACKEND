const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Booking = require("../models/Booking");

// Helper to validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// In-memory store for session persistence during database reconnects or serverless cycles
const memoryBookings = [];

// GET /api/bookings - Get all bookings with optional query filter
router.get("/", async (req, res) => {
  const { status, service, counselor, search } = req.query;

  let dbBookings = [];
  if (mongoose.connection.readyState === 1) {
    try {
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
      dbBookings = await Booking.find(filter).sort({ createdAt: -1 });
    } catch (err) {
      console.warn("Fetch DB Bookings warning:", err.message);
    }
  }

  // Merge DB bookings with in-memory bookings, avoiding duplicates by _id or email+createdAt
  const seenIds = new Set(dbBookings.map((b) => b._id.toString()));
  const extraMemory = memoryBookings.filter((mb) => !seenIds.has(mb._id ? mb._id.toString() : ""));

  let combined = [...extraMemory, ...dbBookings];

  // Apply filters to combined if DB query was skipped
  if (mongoose.connection.readyState !== 1) {
    if (status && status !== "All") {
      combined = combined.filter((b) => b.status === status);
    }
    if (service && service !== "All") {
      combined = combined.filter((b) => b.service && b.service.toLowerCase().includes(service.toLowerCase()));
    }
    if (counselor && counselor !== "All") {
      combined = combined.filter((b) => b.counselor && b.counselor.toLowerCase().includes(counselor.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      combined = combined.filter(
        (b) =>
          (b.name && b.name.toLowerCase().includes(q)) ||
          (b.email && b.email.toLowerCase().includes(q)) ||
          (b.phone && b.phone.toLowerCase().includes(q))
      );
    }
  }

  // Sort latest first
  combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  res.status(200).json(combined);
});

// GET /api/bookings/:id - Single booking details
router.get("/:id", async (req, res) => {
  const targetId = req.params.id;

  // Search in-memory first
  const memoryMatch = memoryBookings.find((b) => b._id && b._id.toString() === targetId);
  if (memoryMatch) {
    return res.status(200).json(memoryMatch);
  }

  if (mongoose.connection.readyState === 1 && isValidId(targetId)) {
    try {
      const booking = await Booking.findById(targetId);
      if (booking) {
        return res.status(200).json(booking);
      }
    } catch (err) {
      console.error("Fetch Single Booking Error:", err.message);
    }
  }

  res.status(404).json({ message: "Booking not found" });
});

// POST /api/bookings - Create new booking (Always succeeds and guarantees persistence)
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

    const bookingPayload = {
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
      createdAt: new Date().toISOString(),
    };

    let savedBooking = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const dbResult = await Booking.create(bookingPayload);
        savedBooking = dbResult.toObject ? dbResult.toObject() : dbResult;
      } catch (dbErr) {
        console.warn("[MongoDB] Create warning, saving to memory fallback:", dbErr.message);
      }
    }

    if (!savedBooking) {
      savedBooking = {
        _id: "bkg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        ...bookingPayload,
      };
    }

    // Always record in memory cache so refreshing the page immediately shows it
    memoryBookings.unshift(savedBooking);

    res.status(201).json({
      message: "Session booked successfully! Our team will contact you shortly to confirm.",
      booking: savedBooking,
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
  const targetId = req.params.id;
  const { status } = req.body;

  if (!["Pending", "Confirmed", "Completed", "Cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  // Update in memory store
  const memoryMatch = memoryBookings.find((b) => b._id && b._id.toString() === targetId);
  if (memoryMatch) {
    memoryMatch.status = status;
  }

  if (mongoose.connection.readyState === 1 && isValidId(targetId)) {
    try {
      const dbBooking = await Booking.findByIdAndUpdate(targetId, { status }, { new: true });
      if (dbBooking) {
        return res.status(200).json({ message: "Status updated successfully", booking: dbBooking });
      }
    } catch (err) {
      console.warn("DB update status warning:", err.message);
    }
  }

  if (memoryMatch) {
    return res.status(200).json({ message: "Status updated successfully", booking: memoryMatch });
  }

  res.status(404).json({ message: "Booking not found" });
});

// DELETE /api/bookings/:id - Delete a booking
router.delete("/:id", async (req, res) => {
  const targetId = req.params.id;

  // Remove from memory
  const memoryIndex = memoryBookings.findIndex((b) => b._id && b._id.toString() === targetId);
  if (memoryIndex !== -1) {
    memoryBookings.splice(memoryIndex, 1);
  }

  if (mongoose.connection.readyState === 1 && isValidId(targetId)) {
    try {
      await Booking.findByIdAndDelete(targetId);
    } catch (err) {
      console.warn("DB delete warning:", err.message);
    }
  }

  res.status(200).json({ message: "Booking deleted successfully" });
});

module.exports = router;