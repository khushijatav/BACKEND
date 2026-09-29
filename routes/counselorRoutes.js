const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Counselor = require("../models/Counselor");
const { seedCounselors } = require("../config/seedData");

// Helper to validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==========================================
// GET ALL COUNSELORS (with optional search & specialization filter)
// GET /api/counselors
// ==========================================
router.get("/", async (req, res) => {
  const { specialization, search } = req.query;

  if (mongoose.connection.readyState === 1) {
    try {
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
      if (counselors && counselors.length > 0) {
        return res.status(200).json(counselors);
      }
    } catch (error) {
      console.warn("Fetch Counselors DB Warning (using seedCounselors fallback):", error.message);
    }
  }

  // Graceful fallback so counselors list never disappears on refresh
  let result = seedCounselors.map((c, idx) => ({ ...c, _id: c._id || `seed-counselor-${idx + 1}` }));
  if (specialization && specialization !== "All") {
    result = result.filter(
      (c) =>
        (c.specialization && c.specialization.toLowerCase().includes(specialization.toLowerCase())) ||
        (c.role && c.role.toLowerCase().includes(specialization.toLowerCase()))
    );
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.specialization && c.specialization.toLowerCase().includes(q)) ||
        (c.role && c.role.toLowerCase().includes(q))
    );
  }

  res.status(200).json(result);
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