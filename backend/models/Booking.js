import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

// Prevent duplicate bookings
bookingSchema.index({ userId: 1, rideId: 1 }, { unique: true });

export default mongoose.model("Booking", bookingSchema);
