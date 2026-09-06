// const express = require("express");
// const router = express.Router();

// const Service = require("../models/service");
// // GET ALL SERVICES
// router.get("/", async (req, res) => {
//   try {
//     const services = await Service.find();

//     res.status(200).json(services);
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to fetch services",
//       error: error.message,
//     });
//   }
// });

// // GET SINGLE SERVICE
// router.get("/:id", async (req, res) => {
//   try {
//     const service = await Service.findById(req.params.id);

//     if (!service) {
//       return res.status(404).json({
//         message: "Service not found",
//       });
//     }

//     res.status(200).json(service);
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to fetch service",
//       error: error.message,
//     });
//   }
// });

// // ADD NEW SERVICE
// router.post("/", async (req, res) => {
//   try {
//     const { title, description, icon } = req.body;

//     const service = new Service({
//       title,
//       description,
//       icon,
//     });

//     const savedService = await service.save();

//     res.status(201).json({
//       message: "Service added successfully",
//       service: savedService,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to add service",
//       error: error.message,
//     });
//   }
// });

// // DELETE SERVICE
// router.delete("/:id", async (req, res) => {
//   try {
//     const service = await Service.findByIdAndDelete(req.params.id);

//     if (!service) {
//       return res.status(404).json({
//         message: "Service not found",
//       });
//     }

//     res.status(200).json({
//       message: "Service deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to delete service",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

const Service = require("../models/Service");

// ==========================================
// GET ALL SERVICES
// GET /api/services
// ==========================================

router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    res.status(200).json(services);
  } catch (error) {
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
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json(service);
  } catch (error) {
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
    const { title, description, icon } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const service = new Service({
      title,
      description,
      icon,
    });

    const savedService = await service.save();

    res.status(201).json({
      message: "Service added successfully",
      service: savedService,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add service",
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
    res.status(500).json({
      message: "Failed to delete service",
      error: error.message,
    });
  }
});

module.exports = router;