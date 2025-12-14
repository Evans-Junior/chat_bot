const express = require("express");
const router = express.Router();
const botController = require("../controllers/bot_controller");

// Validate chat request middleware
const validateChatRequest = (req, res, next) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Message field is required and must be a string",
    });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Message cannot be empty",
    });
  }

  if (message.length > 1000) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Message must be less than 1000 characters",
    });
  }

  next();
};

// Routes - MAKE SURE ALL FUNCTIONS EXIST IN CONTROLLER
router.post("/chat", validateChatRequest, (req, res) =>
  botController.submitMessage(req, res)
);
router.get("/response/:taskId", (req, res) =>
  botController.getResponse(req, res)
);
router.get("/info", (req, res) => botController.getBotInfo(req, res));
router.get("/sessions", (req, res) =>
  botController.getActiveSessions(req, res)
);
router.get("/tasks/pending", (req, res) =>
  botController.getPendingTasks(req, res)
);
router.delete("/sessions/:sessionId", (req, res) =>
  botController.clearSession(req, res)
);

// Optional: Keep synchronous endpoint if needed
router.post("/chat/sync", validateChatRequest, (req, res) =>
  botController.chat(req, res)
);

module.exports = router;
