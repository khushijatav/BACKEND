const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Counselor = require("../models/Counselor");

// Helper to validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==========================================
// GET ALL COUNSELORS (with optional search & specialization filter)
// GET /api/counselors
// ==========================================
router.get("/", async (req, res) => {
  try {
    const { specialization, search } = req.query;
    const filter = {};

    if (specialization && specialization !== "All") {
      filter.specialization = new RegExp(specialization, "i");
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { specialization: new RegExp(search, "i") },
        { role: new RegExp(search, "i") },
        { bio: new RegExp(search, "i") },
      ];
    }

    const counselors = await Counselor.find(filter).sort({ rating: -1, createdAt: -1 });
    res.status(200).json(counselors);
  } catch (error) {
    console.error("Fetch Counselors Error:", error.message);
    res.status(500).json({ message: "Failed to fetch counselors", error: error.message });
  }
});

// ==========================================
// GET SINGLE COUNSELOR DETAILS
// GET /api/counselors/:id
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid counselor ID format" });
    }

    const counselor = await Counselor.findById(req.params.id);
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }
    res.status(200).json(counselor);
  } catch (error) {
    console.error("Fetch Counselor Error:", error.message);
    res.status(500).json({ message: "Failed to fetch counselor", error: error.message });
  }
});

// ==========================================
// ADD NEW COUNSELOR
// POST /api/counselors
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { name, specialization } = req.body;
    if (!name || !specialization) {
      return res.status(400).json({ message: "Name and specialization are required" });
    }

    const counselor = new Counselor(req.body);
    await counselor.save();
    res.status(201).json({ message: "Counselor added successfully", counselor });
  } catch (error) {
    console.error("Add Counselor Error:", error.message);
    res.status(500).json({ message: "Failed to add counselor", error: error.message });
  }
});

// ==========================================
// UPDATE COUNSELOR
// PUT /api/counselors/:id
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid counselor ID format" });
    }

    const counselor = await Counselor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }
    res.status(200).json({ message: "Counselor updated successfully", counselor });
  } catch (error) {
    console.error("Update Counselor Error:", error.message);
    res.status(500).json({ message: "Failed to update counselor", error: error.message });
  }
});

// ==========================================
// DELETE COUNSELOR
// DELETE /api/counselors/:id
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid counselor ID format" });
    }

    const counselor = await Counselor.findByIdAndDelete(req.params.id);
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }
    res.status(200).json({ message: "Counselor removed successfully" });
  } catch (error) {
    console.error("Delete Counselor Error:", error.message);
    res.status(500).json({ message: "Failed to delete counselor", error: error.message });
  }
});

module.exports = router;