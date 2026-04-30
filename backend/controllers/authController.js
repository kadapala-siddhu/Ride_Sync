import User    from "../models/User.js";
import Booking from "../models/Booking.js";
import Ride    from "../models/Ride.js";
import bcrypt  from "bcryptjs";
import jwt     from "jsonwebtoken";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeUser = (user) => ({
  _id:          user._id,
  firstName:    user.firstName,
  lastName:     user.lastName,
  age:          user.age,
  mobile:       user.mobile,
  email:        user.email,
  gender:       user.gender,
  handicapped:  user.handicapped,
  role:         user.role,
  vehicleType:   user.vehicleType,
  vehicleNumber: user.vehicleNumber,
  seats:        user.seats,
  license:      user.license,
  createdAt:    user.createdAt,
});

const collegeEmailRegex = /^[^\s@]+@[^\s@]+\.(edu|edu\.in|ac\.in)$/i;

// ─── Provider Registration ─────────────────────────────────────────────────
// @route POST /api/auth/register/provider
export const registerProvider = async (req, res) => {
  try {
    const {
      firstName, lastName, age, mobile, email, password, confirmPassword,
      gender, vehicleType, vehicleNumber, seats, license,
    } = req.body;

    // Required fields
    if (!firstName || !lastName || !age || !mobile || !email || !password || !gender || !vehicleType || !vehicleNumber) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }
    if (Number(age) < 18) {
      return res.status(400).json({ message: "You must be at least 18 years old to register as a provider" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (license !== true && license !== "true") {
      return res.status(400).json({ message: "You must have a valid driving license to offer rides" });
    }

    // Vehicle number format: 2 letters + 2 digits + 2 letters + 4 digits (e.g. TS09AB1234)
    const vehicleNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/i;
    if (!vehicleNumberRegex.test(vehicleNumber?.trim())) {
      return res.status(400).json({
        message: "Invalid vehicle number. Format must be: 2 letters + 2 digits + 2 letters + 4 digits (e.g. TS09AB1234)"
      });
    }
    if (!collegeEmailRegex.test(email)) {
      return res.status(400).json({ message: "Please use a valid college email (e.g. name@srmap.edu.in)" });
    }

    const emailExists  = await User.findOne({ email });
    if (emailExists)  return res.status(400).json({ message: "Email already registered" });

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) return res.status(400).json({ message: "Mobile number already registered" });

    // Seat logic
    let finalSeats = 1;
    if (vehicleType === "car") {
      const carSeats = Number(seats);
      if (!carSeats || carSeats < 2 || carSeats > 8) {
        return res.status(400).json({ message: "Car seats must be between 2 and 8" });
      }
      finalSeats = carSeats;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName, lastName, age: Number(age), mobile, email,
      password: hashedPassword, gender,
      role: "provider",
      vehicleType, vehicleNumber: vehicleNumber.trim().toUpperCase(), seats: finalSeats,
      license: true,
    });

    res.status(201).json({ ...safeUser(user), token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Seeker Registration ───────────────────────────────────────────────────
// @route POST /api/auth/register/seeker
export const registerSeeker = async (req, res) => {
  try {
    const {
      firstName, lastName, mobile, email, password, confirmPassword,
      gender, handicapped,
    } = req.body;

    if (!firstName || !lastName || !mobile || !email || !password || !gender) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!collegeEmailRegex.test(email)) {
      return res.status(400).json({ message: "Please use a valid college email (e.g. name@srmap.edu.in)" });
    }

    const emailExists  = await User.findOne({ email });
    if (emailExists)  return res.status(400).json({ message: "Email already registered" });

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) return res.status(400).json({ message: "Mobile number already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName, lastName, mobile, email,
      password: hashedPassword, gender,
      role: "seeker",
      handicapped: handicapped === true || handicapped === "true",
    });

    res.status(201).json({ ...safeUser(user), token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;
    if (!emailOrMobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ ...safeUser(user), token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Profile ───────────────────────────────────────────────────────────
// @route GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Profile (name, email, mobile only) ─────────────────────────────
// @route PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { firstName, lastName, email, mobile } = req.body;

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already in use" });
    }
    if (mobile && mobile !== user.mobile) {
      const exists = await User.findOne({ mobile });
      if (exists) return res.status(400).json({ message: "Mobile already in use" });
    }

    user.firstName = firstName || user.firstName;
    user.lastName  = lastName  || user.lastName;
    user.email     = email     || user.email;
    user.mobile    = mobile    || user.mobile;

    const updated = await user.save();
    res.json({ ...safeUser(updated), token: generateToken(updated._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete Account (cascade) ──────────────────────────────────────────────
// @route DELETE /api/auth/profile
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await Booking.deleteMany({ userId });
    const userRides = await Ride.find({ user: userId }).select("_id");
    const rideIds   = userRides.map((r) => r._id);
    if (rideIds.length) await Booking.deleteMany({ rideId: { $in: rideIds } });
    await Ride.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};