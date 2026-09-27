const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Service = require("./models/Service");
const Counselor = require("./models/Counselor");
const { seedServices, seedCounselors } = require("./config/seedData");

const runSeed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mindcare_counseling";
    console.log("[Seeder] Connecting to MongoDB:", mongoUri);
    await mongoose.connect(mongoUri);

    console.log("[Seeder] Clearing existing services and counselors...");
    await Service.deleteMany({});
    await Counselor.deleteMany({});

    console.log("[Seeder] Inserting fresh services...");
    const createdServices = await Service.insertMany(seedServices);
    console.log(`[Seeder] Seeded ${createdServices.length} services.`);

    console.log("[Seeder] Inserting fresh counselors...");
    const createdCounselors = await Counselor.insertMany(seedCounselors);
    console.log(`[Seeder] Seeded ${createdCounselors.length} counselors.`);

    console.log("[Seeder] Database seeding finished successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[Seeder] Error seeding database:", error);
    process.exit(1);
  }
};

runSeed();
