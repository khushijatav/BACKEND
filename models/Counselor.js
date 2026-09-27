const mongoose = require("mongoose");

const counselorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: "Licensed Counselor",
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      default: "5+ years experience",
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80",
    },
    bio: {
      type: String,
      default: "Compassionate mental health professional committed to guiding individuals towards emotional clarity and well-being.",
    },
    languages: {
      type: [String],
      default: ["English", "Hindi"],
    },
    fee: {
      type: String,
      default: "₹1,200 / session",
    },
    availableDays: {
      type: [String],
      default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    education: {
      type: String,
      default: "M.Sc. Clinical Psychology, RCI Registered",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Counselor", counselorSchema);