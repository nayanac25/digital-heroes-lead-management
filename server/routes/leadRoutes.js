const express = require("express");
const router = express.Router();

const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  updateLeadStatus,
  addLeadNote,
} = require("../controllers/leadController");

const { protect } = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");



// Create lead - logged-in user required
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createLead
);

router.get("/", protect, getLeads);

router.get("/:id", protect, getLeadById);

router.patch(
  "/:id/assign",
  protect,
  authorizeRoles("admin"),
  assignLead
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin", "member"),
  updateLeadStatus
);

router.post(
  "/:id/notes",
  protect,
  authorizeRoles("admin", "member"),
  addLeadNote
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateLead
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteLead
);

module.exports = router;