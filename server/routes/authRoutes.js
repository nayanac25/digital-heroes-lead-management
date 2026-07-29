const express = require("express");

const {
  registerUser,
  loginUser,
  getMembers,
} = require("../controllers/authController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get(
  "/members",
  protect,
  authorize("admin"),
  getMembers
);

module.exports = router;
