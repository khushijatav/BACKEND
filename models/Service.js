const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "🧠",
    },
    category: {
      type: String,
      default: "Individual Therapy",
      trim: true,
    },
    duration: {
      type: String,
      default: "50 mins",
    },
    price: {
      type: String,
      default: "₹1,200",
    },
    benefits: {
      type: [String],
      default: [
        "Confidential 1-on-1 counseling",
        "Actionable coping strategies",
        "Goal-oriented emotional support",
      ],
    },
    targetAudience: {
      type: String,
      default: "Adults, Teens, Couples",
    },
    popular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);