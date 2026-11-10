const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
      trim: true,
      unique: true,
    },
    country: { type: String, required: [true, "Country is required"], trim: true },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Beach", "Mountain", "Heritage", "City", "Adventure", "Wildlife"],
        message: "{VALUE} is not a valid category",
      },
    },
    price: { type: Number, required: [true, "Price is required"], min: [0, "Price cannot be negative"] },
    rating: { type: Number, min: [0, "Rating must be at least 0"], max: [5, "Rating cannot exceed 5"], default: 0 },
    description: { type: String, trim: true },
    duration: { type: Number, min: 1, default: 3 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", destinationSchema, "destinations");
