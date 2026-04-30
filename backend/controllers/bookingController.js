import Booking from "../models/Booking.js";
import Ride    from "../models/Ride.js";

// @desc  Request to join a ride (seekers only)
// @route POST /api/bookings/:rideId
export const joinRide = async (req, res) => {
  try {
    if (req.user.role !== "seeker") {
      return res.status(403).json({ message: "Only ride seekers can request rides" });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status !== "active") {
      return res.status(400).json({ message: "This ride is no longer available" });
    }
    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }
    if (ride.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot join your own ride" });
    }

    const existing = await Booking.findOne({ userId: req.user._id, rideId: ride._id });
    if (existing) {
       // if they already requested, don't let them do it again unless it's cancelled/rejected
       if (existing.status === "pending" || existing.status === "accepted") {
          return res.status(400).json({ message: `You have already ${existing.status} this ride` });
       } else {
          // If it was cancelled or rejected previously, maybe let them re-request? Or just block.
          existing.status = "pending";
          await existing.save();
          return res.status(201).json({ message: "Ride requested successfully" });
       }
    }

    // Create a pending booking, do NOT consume seats yet.
    await Booking.create({ userId: req.user._id, rideId: ride._id, status: "pending" });

    res.status(201).json({ message: "Ride requested successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already requested this ride" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc  Accept a booking request (providers only)
// @route PUT /api/bookings/:bookingId/accept
export const acceptRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("rideId");
    if (!booking) return res.status(404).json({ message: "Booking request not found" });

    const ride = booking.rideId;
    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available to accept this request" });
    }
    if (booking.status !== "pending") {
      return res.status(400).json({ message: `Request is already ${booking.status}` });
    }

    booking.status = "accepted";
    await booking.save();

    // Consume a seat
    ride.availableSeats -= 1;
    if (ride.availableSeats === 0) ride.status = "full";
    await ride.save();

    // Auto-reject ALL other pending requests for this passenger
    await Booking.updateMany(
      { userId: booking.userId, status: "pending", _id: { $ne: booking._id } },
      { $set: { status: "rejected" } }
    );

    res.json({ message: "Request accepted successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Reject a booking request (providers only)
// @route PUT /api/bookings/:bookingId/reject
export const rejectRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("rideId");
    if (!booking) return res.status(404).json({ message: "Booking request not found" });

    if (booking.rideId.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status === "accepted") {
       // Refund seat
       booking.rideId.availableSeats += 1;
       if(booking.rideId.status === "full") booking.rideId.status = "active";
       await booking.rideId.save();
    }

    booking.status = "rejected";
    await booking.save();

    res.json({ message: "Request rejected successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all bookings for logged-in user (joined rides)
// @route GET /api/bookings/my
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: "rideId",
        populate: { path: "user", select: "firstName lastName email mobile vehicleNumber vehicleType role" },
      })
      .sort({ createdAt: -1 });

    // Apply privacy filter: Only hide mobile if status is NOT accepted (OR if the ride itself is completed)
    const sanitized = bookings.map(b => {
      const bObj = b.toObject();
      if (bObj.rideId && bObj.rideId.user) {
        if (bObj.status !== "accepted" || bObj.rideId.status === "completed") {
           bObj.rideId.user.mobile = null;
        }
      }
      return bObj;
    });

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get participants of a ride (creator/provider only)
// @route GET /api/bookings/ride/:rideId
export const getRideParticipants = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const bookings = await Booking.find({ rideId: ride._id, status: { $in: ["pending", "accepted", "rejected"] } }).populate(
      "userId", "firstName lastName email mobile gender handicapped role"
    ).sort({ createdAt: 1 });

    // Apply privacy filter
    const sanitized = bookings.map(b => {
      const bObj = b.toObject();
      if (bObj.userId) {
        if (bObj.status !== "accepted" || ride.status === "completed") {
          bObj.userId.mobile = null;
        }
      }
      return bObj;
    });

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get ride history (created + joined)
// @route GET /api/bookings/history
export const getRideHistory = async (req, res) => {
  try {
    // Rides this user created (providers)
    const createdRides = await Ride.find({ user: req.user._id })
      .populate("user", "firstName lastName email mobile vehicleNumber vehicleType role")
      .sort({ createdAt: -1 });

    const createdWithParticipants = await Promise.all(
      createdRides.map(async (ride) => {
        const participants = await Booking.find({ rideId: ride._id }).populate(
          "userId", "firstName lastName email mobile"
        );
        const sParticipants = participants.map(p => {
            const pObj = p.toObject();
            if(pObj.userId && (ride.status === "completed" || pObj.status !== "accepted")) {
               pObj.userId.mobile = null;
            }
            return pObj;
        });
        return { ride, participants: sParticipants };
      })
    );

    // Rides this user joined (seekers)
    const joinedBookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: "rideId",
        populate: { path: "user", select: "firstName lastName email mobile vehicleNumber vehicleType role" },
      })
      .sort({ createdAt: -1 });

    const sJoinedBookings = joinedBookings.map(b => {
        const bObj = b.toObject();
        if (bObj.rideId && bObj.rideId.user) {
           if (bObj.status !== "accepted" || bObj.rideId.status === "completed") {
              bObj.rideId.user.mobile = null;
           }
        }
        return bObj;
    });

    res.json({ createdRides: createdWithParticipants, joinedRides: sJoinedBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
