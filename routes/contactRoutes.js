const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Contact = require("../models/Contact");

// Helper to validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/contact - Get all contact inquiries
router.get("/", async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
        { message: new RegExp(search, "i") },
      ];
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Fetch Contacts Error:", error.message);
    res.status(500).json({
      message: "Failed to fetch contact inquiries",
      error: error.message,
    });
  }
});

// POST /api/contact - Submit new contact inquiry
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject && subject.trim() ? subject.trim() : "General Counseling Inquiry",
      message: message.trim(),
      status: "New",
    });

    await contact.save();

    res.status(201).json({
      message: "Thank you for reaching out! Your message has been received.",
      contact,
    });
  } catch (error) {
    console.error("Save Contact Error:", error.message);
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// PATCH /api/contact/:id/status - Update message status
router.patch("/:id/status", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid inquiry ID format" });
    }

    const { status } = req.body;
    if (!["New", "Read", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.status(200).json({ message: "Inquiry status updated", contact });
  } catch (error) {
    console.error("Update Contact Error:", error.message);
    res.status(500).json({ message: "Failed to update inquiry", error: error.message });
  }
});

// DELETE /api/contact/:id - Delete inquiry
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid inquiry ID format" });
    }

    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.status(200).json({ message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Delete Contact Error:", error.message);
    res.status(500).json({ message: "Failed to delete inquiry", error: error.message });
  }
});

module.exports = router;