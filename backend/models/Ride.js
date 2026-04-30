import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    user:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pathId:         { type: String, required: true },
    startIndex:     { type: Number, required: true },
    endIndex:       { type: Number, required: true },
    origin:         { type: String, required: true, trim: true },
    destination:    { type: String, required: true, trim: true },
    time:           { type: Date,   required: true },
    vehicleType:    { type: String, enum: ["bike", "car"], required: true },
    totalSeats:     { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    status:         { type: String, enum: ["active", "full", "completed"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Ride", rideSchema);
