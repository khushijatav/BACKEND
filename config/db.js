const mongoose = require("mongoose");
const { seedServices, seedCounselors } = require("./seedData");

let isSeeded = false;

const autoSeedIfEmpty = async () => {
  if (isSeeded) return;
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
    isSeeded = true;
  } catch (err) {
    console.warn("[MongoDB] Auto-seeding warning:", err.message);
  }
};

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const primaryUri = process.env.MONGO_URI;
  const localFallbackUri = "mongodb://127.0.0.1:27017/mindcare_counseling";
  const targetUri = primaryUri || localFallbackUri;

  const attemptConnection = (uri, isFallback = false) => {
    return mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(async (conn) => {
        console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
        await autoSeedIfEmpty();
        return conn;
      })
      .catch(async (error) => {
        if (!isFallback && primaryUri && primaryUri !== localFallbackUri && process.env.NODE_ENV !== "production") {
          console.warn(`[MongoDB] Primary connection failed (${error.message}). Falling back to local MongoDB...`);
          return attemptConnection(localFallbackUri, true);
        }
        throw error;
      });
  };

  cachedPromise = attemptConnection(targetUri).catch((error) => {
    cachedPromise = null;
    console.error("[MongoDB] Connection Error:", error.message);
    throw error;
  });

  return cachedPromise;
};

module.exports = connectDB;