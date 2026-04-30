import express from "express";
import {
  createRide,
  getAllRides,
  getRideById,
  updateRide,
  deleteRide,
  getMyRides,
} from "../controllers/rideController.js";
import { protect }      from "../middleware/authMiddleware.js";
import { providerOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// /my must come before /:id to avoid Express routing conflict
router.get("/my",      protect, providerOnly, getMyRides);
router.get("/",        protect, getAllRides);
router.get("/:id",     protect, getRideById);
router.post("/",       protect, providerOnly, createRide);
router.put("/:id",     protect, providerOnly, updateRide);
router.delete("/:id",  protect, providerOnly, deleteRide);

export default router;
