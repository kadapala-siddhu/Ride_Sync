import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName:    { type: String, required: true, trim: true },
    lastName:     { type: String, required: true, trim: true },
    mobile:       { type: String, required: true, unique: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true },
    gender:       { type: String, enum: ["male", "female", "other"], required: true },
    role:         { type: String, enum: ["provider", "seeker"], required: true },
    handicapped:  { type: Boolean, default: false },

    // Provider-only fields (optional for seekers)
    age:          { type: Number },
    vehicleType:  { type: String, enum: ["bike", "car"] },
    vehicleNumber: { type: String, trim: true },
    seats:        { type: Number, default: 1 },
    license:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);