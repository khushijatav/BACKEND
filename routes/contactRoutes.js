const express = require("express");
const router = express.Router();

const Contact = require("../models/Contact");

// POST - Save contact
router.post("/", async (req, res) => {
  try {
    const contact = new Contact(req.body);

    await contact.save();

    res.status(201).json({
      message: "Message sent successfully",
      contact,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET - Get all contacts
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;