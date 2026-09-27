const mongoose = require("mongoose");
const { seedServices, seedCounselors } = require("./seedData");

const autoSeedIfEmpty = async () => {
  try {
    const Service = require("../models/Service");
    const Counselor = require("../models/Counselor");

    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      console.log("[MongoDB] Seeding initial counseling services...");
      await Service.insertMany(seedServices);
      console.log(`[MongoDB] Successfully seeded ${seedServices.length} services.`);
    }

    const counselorCount = await Counselor.countDocuments();
    if (counselorCount === 0) {
      console.log("[MongoDB] Seeding initial counselor profiles...");
      await Counselor.insertMany(seedCounselors);
      console.log(`[MongoDB] Successfully seeded ${seedCounselors.length} counselors.`);
    }
  } catch (err) {
    console.warn("[MongoDB] Auto-seeding warning:", err.message);
  }
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mindcare_counseling";
    const conn = await mongoose.connect(mongoUri);

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);

    // Auto seed if empty
    await autoSeedIfEmpty();
  } catch (error) {
    console.error("[MongoDB] Connection Error:", error.message);
  }
};

module.exports = connectDB;