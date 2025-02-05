import express from "express";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddleware.js";
import {
  createSubTicket,
  createTicket,
  dashboardStatistics,
  deleteRestoreTicket,
  duplicateTicket,
  getAllTickets,
  getTicket,
  // postTicketActivity,
  trashTicket,
  updateTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/create", protectRoute, isAdminRoute, createTicket);
router.post("/duplicate/:id", protectRoute, isAdminRoute, duplicateTicket);
// router.post("/activity/:id", protectRoute, postTicketActivity);

router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getAllTickets);
router.get("/:id", protectRoute, getTicket);

router.post(
  "/create-subticket/:id",
  protectRoute,
  isAdminRoute,
  createSubTicket
);
router.put("/update/:id", protectRoute, updateTicket);
router.put("/:id", protectRoute, isAdminRoute, trashTicket);

router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminRoute,
  deleteRestoreTicket
);

export default router;
