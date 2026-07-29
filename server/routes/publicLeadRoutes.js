const express = require("express");
const router = express.Router();

const {
  createPublicLead,
} = require("../controllers/publicLeadController");

// Public route - no login/JWT required
router.post("/", createPublicLead);

module.exports = router;