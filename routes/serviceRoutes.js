const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Service = require("../models/Service");

// Helper to validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==========================================
// GET ALL SERVICES (with optional category & search filter)
// GET /api/services
// ==========================================
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = new RegExp(category, "i");
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { shortDescription: new RegExp(search, "i") },
      ];
    }

    const services = await Service.find(filter).sort({ popular: -1, createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    console.error("Fetch Services Error:", error.message);
    res.status(500).json({
      message: "Failed to fetch services",
      error: error.message,
    });
  }
});

// ==========================================
// GET SINGLE SERVICE DETAILS
// GET /api/services/:id
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid service ID format" });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error("Fetch Service Details Error:", error.message);
    res.status(500).json({
      message: "Failed to fetch service details",
      error: error.message,
    });
  }
});

// ==========================================
// ADD NEW SERVICE
// POST /api/services
// ==========================================
router.post("/", async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      description,
      icon,
      category,
      duration,
      price,
      benefits,
      targetAudience,
      popular,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const service = new Service({
      title,
      shortDescription: shortDescription || "",
      description,
      icon: icon || "🧠",
      category: category || "Individual Therapy",
      duration: duration || "50 mins",
      price: price || "₹1,200",
      benefits: Array.isArray(benefits) ? benefits : ["Confidential 1-on-1 counseling", "Coping strategies"],
      targetAudience: targetAudience || "Adults & Teens",
      popular: Boolean(popular),
    });

    const savedService = await service.save();

    res.status(201).json({
      message: "Service added successfully",
      service: savedService,
    });
  } catch (error) {
    console.error("Add Service Error:", error.message);
    res.status(500).json({
      message: "Failed to add service",
      error: error.message,
    });
  }
});

// ==========================================
// UPDATE SERVICE
// PUT /api/services/:id
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid service ID format" });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Update Service Error:", error.message);
    res.status(500).json({
      message: "Failed to update service",
      error: error.message,
    });
  }
});

// ==========================================
// DELETE SERVICE
// DELETE /api/services/:id
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid service ID format" });
    }

    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete Service Error:", error.message);
    res.status(500).json({
      message: "Failed to delete service",
      error: error.message,
    });
  }
});

module.exports = router;