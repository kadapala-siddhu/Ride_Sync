import express from "express";
import {
  registerProvider,
  registerSeeker,
  loginUser,
  getProfile,
  updateProfile,
  deleteAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register/provider", registerProvider);
router.post("/register/seeker",   registerSeeker);
router.post("/login",             loginUser);
router.get("/profile",    protect, getProfile);
router.put("/profile",    protect, updateProfile);
router.delete("/profile", protect, deleteAccount);

export default router;