import express from "express";
import {
  joinRide,
  getMyBookings,
  getRideParticipants,
  getRideHistory,
  acceptRequest,
  rejectRequest,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:rideId",          protect, joinRide);
router.get("/my",                protect, getMyBookings);
router.get("/ride/:rideId",      protect, getRideParticipants);
router.get("/history",           protect, getRideHistory);
router.put("/:bookingId/accept", protect, acceptRequest);
router.put("/:bookingId/reject", protect, rejectRequest);

export default router;
