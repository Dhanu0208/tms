import express from "express";
import userRoutes from "./userRoutes.js";
import ticketRoutes from "./ticketRoutes.js";

const router = express.Router();

router.use("/user", userRoutes); //api/user/login
router.use("/ticket", ticketRoutes);

export default router;
