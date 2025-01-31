import express from "express";
import {
  activateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getTeamList,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
} from "../controllers/userController.js";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/get-team", protectRoute, isAdminRoute, getTeamList);

router.put("/profile", protectRoute, updateUserProfile);
router.put("/change-password", protectRoute, changeUserPassword);

// FOR ADMIN ONLY - ADMIN ROUTES
router
  .route("/:id")
  .put(protectRoute, isAdminRoute, activateUserProfile)
  .delete(protectRoute, isAdminRoute, deleteUserProfile);

export default router;
