const express = require("express");
const router = express.Router();
const { createAlarm, getAlarms, stopAlarm } = require("../controllers/alarmController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createAlarm);
router.get("/", authMiddleware, getAlarms);
router.put("/:id/stop", authMiddleware, stopAlarm);

module.exports = router;
