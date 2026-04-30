import Ride    from "../models/Ride.js";
import Booking from "../models/Booking.js";
import { getValidRoutesForSegment } from "../config/routesData.js";

// @desc  Create ride (providers only — enforced by providerOnly middleware)
// @route POST /api/rides
export const createRide = async (req, res) => {
  try {
    const { origin, destination, time, totalSeats } = req.body;
    // vehicleType comes from the provider's registered profile, not from the request
    const vehicleType = req.user.vehicleType;

    if (!origin || !destination || !time || !totalSeats) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validRoutes = getValidRoutesForSegment(origin, destination);
    if (validRoutes.length === 0) {
      return res.status(400).json({ message: "Invalid route segment. Origin and destination must lie on a valid path and cannot be the same." });
    }
    
    // Enforce 1 active ride per provider
    const existingRide = await Ride.findOne({ user: req.user._id, status: { $in: ["active", "full"] } });
    if (existingRide) {
      return res.status(400).json({ message: "You already have an active ride. Complete or delete it before posting a new one." });
    }
    const route = validRoutes[0];
    const stopsCI = route.stops.map(s => s.toLowerCase());
    const startIndex = stopsCI.indexOf(origin.toLowerCase());
    const endIndex =   stopsCI.indexOf(destination.toLowerCase());

    let seats = Number(totalSeats);
    if (vehicleType === "bike") seats = 1;
    if (vehicleType === "car") {
      const maxPassengerSeats = req.user.seats - 1; // registered total minus the driver's seat
      if (seats < 1 || seats > maxPassengerSeats) {
        return res.status(400).json({
          message: `Passenger seats must be between 1 and ${maxPassengerSeats} (your registered vehicle capacity minus 1 for the driver)`
        });
      }
    }

    const ride = await Ride.create({
      user:           req.user._id,
      pathId:         route.id,
      startIndex,
      endIndex,
      origin,
      destination,
      time:           new Date(time),
      vehicleType,
      totalSeats:     seats,
      availableSeats: seats,
      status:         "active",
    });

    const populated = await ride.populate("user", "firstName lastName email mobile vehicleNumber vehicleType role");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all active rides (optional filter by origin/destination)
// @route GET /api/rides
export const getAllRides = async (req, res) => {
  try {
    const { origin, destination } = req.query;
    // Only show rides whose start time is still in the future
    const now = new Date();
    const filter = { status: "active", time: { $gt: now } };

    if (origin && destination) {
      const validRoutes = getValidRoutesForSegment(origin, destination);
      if (validRoutes.length === 0) {
         return res.json([]); // No paths available for this exact segment matching
      }
      const orConditions = validRoutes.map(route => {
         const stopsCI = route.stops.map(s => s.toLowerCase());
         const startIdx = stopsCI.indexOf(origin.toLowerCase());
         const endIdx = stopsCI.indexOf(destination.toLowerCase());
         
         if (startIdx < endIdx) {
            // Forward direction
            return {
               pathId: route.id,
               startIndex: { $lte: startIdx },
               endIndex:   { $gte: endIdx },
               $expr: { $lt: ["$startIndex", "$endIndex"] } 
            };
         } else {
            // Backward direction
            return {
               pathId: route.id,
               startIndex: { $gte: startIdx },
               endIndex:   { $lte: endIdx },
               $expr: { $gt: ["$startIndex", "$endIndex"] } 
            };
         }
      });
      filter.$or = orConditions;
    } else if (origin) {
      filter.origin = { $regex: origin, $options: "i" };
    } else if (destination) {
      filter.destination = { $regex: destination, $options: "i" };
    }

    const rides = await Ride.find(filter)
      .populate("user", "firstName lastName email vehicleNumber vehicleType role")
      .sort({ time: 1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single ride
// @route GET /api/rides/:id
export const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate(
      "user", "firstName lastName email mobile vehicleNumber vehicleType role"
    );
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update ride status (provider — own rides only)
// @route PUT /api/rides/:id
export const updateRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this ride" });
    }

    const { status } = req.body;
    if (status) ride.status = status;
    const updated = await ride.save();
    await updated.populate("user", "firstName lastName email mobile vehicleNumber vehicleType role");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete ride (provider — own rides only)
// @route DELETE /api/rides/:id
export const deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this ride" });
    }

    // Completed rides are permanent records — cannot be deleted
    if (ride.status === "completed") {
      return res.status(403).json({ message: "Completed rides cannot be deleted. They are kept as permanent records." });
    }

    await Booking.deleteMany({ rideId: ride._id });
    await Ride.findByIdAndDelete(ride._id);
    res.json({ message: "Ride deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  My created rides (provider only)
// @route GET /api/rides/my
export const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id })
      .populate("user", "firstName lastName email mobile vehicleNumber vehicleType role")
      .sort({ createdAt: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
